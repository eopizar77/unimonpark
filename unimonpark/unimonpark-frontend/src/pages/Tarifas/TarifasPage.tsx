import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { actualizarTarifa, crearTarifa, eliminarTarifa, listarTarifas } from "@/api/tarifas";
import { listarTiposVehiculo } from "@/api/tiposVehiculo";
import type { TipoVehiculo } from "@/types/tipoVehiculo";
import type { Tarifa } from "@/types/tarifa";
import { tarifaSchema, type TarifaFormValues } from "./tarifaSchema";

import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const valoresIniciales: TarifaFormValues = {
    idTipoVehiculo: 0,
    nombre: "",
    valorHora: 0,
    valorDiurno: null,
    valorNocturno: null,
    horaInicioNocturna: null,
    horaFinNocturna: null,
    activo: true,
};

function formatoMoneda(valor: number | null) {
    if (valor === null) return "-";
    return `$${valor.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

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

    async function cargarDatos() {
        setCargando(true);
        try {
            const [tarifasData, tiposData] = await Promise.all([
                listarTarifas(),
                listarTiposVehiculo(),
            ]);
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
            idTipoVehiculo: tarifa.idTipoVehiculo,
            nombre: tarifa.nombre,
            valorHora: tarifa.valorHora,
            valorDiurno: tarifa.valorDiurno,
            valorNocturno: tarifa.valorNocturno,
            horaInicioNocturna: tarifa.horaInicioNocturna,
            horaFinNocturna: tarifa.horaFinNocturna,
            activo: tarifa.activo,
        });
        setDialogAbierto(true);
    }

    async function onSubmit(valores: TarifaFormValues) {
        const payload = {
            ...valores,
            nombre: valores.nombre.trim(),
            horaInicioNocturna: valores.horaInicioNocturna || null,
            horaFinNocturna: valores.horaFinNocturna || null,
        };

        try {
            if (tarifaEditando) {
                await actualizarTarifa(tarifaEditando.idTarifa, payload);
                toast.success("Tarifa actualizada correctamente");
            } else {
                await crearTarifa(payload);
                toast.success("Tarifa creada correctamente");
            }
            setDialogAbierto(false);
            await cargarDatos();
        } catch {
            toast.error("Ocurrió un error al guardar la tarifa");
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

    function nombreTipo(id: number) {
        return tipos.find((tipo) => tipo.idTipoVehiculo === id)?.nombre ?? "Tipo no encontrado";
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Tarifas</h2>
                <Button onClick={abrirCrear}>Nueva tarifa</Button>
            </div>

            <Table>
                <TableHeader><TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Tipo de vehículo</TableHead>
                    <TableHead>Valor hora</TableHead>
                    <TableHead>Diurna</TableHead>
                    <TableHead>Nocturna</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                    {cargando && <TableRow><TableCell colSpan={7}>Cargando...</TableCell></TableRow>}
                    {!cargando && tarifas.length === 0 && <TableRow><TableCell colSpan={7}>No hay tarifas registradas</TableCell></TableRow>}
                    {tarifas.map((tarifa) => (
                        <TableRow key={tarifa.idTarifa}>
                            <TableCell className="font-medium">{tarifa.nombre}</TableCell>
                            <TableCell>{nombreTipo(tarifa.idTipoVehiculo)}</TableCell>
                            <TableCell>{formatoMoneda(tarifa.valorHora)}</TableCell>
                            <TableCell>{formatoMoneda(tarifa.valorDiurno)}</TableCell>
                            <TableCell>{formatoMoneda(tarifa.valorNocturno)}</TableCell>
                            <TableCell><Badge variant={tarifa.activo ? "default" : "secondary"}>{tarifa.activo ? "Activa" : "Inactiva"}</Badge></TableCell>
                            <TableCell className="flex justify-end gap-2 text-right">
                                <Button variant="outline" size="sm" onClick={() => abrirEditar(tarifa)}>Editar</Button>
                                <AlertDialog>
                                    <AlertDialogTrigger render={<Button variant="destructive" size="sm" />}>Eliminar</AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>¿Eliminar esta tarifa?</AlertDialogTitle>
                                            <AlertDialogDescription>Esta acción no se puede deshacer. Se eliminará la tarifa "{tarifa.nombre}".</AlertDialogDescription>
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
                    <DialogHeader><DialogTitle>{tarifaEditando ? "Editar tarifa" : "Nueva tarifa"}</DialogTitle></DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
                            <FormField control={form.control} name="nombre" render={({ field }) => (
                                <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="idTipoVehiculo" render={({ field }) => (
                                <FormItem><FormLabel>Tipo de vehículo</FormLabel><FormControl>
                                    <select className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm" value={field.value || ""} onChange={(event) => field.onChange(Number(event.target.value))}>
                                        <option value="" disabled>Selecciona un tipo</option>
                                        {tipos.filter((tipo) => tipo.activo || tipo.idTipoVehiculo === field.value).map((tipo) => <option key={tipo.idTipoVehiculo} value={tipo.idTipoVehiculo}>{tipo.nombre}</option>)}
                                    </select>
                                </FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="valorHora" render={({ field }) => (
                                <FormItem><FormLabel>Valor por hora</FormLabel><FormControl><Input type="number" min="0" step="0.01" value={field.value} onChange={(event) => field.onChange(Number(event.target.value))} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="valorDiurno" render={({ field }) => (
                                <FormItem><FormLabel>Valor diurno</FormLabel><FormControl><Input type="number" min="0" step="0.01" value={field.value ?? ""} onChange={(event) => field.onChange(event.target.value === "" ? null : Number(event.target.value))} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="valorNocturno" render={({ field }) => (
                                <FormItem><FormLabel>Valor nocturno</FormLabel><FormControl><Input type="number" min="0" step="0.01" value={field.value ?? ""} onChange={(event) => field.onChange(event.target.value === "" ? null : Number(event.target.value))} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="horaInicioNocturna" render={({ field }) => (
                                <FormItem><FormLabel>Inicio nocturno</FormLabel><FormControl><Input type="time" value={field.value ?? ""} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="horaFinNocturna" render={({ field }) => (
                                <FormItem><FormLabel>Fin nocturno</FormLabel><FormControl><Input type="time" value={field.value ?? ""} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="activo" render={({ field }) => (
                                <FormItem className="flex items-center justify-between sm:mt-6"><FormLabel>Activa</FormLabel><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
                            )} />
                            <DialogFooter className="sm:col-span-2"><Button type="submit">Guardar</Button></DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
