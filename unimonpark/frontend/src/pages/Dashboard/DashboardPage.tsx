import { useEffect, useState, useMemo } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { listarIngresos } from "@/api/ingresos";
import { listarMensualidades } from "@/api/mensualidades";
import { listarMembresias } from "@/api/membresias";
import { listarVehiculos } from "@/api/vehiculos";
import type { Ingreso } from "@/types/ingreso";
import type { Mensualidad } from "@/types/mensualidad";
import type { Membresia } from "@/types/membresia";
import type { Vehiculo } from "@/types/vehiculo";
import { useAuth } from "@/context/AuthContext";
import {
  Car,
  Clock,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  CreditCard,
  CalendarDays,
  LayoutDashboard
} from "lucide-react";

export default function DashboardPage() {
  const { nombreUsuario } = useAuth();
  
  const [ingresos, setIngresos] = useState<Ingreso[]>([]);
  const [mensualidades, setMensualidades] = useState<Mensualidad[]>([]);
  const [membresias, setMembresias] = useState<Membresia[]>([]);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
    const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargarDatos() {
      try {
        const [ing, men, mem, veh] = await Promise.all([
          listarIngresos(),
          listarMensualidades(),
          listarMembresias(),
          listarVehiculos(),
          null /* removed */
        ]);
        setIngresos(ing);
        setMensualidades(men);
        setMembresias(mem);
        setVehiculos(veh);
              } catch (error) {
        console.error("Error al cargar datos del dashboard:", error);
      } finally {
        setCargando(false);
      }
    }
    cargarDatos();
  }, []);

  const ingresosActivos = useMemo(() => ingresos.filter(i => i.estado === "ACTIVO"), [ingresos]);
  const ingresosDelDia = useMemo(() => {
    const hoy = new Date().toISOString().split('T')[0];
    return ingresos.filter(i => i.fechaIngreso.startsWith(hoy));
  }, [ingresos]);

  const alertas = useMemo(() => {
    const hoy = new Date();
    const alertasGeneradas: any[] = [];

    const verificarVencimiento = (fechaFin: string | undefined, tipo: string, titular: string, placa: string, id: number) => {
      if (!fechaFin) return;
      const fin = new Date(fechaFin);
      const diffTime = fin.getTime() - hoy.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 7) {
        alertasGeneradas.push({
          id: `${tipo}-${id}`,
          tipo,
          titular,
          placa,
          fechaFin: fin.toLocaleDateString("es-CO"),
          diasRestantes: diffDays
        });
      }
    };

    mensualidades.forEach(m => {
      if (m.estado === "ACTIVA") {
        const veh = vehiculos.find(v => v.idVehiculo === m.idVehiculo);
        verificarVencimiento(m.fechaFin, "Mensualidad", veh?.nombreUsuario || veh?.nombreExterno || "Desconocido", veh?.placa || "N/A", m.idMensualidadUsuario);
      }
    });

    membresias.forEach(m => {
      if (m.activa) {
        verificarVencimiento(m.fechaFin, "MembresÃ­a", m.nombreTarifa, m.placaVehiculo, m.idMembresia);
      }
    });

    return alertasGeneradas.sort((a, b) => a.diasRestantes - b.diasRestantes);
  }, [mensualidades, membresias, vehiculos]);

  if (cargando) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-slate-400">
          <LayoutDashboard className="h-12 w-12 animate-pulse text-blue-500/50" />
          <p className="animate-pulse text-lg font-medium">Cargando mÃ©tricas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-700 pb-8">
      
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Â¡HOLA, {nombreUsuario?.toUpperCase() || "USUARIO"}! ðŸ‘‹
        </h2>
        <p className="text-base text-slate-500 font-medium">
          AquÃ­ tienes el resumen operativo del parqueadero.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-sm border-slate-100 bg-white hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Ingresos del DÃ­a</CardTitle>
            <div className="p-2 bg-blue-50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold text-slate-900">{ingresosDelDia.length}</div>
            <p className="text-xs text-slate-500 font-medium mt-1">VehÃ­culos registrados hoy</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-slate-100 bg-white hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">OcupaciÃ³n Actual</CardTitle>
            <div className="p-2 bg-emerald-50 rounded-lg">
              <Car className="h-5 w-5 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold text-slate-900">{ingresosActivos.length}</div>
            <p className="text-xs text-slate-500 font-medium mt-1">VehÃ­culos en el parqueadero</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-100 bg-white hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Mensualidades</CardTitle>
            <div className="p-2 bg-indigo-50 rounded-lg">
              <CalendarDays className="h-5 w-5 text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold text-slate-900">
              {mensualidades.filter(m => m.estado === "ACTIVA").length}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">Planes activos actualmente</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-100 bg-white hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">MembresÃ­as</CardTitle>
            <div className="p-2 bg-purple-50 rounded-lg">
              <CreditCard className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold text-slate-900">
              {membresias.filter(m => m.activa).length}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">MembresÃ­as vigentes</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="shadow-sm border-slate-100 flex flex-col">
          <CardHeader className="border-b border-slate-50 bg-slate-50/50 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base font-bold text-amber-600">
                <AlertCircle className="h-5 w-5" />
                Vencimientos PrÃ³ximos (7 DÃ­as)
              </CardTitle>
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                {alertas.length} Alerta{alertas.length !== 1 && 's'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            {alertas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-sm text-slate-500 h-full">
                <CheckCircle2 className="h-12 w-12 text-emerald-400 mb-4" />
                <p className="font-semibold text-slate-700 text-base">Todo al dÃ­a</p>
                <p className="text-slate-500 mt-1">No hay mensualidades ni membresÃ­as por vencer pronto.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-xs font-semibold uppercase text-slate-500">Titular / Usuario</TableHead>
                      <TableHead className="text-xs font-semibold uppercase text-slate-500">Placa</TableHead>
                      <TableHead className="text-xs font-semibold uppercase text-slate-500">Tipo</TableHead>
                      <TableHead className="text-xs font-semibold uppercase text-slate-500">Fecha Fin</TableHead>
                      <TableHead className="text-xs font-semibold uppercase text-slate-500 text-right">Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {alertas.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium text-slate-800">{item.titular}</TableCell>
                        <TableCell>
                           <span className="font-mono font-bold bg-slate-100 text-slate-800 px-2 py-1 rounded text-xs">
                             {item.placa}
                           </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-medium text-slate-500">{item.tipo}</span>
                        </TableCell>
                        <TableCell className="text-slate-600">{item.fechaFin}</TableCell>
                        <TableCell className="text-right">
                          {item.diasRestantes < 0 && (
                            <Badge className="bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 shadow-none">Vencida</Badge>
                          )}
                          {item.diasRestantes === 0 && (
                            <Badge className="bg-red-500 text-white hover:bg-red-600 shadow-none animate-pulse">Vence HOY</Badge>
                          )}
                          {item.diasRestantes > 0 && item.diasRestantes <= 3 && (
                            <Badge className="bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-200 shadow-none">
                              En {item.diasRestantes} dÃ­as
                            </Badge>
                          )}
                          {item.diasRestantes > 3 && (
                            <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200 shadow-none">
                              En {item.diasRestantes} dÃ­as
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

      <Card className="shadow-sm border-slate-100">
        <CardHeader className="border-b border-slate-50 bg-slate-50/50 pb-4">
          <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-800">
            <Clock className="h-5 w-5 text-slate-500" />
            Ãšltimos Ingresos Registrados
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {ingresos.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">No hay ingresos registrados aÃºn.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-xs font-semibold uppercase text-slate-500 pl-6">Fecha y Hora</TableHead>
                    <TableHead className="text-xs font-semibold uppercase text-slate-500">VehÃ­culo / Placa</TableHead>
                    <TableHead className="text-xs font-semibold uppercase text-slate-500">Tipo Propietario</TableHead>
                    <TableHead className="text-xs font-semibold uppercase text-slate-500">Modo</TableHead>
                    <TableHead className="text-xs font-semibold uppercase text-slate-500 pr-6">Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ingresos.slice(0, 5).map((ingreso) => {
                    const veh = vehiculos.find((v) => v.idVehiculo === ingreso.idVehiculo);
                    const esExterno = veh ? (veh.idExterno !== null || veh.nombreExterno !== null) : false;
                    
                    return (
                      <TableRow key={ingreso.idIngreso}>
                        <TableCell className="text-slate-600 pl-6">
                           <div className="flex flex-col">
                             <span className="font-medium text-slate-800">
                               {new Date(ingreso.fechaIngreso).toLocaleDateString("es-CO", { day: '2-digit', month: 'short', year: 'numeric' })}
                             </span>
                             <span className="text-xs text-slate-500">
                               {new Date(ingreso.fechaIngreso).toLocaleTimeString("es-CO", { hour: '2-digit', minute: '2-digit' })}
                             </span>
                           </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col items-start gap-1">
                              <span className="bg-slate-100 text-slate-900 font-mono font-bold text-xs px-2 py-1 rounded border border-slate-200 inline-block">
                                  {veh?.placa || "N/A"}
                              </span>
                              <span className="text-xs text-slate-500">{veh?.marca || "VehÃ­culo"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {esExterno ? (
                            <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
                              Visitante
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              Institucional
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-medium px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md">
                            {ingreso.tipoIngreso}
                          </span>
                        </TableCell>
                        <TableCell className="pr-6">
                          <Badge className={ingreso.estado === "ACTIVO" ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 shadow-none border border-emerald-200" : "bg-slate-100 text-slate-600 shadow-none border border-slate-200"}>
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


