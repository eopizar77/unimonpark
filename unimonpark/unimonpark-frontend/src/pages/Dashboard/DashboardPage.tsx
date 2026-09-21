import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  MapPin,
  CheckCircle2,
  LogIn,
  CalendarCheck,
  AlertTriangle,
  AlertCircle,
  Car,
  Clock,
} from "lucide-react";

import { listarEspaciosParqueo } from "@/api/espaciosParqueo";
import { listarIngresos } from "@/api/ingresos";
import { listarMembresias } from "@/api/membresias";
import { listarPenalizaciones } from "@/api/penalizaciones";
import { listarMensualidades } from "@/api/mensualidades";
import { listarVehiculos } from "@/api/vehiculos";
import { listarTiposVehiculo } from "@/api/tiposVehiculo";
import { listarUsuarios } from "@/api/usuarios";

import type { EspacioParqueo } from "@/types/espacioParqueo";
import type { Ingreso } from "@/types/ingreso";
import type { Membresia } from "@/types/membresia";
import type { Mensualidad } from "@/types/mensualidad";
import type { Vehiculo } from "@/types/vehiculo";
import type { TipoVehiculo } from "@/types/tipoVehiculo";
import type { Usuario } from "@/types/usuario";

import StatCard from "./StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface AlertaVencimiento {
  id: string;
  tipo: "Mensualidad" | "Membresía";
  placa: string;
  usuario: string;
  fechaFin: string;
  diasRestantes: number;
}

