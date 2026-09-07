import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
    actualizarEspacioParqueo,
    crearEspacioParqueo,
    eliminarEspacioParqueo,
    listarEspaciosParqueo,
} from "@/api/espaciosParqueo";
import { listarTiposVehiculo } from "@/api/tiposVehiculo";
import type { TipoVehiculo } from "@/types/tipoVehiculo";
import type { EspacioParqueo } from "@/types/espacioParqueo";
import { espacioParqueoSchema, type EspacioParqueoFormValues } from "./espacioParqueoSchema";

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

const estadosDisponibles = ["disponible", "ocupado", "reservado", "mantenimiento"];

const valoresIniciales: EspacioParqueoFormValues = {
    codigo: "",
    piso: "",
    zona: "",
    estado: "disponible",
    activo: true,
    idTipoVehiculo: 0,
};

export default function EspaciosParqueoPage() {
    const [espacios, setEspacios] = useState<EspacioParqueo[]>([]);
    const [tipos, setTipos] = useState<TipoVehiculo[]>([]);
    const [cargando, setCargando] = useState(true);
    const [dialogAbierto, setDialogAbierto] = useState(false);
    const [espacioEditando, setEspacioEditando] = useState<EspacioParqueo | null>(null);

    const form = useForm<EspacioParqueoFormValues>({
        resolver: zodResolver(espacioParqueoSchema),
        defaultValues: valoresIniciales,
    });

    async function cargarDatos() {
        setCargando(true);
        try {
            const [espaciosData, tiposData] = await Promise.all([
                listarEspaciosParqueo(),
                listarTiposVehiculo(),
            ]);
            setEspacios(espaciosData);
            setTipos(tiposData);
        } catch {
            toast.error("No se pudieron cargar los espacios de parqueo");
        } finally {
            setCargando(false);
        }
    }

    useEffect(() => {
        cargarDatos();
    }, []);

    function abrirCrear() {
        setEspacioEditando(null);
        form.reset(valoresIniciales);
        setDialogAbierto(true);
    }

    function abrirEditar(espacio: EspacioParqueo) {
        setEspacioEditando(espacio);
        form.reset({
            codigo: espacio.codigo,
            piso: espacio.piso || "",
            zona: espacio.zona || "",
            estado: espacio.estado,
            activo: espacio.activo,
            idTipoVehiculo: espacio.idTipoVehiculo,
        });
        setDialogAbierto(true);
    }

    async function onSubmit(valores: EspacioParqueoFormValues) {
        const payload = {
            codigo: valores.codigo.trim().toUpperCase(),
            piso: valores.piso ?? "",
            zona: valores.zona ?? "",
            estado: valores.estado.trim().toLowerCase(),
            activo: valores.activo,
            idTipoVehiculo: valores.idTipoVehiculo,
        };

        try {
            if (espacioEditando) {
                await actualizarEspacioParqueo(espacioEditando.idEspacio, payload);
                toast.success("Espacio de parqueo actualizado correctamente");
            } else {
                await crearEspacioParqueo(payload);
                toast.success("Espacio de parqueo creado correctamente");
            }
            setDialogAbierto(false);
            await cargarDatos();
        } catch {
            toast.error("Ocurrió un error al guardar el espacio de parqueo");
        }
    }

    async function handleEliminar(id: number) {
        try {
            await eliminarEspacioParqueo(id);
            toast.success("Espacio de parqueo eliminado");
            await cargarDatos();
        } catch {
            toast.error("No se pudo eliminar el espacio de parqueo");
        }
    }

    function nombreTipo(id: number) {
        return tipos.find((tipo) => tipo.idTipoVehiculo === id)?.nombre ?? "Tipo no encontrado";
    }

    function estadosParaFormulario() {
        const estadoActual = form.getValues("estado");
        return estadoActual && !estadosDisponibles.includes(estadoActual)
            ? [...estadosDisponibles, estadoActual]
            : estadosDisponibles;
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Espacios de parqueo</h2>
                <Button onClick={abrirCrear}>Nuevo espacio</Button>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Piso</TableHead>
                        <TableHead>Zona</TableHead>
                        <TableHead>Tipo de vehículo</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Activo</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {cargando && <TableRow><TableCell colSpan={7}>Cargando...</TableCell></TableRow>}
                    {!cargando && espacios.length === 0 && (
                        <TableRow><TableCell colSpan={7}>No hay espacios de parqueo registrados</TableCell></TableRow>
                    )}
                    {espacios.map((espacio) => (
                        <TableRow key={espacio.idEspacio}>
                            <TableCell className="font-medium">{espacio.codigo}</TableCell>
                            <TableCell>{espacio.piso || "-"}</TableCell>
                            <TableCell>{espacio.zona || "-"}</TableCell>
                            <TableCell>{nombreTipo(espacio.idTipoVehiculo)}</TableCell>
                            <TableCell><Badge variant="outline">{espacio.estado}</Badge></TableCell>
                            <TableCell>
                                <Badge variant={espacio.activo ? "default" : "secondary"}>
                                    {espacio.activo ? "Sí" : "No"}
                                </Badge>
                            </TableCell>
                            <TableCell className="flex justify-end gap-2 text-right">
                                <Button variant="outline" size="sm" onClick={() => abrirEditar(espacio)}>
                                    Editar
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger render={<Button variant="destructive" size="sm" />}>
                                        Eliminar
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>¿Eliminar este espacio?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Esta acción no se puede deshacer. Se eliminará el espacio "{espacio.codigo}".
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleEliminar(espacio.idEspacio)}>
                                                Eliminar
                                            </AlertDialogAction>
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
                        <DialogTitle>{espacioEditando ? "Editar espacio de parqueo" : "Nuevo espacio de parqueo"}</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
                            <FormField control={form.control} name="codigo" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Código</FormLabel>
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
                                            onChange={(event) => field.onChange(Number(event.target.value))}
                                        >
                                            <option value="" disabled>Selecciona un tipo</option>
                                            {tipos.filter((tipo) => tipo.activo || tipo.idTipoVehiculo === field.value).map((tipo) => (
                                                <option key={tipo.idTipoVehiculo} value={tipo.idTipoVehiculo}>{tipo.nombre}</option>
                                            ))}
                                        </select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="piso" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Piso</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="zona" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Zona</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="estado" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Estado</FormLabel>
                                    <FormControl>
                                        <select
                                            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                                            value={field.value}
                                            onChange={field.onChange}
                                        >
                                            {estadosParaFormulario().map((estado) => (
                                                <option key={estado} value={estado}>{estado}</option>
                                            ))}
                                        </select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="activo" render={({ field }) => (
                                <FormItem className="flex items-center justify-between sm:mt-6">
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
