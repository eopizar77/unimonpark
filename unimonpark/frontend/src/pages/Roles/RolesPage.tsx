import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Search } from "lucide-react";

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
    const [busqueda, setBusqueda] = useState("");
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

    
    const rolesFiltrados = roles.filter(r => { const search = busqueda.toLowerCase(); return (r.nombre?.toLowerCase() || "").includes(search) || (r.descripcion?.toLowerCase() || "").includes(search); });
return(
        <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Roles</h2>
                    <p className="text-sm text-slate-500 font-normal">Gestión de roles y permisos</p>
                </div>
                <Button onClick={abrirCrear}>Nuevo Rol</Button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
                <div className="p-4 border-b border-slate-200/80">
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                        <Input placeholder="Buscar roles..." className="pl-9 bg-white" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
                    </div>
                </div>
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow>
                            <TableHead className="text-slate-500 font-medium text-xs uppercase tracking-wider">Nombre</TableHead>
                            <TableHead className="text-slate-500 font-medium text-xs uppercase tracking-wider">Descripción</TableHead>
                            <TableHead className="text-slate-500 font-medium text-xs uppercase tracking-wider">Estado</TableHead>
                            <TableHead className="text-slate-500 font-medium text-xs uppercase tracking-wider text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {cargando && (
                            <TableRow><TableCell colSpan={4}>Cargando...</TableCell></TableRow>
                        )}
                        {!cargando && rolesFiltrados.length === 0 && (
                            <TableRow><TableCell colSpan={4}>No hay Roles Registrados</TableCell></TableRow>
                        )}
                        {rolesFiltrados.map((rol) =>(
                            <TableRow key={rol.idRol}>
                                <TableCell className="font-medium">{rol.nombre}</TableCell>
                                <TableCell>{rol.descripcion}</TableCell>
                                <TableCell>
                                    <Badge variant={rol.activo ? "default" : "secondary"}>
                                        {rol.activo ? "Activo" : "Inactivo"}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right align-middle"><div className="flex justify-end items-center gap-2">
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
                                    </AlertDialog></div></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

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
                                <FormLabel>Descripción</FormLabel>
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