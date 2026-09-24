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
  UserCheck
} from "lucide-react";

import { listarEspaciosParqueo } from "@/api/espaciosParqueo";
import { listarIngresos } from "@/api/ingresos";
import { listarMembresias } from "@/api/membresias";
import { listarPenalizaciones } from "@/api/penalizaciones";
import { listarMensualidades } from "@/api/mensualidades";
import { listarVehiculos } from "@/api/vehiculos";
import { listarTiposVehiculo } from "@/api/tiposVehiculo";
import { listarUsuarios } from "@/api/usuarios";
import { listarExternos } from "@/api/externos";

import type { EspacioParqueo } from "@/types/espacioParqueo";
import type { Ingreso } from "@/types/ingreso";
import type { Membresia } from "@/types/membresia";
import type { Mensualidad } from "@/types/mensualidad";
import type { Vehiculo } from "@/types/vehiculo";
import type { TipoVehiculo } from "@/types/tipoVehiculo";
import type { Usuario } from "@/types/usuario";
import type { Externo } from "@/types/externo";

import StatCard from "./StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";

interface AlertaVencimiento {
  id: string;
  tipo: "Mensualidad" | "Membresía";
  placa: string;
  usuario: string;
  fechaFin: string;
  diasRestantes: number;
}

export default function DashboardPage() {
  const { nombreUsuario } = useAuth();
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
  const [_, setExternos] = useState<Externo[]>([]);

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
          externosData,
        ] = await Promise.all([
          listarEspaciosParqueo(),
          listarIngresos(),
          listarMembresias(),
          listarMensualidades(),
          listarPenalizaciones(),
          listarVehiculos(),
          listarTiposVehiculo(),
          listarUsuarios(),
          listarExternos(),
        ]);

        setEspacios(espaciosData);
        setIngresos(ingresosData);
        setMembresias(membresiasData);
        setMensualidades(mensualidadesData);
        setPenalizaciones(penalizacionesData.filter((p) => p.estado === "PENDIENTE").length);
        setVehiculos(vehiculosData);
        setTipos(tiposData);
        setUsuarios(usuariosData);
        setExternos(externosData);
      } catch {
        toast.error("No se pudo cargar el resumen del parqueadero");
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);

  if (cargando) {
    return <p className="text-muted-foreground animate-pulse">Cargando centro de control...</p>;
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

  // --- CONTEO DE EXTERNOS ADENTRO ---
  const vehiculosDeExternos = vehiculos
    .filter((v) => v.idExterno !== null || v.nombreExterno !== null)
    .map((v) => v.idVehiculo);
    
  const externosAdentro = ingresosActivos.filter((i) =>
    vehiculosDeExternos.includes(i.idVehiculo)
  ).length;

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

  // Fecha bonita para el saludo
  const fechaActual = hoy.toLocaleDateString("es-CO", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-primary">
          ¡HOLA, {nombreUsuario || "Operario"}! 👋
        </h2>
        <p className="text-sm text-muted-foreground mt-1 capitalize">
          {fechaActual} - MONITOREO TIEMPO REAL -- UNIMONPARK --
        </p>
      </div>

      {/* Tarjetas Principales */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard titulo="Disponibles" valor={espaciosDisponibles} icon={CheckCircle2} />
        <StatCard titulo="Ocupados" valor={espaciosOcupados} icon={MapPin} />
        <StatCard
          titulo="Adentro"
          valor={ingresosActivos.length}
          icon={LogIn}
          descripcion="Ingresos activos"
        />
        <StatCard
          titulo="Externos"
          valor={externosAdentro}
          icon={UserCheck}
          descripcion="Visitantes ahora"
        />
        <StatCard
          titulo="Abonos vigentes"
          valor={membresiasVigentes + mensualidadesVigentes}
          icon={CalendarCheck}
        />
        <StatCard
          titulo="Penalizaciones"
          valor={penalizaciones}
          icon={AlertTriangle}
        />
      </div>

      {/* Grid de Ocupación por Tipo y Alertas */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Distribución por Tipo de Vehículo */}
        <Card className="md:col-span-1 shadow-sm border-gray-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-primary">
              <Car className="h-5 w-5" />
              OCUPACION POR TIPO
            </CardTitle>
            <CardDescription>Vehículos con ingreso activo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {ocupacionPorTipo.map((item) => {
              // Calcular porcentaje visual (sobre el total de ocupados, max 100%)
              const porcentaje = ingresosActivos.length > 0 ? Math.round((item.cantidad / ingresosActivos.length) * 100) : 0;
              return (
                <div key={item.nombre} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{item.nombre}</span>
                    <span className="font-bold text-primary">{item.cantidad}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-1000" 
                      style={{ width: `${porcentaje}%` }} 
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Notificaciones y Vencimientos Próximos */}
        <Card className="md:col-span-2 shadow-sm border-gray-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-amber-600 dark:text-amber-500">
              <AlertCircle className="h-5 w-5" />
              VENCIMIENTOS PROXIMOS (7 Días)
            </CardTitle>
            <CardDescription>
              Mensualidades y membresías con fecha límite de vencimiento cercana
            </CardDescription>
          </CardHeader>
          <CardContent>
            {alertas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-sm text-muted-foreground bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                <CheckCircle2 className="h-10 w-10 text-secondary mb-3" />
                <p className="font-medium text-slate-600">No hay vencimientos en los próximos 7 días</p>
                <p className="text-xs">Todas las mensualidades y membresías están al día.</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader className="bg-slate-50">
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
                        <TableCell className="font-medium text-primary">{item.usuario}</TableCell>
                        <TableCell>{item.placa}</TableCell>
                        <TableCell>
                          <span className="text-xs text-muted-foreground bg-slate-100 px-2 py-1 rounded-md">{item.tipo}</span>
                        </TableCell>
                        <TableCell>{item.fechaFin}</TableCell>
                        <TableCell className="text-right">
                          {item.diasRestantes < 0 && (
                            <Badge variant="destructive" className="bg-red-500">Vencida</Badge>
                          )}
                          {item.diasRestantes === 0 && (
                            <Badge variant="destructive" className="bg-red-500">Vence HOY</Badge>
                          )}
                          {item.diasRestantes > 0 && item.diasRestantes <= 3 && (
                            <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-none">
                              En {item.diasRestantes} días
                            </Badge>
                          )}
                          {item.diasRestantes > 3 && (
                            <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200">
                              En {item.diasRestantes} días
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Actividad Reciente */}
      <Card className="shadow-sm border-gray-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-primary">
            <Clock className="h-5 w-5" />
            Últimos Ingresos Registrados
          </CardTitle>
          <CardDescription>Actividad reciente en el control de acceso</CardDescription>
        </CardHeader>
        <CardContent>
          {ingresos.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay ingresos registrados aún.</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead>Fecha y Hora</TableHead>
                    <TableHead>Vehículo / Placa</TableHead>
                    <TableHead>Tipo Propietario</TableHead>
                    <TableHead>Tipo Ingreso</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ingresos.slice(0, 5).map((ingreso) => {
                    const veh = vehiculos.find((v) => v.idVehiculo === ingreso.idVehiculo);
                    const esExterno = veh ? (veh.idExterno !== null || veh.nombreExterno !== null) : false;
                    
                    return (
                      <TableRow key={ingreso.idIngreso}>
                        <TableCell className="text-slate-600">{new Date(ingreso.fechaIngreso).toLocaleString("es-CO")}</TableCell>
                        <TableCell className="font-medium text-primary">
                          {veh ? `${veh.placa || "Bicicleta"} - ${veh.marca || ""}` : "Vehículo"}
                        </TableCell>
                        <TableCell>
                          {esExterno ? (
                            <Badge variant="outline" className="bg-secondary/20 text-secondary-foreground border-secondary/30">
                              Visitante Externo
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                              Institucional
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-medium px-2 py-1 bg-slate-100 rounded-md">
                            {ingreso.tipoIngreso}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge className={ingreso.estado === "ACTIVO" ? "bg-secondary text-secondary-foreground" : "bg-slate-200 text-slate-700"}>
                            {ingreso.estado}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}