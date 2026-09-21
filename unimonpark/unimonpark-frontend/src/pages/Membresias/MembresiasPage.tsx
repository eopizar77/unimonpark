import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { listarMembresias, crearMembresia } from "@/api/membresias";
import { obtenerMensajeError } from "@/api/client";
import { listarVehiculos } from "@/api/vehiculos";
import { listarTarifas } from "@/api/tarifas";
import type { Vehiculo } from "@/types/vehiculo";
import type { Tarifa } from "@/types/tarifa";
import type { Membresia } from "@/types/membresia";
import { membresiaSchema, type MembresiaFormValues } from "./membresiaShema";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const valoresIniciales: MembresiaFormValues = {
  idVehiculo: 0,
  idTarifa: 0,
};

export default function MembresiasPage() {
  const [membresias, setMembresias] = useState<Membresia[]>([]);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [tarifas, setTarifas] = useState<Tarifa[]>([]);
  const [cargando, setCargando] = useState(true);
  const [dialogAbierto, setDialogAbierto] = useState(false);

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
      setVehiculos(vehiculosData);
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
    form.reset(valoresIniciales);
    setDialogAbierto(true);
  }

  async function onSubmit(valores: MembresiaFormValues) {
    try {
      await crearMembresia(valores);
      toast.success("Membresía creada correctamente");
      setDialogAbierto(false);
      await cargarDatos();
    } catch (error: unknown) {
      toast.error(obtenerMensajeError(error, "Ocurrió un error al crear la membresía"));
    }
  }

  function formatearFecha(fecha: string) {
    return new Date(fecha).toLocaleDateString("es-CO", { year: "numeric", month: "short", day: "numeric" });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Membresías</h2>
        <Button onClick={abrirCrear}>Nueva membresía</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Placa</TableHead>
            <TableHead>Tarifa</TableHead>
            <TableHead>Inicio</TableHead>
            <TableHead>Vence</TableHead>
            <TableHead>Monto pagado</TableHead>
            <TableHead>Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cargando && <TableRow><TableCell colSpan={6}>Cargando...</TableCell></TableRow>}
          {!cargando && membresias.length === 0 && (
            <TableRow><TableCell colSpan={6}>No hay membresías registradas</TableCell></TableRow>
          )}
          {membresias.map((m) => (
            <TableRow key={m.idMembresia}>
              <TableCell className="font-medium">{m.placaVehiculo}</TableCell>
              <TableCell>{m.nombreTarifa}</TableCell>
              <TableCell>{formatearFecha(m.fechaInicio)}</TableCell>
              <TableCell>{formatearFecha(m.fechaFin)}</TableCell>
              <TableCell>${m.montoPagado}</TableCell>
              <TableCell>
                <Badge variant={m.activa ? "default" : "secondary"}>
                  {m.activa ? "Activa" : "Vencida"}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={dialogAbierto} onOpenChange={setDialogAbierto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva membresía</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <FormField control={form.control} name="idVehiculo" render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehículo</FormLabel>
                  <FormControl>
                    <select
                      className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                      value={field.value || ""}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    >
                      <option value="" disabled>Selecciona un vehículo</option>
                      {vehiculos.map((v) => (
                        <option key={v.idVehiculo} value={v.idVehiculo}>{v.placa}</option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="idTarifa" render={({ field }) => (
                <FormItem>
                  <FormLabel>Tarifa (mensual)</FormLabel>
                  <FormControl>
                    <select
                      className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                      value={field.value || ""}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    >
                      <option value="" disabled>Selecciona una tarifa</option>
                      {tarifas.map((t) => (
                        <option key={t.idTarifa} value={t.idTarifa}>{t.nombre}</option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
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