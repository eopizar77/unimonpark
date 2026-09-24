import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { crearSalida, listarSalidas } from "@/api/salidas";
import { listarIngresos } from "@/api/ingresos";
import { listarTarifas } from "@/api/tarifas";
import { listarVehiculos } from "@/api/vehiculos";
import { listarEspaciosParqueo } from "@/api/espaciosParqueo";
import { listarTiposVehiculo } from "@/api/tiposVehiculo";
import { listarMembresias } from "@/api/membresias";
import type { Salida } from "@/types/salida";
import type { Ingreso } from "@/types/ingreso";
import type { Tarifa } from "@/types/tarifa";
import type { Vehiculo } from "@/types/vehiculo";
import type { EspacioParqueo } from "@/types/espacioParqueo";
import type { TipoVehiculo } from "@/types/tipoVehiculo";
import type { Membresia } from "@/types/membresia";
import { salidaSchema, type SalidaFormValues } from "./salidaSchema";
import { BuscadorConFiltro } from "@/components/BuscadorConFiltro";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";

const rolesConPermiso = new Set(["ADMINISTRADOR", "GESTION"]);
const valoresIniciales: SalidaFormValues = {
    idIngreso: 0,
    lecturaFinalKm: null,
    observaciones: "",
    idTarifa: null,
    modalidadPago: "POR_TIEMPO",
};

