import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Search } from "lucide-react";

import { actualizarExterno, crearExterno, eliminarExterno, listarExternos } from "@/api/externos";
import { consultarSincronizacion } from "@/api/sincronizacion";
import { Loader2 } from "lucide-react";
import { obtenerMensajeError } from "@/api/client";
import type { Externo, ExternoPayload } from "@/types/externo";
import { externoSchema, TIPOS_DOCUMENTO, type ExternoFormValues } from "./externoSchema";

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const valoresIniciales: ExternoFormValues = {
    tipoDocumento: "CC",
    numeroDocumento: "",
    nombres: "",
    apellidos: "",
    telefono: "",
    correo: "",
    empresa: "",
    activo: true,
};

export default function ExternosPage() {
    const [externos, setExternos] = useState<Externo[]>([]);
    const [cargando, setCargando] = useState(true);
    const [buscandoSync, setBuscandoSync] = useState(false);
    const [dialogAbierto, setDialogAbierto] = useState(false);
    const [externoEditando, setExternoEditando] = useState<Externo | null>(null);
    const [busqueda, setBusqueda] = useState("");

    const form = useForm<ExternoFormValues>({
        resolver: zodResolver(externoSchema),
        defaultValues: valoresIniciales,
    });

    async function cargarDatos() {
        setCargando(true);
        try {
            const data = await listarExternos();
            setExternos(data);
        } catch {
            toast.error("No se pudieron cargar los usuarios externos");
        } finally {
            setCargando(false);
        }
    }

    useEffect(() => {
        cargarDatos();
    }, []);

    
    const sincronizarConDB = async (documento: string) => {
        if (!documento) return;
        setBuscandoSync(true);
        try {
            const data = await consultarSincronizacion(documento);
            if (!data.esExterno) {
                toast.warning("Esta persona no es un Tercero. Regístralo en el módulo de Usuarios.");
            } else {
                form.setValue("nombres", data.nombres || "");
                form.setValue("apellidos", data.apellidos || "");
                // Externos doesn't have correo field in DB by default, but if it does we set it
                toast.success("Datos sincronizados con la Universidad");
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || "No se encontró en la base de datos institucional");
        } finally {
            setBuscandoSync(false);
        }
    };

    function abrirCrear() {
        setExternoEditando(null);
        form.reset(valoresIniciales);
        setDialogAbierto(true);
    }

    function abrirEditar(externo: Externo) {
        setExternoEditando(externo);
        form.reset({
            tipoDocumento: externo.tipoDocumento,
            numeroDocumento: externo.numeroDocumento,
            nombres: externo.nombres,
            apellidos: externo.apellidos,
            telefono: externo.telefono || "",
            correo: externo.correo || "",
            empresa: externo.empresa || "",
            activo: externo.activo,
        });
        setDialogAbierto(true);
    }

    async function onSubmit(valores: ExternoFormValues) {
        const payload: ExternoPayload = {
            tipoDocumento: valores.tipoDocumento,
            numeroDocumento: valores.numeroDocumento.trim(),
            nombres: valores.nombres.trim(),
            apellidos: valores.apellidos.trim(),
            telefono: valores.telefono?.trim() || null,
            correo: valores.correo?.trim() || null,
            empresa: valores.empresa?.trim() || null,
            activo: valores.activo,
        };

        try {
            if (externoEditando) {
                await actualizarExterno(externoEditando.idExterno, payload);
                toast.success("Externo actualizado correctamente");
            } else {
                await crearExterno(payload);
                toast.success("Externo registrado correctamente");
            }
            setDialogAbierto(false);
            await cargarDatos();
        } catch (error: unknown) {
            toast.error(obtenerMensajeError(error, "Ocurrió un error al guardar el usuario externo"));
        }
    }

    async function handleEliminar(id: number) {
        try {
            await eliminarExterno(id);
            toast.success("Externo eliminado");
            await cargarDatos();
        } catch {
            toast.error("No se pudo eliminar el usuario externo");
        }
    }

    const externosFiltrados = externos.filter(e => 
        e.numeroDocumento.includes(busqueda) || 
        e.nombres.toLowerCase().includes(busqueda.toLowerCase()) || 
        e.apellidos.toLowerCase().includes(busqueda.toLowerCase()) ||
        (e.empresa && e.empresa.toLowerCase().includes(busqueda.toLowerCase()))
    );

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Usuarios Externos</h2>
                    <p className="text-sm text-slate-500 font-normal">
                        Visitantes, contratistas y proveedores no pertenecientes a la nómina institucional.
                    </p>
                </div>
                <Button onClick={abrirCrear}>Nuevo externo</Button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
                <div className="p-4 border-b border-slate-200/80">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input 
                            placeholder="Buscar externo..." 
                            className="pl-9"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </div>
                </div>

                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow>
                            <TableHead className="text-slate-500 font-medium text-xs uppercase tracking-wider">Documento</TableHead>
                            <TableHead className="text-slate-500 font-medium text-xs uppercase tracking-wider">Nombre completo</TableHead>
                            <TableHead className="text-slate-500 font-medium text-xs uppercase tracking-wider">Teléfono</TableHead>
                            <TableHead className="text-slate-500 font-medium text-xs uppercase tracking-wider">Correo</TableHead>
                            <TableHead className="text-slate-500 font-medium text-xs uppercase tracking-wider">Empresa / Entidad</TableHead>
                            <TableHead className="text-slate-500 font-medium text-xs uppercase tracking-wider">Estado</TableHead>
                            <TableHead className="text-slate-500 font-medium text-xs uppercase tracking-wider text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                    {cargando && (
                        <TableRow>
                            <TableCell colSpan={7}>Cargando...</TableCell>
                        </TableRow>
                    )}
                    {!cargando && externosFiltrados.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={7}>No hay usuarios externos registrados</TableCell>
                        </TableRow>
                    )}
                    {externosFiltrados.map((externo) => (
                        <TableRow key={externo.idExterno}>
                            <TableCell className="font-medium">
                                <span className="text-xs text-muted-foreground mr-1">
                                    {externo.tipoDocumento}
                                </span>
                                <span className="bg-slate-100 text-slate-900 font-mono font-bold text-xs px-2.5 py-1 rounded border border-slate-300 tracking-wider inline-block">
                                    {externo.numeroDocumento}
                                </span>
                            </TableCell>
                            <TableCell>{`${externo.nombres} ${externo.apellidos}`}</TableCell>
                            <TableCell>{externo.telefono || "-"}</TableCell>
                            <TableCell>{externo.correo || "-"}</TableCell>
                            <TableCell>{externo.empresa || "-"}</TableCell>
                            <TableCell>
                                <Badge variant={externo.activo ? "default" : "secondary"}>
                                    {externo.activo ? "Activo" : "Inactivo"}
                                </Badge>
                            </TableCell>
                            <TableCell className="flex justify-end gap-2 text-right">
                                <Button variant="outline" size="sm" onClick={() => abrirEditar(externo)}>
                                    Editar
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger render={<Button variant="destructive" size="sm" />}>
                                        Eliminar
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>¿Eliminar este usuario externo?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Esta acción no se puede deshacer. Se eliminará a "{externo.nombres} {externo.apellidos}".
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleEliminar(externo.idExterno)}>
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
            </div>

            <Dialog open={dialogAbierto} onOpenChange={setDialogAbierto}>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{externoEditando ? "Editar usuario externo" : "Nuevo usuario externo"}</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="tipoDocumento"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo de documento</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona el tipo" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {TIPOS_DOCUMENTO.map((tipo) => (
                                                    <SelectItem key={tipo} value={tipo}>
                                                        {tipo}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="numeroDocumento"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Número de documento</FormLabel>
                                        <FormControl>
                                            <div className="flex gap-2">
                                                <Input {...field} placeholder="Ej: 1020304050" />
                                                <Button type="button" variant="secondary" onClick={() => sincronizarConDB(field.value)} disabled={buscandoSync || !field.value} title="Buscar en BD">
                                                    {buscandoSync ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                                </Button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="nombres"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nombres</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Ej: Carlos" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="apellidos"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Apellidos</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Ej: Gómez" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="telefono"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Teléfono</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Ej: 3001234567" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="correo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Correo electrónico</FormLabel>
                                        <FormControl>
                                            <Input type="email" {...field} placeholder="correo@empresa.com" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="empresa"
                                render={({ field }) => (
                                    <FormItem className="sm:col-span-2">
                                        <FormLabel>Empresa o Entidad</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Ej: Proveedor Alimentos S.A.S." />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="activo"
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between sm:col-span-2">
                                        <FormLabel>Activo</FormLabel>
                                        <FormControl>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

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
