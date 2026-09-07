import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { actualizarVehiculo, crearVehiculo, eliminarVehiculo, listarVehiculos } from "@/api/vehiculos";
import { listarTiposVehiculo } from "@/api/tiposVehiculo";
import { listarUsuarios } from "@/api/usuarios";
import type { TipoVehiculo } from "@/types/tipoVehiculo";
import type { Usuario } from "@/types/usuario";
import type { Vehiculo } from "@/types/vehiculo";
import { vehiculoSchema, type VehiculoFormValues } from "./vehiculoSchema";

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

const valoresIniciales: VehiculoFormValues = {
    idUsuario: null,
    idTipoVehiculo: 0,
    placa: "",
    marca: "",
    modelo: "",
    color: "",
    activo: true,
};

export default function VehiculosPage() {
    const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [tipos, setTipos] = useState<TipoVehiculo[]>([]);
    const [cargando, setCargando] = useState(true);
    const [dialogAbierto, setDialogAbierto] = useState(false);
    const [vehiculoEditando, setVehiculoEditando] = useState<Vehiculo | null>(null);

    const form = useForm<VehiculoFormValues>({
        resolver: zodResolver(vehiculoSchema),
        defaultValues: valoresIniciales,
    });

    async function cargarDatos() {
        setCargando(true);
        try {
            const [vehiculosData, usuariosData, tiposData] = await Promise.all([
                listarVehiculos(),
                listarUsuarios(),
                listarTiposVehiculo(),
            ]);
            setVehiculos(vehiculosData);
            setUsuarios(usuariosData);
            setTipos(tiposData);
        } catch {
            toast.error("No se pudieron cargar los vehículos");
        } finally {
            setCargando(false);
        }
    }

    useEffect(() => {
        cargarDatos();
    }, []);

    function abrirCrear() {
        setVehiculoEditando(null);
        form.reset(valoresIniciales);
        setDialogAbierto(true);
    }

    function abrirEditar(vehiculo: Vehiculo) {
        setVehiculoEditando(vehiculo);
        form.reset({
            idUsuario: vehiculo.idUsuario,
            idTipoVehiculo: vehiculo.idTipoVehiculo,
            placa: vehiculo.placa,
            marca: vehiculo.marca || "",
            modelo: vehiculo.modelo || "",
            color: vehiculo.color || "",
            activo: vehiculo.activo,
        });
        setDialogAbierto(true);
    }

    async function onSubmit(valores: VehiculoFormValues) {
        const payload = {
            idUsuario: valores.idUsuario,
            idTipoVehiculo: valores.idTipoVehiculo,
            placa: valores.placa.trim().toUpperCase(),
            marca: valores.marca ?? "",
            modelo: valores.modelo ?? "",
            color: valores.color ?? "",
            activo: valores.activo,
        };

        try {
            if (vehiculoEditando) {
                await actualizarVehiculo(vehiculoEditando.idVehiculo, payload);
                toast.success("Vehículo actualizado correctamente");
            } else {
                await crearVehiculo(payload);
                toast.success("Vehículo creado correctamente");
            }
            setDialogAbierto(false);
            await cargarDatos();
        } catch {
            toast.error("Ocurrió un error al guardar el vehículo");
        }
    }

    async function handleEliminar(id: number) {
        try {
            await eliminarVehiculo(id);
            toast.success("Vehículo eliminado");
            await cargarDatos();
        } catch {
            toast.error("No se pudo eliminar el vehículo");
        }
    }

    function nombreUsuario(id: number | null) {
        if (id === null) return "Sin asignar";
        const usuario = usuarios.find((item) => item.idUsuario === id);
        return usuario ? `${usuario.nombres} ${usuario.apellidos}` : "Usuario no encontrado";
    }

    function nombreTipo(id: number) {
        return tipos.find((tipo) => tipo.idTipoVehiculo === id)?.nombre ?? "Tipo no encontrado";
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Vehículos</h2>
                <Button onClick={abrirCrear}>Nuevo vehículo</Button>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Placa</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Propietario</TableHead>
                        <TableHead>Marca / modelo</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {cargando && <TableRow><TableCell colSpan={6}>Cargando...</TableCell></TableRow>}
                    {!cargando && vehiculos.length === 0 && (
                        <TableRow><TableCell colSpan={6}>No hay vehículos registrados</TableCell></TableRow>
                    )}
                    {vehiculos.map((vehiculo) => (
                        <TableRow key={vehiculo.idVehiculo}>
                            <TableCell className="font-medium">{vehiculo.placa}</TableCell>
                            <TableCell>{nombreTipo(vehiculo.idTipoVehiculo)}</TableCell>
                            <TableCell>{nombreUsuario(vehiculo.idUsuario)}</TableCell>
                            <TableCell>{[vehiculo.marca, vehiculo.modelo].filter(Boolean).join(" / ") || "-"}</TableCell>
                            <TableCell>
                                <Badge variant={vehiculo.activo ? "default" : "secondary"}>
                                    {vehiculo.activo ? "Activo" : "Inactivo"}
                                </Badge>
                            </TableCell>
                            <TableCell className="flex justify-end gap-2 text-right">
                                <Button variant="outline" size="sm" onClick={() => abrirEditar(vehiculo)}>
                                    Editar
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger render={<Button variant="destructive" size="sm" />}>
                                        Eliminar
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>¿Eliminar este vehículo?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Esta acción no se puede deshacer. Se eliminará el vehículo "{vehiculo.placa}".
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleEliminar(vehiculo.idVehiculo)}>
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
                        <DialogTitle>{vehiculoEditando ? "Editar vehículo" : "Nuevo vehículo"}</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
                            <FormField control={form.control} name="placa" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Placa</FormLabel>
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
                            <FormField control={form.control} name="marca" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Marca</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="modelo" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Modelo</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="color" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Color</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="idUsuario" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Usuario</FormLabel>
                                    <FormControl>
                                        <select
                                            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                                            value={field.value ?? ""}
                                            onChange={(event) => field.onChange(event.target.value ? Number(event.target.value) : null)}
                                        >
                                            <option value="">Sin asignar</option>
                                            {usuarios.filter((usuario) => usuario.activo || usuario.idUsuario === field.value).map((usuario) => (
                                                <option key={usuario.idUsuario} value={usuario.idUsuario}>
                                                    {usuario.nombres} {usuario.apellidos}
                                                </option>
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
