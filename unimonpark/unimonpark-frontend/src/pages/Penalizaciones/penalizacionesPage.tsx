import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { listarPenalizaciones, crearPenalizacion, marcarPenalizacionPagada } from "@/api/penalizaciones";
import { obtenerMensajeError } from "@/api/client";
import { listarVehiculos } from "@/api/vehiculos";
import type { Vehiculo } from "@/types/vehiculo";
import type { Penalizacion } from "@/types/penalizaciones";
import { penalizacionSchema, type PenalizacionFormValues } from "./penalizacionSchema";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const valoresIniciales: PenalizacionFormValues = {
  idVehiculo: 0,
  tipo: "TICKET_PERDIDO",
  observaciones: "",
};

export default function PenalizacionesPage() {
  const [penalizaciones, setPenalizaciones] = useState<Penalizacion[]>([]);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [dialogAbierto, setDialogAbierto] = useState(false);

  const form = useForm<PenalizacionFormValues>({
    resolver: zodResolver(penalizacionSchema),
    defaultValues: valoresIniciales,
  });

  async function cargarDatos() {
    setCargando(true);
    try {
      const [penalizacionesData, vehiculosData] = await Promise.all([
        listarPenalizaciones(),
        listarVehiculos(),
      ]);
      setPenalizaciones(penalizacionesData);
      setVehiculos(vehiculosData);
    } catch {
      toast.error("No se pudieron cargar las penalizaciones");
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

  async function onSubmit(valores: PenalizacionFormValues) {
    try {
      await crearPenalizacion(valores);
      toast.success("Penalización registrada correctamente");
      setDialogAbierto(false);
      await cargarDatos();
    } catch (error: unknown) {
      toast.error(obtenerMensajeError(error, "Ocurrió un error al registrar la penalización"));
    }
  }

  async function handleMarcarPagada(id: number) {
    try {
      await marcarPenalizacionPagada(id);
      toast.success("Penalización marcada como pagada");
      await cargarDatos();
    } catch {
      toast.error("No se pudo actualizar la penalización");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Penalizaciones</h2>
        <Button onClick={abrirCrear}>Nueva penalización</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Placa</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cargando && <TableRow><TableCell colSpan={5}>Cargando...</TableCell></TableRow>}
          {!cargando && penalizaciones.length === 0 && (
            <TableRow><TableCell colSpan={5}>No hay penalizaciones registradas</TableCell></TableRow>
          )}
          {penalizaciones.map((p) => (
            <TableRow key={p.idPenalizacion}>
              <TableCell className="font-medium">{p.placaVehiculo}</TableCell>
              <TableCell>{p.tipo === "TICKET_PERDIDO" ? "Ticket perdido" : "Ficha perdida"}</TableCell>
              <TableCell>${p.valor}</TableCell>
              <TableCell>
                <Badge variant={p.estado === "PAGADA" ? "default" : "secondary"}>
                  {p.estado === "PAGADA" ? "Pagada" : "Pendiente"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {p.estado === "PENDIENTE" && (
                  <Button variant="outline" size="sm" onClick={() => handleMarcarPagada(p.idPenalizacion)}>
                    Marcar pagada
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={dialogAbierto} onOpenChange={setDialogAbierto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva penalización</DialogTitle>
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

              <FormField control={form.control} name="tipo" render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de penalización</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="TICKET_PERDIDO">Ticket perdido ($3.000)</SelectItem>
                      <SelectItem value="FICHA_PERDIDA">Ficha perdida ($25.000)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="observaciones" render={({ field }) => (
                <FormItem>
                  <FormLabel>Observaciones (opcional)</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <DialogFooter>
                <Button type="submit">Registrar</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}