export default function DashboardPage() {
  const [cargando, setCargando] = useState(true);

  // Datos base
  const [espacios, setEspacios] = useState<EspacioParqueo[]>([]);
  const [ingresos, setIngresos] = useState<Ingreso[]>([]);
  const [membresias, setMembresias] = useState<Membresia[]>([]);
  const [mensualidades, setMensualidades] = useState<Mensualidad[]>([]);
  const [penalizaciones, setPenalizaciones] = useState(0);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [tipos, setTipos] = useState<TipoVehiculo[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  useEffect(() => {
    async function cargar() {
      setCargando(true);
      try {
        const [
          espaciosData,
          ingresosData,
          membresiasData,
          mensualidadesData,
          penalizacionesData,
          vehiculosData,
          tiposData,
          usuariosData,
        ] = await Promise.all([
          listarEspaciosParqueo(),
          listarIngresos(),
          listarMembresias(),
          listarMensualidades(),
          listarPenalizaciones(),
          listarVehiculos(),
          listarTiposVehiculo(),
          listarUsuarios(),
        ]);

        setEspacios(espaciosData);
        setIngresos(ingresosData);
        setMembresias(membresiasData);
        setMensualidades(mensualidadesData);
        setPenalizaciones(penalizacionesData.filter((p) => p.estado === "PENDIENTE").length);
        setVehiculos(vehiculosData);
        setTipos(tiposData);
        setUsuarios(usuariosData);
      } catch {
        toast.error("No se pudo cargar el resumen del parqueadero");
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);

  if (cargando) {
    return <p className="text-muted-foreground">Cargando centro de control...</p>;
  }

  // --- CÁLCULOS ESTADÍSTICOS ---
  const espaciosDisponibles = espacios.filter((e) => e.estado === "DISPONIBLE").length;
  const espaciosOcupados = espacios.filter((e) => e.estado === "OCUPADO").length;
  const ingresosActivos = ingresos.filter((i) => i.estado === "ACTIVO");
  const membresiasVigentes = membresias.filter((m) => m.activa).length;
  const mensualidadesVigentes = mensualidades.filter((m) => m.estado === "ACTIVA").length;

  // --- CONTEO DE VEHÍCULOS ADENTRO POR TIPO ---
  const ocupacionPorTipo = tipos.map((tipo) => {
    const vehiculosDeEsteTipo = vehiculos
      .filter((v) => v.idTipoVehiculo === tipo.idTipoVehiculo)
      .map((v) => v.idVehiculo);

    const cantidadAdentro = ingresosActivos.filter((i) =>
      vehiculosDeEsteTipo.includes(i.idVehiculo)
    ).length;

    return {
      nombre: tipo.nombre,
      cantidad: cantidadAdentro,
    };
  });

  // --- DETECCIÓN DE ALERTAS DE VENCIMIENTO (Próximos 7 días) ---
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const alertas: AlertaVencimiento[] = [];

  // Revisar Mensualidades
  mensualidades.forEach((m) => {
    if (m.estado === "ACTIVA" && m.fechaFin) {
      const fechaFin = new Date(m.fechaFin);
      fechaFin.setHours(0, 0, 0, 0);
      const diffDias = Math.round((fechaFin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDias <= 7) {
        const u = usuarios.find((user) => user.idUsuario === m.idUsuario);
        alertas.push({
          id: `mens-${m.idMensualidadUsuario}`,
          tipo: "Mensualidad",
          placa: m.placaVehiculo || "Sin placa",
          usuario: u ? `${u.nombres} ${u.apellidos}` : "Usuario no encontrado",
          fechaFin: m.fechaFin,
          diasRestantes: diffDias,
        });
      }
    }
  });

  // Revisar Membresías
  membresias.forEach((mem) => {
    if (mem.activa && mem.fechaFin) {
      const fechaFin = new Date(mem.fechaFin);
      fechaFin.setHours(0, 0, 0, 0);
      const diffDias = Math.round((fechaFin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDias <= 7) {
        const veh = vehiculos.find((v) => v.idVehiculo === mem.idVehiculo);
        const u = veh ? usuarios.find((user) => user.idUsuario === veh.idUsuario) : null;
        alertas.push({
          id: `mem-${mem.idMembresia}`,
          tipo: "Membresía",
          placa: mem.placaVehiculo || "Sin placa",
          usuario: u ? `${u.nombres} ${u.apellidos}` : "Titular registrado",
          fechaFin: mem.fechaFin,
          diasRestantes: diffDias,
        });
      }
    }
  });

  // Ordenar de más urgente a menos urgente
  alertas.sort((a, b) => a.diasRestantes - b.diasRestantes);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Panel de Control General</h2>
        <p className="text-sm text-muted-foreground">
          Monitoreo en tiempo real del parqueadero UnimonPark
        </p>
      </div>

      {/* Tarjetas Principales */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard titulo="Espacios disponibles" valor={espaciosDisponibles} icon={CheckCircle2} />
        <StatCard titulo="Espacios ocupados" valor={espaciosOcupados} icon={MapPin} />
        <StatCard
          titulo="Vehículos adentro"
          valor={ingresosActivos.length}
          icon={LogIn}
          descripcion="Ingresos activos"
        />
        <StatCard
          titulo="Abonos vigentes"
          valor={membresiasVigentes + mensualidadesVigentes}
          icon={CalendarCheck}
          descripcion="Membresías + Mensualidades"
        />
        <StatCard
          titulo="Penalizaciones"
          valor={penalizaciones}
          icon={AlertTriangle}
          descripcion="Pendientes por resolver"
        />
      </div>

      {/* Grid de Ocupación por Tipo y Alertas */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Distribución por Tipo de Vehículo */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Car className="h-5 w-5 text-blue-500" />
              Ocupación por Tipo
            </CardTitle>
            <CardDescription>Vehículos dentro en este instante</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {ocupacionPorTipo.map((item) => (
              <div key={item.nombre} className="flex items-center justify-between rounded-lg border p-3">
                <span className="font-medium text-sm">{item.nombre}</span>
                <Badge variant={item.cantidad > 0 ? "default" : "secondary"}>
                  {item.cantidad} dentro
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Notificaciones y Vencimientos Próximos */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-amber-600 dark:text-amber-500">
              <AlertCircle className="h-5 w-5" />
              Vencimientos Próximos (7 Días)
            </CardTitle>
            <CardDescription>
              Mensualidades y membresías con fecha límite de vencimiento cercana
            </CardDescription>
          </CardHeader>
          <CardContent>
            {alertas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center text-sm text-muted-foreground">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mb-2" />
                <p className="font-medium">No hay vencimientos en los próximos 7 días</p>
                <p className="text-xs">Todas las mensualidades y membresías están al día.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titular / Usuario</TableHead>
                    <TableHead>Placa</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Fecha Fin</TableHead>
                    <TableHead className="text-right">Urgencia</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alertas.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.usuario}</TableCell>
                      <TableCell>{item.placa}</TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">{item.tipo}</span>
                      </TableCell>
                      <TableCell>{item.fechaFin}</TableCell>
                      <TableCell className="text-right">
                        {item.diasRestantes < 0 && (
                          <Badge variant="destructive">Vencida</Badge>
                        )}
                        {item.diasRestantes === 0 && (
                          <Badge variant="destructive">Vence HOY</Badge>
                        )}
                        {item.diasRestantes > 0 && item.diasRestantes <= 3 && (
                          <Badge className="bg-amber-500 hover:bg-amber-600 text-white">
                            En {item.diasRestantes} días
                          </Badge>
                        )}
                        {item.diasRestantes > 3 && (
                          <Badge variant="secondary">
                            En {item.diasRestantes} días
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Actividad Reciente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-5 w-5 text-slate-500" />
            Últimos Ingresos Registrados
          </CardTitle>
          <CardDescription>Actividad reciente en el control de acceso</CardDescription>
        </CardHeader>
        <CardContent>
          {ingresos.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay ingresos registrados aún.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha y Hora</TableHead>
                  <TableHead>Vehículo / Placa</TableHead>
                  <TableHead>Tipo Ingreso</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ingresos.slice(0, 5).map((ingreso) => {
                  const veh = vehiculos.find((v) => v.idVehiculo === ingreso.idVehiculo);
                  return (
                    <TableRow key={ingreso.idIngreso}>
                      <TableCell>{new Date(ingreso.fechaIngreso).toLocaleString("es-CO")}</TableCell>
                      <TableCell className="font-medium">
                        {veh ? `${veh.placa || "Bicicleta"} - ${veh.marca || ""}` : "Vehículo"}
                      </TableCell>
                      <TableCell>{ingreso.tipoIngreso}</TableCell>
                      <TableCell>
                        <Badge variant={ingreso.estado === "ACTIVO" ? "default" : "secondary"}>
                          {ingreso.estado}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}