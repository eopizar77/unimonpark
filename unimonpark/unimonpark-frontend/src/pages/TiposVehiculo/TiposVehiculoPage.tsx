import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
    actualizarTipoVehiculo,
    crearTipoVehiculo,
    eliminarTipoVehiculo,
    listarTiposVehiculo,
} from "@/api/tiposVehiculo";
import type { TipoVehiculo } from "@/types/tipoVehiculo";
import { tipoVehiculoSchema, type TipoVehiculoFormValues } from "./tipoVehiculoSchema";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
    AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function TiposVehiculoPage() {
    const [tipos, setTipos] = useState<TipoVehiculo[]>([]);
    const [cargando, setCargando] = useState(true);
    const [dialogAbierto, setDialogAbierto] = useState(false);
    const [tipoEditando, setTipoEditando] = useState<TipoVehiculo | null>(null);

    const form = useForm<TipoVehiculoFormValues>({
        resolver: zodResolver(tipoVehiculoSchema),
        defaultValues: { nombre: "", descripcion: "", activo: true },
    });

    async function cargarTipos() {
        setCargando(true);
        try {
            setTipos(await listarTiposVehiculo());
        } catch {
            toast.error("No se pudieron cargar los tipos de vehículo");
        } finally {
            setCargando(false);
        }
    }

    useEffect(() => {
        cargarTipos();
    }, []);

    function abrirCrear() {
        setTipoEditando(null);
        form.reset({ nombre: "", descripcion: "", activo: true });
        setDialogAbierto(true);
    }

    function abrirEditar(tipo: TipoVehiculo) {
        setTipoEditando(tipo);
        form.reset({
            nombre: tipo.nombre,
            descripcion: tipo.descripcion || "",
            activo: tipo.activo,
        });
        setDialogAbierto(true);
    }

    async function onSubmit(valores: TipoVehiculoFormValues) {
        const payload = { ...valores, descripcion: valores.descripcion ?? "" };
        try {
            if (tipoEditando) {
                await actualizarTipoVehiculo(tipoEditando.idTipoVehiculo, payload);
                toast.success("Tipo de vehículo actualizado correctamente");
            } else {
                await crearTipoVehiculo(payload);
                toast.success("Tipo de vehículo creado correctamente");
            }
            setDialogAbierto(false);
            await cargarTipos();
        } catch {
            toast.error("Ocurrió un error al guardar el tipo de vehículo");
        }
    }

    async function handleEliminar(id: number) {
        try {
            await eliminarTipoVehiculo(id);
            toast.success("Tipo de vehículo eliminado");
            await cargarTipos();
        } catch {
            toast.error("No se pudo eliminar el tipo de vehículo");
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Tipos de Vehículo</h2>
                <Button onClick={abrirCrear}>Nuevo tipo</Button>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {cargando && <TableRow><TableCell colSpan={4}>Cargando...</TableCell></TableRow>}
                    {!cargando && tipos.length === 0 && (
                        <TableRow><TableCell colSpan={4}>No hay tipos de vehículo registrados</TableCell></TableRow>
                    )}
                    {tipos.map((tipo) => (
                        <TableRow key={tipo.idTipoVehiculo}>
                            <TableCell className="font-medium">{tipo.nombre}</TableCell>
                            <TableCell>{tipo.descripcion}</TableCell>
                            <TableCell>
                                <Badge variant={tipo.activo ? "default" : "secondary"}>
                                    {tipo.activo ? "Activo" : "Inactivo"}
                                </Badge>
                            </TableCell>
                            <TableCell className="flex justify-end gap-2 text-right">
                                <Button variant="outline" size="sm" onClick={() => abrirEditar(tipo)}>
                                    Editar
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger render={<Button variant="destructive" size="sm" />}>
                                        Eliminar
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>¿Eliminar este tipo de vehículo?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Esta acción no se puede deshacer. Se eliminará "{tipo.nombre}".
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleEliminar(tipo.idTipoVehiculo)}>
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
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{tipoEditando ? "Editar tipo de vehículo" : "Nuevo tipo de vehículo"}</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                            <FormField control={form.control} name="nombre" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="descripcion" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descripción</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="activo" render={({ field }) => (
                                <FormItem className="flex items-center justify-between">
                                    <FormLabel>Activo</FormLabel>
                                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                </FormItem>
                            )} />
                            <DialogFooter><Button type="submit">Guardar</Button></DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
