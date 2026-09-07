import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { actualizarUsuario, crearUsuario, eliminarUsuario, listarUsuarios } from "@/api/usuarios";
import { listarRoles } from "@/api/roles";
import type { Rol } from "@/types/rol";
import type { Usuario } from "@/types/usuario";
import { usuarioSchema, type UsuarioFormValues } from "./usuarioSchema";

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

const valoresIniciales: UsuarioFormValues = {
    nombres: "",
    apellidos: "",
    documento: "",
    correo: "",
    telefono: "",
    nombreUsuario: "",
    contrasena: "",
    idRol: 0,
    activo: true,
};

export default function UsuariosPage() {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [roles, setRoles] = useState<Rol[]>([]);
    const [cargando, setCargando] = useState(true);
    const [dialogAbierto, setDialogAbierto] = useState(false);
    const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);

    const form = useForm<UsuarioFormValues>({
        resolver: zodResolver(usuarioSchema),
        defaultValues: valoresIniciales,
    });

    async function cargarDatos() {
        setCargando(true);
        try {
            const [usuariosData, rolesData] = await Promise.all([listarUsuarios(), listarRoles()]);
            setUsuarios(usuariosData);
            setRoles(rolesData.filter((rol) => rol.activo));
        } catch {
            toast.error("No se pudieron cargar los usuarios");
        } finally {
            setCargando(false);
        }
    }

    useEffect(() => {
        cargarDatos();
    }, []);

    function abrirCrear() {
        setUsuarioEditando(null);
        form.reset(valoresIniciales);
        setDialogAbierto(true);
    }

    function abrirEditar(usuario: Usuario) {
        setUsuarioEditando(usuario);
        form.reset({
            nombres: usuario.nombres,
            apellidos: usuario.apellidos,
            documento: usuario.documento,
            correo: usuario.correo,
            telefono: usuario.telefono || "",
            nombreUsuario: usuario.nombreUsuario,
            contrasena: "",
            idRol: usuario.idRol,
            activo: usuario.activo,
        });
        setDialogAbierto(true);
    }

    async function onSubmit(valores: UsuarioFormValues) {
        if (!usuarioEditando && !valores.contrasena) {
            form.setError("contrasena", { message: "La contraseña es obligatoria al crear un usuario" });
            return;
        }

        const payload = {
            ...valores,
            telefono: valores.telefono ?? "",
            ...(valores.contrasena ? { contrasena: valores.contrasena } : {}),
        };

        try {
            if (usuarioEditando) {
                await actualizarUsuario(usuarioEditando.idUsuario, payload);
                toast.success("Usuario actualizado correctamente");
            } else {
                await crearUsuario(payload);
                toast.success("Usuario creado correctamente");
            }
            setDialogAbierto(false);
            await cargarDatos();
        } catch {
            toast.error("Ocurrió un error al guardar el usuario");
        }
    }

    async function handleEliminar(id: number) {
        try {
            await eliminarUsuario(id);
            toast.success("Usuario eliminado");
            await cargarDatos();
        } catch {
            toast.error("No se pudo eliminar el usuario");
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Usuarios</h2>
                <Button onClick={abrirCrear}>Nuevo usuario</Button>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Usuario</TableHead>
                        <TableHead>Correo</TableHead>
                        <TableHead>Rol</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {cargando && <TableRow><TableCell colSpan={6}>Cargando...</TableCell></TableRow>}
                    {!cargando && usuarios.length === 0 && (
                        <TableRow><TableCell colSpan={6}>No hay usuarios registrados</TableCell></TableRow>
                    )}
                    {usuarios.map((usuario) => (
                        <TableRow key={usuario.idUsuario}>
                            <TableCell className="font-medium">{usuario.nombres} {usuario.apellidos}</TableCell>
                            <TableCell>{usuario.nombreUsuario}</TableCell>
                            <TableCell>{usuario.correo}</TableCell>
                            <TableCell>{roles.find((rol) => rol.idRol === usuario.idRol)?.nombre ?? usuario.idRol}</TableCell>
                            <TableCell>
                                <Badge variant={usuario.activo ? "default" : "secondary"}>
                                    {usuario.activo ? "Activo" : "Inactivo"}
                                </Badge>
                            </TableCell>
                            <TableCell className="flex justify-end gap-2 text-right">
                                <Button variant="outline" size="sm" onClick={() => abrirEditar(usuario)}>
                                    Editar
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger render={<Button variant="destructive" size="sm" />}>
                                        Eliminar
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>¿Eliminar este usuario?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Esta acción no se puede deshacer. Se eliminará "{usuario.nombreUsuario}".
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleEliminar(usuario.idUsuario)}>
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
                        <DialogTitle>{usuarioEditando ? "Editar usuario" : "Nuevo usuario"}</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
                            <FormField control={form.control} name="nombres" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombres</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="apellidos" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Apellidos</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="documento" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Documento</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="telefono" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Teléfono</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="correo" render={({ field }) => (
                                <FormItem className="sm:col-span-2">
                                    <FormLabel>Correo</FormLabel>
                                    <FormControl><Input type="email" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="nombreUsuario" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre de usuario</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="contrasena" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{usuarioEditando ? "Nueva contraseña" : "Contraseña"}</FormLabel>
                                    <FormControl><Input type="password" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="idRol" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Rol</FormLabel>
                                    <FormControl>
                                        <select
                                            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                                            value={field.value || ""}
                                            onChange={(event) => field.onChange(Number(event.target.value))}
                                        >
                                            <option value="" disabled>Selecciona un rol</option>
                                            {roles.map((rol) => <option key={rol.idRol} value={rol.idRol}>{rol.nombre}</option>)}
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
