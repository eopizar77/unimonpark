import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { listarRoles, crearRol, actualizarRol, eliminarRol } from "@/api/roles";
import type { Rol } from "@/types/rol";
import { rolSchema, type RolFormValues } from "./rolSchema";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function RolesPage(){
    const [roles, setRoles] = useState<Rol[]>([]);
    const [cargando, setCargando] = useState(true);
    const [dialogAbierto, setDialogAbierto] = useState(false);
    const [rolEditando, setRolEditando] = useState<Rol | null>(null);

    const form = useForm<RolFormValues>({
        resolver: zodResolver(rolSchema),
        defaultValues: { nombre: "", descripcion: "", activo: true },
    });
    
    async function cargarRoles(){
        setCargando(true);
        try {
            const data = await listarRoles();
            setRoles(data);
        } catch {
            toast.error("No se han podido cargar los roles");
        } finally {
            setCargando(false);
        }
    }

    useEffect(() => {
        cargarRoles();
    }, []);

    function abrirCrear(){
        setRolEditando(null);
        form.reset({ nombre: "", descripcion: "", activo: true });
        setDialogAbierto(true);
    }

    function abrirEditar(rol: Rol){
        setRolEditando(rol);
        form.reset({ nombre: rol.nombre, descripcion: rol.descripcion || "", activo: rol.activo });
        setDialogAbierto(true);
    }

    async function onSubmit(valores: RolFormValues){
        try{
            const payload = { ...valores, descripcion: valores.descripcion ?? "" };
            if (rolEditando){
                await actualizarRol(rolEditando.idRol, payload);
                toast.success("Rol actualizado satisfactoriamente");
            } else {
                await crearRol(payload);
                toast.success("Rol creado correctamente");
            }
            setDialogAbierto(false);
            await cargarRoles();
        } catch {
            toast.error("Ocurrió un error al guardar el rol");
        }
    }

    async function handleEliminar(id: number){
        try{
            await eliminarRol(id);
            toast.success("Rol Eliminado");
            cargarRoles();
        } catch {
            toast.error("No fue posible eliminar el rol")
        }
    }

    return(
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Roles</h2>
                <Button onClick={abrirCrear}>Nuevo Rol</Button>
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
                    {cargando && (
                        <TableRow><TableCell colSpan={4}>Cargando...</TableCell></TableRow>
                    )}
                    {!cargando && roles.length === 0 && (
                        <TableRow><TableCell colSpan={4}>No hay Roles Registrados</TableCell></TableRow>
                    )}
                    {roles.map((rol) =>(
                        <TableRow key={rol.idRol}>
                            <TableCell className="font-medium">{rol.nombre}</TableCell>
                            <TableCell>{rol.descripcion}</TableCell>
                            <TableCell>
                                <Badge variant={rol.activo ? "default" : "secondary"}>
                                    {rol.activo ? "Activo" : "Inactivo"}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right flex gap-2 justify-end">
                                <Button variant="outline" size="sm" onClick={() => abrirEditar(rol)}>
                                    Editar
                                </Button>

                                <AlertDialog>
                                    <AlertDialogTrigger
                                        render={<Button variant="destructive" size="sm" />}
                                    >
                                        Eliminar
                                    </AlertDialogTrigger>
                                        <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>¿Eliminar este rol?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Esta acción no se puede deshacer. Se eliminará el rol "{rol.nombre}".
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleEliminar(rol.idRol)}>
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
                        <DialogTitle>{rolEditando ? "Editar rol" : "Nuevo rol"}</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                            <FormField
                            control={form.control}
                            name="nombre"
                            render={({ field }) =>(
                                <FormItem>
                                    <FormLabel>Nombre</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>)}
                            />

                            <FormField
                            control={form.control}
                            name="descripcion"
                            render={({ field}) => (
                                <FormItem>
                                <FormLabel>Descripcion</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                            />

                            <FormField
                                control={form.control}
                                name="activo"
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between">
                                        <FormLabel>Activo</FormLabel>
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <DialogFooter>
                                <Button type="submit">Guardar</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    )
}