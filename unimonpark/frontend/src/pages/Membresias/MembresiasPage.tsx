import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Search } from "lucide-react";

import { listarMembresias, crearMembresia, editarMembresia } from "@/api/membresias";
import { obtenerMensajeError } from "@/api/client";
import { listarVehiculos } from "@/api/vehiculos";
import { listarTarifas } from "@/api/tarifas";
import type { Vehiculo } from "@/types/vehiculo";
import type { Tarifa } from "@/types/tarifa";
import type { Membresia } from "@/types/membresia";
import { membresiaSchema, type MembresiaFormValues } from "./membresiaShema";
import { BuscadorConFiltro } from "@/components/BuscadorConFiltro";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const valoresIniciales: MembresiaFormValues = {
  idVehiculo: 0,
  idTarifa: 0,
  fechaInicio: "",
  fechaFin: "",
  montoPagadoManual: null,
};

function formatearMoneda(valor: number | null | undefined): string {
  if (valor == null) return "$ 0";
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(valor);
}

function formatCurrencyValue(value: number | null | undefined): string {
    if (value == null) return "";
    return formatearMoneda(value).replace(/\s/g, " ");
}

function handleCurrencyChange(e: React.ChangeEvent<HTMLInputElement>, onChange: (v: number | null) => void) {
    const digits = e.target.value.replace(/\D/g, "");
    if (!digits) {
        onChange(null);
    } else {
        onChange(Number(digits));
    }
}

