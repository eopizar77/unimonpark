import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { crearIngreso, listarIngresos } from "@/api/ingresos";
import { obtenerMensajeError } from "@/api/client";
import { listarVehiculos } from "@/api/vehiculos";
import { listarEspaciosParqueo } from "@/api/espaciosParqueo";
import { listarTiposVehiculo } from "@/api/tiposVehiculo";
import { listarUsuarios } from "@/api/usuarios";
import { listarMembresias } from "@/api/membresias";

import type { Ingreso } from "@/types/ingreso";
import type { Vehiculo } from "@/types/vehiculo";
import type { EspacioParqueo } from "@/types/espacioParqueo";
import type { TipoVehiculo } from "@/types/tipoVehiculo";
import type { Usuario } from "@/types/usuario";
import type { Membresia } from "@/types/membresia";

import { ingresoSchema, type IngresoFormValues } from "./ingresoSchema";
import { BuscadorConFiltro } from "@/components/BuscadorConFiltro";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";

const rolesConPermiso = new Set(["ADMINISTRADOR", "GESTION"]);
const valoresIniciales: IngresoFormValues = {
    idVehiculo: 0,
    idEspacioParqueo: 0,
    lecturaInicialKm: null,
    tipoIngreso: "NORMAL",
    numeroFicha: null,
};

