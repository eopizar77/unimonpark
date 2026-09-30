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
import { listarExternos } from "@/api/externos";
import { listarMembresias } from "@/api/membresias";

import type { Ingreso } from "@/types/ingreso";
import type { Vehiculo } from "@/types/vehiculo";
import type { EspacioParqueo } from "@/types/espacioParqueo";
import type { TipoVehiculo } from "@/types/tipoVehiculo";
import type { Usuario } from "@/types/usuario";
import type { Externo } from "@/types/externo";
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
import { Search, MapPin } from "lucide-react";

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
    const [externos, setExternos] = useState<Externo[]>([]);
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
            const [ingresosData, vehiculosData, espaciosData, tiposData, usuariosData, externosData, membresiasData] = await Promise.all([
                listarIngresos(),
                listarVehiculos(),
                listarEspaciosParqueo(),
                listarTiposVehiculo(),
                listarUsuarios(),
                listarExternos(),
                listarMembresias(),
            ]);
            setIngresos(ingresosData);
            setVehiculos(vehiculosData);
            setEspacios(espaciosData);
            setTipos(tiposData);
            setUsuarios(usuariosData);
            setExternos(externosData);
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
        if (esBicicletaIngreso) {
            const ficha = valores.numeroFicha?.trim();
            if (!ficha) {
                toast.error("El nÃƒÆ’Ã‚Âºmero de ficha es obligatorio para bicicletas");
                return;
            }
            const fichaEnUso = ingresos.some(
                (ing) => ing.estado === "ACTIVO" && ing.numeroFicha === ficha
            );
            if (fichaEnUso) {
                toast.error(`El nÃƒÆ’Ã‚Âºmero de ficha ${ficha} ya se encuentra asignado a una bicicleta adentro.`);
                return;
            }
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
        let nombreCompleto = "";
        
        if (vehiculo.idExterno) {
            const ext = externos.find((e) => e.idExterno === vehiculo.idExterno);
            nombreCompleto = ext ? `${ext.nombres} ${ext.apellidos} (Ext)` : (vehiculo.nombreExterno ? `${vehiculo.nombreExterno} (Ext)` : "");
        } else if (vehiculo.idUsuario) {
            const propietario = usuarios.find((u) => u.idUsuario === vehiculo.idUsuario);
            nombreCompleto = propietario ? `${propietario.nombres} ${propietario.apellidos}` : (vehiculo.nombreUsuario || "");
        } else if (vehiculo.nombreExterno) {
            nombreCompleto = `${vehiculo.nombreExterno} (Ext)`;
        } else if (vehiculo.nombreUsuario) {
            nombreCompleto = vehiculo.nombreUsuario;
        }

        return `${identificador} - ${nombreCompleto ? `${nombreCompleto} ` : ""}(${vehiculo.marca || "VehÃƒÆ’Ã‚Â­culo"})`;
    }

    function renderEtiquetaVehiculo(vehiculo: Vehiculo) {
        const identificador = vehiculo.placa || "Bicicleta";
        
        let nombreCompleto = "";
        let esExterno = false;
        
        if (vehiculo.idExterno) {
            const ext = externos.find((e) => e.idExterno === vehiculo.idExterno);
            nombreCompleto = ext ? `${ext.nombres} ${ext.apellidos}` : (vehiculo.nombreExterno || "Desconocido");
            esExterno = true;
        } else if (vehiculo.idUsuario) {
            const propietario = usuarios.find((u) => u.idUsuario === vehiculo.idUsuario);
            nombreCompleto = propietario ? `${propietario.nombres} ${propietario.apellidos}` : (vehiculo.nombreUsuario || "Desconocido");
        } else {
            nombreCompleto = vehiculo.nombreExterno || vehiculo.nombreUsuario || "Desconocido";
        }

        return (
            <div className="flex flex-col items-start gap-1 py-1">
                <div className="flex items-center gap-2">
                    <span className="bg-slate-100 text-slate-900 font-mono font-bold text-xs px-2.5 py-1 rounded border border-slate-300 tracking-wider">
                        {identificador}
                    </span>
                    <span className="text-sm font-medium text-slate-800 capitalize">{nombreCompleto.toLowerCase()}</span>
                    {esExterno && (
                        <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-600 border-amber-200 py-0 h-4">
                            EXTERNO
                        </Badge>
                    )}
                </div>
                <span className="text-xs text-slate-500 font-normal ml-[3.25rem]">
                    {vehiculo.placa ? (vehiculo.marca || "VehÃ­culo") : "Bicicleta"}
                </span>
            </div>
        );
    }

    function descripcionVehiculo(id: number) {
        const vehiculo = vehiculos.find((item) => item.idVehiculo === id);
        return vehiculo ? etiquetaVehiculo(vehiculo) : "VehÃƒÆ’Ã‚Â­culo no encontrado";
    }

    function descripcionEspacio(id: number) {
        const espacio = espacios.find((item) => item.idEspacio === id);
        return espacio ? `${espacio.codigo}${espacio.zona ? ` - ${espacio.zona}` : ""}` : "Espacio no encontrado";
    }

    function obtenerNombreConductor(id: number) {
        const vehiculo = vehiculos.find(v => v.idVehiculo === id);
        if (!vehiculo) return "Desconocido";
        if (vehiculo.idExterno) {
            const ext = externos.find(e => e.idExterno === vehiculo.idExterno);
            return ext ? `${ext.nombres} ${ext.apellidos}` : (vehiculo.nombreExterno || "Desconocido");
        } else if (vehiculo.idUsuario) {
            const propietario = usuarios.find(u => u.idUsuario === vehiculo.idUsuario);
            return propietario ? `${propietario.nombres} ${propietario.apellidos}` : (vehiculo.nombreUsuario || "Desconocido");
        } else if (vehiculo.nombreExterno) {
            return vehiculo.nombreExterno;
        } else if (vehiculo.nombreUsuario) {
            return vehiculo.nombreUsuario;
        }
        return "Desconocido";
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

    // ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸ÃƒÂ¢Ã¢â€šÂ¬Ã‚ÂÃƒâ€šÃ‚Â Detectar si el vehÃƒÆ’Ã‚Â­culo seleccionado tiene membresÃƒÆ’Ã‚Â­a activa
    const membresiaActiva = vehiculoSeleccionado
        ? membresias.find((m) => m.activa && m.idVehiculo === vehiculoSeleccionado.idVehiculo)
        : undefined;

    // ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸Ãƒâ€¦Ã‚Â¡ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ Efecto 1: NotificaciÃƒÆ’Ã‚Â³n de MembresÃƒÆ’Ã‚Â­a y cambio automÃƒÆ’Ã‚Â¡tico a tipo "MENSUAL"
    useEffect(() => {
        if (!idVehiculoSeleccionado || !vehiculoSeleccionado) return;

        const membresia = membresias.find((m) => m.activa && m.idVehiculo === vehiculoSeleccionado.idVehiculo);
        if (membresia) {
            toast.success(`ÃƒÆ’Ã‚Â¢Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚Â Ãƒâ€šÃ‚Â¡VehÃƒÆ’Ã‚Â­culo con MembresÃƒÆ’Ã‚Â­a Vigente! (Vence: ${membresia.fechaFin})`, {
                duration: 4500,
            });
            form.setValue("tipoIngreso", "MENSUAL");
        }
    }, [idVehiculoSeleccionado, membresias]);

    // ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸Ãƒâ€¦Ã‚Â¡ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ Efecto 2: AsignaciÃƒÆ’Ã‚Â³n automÃƒÆ’Ã‚Â¡tica de celda por primera letra ('A', 'M', 'B')
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
            toast.info(`Espacio asignado automÃƒÆ’Ã‚Â¡ticamente: ${espacioSugerido.codigo}`, { duration: 2500 });
        } else if (espaciosDisponibles.length > 0) {
            form.setValue("idEspacioParqueo", espaciosDisponibles[0].idEspacio);
        }
    }, [idVehiculoSeleccionado, tipoVehiculoSeleccionado]);

    const [busqueda, setBusqueda] = useState("");

    const ingresosFiltrados = ingresos.filter((ingreso) => {
        const dVehiculo = descripcionVehiculo(ingreso.idVehiculo).toLowerCase();
        const numFicha = (ingreso.numeroFicha || "").toLowerCase();
        const vehiculo = vehiculos.find(v => v.idVehiculo === ingreso.idVehiculo);
        const cedula = vehiculo
            ? (vehiculo.idUsuario
                ? (usuarios.find(u => u.idUsuario === vehiculo.idUsuario)?.documento || "")
                : (externos.find(e => e.idExterno === vehiculo.idExterno)?.numeroDocumento || ""))
            : "";
        const search = busqueda.toLowerCase();
        return dVehiculo.includes(search) || numFicha.includes(search) || cedula.includes(search);
    });

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Ingresos</h2>
                    <p className="text-sm text-slate-500 font-normal">Registro histÃƒÆ’Ã‚Â³rico de entradas al parqueadero</p>
                </div>
                {puedeCrear && <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-4 py-2.5 shadow-sm transition-all duration-150" onClick={abrirCrear}>Registrar ingreso</Button>}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
                <div className="p-4 md:p-6 border-b border-slate-200/80">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input 
                            type="search" 
                            placeholder="Buscar por placa, ficha o usuario o cÃƒÆ’Ã‚Â©dula..." 
                            className="pl-10 pr-4 py-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm w-full md:max-w-md" 
                            value={busqueda} 
                            onChange={(e) => setBusqueda(e.target.value)} 
                        />
                    </div>
                </div>
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow>
                            <TableHead className="text-slate-500 font-medium text-xs uppercase tracking-wider">Fecha de Ingreso</TableHead>
                            <TableHead className="text-slate-500 font-medium text-xs uppercase tracking-wider">IdentificaciÃƒÆ’Ã‚Â³n</TableHead>
                            <TableHead className="text-slate-500 font-medium text-xs uppercase tracking-wider hidden md:table-cell">Conductor</TableHead>
                            <TableHead className="text-slate-500 font-medium text-xs uppercase tracking-wider">UbicaciÃƒÆ’Ã‚Â³n</TableHead>
                            <TableHead className="text-slate-500 font-medium text-xs uppercase tracking-wider hidden lg:table-cell">Lectura (Km)</TableHead>
                            <TableHead className="text-slate-500 font-medium text-xs uppercase tracking-wider">Estado</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {cargando && <TableRow><TableCell colSpan={6} className="text-center py-4">Cargando...</TableCell></TableRow>}
                        {!cargando && ingresosFiltrados.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-4">No hay ingresos registrados</TableCell></TableRow>}
                        {ingresosFiltrados.map((ingreso) => {
                            const fecha = new Date(ingreso.fechaIngreso);
                            const dateStr = Number.isNaN(fecha.getTime()) ? ingreso.fechaIngreso : fecha.toLocaleDateString("es-CO", { day: '2-digit', month: 'short', year: 'numeric' });
                            const timeStr = Number.isNaN(fecha.getTime()) ? "" : fecha.toLocaleTimeString("es-CO", { hour: '2-digit', minute: '2-digit', hour12: true });

                            const vehiculo = vehiculos.find(v => v.idVehiculo === ingreso.idVehiculo);
                            const isBici = !vehiculo?.placa;
                            const identificador = vehiculo?.placa || ingreso.numeroFicha || "S/N";
                            const subtext = isBici ? "Bicicleta" : (vehiculo?.marca || "VehÃƒÆ’Ã‚Â­culo");

                            const isActive = ingreso.estado.toLowerCase() === "activo";

                            return (
                                <TableRow key={ingreso.idIngreso}>
                                    <TableCell>
                                        <div className="text-sm font-medium text-slate-900">{dateStr}</div>
                                        <div className="text-xs text-slate-500">{timeStr}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col items-start gap-1">
                                            <span className="bg-slate-100 text-slate-900 font-mono font-bold text-xs px-2.5 py-1 rounded border border-slate-300 tracking-wider inline-block">
                                                {identificador}
                                            </span>
                                            <span className="text-xs text-slate-500 font-normal">{subtext}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        <div className="text-sm font-medium text-slate-800 capitalize">
                                            {obtenerNombreConductor(ingreso.idVehiculo).toLowerCase()}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                                            <MapPin className="h-3 w-3 text-slate-500" />
                                            {descripcionEspacio(ingreso.idEspacioParqueo)}
                                        </span>
                                    </TableCell>
                                    <TableCell className="hidden lg:table-cell text-sm text-slate-600">
                                        {ingreso.lecturaInicialKm ? `${ingreso.lecturaInicialKm} km` : <span className="text-slate-400">N/A</span>}
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"} variant="outline">
                                            {ingreso.estado}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            {puedeCrear && <Dialog open={dialogAbierto} onOpenChange={setDialogAbierto}>
                <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>Registrar ingreso</DialogTitle></DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                            <FormField control={form.control} name="idVehiculo" render={({ field }) => (
                                <FormItem><FormLabel>VehÃƒÆ’Ã‚Â­culo (busca por placa o nombre)</FormLabel><FormControl>
                                    <BuscadorConFiltro
                                        items={vehiculosDisponibles}
                                        valorSeleccionado={field.value || null}
                                        obtenerId={(v) => v.idVehiculo}
                                        obtenerEtiqueta={etiquetaVehiculo}
                                        renderEtiqueta={renderEtiquetaVehiculo}
                                        obtenerTerminosBusqueda={(v) => {
                                            if (v.idExterno) return externos.find(e => e.idExterno === v.idExterno)?.numeroDocumento || "";
                                            if (v.idUsuario) return usuarios.find(u => u.idUsuario === v.idUsuario)?.documento || "";
                                            return "";
                                        }}
                                        onSeleccionar={(id) => field.onChange(id)}
                                        placeholder={vehiculosDisponibles.length === 0 ? "No hay veh\u00EDculos pendientes de ingreso" : "Escribe la placa, nombre o c\u00E9dula..."}
                                    />
                                </FormControl><FormMessage /></FormItem>
                            )} />

                            {/* Banner visual si el vehÃƒÆ’Ã‚Â­culo cuenta con membresÃƒÆ’Ã‚Â­a activa */}
                            {membresiaActiva && (
                                <div className="flex items-center gap-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3 text-sm text-emerald-700 dark:text-emerald-400 font-medium">
                                    <span className="text-xl">ÃƒÆ’Ã‚Â¢Ãƒâ€šÃ‚Â­Ãƒâ€šÃ‚Â</span>
                                    <div>
                                        <p className="font-semibold">VehÃƒÂ­culo con MembresÃƒÂ­a Vigente</p>
                                        <p className="text-xs text-emerald-600 dark:text-emerald-500">
                                            Vence el {membresiaActiva.fechaFin}. El ingreso se registrÃƒÆ’Ã‚Â³ como MENSUAL automÃƒÆ’Ã‚Â¡ticamente.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {esBicicletaIngreso && (
                                <FormField control={form.control} name="numeroFicha" render={({ field }) => (
                                    <FormItem><FormLabel>NÃƒÆ’Ã‚Âºmero de ficha</FormLabel><FormControl>
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