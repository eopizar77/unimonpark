import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { actualizarExterno, crearExterno, eliminarExterno, listarExternos } from "@/api/externos";
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
    const [dialogAbierto, setDialogAbierto] = useState(false);
    const [externoEditando, setExternoEditando] = useState<Externo | null>(null);

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

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Usuarios Externos</h2>
                    <p className="text-sm text-muted-foreground">
                        Visitantes, contratistas y proveedores no pertenecientes a la nómina institucional.
                    </p>
                </div>
                <Button onClick={abrirCrear}>Nuevo externo</Button>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Documento</TableHead>
                        <TableHead>Nombre completo</TableHead>
                        <TableHead>Teléfono</TableHead>
                        <TableHead>Correo</TableHead>
                        <TableHead>Empresa / Entidad</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {cargando && (
                        <TableRow>
                            <TableCell colSpan={7}>Cargando...</TableCell>
                        </TableRow>
                    )}
                    {!cargando && externos.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={7}>No hay usuarios externos registrados</TableCell>
                        </TableRow>
                    )}
                    {externos.map((externo) => (
                        <TableRow key={externo.idExterno}>
                            <TableCell className="font-medium">
                                <span className="text-xs text-muted-foreground mr-1">
                                    {externo.tipoDocumento}
                                </span>
                                {externo.numeroDocumento}
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
                                            <Input {...field} placeholder="Ej: 1020304050" />
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