export default function IngresosPage() {
    const { rol } = useAuth();
    const puedeCrear = rolesConPermiso.has((rol ?? "").trim().toUpperCase());
    const [ingresos, setIngresos] = useState<Ingreso[]>([]);
    const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
    const [espacios, setEspacios] = useState<EspacioParqueo[]>([]);
    const [tipos, setTipos] = useState<TipoVehiculo[]>([]);
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [membresias, setMembresias] = useState<Membresia[]>([]);
    const [cargando, setCargando] = useState(true);
    const [dialogAbierto, setDialogAbierto] = useState(false);

    const form = useForm<IngresoFormValues>({
        resolver: zodResolver(ingresoSchema),
        defaultValues: valoresIniciales,
    });

    async function cargarDatos() {
        setCargando(true);
        try {
            const [ingresosData, vehiculosData, espaciosData, tiposData, usuariosData, membresiasData] = await Promise.all([
                listarIngresos(),
                listarVehiculos(),
                listarEspaciosParqueo(),
                listarTiposVehiculo(),
                listarUsuarios(),
                listarMembresias(),
            ]);
            setIngresos(ingresosData);
            setVehiculos(vehiculosData);
            setEspacios(espaciosData);
            setTipos(tiposData);
            setUsuarios(usuariosData);
            setMembresias(membresiasData);
        } catch {
            toast.error("No se pudieron cargar los ingresos");
        } finally {
            setCargando(false);
        }
    }

    useEffect(() => {
        cargarDatos();
    }, []);

    function abrirCrear() {
        form.reset(valoresIniciales);
        setDialogAbierto(true);
    }

    async function onSubmit(valores: IngresoFormValues) {
        if (esBicicletaIngreso && !valores.numeroFicha?.trim()) {
            toast.error("El número de ficha es obligatorio para bicicletas");
            return;
        }
        try {
            await crearIngreso({
                ...valores,
                numeroFicha: esBicicletaIngreso ? valores.numeroFicha : null,
                estado: "ACTIVO",
            });
            toast.success("Ingreso registrado correctamente");
            setDialogAbierto(false);
            await cargarDatos();
        } catch (error: unknown) {
            toast.error(obtenerMensajeError(error, "No se pudo registrar el ingreso"));
        }
    }

    function etiquetaVehiculo(vehiculo: Vehiculo) {
        const identificador = vehiculo.placa || "Bicicleta";
        const propietario = usuarios.find((u) => u.idUsuario === vehiculo.idUsuario);
        const nombreCompleto = propietario ? `${propietario.nombres} ${propietario.apellidos}` : "";
        return `${identificador} - ${nombreCompleto ? `${nombreCompleto} ` : ""}(${vehiculo.marca || "Vehículo"})`;
    }

    function descripcionVehiculo(id: number) {
        const vehiculo = vehiculos.find((item) => item.idVehiculo === id);
        return vehiculo ? etiquetaVehiculo(vehiculo) : "Vehículo no encontrado";
    }

    function descripcionEspacio(id: number) {
        const espacio = espacios.find((item) => item.idEspacio === id);
        return espacio ? `${espacio.codigo}${espacio.zona ? ` - ${espacio.zona}` : ""}` : "Espacio no encontrado";
    }

    function formatearFecha(fecha: string) {
        const fechaFormateada = new Date(fecha);
        return Number.isNaN(fechaFormateada.getTime()) ? fecha : fechaFormateada.toLocaleString("es-CO");
    }

    const vehiculosConIngresoActivo = new Set(
        ingresos
            .filter((ingreso) => ingreso.estado === "ACTIVO")
            .map((ingreso) => ingreso.idVehiculo),
    );
    const vehiculosDisponibles = vehiculos.filter(
        (vehiculo) => vehiculo.activo && !vehiculosConIngresoActivo.has(vehiculo.idVehiculo),
    );
    const espaciosDisponibles = espacios.filter((espacio) => espacio.activo && espacio.estado.toLowerCase() === "disponible");

    const idVehiculoSeleccionado = form.watch("idVehiculo");
    const vehiculoSeleccionado = vehiculos.find((v) => v.idVehiculo === idVehiculoSeleccionado);
    const tipoVehiculoSeleccionado = vehiculoSeleccionado
        ? tipos.find((t) => t.idTipoVehiculo === vehiculoSeleccionado.idTipoVehiculo)
        : undefined;
    const esBicicletaIngreso = tipoVehiculoSeleccionado?.nombre.toLowerCase() === "bicicleta";

    // 🔍 Detectar si el vehículo seleccionado tiene membresía activa
    const membresiaActiva = vehiculoSeleccionado
        ? membresias.find((m) => m.activa && m.idVehiculo === vehiculoSeleccionado.idVehiculo)
        : undefined;

    // 🚀 Efecto 1: Notificación de Membresía y cambio automático a tipo "MENSUAL"
    useEffect(() => {
        if (!idVehiculoSeleccionado || !vehiculoSeleccionado) return;

        const membresia = membresias.find((m) => m.activa && m.idVehiculo === vehiculoSeleccionado.idVehiculo);
        if (membresia) {
            toast.success(`⭐ ¡Vehículo con Membresía Vigente! (Vence: ${membresia.fechaFin})`, {
                duration: 4500,
            });
            form.setValue("tipoIngreso", "MENSUAL");
        }
    }, [idVehiculoSeleccionado, membresias]);

    // 🚀 Efecto 2: Asignación automática de celda por primera letra ('A', 'M', 'B')
    useEffect(() => {
        if (!idVehiculoSeleccionado || !vehiculoSeleccionado || !tipoVehiculoSeleccionado) {
            return;
        }

        const letraTipo = tipoVehiculoSeleccionado.nombre.trim().charAt(0).toUpperCase();
        const espacioSugerido = espaciosDisponibles.find((espacio) =>
            espacio.codigo.trim().toUpperCase().startsWith(letraTipo)
        );

        if (espacioSugerido) {
            form.setValue("idEspacioParqueo", espacioSugerido.idEspacio);
            toast.info(`Espacio asignado automáticamente: ${espacioSugerido.codigo}`, { duration: 2500 });
        } else if (espaciosDisponibles.length > 0) {
            form.setValue("idEspacioParqueo", espaciosDisponibles[0].idEspacio);
        }
    }, [idVehiculoSeleccionado, tipoVehiculoSeleccionado]);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Ingresos</h2>
                    <p className="text-sm text-muted-foreground">Registro histórico de entradas al parqueadero</p>
                </div>
                {puedeCrear && <Button onClick={abrirCrear}>Registrar ingreso</Button>}
            </div>

            <Table>
                <TableHeader><TableRow>
                    <TableHead>Fecha de ingreso</TableHead>
                    <TableHead>Vehículo</TableHead>
                    <TableHead>Ficha</TableHead>
                    <TableHead>Espacio</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Lectura inicial (km)</TableHead>
                    <TableHead>Estado</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                    {cargando && <TableRow><TableCell colSpan={7}>Cargando...</TableCell></TableRow>}
                    {!cargando && ingresos.length === 0 && <TableRow><TableCell colSpan={7}>No hay ingresos registrados</TableCell></TableRow>}
                    {ingresos.map((ingreso) => (
                        <TableRow key={ingreso.idIngreso}>
                            <TableCell>{formatearFecha(ingreso.fechaIngreso)}</TableCell>
                            <TableCell>{descripcionVehiculo(ingreso.idVehiculo)}</TableCell>
                            <TableCell>{ingreso.numeroFicha ?? "-"}</TableCell>
                            <TableCell>{descripcionEspacio(ingreso.idEspacioParqueo)}</TableCell>
                            <TableCell>{ingreso.tipoIngreso}</TableCell>
                            <TableCell>{ingreso.lecturaInicialKm ?? "-"}</TableCell>
                            <TableCell><Badge variant={ingreso.estado.toLowerCase() === "activo" ? "default" : "secondary"}>{ingreso.estado}</Badge></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {puedeCrear && <Dialog open={dialogAbierto} onOpenChange={setDialogAbierto}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader><DialogTitle>Registrar ingreso</DialogTitle></DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                            <FormField control={form.control} name="idVehiculo" render={({ field }) => (
                                <FormItem><FormLabel>Vehículo (busca por placa o nombre)</FormLabel><FormControl>
                                    <BuscadorConFiltro
                                        items={vehiculosDisponibles}
                                        valorSeleccionado={field.value || null}
                                        obtenerId={(v) => v.idVehiculo}
                                        obtenerEtiqueta={etiquetaVehiculo}
                                        onSeleccionar={(id) => field.onChange(id)}
                                        placeholder={vehiculosDisponibles.length === 0 ? "No hay vehículos pendientes de ingreso" : "Escribe la placa o nombre del propietario..."}
                                    />
                                </FormControl><FormMessage /></FormItem>
                            )} />

                            {/* Banner visual si el vehículo cuenta con membresía activa */}
                            {membresiaActiva && (
                                <div className="flex items-center gap-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3 text-sm text-emerald-700 dark:text-emerald-400 font-medium">
                                    <span className="text-xl">⭐</span>
                                    <div>
                                        <p className="font-semibold">Vehículo con Membresía Vigente</p>
                                        <p className="text-xs text-emerald-600 dark:text-emerald-500">
                                            Vence el {membresiaActiva.fechaFin}. El ingreso se registró como MENSUAL automáticamente.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {esBicicletaIngreso && (
                                <FormField control={form.control} name="numeroFicha" render={({ field }) => (
                                    <FormItem><FormLabel>Número de ficha</FormLabel><FormControl>
                                        <Input {...field} value={field.value ?? ""} onChange={(event) => field.onChange(event.target.value)} />
                                    </FormControl><FormMessage /></FormItem>
                                )} />
                            )}
                            <FormField control={form.control} name="idEspacioParqueo" render={({ field }) => (
                                <FormItem><FormLabel>Espacio de parqueo</FormLabel><FormControl>
                                    <select className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm" value={field.value || ""} onChange={(event) => field.onChange(Number(event.target.value))}>
                                        <option value="" disabled>Selecciona un espacio disponible</option>
                                        {espaciosDisponibles.map((espacio) => <option key={espacio.idEspacio} value={espacio.idEspacio}>{espacio.codigo}{espacio.zona ? ` - ${espacio.zona}` : ""}</option>)}
                                    </select>
                                </FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="lecturaInicialKm" render={({ field }) => (
                                <FormItem><FormLabel>Lectura inicial (km)</FormLabel><FormControl><Input type="number" min="0" step="1" value={field.value ?? ""} onChange={(event) => field.onChange(event.target.value === "" ? null : Number(event.target.value))} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="tipoIngreso" render={({ field }) => (
                                <FormItem><FormLabel>Tipo de ingreso</FormLabel><FormControl>
                                    <select className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm" value={field.value} onChange={(event) => field.onChange(event.target.value)}>
                                        <option value="NORMAL">Normal</option>
                                        <option value="AUTORIZADO">Autorizado</option>
                                        <option value="MENSUAL">Mensual</option>
                                        <option value="VIP">VIP</option>
                                    </select>
                                </FormControl><FormMessage /></FormItem>
                            )} />
                            <DialogFooter><Button type="submit">Registrar ingreso</Button></DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>}
        </div>
    );
}