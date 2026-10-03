import { BuscadorConFiltro } from "@/components/BuscadorConFiltro";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { actualizarVehiculo, crearVehiculo, eliminarVehiculo, listarVehiculos } from "@/api/vehiculos";
import { obtenerMensajeError } from "@/api/client";
import { listarTiposVehiculo } from "@/api/tiposVehiculo";
import { listarUsuarios } from "@/api/usuarios";
import { listarExternos } from "@/api/externos";
import type { TipoVehiculo } from "@/types/tipoVehiculo";
import type { Usuario } from "@/types/usuario";
import type { Externo } from "@/types/externo";
import type { Vehiculo, VehiculoPayload } from "@/types/vehiculo";
import { vehiculoSchema, type VehiculoFormValues } from "./vehiculoSchema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


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
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";

const valoresIniciales: VehiculoFormValues = {
    tipoPropietario: "USUARIO",
    idUsuario: null,
    idExterno: null,
    idTipoVehiculo: 0,
    placa: "",
    marca: "",
    modelo: "",
    color: "",
    categoriaPersona: "DOCENTE_ADMINISTRATIVO",
    activo: true,
};

export default function VehiculosPage() {
    const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [externos, setExternos] = useState<Externo[]>([]);
    const [tipos, setTipos] = useState<TipoVehiculo[]>([]);
    const [cargando, setCargando] = useState(true);
    if (cargando) {}
    
    const [dialogAbierto, setDialogAbierto] = useState(false);
    const [vehiculoEditando, setVehiculoEditando] = useState<Vehiculo | null>(null);

    const form = useForm<VehiculoFormValues>({
        resolver: zodResolver(vehiculoSchema),
        defaultValues: valoresIniciales,
    });

    const idTipoSeleccionado = form.watch("idTipoVehiculo");
    const tipoPropietarioSeleccionado = form.watch("tipoPropietario");
    const tipoSeleccionado = tipos.find((t) => t.idTipoVehiculo === idTipoSeleccionado);
    const esBicicleta = tipoSeleccionado?.nombre.toLowerCase() === "bicicleta";

    async function cargarDatos() {
        setCargando(true);
        try {
            const [vehiculosData, usuariosData, externosData, tiposData] = await Promise.all([
                listarVehiculos(),
                listarUsuarios(),
                listarExternos(),
                listarTiposVehiculo(),
            ]);
            setVehiculos(vehiculosData);
            setUsuarios(usuariosData);
            setExternos(externosData);
            setTipos(tiposData);
        } catch {
            toast.error("No se pudieron cargar los vehÃƒÂ­culos");
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
        const esExterno = Boolean(vehiculo.idExterno);
        form.reset({
            tipoPropietario: esExterno ? "EXTERNO" : "USUARIO",
            idUsuario: vehiculo.idUsuario ?? null,
            idExterno: vehiculo.idExterno ?? null,
            idTipoVehiculo: vehiculo.idTipoVehiculo,
            placa: vehiculo.placa ?? "",
            marca: vehiculo.marca || "",
            modelo: vehiculo.modelo || "",
            color: vehiculo.color || "",
            categoriaPersona: vehiculo.categoriaPersona ?? (esExterno ? "EXTERNO" : "DOCENTE_ADMINISTRATIVO"),
            activo: vehiculo.activo,
        });
        setDialogAbierto(true);
    }

    async function onSubmit(valores: VehiculoFormValues) {
        if (!esBicicleta && !valores.placa?.trim()) {
            toast.error("La placa es obligatoria para este tipo de vehÃƒÂ­culo");
            return;
        }

        const payload: VehiculoPayload = {
            idUsuario: valores.tipoPropietario === "USUARIO" ? valores.idUsuario : null,
            idExterno: valores.tipoPropietario === "EXTERNO" ? valores.idExterno : null,
            idTipoVehiculo: valores.idTipoVehiculo,
            placa: esBicicleta ? null : valores.placa?.trim() || null,
            marca: valores.marca ?? "",
            modelo: valores.modelo ?? "",
            color: valores.color ?? "",
            categoriaPersona: valores.categoriaPersona,
            activo: valores.activo,
        };

        try {
            if (vehiculoEditando) {
                await actualizarVehiculo(vehiculoEditando.idVehiculo, payload);
                toast.success("VehÃƒÂ­culo actualizado correctamente");
            } else {
                await crearVehiculo(payload);
                toast.success("VehÃƒÂ­culo creado correctamente");
            }
            setDialogAbierto(false);
            await cargarDatos();
        } catch (error: unknown) {
            toast.error(obtenerMensajeError(error, "OcurriÃƒÂ³ un error al guardar el vehÃƒÂ­culo"));
        }
    }

    async function handleEliminar(id: number) {
        try {
            await eliminarVehiculo(id);
            toast.success("VehÃƒÂ­culo eliminado");
            await cargarDatos();
        } catch {
            toast.error("No se pudo eliminar el vehÃƒÂ­culo");
        }
    }

    function renderPropietario(vehiculo: Vehiculo) {
        if (vehiculo.nombreExterno) {
            
    return (
                <div className="flex items-center gap-1.5">
                    <span>{vehiculo.nombreExterno}</span>
                    <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-300">
                        Externo
                    </Badge>
                </div>
            );
        }
        if (vehiculo.idExterno) {
            const ext = externos.find((e) => e.idExterno === vehiculo.idExterno);
            if (ext) {
                return (
                    <div className="flex items-center gap-1.5">
                        <span>{`${ext.nombres} ${ext.apellidos}`}</span>
                        <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-300">
                            Externo
                        </Badge>
                    </div>
                );
            }
        }
        if (vehiculo.nombreUsuario) {
            return vehiculo.nombreUsuario;
        }
        if (vehiculo.idUsuario) {
            const usuario = usuarios.find((item) => item.idUsuario === vehiculo.idUsuario);
            return usuario ? `${usuario.nombres} ${usuario.apellidos}` : "Usuario no encontrado";
        }
        return <span className="text-muted-foreground italic">Sin propietario</span>;
    }

    function nombreTipo(id: number) {
        return tipos.find((tipo) => tipo.idTipoVehiculo === id)?.nombre ?? "Tipo no encontrado";
    }

    const columns: ColumnDef<Vehiculo>[] = [
        {
            accessorKey: "placa",
            header: "Placa",
            cell: ({ row }) => {
                const placa = row.original.placa;
                return placa ? (
                    <span className="bg-slate-100 text-slate-900 font-mono text-xl font-bold px-2.5 py-1 rounded border border-slate-300 tracking-wider inline-block">
                        {placa}
                    </span>
                ) : (
                    <span className="text-muted-foreground italic">Sin placa</span>
                );
            },
        },
        {
            id: "marca_modelo",
            header: "Marca / Modelo",
            cell: ({ row }) => [row.original.marca, row.original.modelo].filter(Boolean).join(" / ") || "-",
        },
        {
            accessorKey: "color",
            header: "Color",
            cell: ({ row }) => row.original.color || "-",
        },
        {
            accessorKey: "idTipoVehiculo",
            header: "Tipo",
            cell: ({ row }) => nombreTipo(row.original.idTipoVehiculo),
        },
        {
            id: "usuario",
            header: "Propietario",
            cell: ({ row }) => renderPropietario(row.original),
        },
        {
            accessorKey: "activo",
            header: "Estado",
            cell: ({ row }) => {
                const activo = row.original.activo;
                return (
                    <Badge variant={activo ? "default" : "secondary"} className={activo ? "bg-emerald-500 hover:bg-emerald-600" : "bg-red-500 hover:bg-red-600"}>
                        {activo ? "Activo" : "Inactivo"}
                    </Badge>
                );
            },
        },
        {
            id: "acciones",
            header: "Acciones",
            cell: ({ row }) => {
                const vehiculo = row.original;
                return (
                    <div className="flex justify-end gap-2 text-right">
                        <Button variant="outline" size="sm" onClick={() => abrirEditar(vehiculo)}>
                            Editar
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger>
                                <Button variant="destructive" size="sm">Eliminar</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Ã‚Â¿Eliminar este vehÃƒÂ­culo?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Esta acciÃƒÂ³n no se puede deshacer. Se eliminarÃƒÂ¡ el vehÃƒÂ­culo "{vehiculo.placa || "sin placa"}".
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
                    </div>
                );
            },
        },
    ];

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">VehÃƒÂ­culos</h2>
                    <p className="text-sm text-slate-500 font-normal">
                        GestiÃƒÂ³n de automotores y bicicletas pertenecientes a usuarios institucionales o visitantes externos.
                    </p>
                </div>
                <Button onClick={abrirCrear}>Nuevo vehÃƒÂ­culo</Button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
                <DataTable columns={columns} data={vehiculos} searchKey="placa" searchPlaceholder="Buscar por placa..." />
            </div>

            <Dialog open={dialogAbierto} onOpenChange={setDialogAbierto}>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{vehiculoEditando ? "Editar vehÃƒÂ­culo" : "Nuevo vehÃƒÂ­culo"}</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
                            {/* Selector de Tipo de Propietario */}
                            <FormField
                                control={form.control}
                                name="tipoPropietario"
                                render={({ field }) => (
                                    <FormItem className="sm:col-span-2">
                                        <FormLabel>Tipo de Propietario</FormLabel>
                                        <Select
                                            onValueChange={(val) => {
                                                field.onChange(val);
                                                if (val === "EXTERNO") {
                                                    form.setValue("categoriaPersona", "EXTERNO");
                                                    form.setValue("idUsuario", null);
                                                } else {
                                                    form.setValue("categoriaPersona", "DOCENTE_ADMINISTRATIVO");
                                                    form.setValue("idExterno", null);
                                                }
                                            }}
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona el tipo de propietario" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="USUARIO">Usuario Institucional (Docente, Estudiante, Admin)</SelectItem>
                                                <SelectItem value="EXTERNO">Visitante Externo / Contratista</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Dropdown Usuario Institucional */}
                            {tipoPropietarioSeleccionado === "USUARIO" && (
                                <FormField
                                    control={form.control}
                                    name="idUsuario"
                                    render={({ field }) => (
                                        <FormItem className="sm:col-span-2">
                                            <FormLabel>Usuario Institucional</FormLabel>
                                            <FormControl>
                                                <BuscadorConFiltro
                                                    items={usuarios.filter(u => u.activo || u.idUsuario === field.value)}
                                                    valorSeleccionado={field.value || null}
                                                    obtenerId={(u) => u.idUsuario}
                                                    obtenerEtiqueta={(u) => `${u.nombres} ${u.apellidos} (${u.documento})`}
                                                    obtenerTerminosBusqueda={(u) => String(u.documento || "")}
                                                    onSeleccionar={(id) => field.onChange(id)}
                                                    placeholder="Selecciona o busca un usuario..."
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            {/* Dropdown Usuario Externo */}
                            {tipoPropietarioSeleccionado === "EXTERNO" && (
                                <FormField
                                    control={form.control}
                                    name="idExterno"
                                    render={({ field }) => (
                                        <FormItem className="sm:col-span-2">
                                            <FormLabel>Visitante Externo</FormLabel>
                                            <FormControl>
                                                <BuscadorConFiltro
                                                    items={externos.filter(e => e.activo || e.idExterno === field.value)}
                                                    valorSeleccionado={field.value || null}
                                                    obtenerId={(e) => e.idExterno}
                                                    obtenerEtiqueta={(e) => `${e.nombres} ${e.apellidos} - ${e.numeroDocumento} ${e.empresa ? `(${e.empresa})` : ""}`}
                                                    obtenerTerminosBusqueda={(e) => String(e.numeroDocumento || "")}
                                                    onSeleccionar={(id) => field.onChange(id)}
                                                    placeholder="Selecciona o busca un externo..."
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            {/* Tipo de VehÃƒÂ­culo */}
                            <FormField
                                control={form.control}
                                name="idTipoVehiculo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo de vehÃƒÂ­culo</FormLabel>
                                        <FormControl>
                                            <select
                                                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                                                value={field.value || ""}
                                                onChange={(event) => field.onChange(Number(event.target.value))}
                                            >
                                                <option value="" disabled>
                                                    Selecciona un tipo
                                                </option>
                                                {tipos
                                                    .filter((tipo) => tipo.activo || tipo.idTipoVehiculo === field.value)
                                                    .map((tipo) => (
                                                        <option key={tipo.idTipoVehiculo} value={tipo.idTipoVehiculo}>
                                                            {tipo.nombre}
                                                        </option>
                                                    ))}
                                            </select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* CategorÃƒÂ­a de Persona */}
                            <FormField
                                control={form.control}
                                name="categoriaPersona"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>CategorÃƒÂ­a de persona</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value ?? ""}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona una categorÃƒÂ­a" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="DOCENTE_ADMINISTRATIVO">Docente / Administrativo</SelectItem>
                                                <SelectItem value="ESTUDIANTE">Estudiante</SelectItem>
                                                <SelectItem value="CENTRO_OBRERO">Centro Obrero</SelectItem>
                                                <SelectItem value="EXTERNO">Externo</SelectItem>
                                                <SelectItem value="DOCENTE_ADMINISTRATIVO_EXTERNO">
                                                    Docente/Admin/Ext (Legacy)
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Placa (si no es bicicleta) */}
                            {!esBicicleta && (
                                <FormField
                                    control={form.control}
                                    name="placa"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Placa</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Ej: ABC123" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            <FormField
                                control={form.control}
                                name="marca"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Marca</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Ej: Chevrolet" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="modelo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Modelo</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Ej: Onix 2022" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="color"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Color</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Ej: Gris" />
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