export default function MembresiasPage() {
  const [membresias, setMembresias] = useState<Membresia[]>([]);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [tarifas, setTarifas] = useState<Tarifa[]>([]);
  const [cargando, setCargando] = useState(true);
  const [dialogAbierto, setDialogAbierto] = useState(false);
  const [membresiaEditando, setMembresiaEditando] = useState<Membresia | null>(null);

  const form = useForm<MembresiaFormValues>({
    resolver: zodResolver(membresiaSchema),
    defaultValues: valoresIniciales,
  });

  async function cargarDatos() {
    setCargando(true);
    try {
      const [membresiasData, vehiculosData, tarifasData] = await Promise.all([
        listarMembresias(),
        listarVehiculos(),
        listarTarifas(),
      ]);
      setMembresias(membresiasData);
      setVehiculos(vehiculosData.filter((v) => v.activo));
      setTarifas(tarifasData);
    } catch {
      toast.error("No se pudieron cargar las membresías");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  function abrirCrear() {
    setMembresiaEditando(null);
    form.reset(valoresIniciales);
    setDialogAbierto(true);
  }

  function abrirEditar(m: Membresia) {
    setMembresiaEditando(m);
    form.reset({
        idVehiculo: m.idVehiculo,
        idTarifa: m.idTarifa || 0,
        fechaInicio: m.fechaInicio ? m.fechaInicio.substring(0, 16) : "",
        fechaFin: m.fechaFin ? m.fechaFin.substring(0, 16) : "",
        montoPagadoManual: m.montoPagado,
    });
    setDialogAbierto(true);
  }

  async function onSubmit(valores: MembresiaFormValues) {
    try {
      if (membresiaEditando) {
          await editarMembresia(membresiaEditando.idMembresia, valores);
          toast.success("Membresía actualizada correctamente");
      } else {
          await crearMembresia(valores);
          toast.success("Membresía creada correctamente");
      }
      setDialogAbierto(false);
      await cargarDatos();
    } catch (error: unknown) {
      toast.error(obtenerMensajeError(error, membresiaEditando ? "Error al actualizar la membresía" : "Error al crear la membresía"));
    }
  }

  function renderDate(fecha?: string) {
    if (!fecha) return <span className="text-sm text-slate-500">-</span>;
    const dateObj = new Date(fecha);
    const dateStr = dateObj.toLocaleDateString("es-CO", { year: "numeric", month: "short", day: "numeric" });
    const timeStr = dateObj.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
    return (
      <div className="flex flex-col">
        <span className="text-sm font-medium text-slate-900">{dateStr}</span>
        <span className="text-xs text-slate-500">{timeStr}</span>
      </div>
    );
  }

  // Filtrar tarifas que aplican para cobro mensual
  const tarifasMensuales = tarifas.filter(
    (t) => t.activo && (t.tipoCalculo === "MENSUAL" || t.tipoCalculo === "PLANA")
  );

  function etiquetaVehiculoMembresia(v: Vehiculo) {
    const propietario = v.nombreUsuario || (v.nombreExterno ? `${v.nombreExterno} (Ext)` : "Sin propietario");
    return v.placa ? `${v.placa} — ${propietario}` : `Bicicleta — ${propietario}`;
  }

  const [busqueda, setBusqueda] = useState("");

  const membresiasFiltradas = membresias.filter((m) => {
    const dVehiculo = vehiculos.find(v => v.idVehiculo === m.idVehiculo);
    const textVehiculo = dVehiculo ? etiquetaVehiculoMembresia(dVehiculo).toLowerCase() : "";
    return textVehiculo.includes(busqueda.toLowerCase());
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Membresías</h2>
          <p className="text-sm text-slate-500 font-normal">
            Suscripciones mensuales de parqueo para vehículos autorizados.
          </p>
        </div>
        <Button onClick={abrirCrear}>Nueva membresía</Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="p-4 border-b border-slate-200/80 flex items-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              type="search" 
              placeholder="Buscar por vehículo o propietario..." 
              className="pl-9 w-full" 
              value={busqueda} 
              onChange={(e) => setBusqueda(e.target.value)} 
            />
          </div>
        </div>

        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="text-slate-500 font-medium text-xs uppercase tracking-wider">Placa</TableHead>
              <TableHead className="text-slate-500 font-medium text-xs uppercase tracking-wider">Tarifa</TableHead>
              <TableHead className="text-slate-500 font-medium text-xs uppercase tracking-wider">Inicio</TableHead>
              <TableHead className="text-slate-500 font-medium text-xs uppercase tracking-wider">Vence</TableHead>
              <TableHead className="text-slate-500 font-medium text-xs uppercase tracking-wider">Monto pagado</TableHead>
              <TableHead className="text-slate-500 font-medium text-xs uppercase tracking-wider">Estado</TableHead>
              <TableHead className="text-slate-500 font-medium text-xs uppercase tracking-wider text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cargando && (
              <TableRow>
                <TableCell colSpan={7}>Cargando...</TableCell>
              </TableRow>
            )}
            {!cargando && membresiasFiltradas.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>No hay membresías registradas</TableCell>
              </TableRow>
            )}
            {membresiasFiltradas.map((m) => (
              <TableRow key={m.idMembresia}>
                <TableCell>
                  <span className="bg-slate-100 text-slate-900 font-mono font-bold text-xs px-2.5 py-1 rounded border border-slate-300 tracking-wider inline-block">
                    {m.placaVehiculo || "SIN PLACA"}
                  </span>
                </TableCell>
                <TableCell>{m.nombreTarifa}</TableCell>
                <TableCell>{renderDate(m.fechaInicio)}</TableCell>
                <TableCell>{renderDate(m.fechaFin)}</TableCell>
                <TableCell className="font-semibold">{formatearMoneda(m.montoPagado)}</TableCell>
                <TableCell>
                  <Badge variant={m.activa ? "default" : "secondary"}>
                    {m.activa ? "Activa" : "Vencida"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" onClick={() => abrirEditar(m)}>Editar</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogAbierto} onOpenChange={setDialogAbierto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{membresiaEditando ? "Editar membresía" : "Nueva membresía mensual"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="idVehiculo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehículo y Propietario</FormLabel>
                    <FormControl>
                      <BuscadorConFiltro
                        items={vehiculos}
                        valorSeleccionado={field.value || null}
                        obtenerId={(v) => v.idVehiculo}
                        obtenerEtiqueta={(v) => {
                          const propietario = v.nombreUsuario || (v.nombreExterno ? `${v.nombreExterno} (Ext)` : "Sin propietario");
                          return v.placa ? `${v.placa} ${propietario}` : `Vehículo ${v.idVehiculo} ${propietario}`;
                        }}
                        onSeleccionar={(id) => field.onChange(id)}
                        placeholder="Selecciona un vehículo o propietario..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="idTarifa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tarifa mensual</FormLabel>
                    <FormControl>
                      <select
                        className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                        value={field.value || ""}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      >
                        <option value="" disabled>
                          Selecciona una tarifa mensual
                        </option>
                        {(tarifasMensuales.length > 0 ? tarifasMensuales : tarifas).map((t) => {
                          const detalle =
                            t.porcentaje != null
                              ? `${t.porcentaje}% matrícula/salario`
                              : t.valorHora != null
                              ? formatearMoneda(t.valorHora)
                              : "";
                          return (
                            <option key={t.idTarifa} value={t.idTarifa}>
                              {t.nombre} {detalle ? `(${detalle})` : ""}
                            </option>
                          );
                        })}
                      </select>
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      El monto se calculará y redondeará automáticamente hacia arriba en múltiplos de $10.000.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="fechaInicio" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inicio (Histórico Opcional)</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="fechaFin" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fin (Opcional)</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="montoPagadoManual" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto a cobrar (Opcional)</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Dejar vacío para cálculo automático" value={formatCurrencyValue(field.value)} onChange={(e) => handleCurrencyChange(e, field.onChange)} />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">Si no ingresas un valor, el sistema calculará automáticamente el monto proporcional según los días de inicio y fin.</p>
                  </FormItem>
              )} />

              <DialogFooter>
                <Button type="submit">Crear membresía</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}