function formatoMoneda(valor: number) {
    return `$${valor.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function SalidasPage() {
    const { rol } = useAuth();
    const puedeCrear = rolesConPermiso.has((rol ?? "").trim().toUpperCase());
    const [salidas, setSalidas] = useState<Salida[]>([]);
    const [ingresos, setIngresos] = useState<Ingreso[]>([]);
    const [tarifas, setTarifas] = useState<Tarifa[]>([]);
    const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
    const [espacios, setEspacios] = useState<EspacioParqueo[]>([]);
    const [tipos, setTipos] = useState<TipoVehiculo[]>([]);
    const [membresias, setMembresias] = useState<Membresia[]>([]);
    const [cargando, setCargando] = useState(true);
    const [dialogAbierto, setDialogAbierto] = useState(false);
    const [ahora, setAhora] = useState(() => Date.now());

    const form = useForm<SalidaFormValues>({
        resolver: zodResolver(salidaSchema),
        defaultValues: valoresIniciales,
    });

    async function cargarDatos() {
        setCargando(true);
        try {
            const [salidasData, ingresosData, tarifasData, vehiculosData, espaciosData, tiposData, membresiasData] = await Promise.all([
                listarSalidas(),
                listarIngresos(),
                listarTarifas(),
                listarVehiculos(),
                listarEspaciosParqueo(),
                listarTiposVehiculo(),
                listarMembresias(),
            ]);
            setSalidas(salidasData);
            setIngresos(ingresosData);
            setTarifas(tarifasData);
            setVehiculos(vehiculosData);
            setEspacios(espaciosData);
            setTipos(tiposData);
            setMembresias(membresiasData);
        } catch {
            toast.error("No se pudieron cargar las salidas");
        } finally {
            setCargando(false);
        }
    }

    useEffect(() => {
        cargarDatos();
    }, []);

    useEffect(() => {
        if (!dialogAbierto) return;
        const intervalo = window.setInterval(() => setAhora(Date.now()), 30_000);
        return () => window.clearInterval(intervalo);
    }, [dialogAbierto]);

    function abrirCrear() {
        form.reset(valoresIniciales);
        setDialogAbierto(true);
    }

    async function onSubmit(valores: SalidaFormValues) {
    if (!esBicicletaSalida && !membresiaActiva && !valores.idTarifa) {
        toast.error("Selecciona una tarifa para este vehÃ­culo");
        return;
    }
    const idTarifaFinal: number | null = (esBicicletaSalida || membresiaActiva) ? null : ((valores.idTarifa as number | null) ?? null);
    try {
        await crearSalida({
            ...valores,
            idTarifa: idTarifaFinal,
            observaciones: valores.observaciones ?? "",
        });
        toast.success("Salida registrada correctamente");
        setDialogAbierto(false);
        await cargarDatos();
    } catch {
        toast.error("No se pudo registrar la salida");
    }
}

    function obtenerIngreso(id: number) {
        return ingresos.find((ingreso) => ingreso.idIngreso === id);
    }

    function identificadorVehiculo(vehiculo: Vehiculo | undefined, ingreso: Ingreso | undefined) {
        const idBase = vehiculo?.placa ? vehiculo.placa : (ingreso?.numeroFicha ? `${ingreso.numeroFicha}` : "Vehículo");
        const propietario = vehiculo ? (vehiculo.nombreUsuario || (vehiculo.nombreExterno ? `${vehiculo.nombreExterno} (Ext)` : "")) : "";
        return propietario ? `${idBase} ${propietario}` : idBase;
    }

    function descripcionIngreso(id: number) {
        const ingreso = obtenerIngreso(id);
        if (!ingreso) return "Ingreso no encontrado";
        const vehiculo = vehiculos.find((item) => item.idVehiculo === ingreso.idVehiculo);
        const espacio = espacios.find((item) => item.idEspacio === ingreso.idEspacioParqueo);
        return `${identificadorVehiculo(vehiculo, ingreso)} - ${espacio?.codigo ?? "Espacio"}`;
    }

    function descripcionIngresoActivo(ingreso: Ingreso) {
        return `${descripcionIngreso(ingreso.idIngreso)} - ingreso ${formatearFecha(ingreso.fechaIngreso)}`;
    }

    function renderDescripcionIngreso(texto: string) {
        if (texto.includes("(Ext)")) {
            const parts = texto.split("(Ext)");
            return (
                <div className="flex items-center gap-1.5 flex-wrap">
                    <span>{parts[0]}</span>
                    <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-300 py-0 h-4">
                        EXTERNO
                    </Badge>
                    <span>{parts[1]}</span>
                </div>
            );
        }
        return <span>{texto}</span>;
    }

    function formatearFecha(fecha: string) {
        const fechaFormateada = new Date(fecha);
        return Number.isNaN(fechaFormateada.getTime()) ? fecha : fechaFormateada.toLocaleString("es-CO");
    }

    function minutosTranscurridos(fechaIngreso: string) {
        const inicio = new Date(fechaIngreso).getTime();
        if (Number.isNaN(inicio)) return null;
        return Math.max(0, Math.floor((ahora - inicio) / 60_000));
    }

    const idIngresoSeleccionado = form.watch("idIngreso");
    const ingresoSeleccionado = obtenerIngreso(idIngresoSeleccionado);
    const minutosCalculados = ingresoSeleccionado ? minutosTranscurridos(ingresoSeleccionado.fechaIngreso) : null;

    const vehiculoSeleccionado = ingresoSeleccionado
        ? vehiculos.find((v) => v.idVehiculo === ingresoSeleccionado.idVehiculo)
        : undefined;

    const tipoVehiculoSeleccionado = vehiculoSeleccionado
        ? tipos.find((t) => t.idTipoVehiculo === vehiculoSeleccionado.idTipoVehiculo)
        : undefined;
    const esBicicletaSalida = tipoVehiculoSeleccionado?.nombre.toLowerCase() === "bicicleta";

    const membresiaActiva = vehiculoSeleccionado
        ? membresias.find(m => m.idVehiculo === vehiculoSeleccionado.idVehiculo && m.activa)
        : undefined;

    // Tarifas que aplican al vehÃ­culo del ingreso seleccionado (por tipo de vehÃ­culo + categorÃ­a de persona).
    const tarifasSugeridas = vehiculoSeleccionado
        ? tarifas.filter((tarifa) => tarifa.activo
            && tarifa.idTipoVehiculo === vehiculoSeleccionado.idTipoVehiculo
            && (tarifa.categoriaPersona === vehiculoSeleccionado.categoriaPersona || tarifa.categoriaPersona == null))
        : [];

    // Preselecciona automÃ¡ticamente la primera tarifa sugerida cuando cambia el ingreso elegido.
    // Las bicicletas no requieren tarifa (el ingreso es gratuito), asÃ­ que se deja en null.
    useEffect(() => {
        if (esBicicletaSalida || membresiaActiva) {
            form.setValue("idTarifa", null);
        } else if (tarifasSugeridas.length > 0) {
            form.setValue("idTarifa", tarifasSugeridas[0].idTarifa);
        } else {
            form.setValue("idTarifa", null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idIngresoSeleccionado, esBicicletaSalida, membresiaActiva]);

    const ingresosActivos = ingresos.filter((ingreso) => ingreso.estado.toLowerCase() === "activo");

    const [busqueda, setBusqueda] = useState("");

    const salidasFiltradas = salidas.filter((salida) => {
        const dIngreso = descripcionIngreso(salida.idIngreso).toLowerCase();
        const search = busqueda.toLowerCase();
        return dIngreso.includes(search);
    });

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Salidas</h2>
                    <p className="text-sm text-muted-foreground">Registro histórico de salidas del parqueadero</p>
                </div>
                {puedeCrear && <Button onClick={abrirCrear}>Registrar salida</Button>}
            </div>

            <div className="flex items-center mb-2">
                <Input 
                    type="search" 
                    placeholder="Buscar por placa, vehículo o ingreso..." 
                    className="max-w-md" 
                    value={busqueda} 
                    onChange={(e) => setBusqueda(e.target.value)} 
                />
            </div>

            <Table>
                <TableHeader><TableRow>
                    <TableHead>Fecha</TableHead><TableHead>Ingreso / vehículo</TableHead><TableHead>Tipo ingreso</TableHead><TableHead>Tarifa / modalidad</TableHead>
                    <TableHead>Tiempo</TableHead><TableHead>Valor total</TableHead><TableHead>Estado</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                    {cargando && <TableRow><TableCell colSpan={7}>Cargando...</TableCell></TableRow>}
                    {!cargando && salidasFiltradas.length === 0 && <TableRow><TableCell colSpan={7}>No hay salidas registradas</TableCell></TableRow>}
                    {salidasFiltradas.map((salida) => (
                        <TableRow key={salida.idSalida}>
                            <TableCell>{formatearFecha(salida.fechaSalida)}</TableCell>
                            <TableCell>{renderDescripcionIngreso(descripcionIngreso(salida.idIngreso))}</TableCell>
                            <TableCell>{salida.tipoIngreso ?? "-"}</TableCell>
                            <TableCell>{tarifas.find((tarifa) => tarifa.idTarifa === salida.idTarifa)?.nombre ?? "Sin tarifa (bicicleta)"} ({salida.modalidadPago ?? "LEGACY"})</TableCell>
                            <TableCell>{salida.tiempoPermanencia ?? "-"} min</TableCell>
                            <TableCell>{formatoMoneda(salida.valorTotal)}</TableCell>
                            <TableCell><Badge variant="secondary">{salida.estado}</Badge></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {puedeCrear && <Dialog open={dialogAbierto} onOpenChange={setDialogAbierto}>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                    <DialogHeader><DialogTitle>Registrar salida</DialogTitle></DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                            <FormField control={form.control} name="idIngreso" render={({ field }) => (
                                <FormItem><FormLabel>Vehículo (busca por placa o ficha)</FormLabel><FormControl>
                                    <BuscadorConFiltro
                                        items={ingresosActivos}
                                        valorSeleccionado={field.value || null}
                                        obtenerId={(i) => i.idIngreso}
                                        obtenerEtiqueta={descripcionIngresoActivo}
                                        renderEtiqueta={(i) => renderDescripcionIngreso(descripcionIngresoActivo(i))}
                                        onSeleccionar={(id) => field.onChange(id)}
                                        placeholder={ingresosActivos.length === 0 ? "No hay vehículos pendientes de salida" : "Escribe la placa o ficha..."}
                                    />
                                </FormControl><FormMessage /></FormItem>
                            )} />

                            {membresiaActiva ? (
                                <div className="rounded-lg border border-blue-500/50 bg-blue-500/10 px-2.5 py-2 text-sm text-blue-700 font-medium">
                                    Usuario con membresía mensual activa válida hasta {formatearFecha(membresiaActiva.fechaFin)}. El sistema generará salida gratuita (valor $0).
                                </div>
                            ) : esBicicletaSalida ? (
                                <div className="rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-2.5 py-2 text-sm text-emerald-700">
                                    Bicicleta ingreso gratuito, no requiere tarifa.
                                </div>
                            ) : (
                                <FormField control={form.control} name="idTarifa" render={({ field }) => (
    <FormItem>
        <FormLabel>Tarifa (sugerida según el vehículo)</FormLabel>
        <FormControl>
            <select
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                value={(field.value as number | null) ?? "" }
                onChange={(event) => field.onChange(Number(event.target.value))}
                disabled={!ingresoSeleccionado || tarifasSugeridas.length === 0}
            >
                <option value="" disabled>
                    {!ingresoSeleccionado ? "Primero selecciona un ingreso" : tarifasSugeridas.length === 0 ? "No hay tarifas para este vehículo" : "Selecciona una tarifa"}
                </option>
                {tarifasSugeridas.map((tarifa) => <option key={tarifa.idTarifa} value={tarifa.idTarifa}>{tarifa.nombre} - {formatoMoneda(tarifa.valorHora ?? 0)}</option>)}
            </select>
        </FormControl>
        {ingresoSeleccionado && tarifasSugeridas.length === 0 && (
            <p className="rounded-lg border border-destructive/50 bg-destructive/10 px-2.5 py-2 text-sm text-destructive">
                No hay tarifa configurada para este vehículo. Configura una tarifa antes de registrar la salida.
            </p>
        )}
        <FormMessage />
    </FormItem>
)} />
                            )}

                            <FormField control={form.control} name="modalidadPago" render={({ field }) => (
                                <FormItem><FormLabel>Modalidad de pago</FormLabel><FormControl>
                                    <select className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm" value={field.value} onChange={(event) => field.onChange(event.target.value)}>
                                        <option value="POR_TIEMPO">Por tiempo</option>
                                        <option value="POR_PLANILLA">Por planilla / mensualidad</option>
                                        <option value="ESPECIAL">Especial</option>
                                    </select>
                                </FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="lecturaFinalKm" render={({ field }) => (
                                <FormItem><FormLabel>Lectura final (km)</FormLabel><FormControl><Input type="number" min="0" step="1" value={field.value ?? ""} onChange={(event) => field.onChange(event.target.value === "" ? null : Number(event.target.value))} /></FormControl><FormMessage /></FormItem>
                            )} />
                            {ingresoSeleccionado && <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                                <p><strong>Ingreso:</strong> {formatearFecha(ingresoSeleccionado.fechaIngreso)}</p>
                                <p><strong>Tiempo calculado:</strong> {minutosCalculados ?? "-"} minutos</p>
                                <p className="text-muted-foreground">El tiempo y el valor final serán calculados por el sistema al registrar la salida.</p>
                            </div>}
                            <FormField control={form.control} name="observaciones" render={({ field }) => (
                                <FormItem><FormLabel>Observaciones</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <DialogFooter><Button type="submit">Registrar salida</Button></DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>}
        </div>
    );
}




