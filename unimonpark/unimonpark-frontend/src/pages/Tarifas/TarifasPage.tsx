import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { listarTarifas, crearTarifa, actualizarTarifa, eliminarTarifa } from "@/api/tarifas";
import { obtenerMensajeError } from "@/api/client";
import { listarTiposVehiculo } from "@/api/tiposVehiculo";
import type { TipoVehiculo } from "@/types/tipoVehiculo";
import type { Tarifa } from "@/types/tarifa";
import { tarifaSchema, type TarifaFormValues } from "./tarifaSchema";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const valoresIniciales: TarifaFormValues = {
  nombre: "",
  valorHora: 0,
  activo: true,
  idTipoVehiculo: 0,
  categoriaPersona: null,
  tipoCalculo: "POR_HORA",
  horasLimite: null,
  valorHastaLimite: null,
  valorDespuesLimite: null,
  porcentaje: null,
};

export default function TarifasPage() {
  const [tarifas, setTarifas] = useState<Tarifa[]>([]);
  const [tipos, setTipos] = useState<TipoVehiculo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [dialogAbierto, setDialogAbierto] = useState(false);
  const [tarifaEditando, setTarifaEditando] = useState<Tarifa | null>(null);

  const form = useForm<TarifaFormValues>({
    resolver: zodResolver(tarifaSchema),
    defaultValues: valoresIniciales,
  });

  const tipoCalculoSeleccionado = form.watch("tipoCalculo");

  async function cargarDatos() {
    setCargando(true);
    try {
      const [tarifasData, tiposData] = await Promise.all([listarTarifas(), listarTiposVehiculo()]);
      setTarifas(tarifasData);
      setTipos(tiposData);
    } catch {
      toast.error("No se pudieron cargar las tarifas");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  function abrirCrear() {
    setTarifaEditando(null);
    form.reset(valoresIniciales);
    setDialogAbierto(true);
  }

  function abrirEditar(tarifa: Tarifa) {
    setTarifaEditando(tarifa);
    form.reset({
      nombre: tarifa.nombre,
      valorHora: tarifa.valorHora,
      activo: tarifa.activo,
      idTipoVehiculo: tarifa.idTipoVehiculo,
      categoriaPersona: tarifa.categoriaPersona ?? null,
      tipoCalculo: tarifa.tipoCalculo,
      horasLimite: tarifa.horasLimite,
      valorHastaLimite: tarifa.valorHastaLimite,
      valorDespuesLimite: tarifa.valorDespuesLimite,
      porcentaje: tarifa.porcentaje ?? null,
    });
    setDialogAbierto(true);
  }

  async function onSubmit(valores: TarifaFormValues) {
    try {
      if (tarifaEditando) {
        await actualizarTarifa(tarifaEditando.idTarifa, valores);
        toast.success("Tarifa actualizada correctamente");
      } else {
        await crearTarifa(valores);
        toast.success("Tarifa creada correctamente");
      }
      setDialogAbierto(false);
      await cargarDatos();
    } catch (error: unknown) {
      toast.error(obtenerMensajeError(error, "Ocurrió un error al guardar la tarifa"));
    }
  }

  async function handleEliminar(id: number) {
    try {
      await eliminarTarifa(id);
      toast.success("Tarifa eliminada");
      await cargarDatos();
    } catch {
      toast.error("No se pudo eliminar la tarifa");
    }
  }

  function valorMostrado(tarifa: Tarifa) {
    if (tarifa.tipoCalculo === "POR_TRAMOS") {
      return `$${tarifa.valorHastaLimite} / $${tarifa.valorDespuesLimite}`;
    }
    if (tarifa.tipoCalculo === "MENSUAL") {
      return tarifa.porcentaje != null ? `${tarifa.porcentaje}%` : `$${tarifa.valorHora ?? "-"}`;
    }
    return `$${tarifa.valorHora}`;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Tarifas</h2>
        <Button onClick={abrirCrear}>Nueva tarifa</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Tipo vehículo</TableHead>
            <TableHead>Cálculo</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cargando && <TableRow><TableCell colSpan={6}>Cargando...</TableCell></TableRow>}
          {!cargando && tarifas.length === 0 && (
            <TableRow><TableCell colSpan={6}>No hay tarifas registradas</TableCell></TableRow>
          )}
          {tarifas.map((tarifa) => (
            <TableRow key={tarifa.idTarifa}>
              <TableCell className="font-medium">{tarifa.nombre}</TableCell>
              <TableCell>{tarifa.nombreTipoVehiculo}</TableCell>
              <TableCell>{tarifa.tipoCalculo}</TableCell>
              <TableCell>{valorMostrado(tarifa)}</TableCell>
              <TableCell>
                <Badge variant={tarifa.activo ? "default" : "secondary"}>
                  {tarifa.activo ? "Activo" : "Inactivo"}
                </Badge>
              </TableCell>
              <TableCell className="flex justify-end gap-2 text-right">
                <Button variant="outline" size="sm" onClick={() => abrirEditar(tarifa)}>Editar</Button>
                <AlertDialog>
                  <AlertDialogTrigger render={<Button variant="destructive" size="sm" />}>
                    Eliminar
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Eliminar esta tarifa?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer. Se eliminará "{tarifa.nombre}".
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleEliminar(tarifa.idTarifa)}>Eliminar</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={dialogAbierto} onOpenChange={setDialogAbierto}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{tarifaEditando ? "Editar tarifa" : "Nueva tarifa"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="nombre" render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Nombre</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="idTipoVehiculo" render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de vehículo</FormLabel>
                  <FormControl>
                    <select
                      className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                      value={field.value || ""}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    >
                      <option value="" disabled>Selecciona un tipo</option>
                      {tipos.map((tipo) => (
                        <option key={tipo.idTipoVehiculo} value={tipo.idTipoVehiculo}>{tipo.nombre}</option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="categoriaPersona" render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría de persona</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sin categoría específica" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ESTUDIANTE">Estudiante</SelectItem>
                      <SelectItem value="DOCENTE_ADMINISTRATIVO_EXTERNO">Docente / Administrativo / Externo</SelectItem>
                      <SelectItem value="CENTRO_OBRERO">Centro Obrero</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="tipoCalculo" render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Tipo de cálculo</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el tipo de cálculo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="POR_HORA">Por hora</SelectItem>
                      <SelectItem value="POR_TRAMOS">Por tramos</SelectItem>
                      <SelectItem value="PLANA">Tarifa plana</SelectItem>
                      <SelectItem value="MENSUAL">Mensual (% sobre matrícula/salario)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              {(tipoCalculoSeleccionado === "POR_HORA" || tipoCalculoSeleccionado === "PLANA" || tipoCalculoSeleccionado === "MENSUAL") && (
                <FormField control={form.control} name="valorHora" render={({ field }) => (
                  <FormItem className={tipoCalculoSeleccionado === "MENSUAL" ? "" : "sm:col-span-2"}>
                    <FormLabel>
                      {tipoCalculoSeleccionado === "PLANA"
                        ? "Valor único"
                        : tipoCalculoSeleccionado === "MENSUAL"
                        ? "Valor mensual fijo"
                        : "Valor por hora"}
                    </FormLabel>
                    <FormControl>
                      <Input type="number" {...field} value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))} />
                    </FormControl>
                    {tipoCalculoSeleccionado === "MENSUAL" && (
                      <p className="text-xs text-muted-foreground">Úsalo cuando la mensualidad es un monto fijo (ej. motos). Déjalo vacío si usas porcentaje.</p>
                    )}
                    <FormMessage />
                  </FormItem>
                )} />
              )}

              {tipoCalculoSeleccionado === "MENSUAL" && (
                <FormField control={form.control} name="porcentaje" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Porcentaje mensual (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        placeholder="Ej: 2 o 3"
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      Úsalo cuando la mensualidad es % de matrícula/salario (ej. carros). Déjalo vacío si usas valor fijo.
                    </p>
                    <FormMessage />
                  </FormItem>
                )} />
              )}

              {tipoCalculoSeleccionado === "POR_TRAMOS" && (
                <>
                  <FormField control={form.control} name="horasLimite" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Horas límite</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" {...field} value={field.value ?? ""} onChange={(e) => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="valorHastaLimite" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor hasta el límite</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} value={field.value ?? ""} onChange={(e) => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="valorDespuesLimite" render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Valor después del límite</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} value={field.value ?? ""} onChange={(e) => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </>
              )}

              <FormField control={form.control} name="activo" render={({ field }) => (
                <FormItem className="flex items-center justify-between sm:col-span-2">
                  <FormLabel>Activo</FormLabel>
                  <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                </FormItem>
              )} />

              <DialogFooter className="sm:col-span-2">
                <Button type="submit">Guardar</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}