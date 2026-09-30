import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { crearPago, listarPagos } from "@/api/pagos";
import { listarFacturas } from "@/api/facturas";
import { listarUsuarios } from "@/api/usuarios";
import { listarExternos } from "@/api/externos";
import type { Pago } from "@/types/pago";
import type { Factura } from "@/types/factura";
import type { Usuario } from "@/types/usuario";
import type { Externo } from "@/types/externo";
import { pagoSchema, type PagoFormValues } from "./pagoSchema";
import { BuscadorConFiltro } from "@/components/BuscadorConFiltro";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";

const rolesConPermiso = new Set(["ADMINISTRADOR", "GESTION"]);
const metodosPago = ["efectivo", "tarjeta", "transferencia", "PSE", "otro"];
const valoresIniciales: PagoFormValues = {
    idFactura: 0,
    monto: 0,
    metodoPago: "efectivo",
    referencia: "",
};

function formatoMoneda(valor: number) {
    return `$${valor.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function PagosPage() {
    const { rol } = useAuth();
    const puedeCrear = rolesConPermiso.has((rol ?? "").trim().toUpperCase());
    const [pagos, setPagos] = useState<Pago[]>([]);
    const [facturas, setFacturas] = useState<Factura[]>([]);
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [externos, setExternos] = useState<Externo[]>([]);
    const [cargando, setCargando] = useState(true);
    const [dialogAbierto, setDialogAbierto] = useState(false);

    const form = useForm<PagoFormValues>({
        resolver: zodResolver(pagoSchema),
        defaultValues: valoresIniciales,
    });

    const idFacturaSeleccionada = form.watch("idFactura");

    useEffect(() => {
        if (!idFacturaSeleccionada) return;
        const factura = facturas.find(f => f.idFactura === idFacturaSeleccionada);
        if (factura) {
            form.setValue("monto", factura.total);
        }
    }, [idFacturaSeleccionada, facturas, form]);

    async function cargarDatos() {
        setCargando(true);
        try {
            const [pagosData, facturasData, usuariosData, externosData] = await Promise.all([listarPagos(), listarFacturas(), listarUsuarios(), listarExternos()]);
            setPagos(pagosData);
            setFacturas(facturasData);
            setUsuarios(usuariosData);
            setExternos(externosData);
        } catch {
            toast.error("No se pudieron cargar los pagos");
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

    async function onSubmit(valores: PagoFormValues) {
        try {
            await crearPago({
                ...valores,
                referencia: valores.referencia ?? "",
                estado: "aprobado",
            });
            toast.success("Pago registrado correctamente");
            setDialogAbierto(false);
            await cargarDatos();
        } catch {
            toast.error("No se pudo registrar el pago");
        }
    }

    function formatearFechaObj(fecha: string) {
        const fechaFormateada = new Date(fecha);
        if (Number.isNaN(fechaFormateada.getTime())) return { dia: fecha, hora: "" };
        const dia = fechaFormateada.toLocaleDateString("es-CO");
        const hora = fechaFormateada.toLocaleTimeString("es-CO", { hour: '2-digit', minute: '2-digit' });
        return { dia, hora };
    }

    function obtenerFactura(id: number) {
        return facturas.find((factura) => factura.idFactura === id);
    }

    function descripcionFactura(factura: Factura) {
        return `${factura.placaVehiculo || "Bicicleta"} - ${factura.nombres} ${factura.apellidos} - Factura #${factura.idFactura} - ${formatoMoneda(factura.total)}`;
    }

    function nombreUsuarioPago(idFactura: number) {
        const factura = obtenerFactura(idFactura);
        return factura ? `${factura.nombres} ${factura.apellidos}` : "-";
    }

    function placaVehiculoPago(idFactura: number) {
        const factura = obtenerFactura(idFactura);
        return factura ? (factura.placaVehiculo || "Bicicleta") : "-";
    }

    const pagosRegistrados = new Set(pagos.map((pago) => pago.idFactura));
    const facturasDisponibles = facturas.filter((factura) => !pagosRegistrados.has(factura.idFactura));

    const [busqueda, setBusqueda] = useState("");
    const [fechaDesde, setFechaDesde] = useState("");
    const [fechaHasta, setFechaHasta] = useState("");

    const pagosFiltrados = pagos.filter((pago) => {
        const dFactura = `#${pago.idFactura}`;
        const uNombre = nombreUsuarioPago(pago.idFactura).toLowerCase();
        const vPlaca = placaVehiculoPago(pago.idFactura).toLowerCase();
        const factura = obtenerFactura(pago.idFactura);
        const cedula = factura
            ? (factura.idUsuario
                ? (usuarios.find(u => u.idUsuario === factura.idUsuario)?.documento || "")
                : (externos.find(e => e.idExterno === factura.idExterno)?.numeroDocumento || ""))
            : "";
        const search = busqueda.toLowerCase();
        const coincideTexto = dFactura.includes(search) || uNombre.includes(search) || vPlaca.includes(search) || `#${pago.idPago}`.includes(search) || cedula.includes(search);

        let coincideFecha = true;
        if (fechaDesde || fechaHasta) {
            const pagoDate = new Date(pago.fecha);
            if (fechaDesde) {
                const start = new Date(fechaDesde);
                start.setHours(0, 0, 0, 0);
                if (pagoDate < start) coincideFecha = false;
            }
            if (fechaHasta) {
                const end = new Date(fechaHasta);
                end.setHours(23, 59, 59, 999);
                if (pagoDate > end) coincideFecha = false;
            }
        }

        return coincideTexto && coincideFecha;
    });

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Pagos</h2>
                    <p className="text-sm text-slate-500 font-normal">Registro histórico de pagos recibidos</p>
                </div>
                {puedeCrear && <Button onClick={abrirCrear}>Registrar pago</Button>}
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-2">
                <Input 
                    type="search" 
                    placeholder="Buscar por placa, usuario, # de factura o cédula..." 
                    className="w-full md:w-80" 
                    value={busqueda} 
                    onChange={(e) => setBusqueda(e.target.value)} 
                />
                <div className="flex items-center gap-2">
                    <Input 
                        type="date" 
                        value={fechaDesde} 
                        onChange={(e) => setFechaDesde(e.target.value)} 
                        className="w-auto"
                    />
                    <span className="text-sm text-slate-500">hasta</span>
                    <Input 
                        type="date" 
                        value={fechaHasta} 
                        onChange={(e) => setFechaHasta(e.target.value)} 
                        className="w-auto"
                    />
                    {(busqueda || fechaDesde || fechaHasta) && (
                        <Button 
                            variant="ghost" 
                            onClick={() => {
                                setBusqueda("");
                                setFechaDesde("");
                                setFechaHasta("");
                            }}
                        >
                            Limpiar
                        </Button>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50/50"><TableRow>
                        <TableHead className="text-slate-500 font-medium text-xs uppercase tracking-wider">Pago</TableHead>
                        <TableHead className="text-slate-500 font-medium text-xs uppercase tracking-wider">Factura</TableHead>
                        <TableHead className="text-slate-500 font-medium text-xs uppercase tracking-wider">Usuario</TableHead>
                        <TableHead className="text-slate-500 font-medium text-xs uppercase tracking-wider">Vehículo</TableHead>
                        <TableHead className="text-slate-500 font-medium text-xs uppercase tracking-wider">Fecha</TableHead>
                        <TableHead className="text-slate-500 font-medium text-xs uppercase tracking-wider">Monto</TableHead>
                        <TableHead className="text-slate-500 font-medium text-xs uppercase tracking-wider">Método</TableHead>
                        <TableHead className="text-slate-500 font-medium text-xs uppercase tracking-wider">Referencia</TableHead>
                        <TableHead className="text-slate-500 font-medium text-xs uppercase tracking-wider">Estado</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                        {cargando && <TableRow><TableCell colSpan={9}>Cargando...</TableCell></TableRow>}
                        {!cargando && pagosFiltrados.length === 0 && <TableRow><TableCell colSpan={9}>No hay pagos registrados</TableCell></TableRow>}
                        {pagosFiltrados.map((pago) => {
                            const fechaF = formatearFechaObj(pago.fecha);
                            return (
                                <TableRow key={pago.idPago}>
                                    <TableCell><span className="font-mono bg-slate-100 text-slate-700 px-2 py-1 rounded-md text-xs font-medium">#{pago.idPago}</span></TableCell>
                                    <TableCell>#{pago.idFactura}</TableCell>
                                    <TableCell>{nombreUsuarioPago(pago.idFactura)}</TableCell>
                                    <TableCell>{placaVehiculoPago(pago.idFactura)}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span>{fechaF.dia}</span>
                                            {fechaF.hora && <span className="text-xs text-muted-foreground">{fechaF.hora}</span>}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-mono font-bold text-emerald-600">{formatoMoneda(pago.monto)}</TableCell>
                                    <TableCell>{pago.metodoPago}</TableCell>
                                    <TableCell>{pago.referencia || "-"}</TableCell>
                                    <TableCell><Badge variant="secondary">{pago.estado}</Badge></TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            {puedeCrear && <Dialog open={dialogAbierto} onOpenChange={setDialogAbierto}>
                <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>Registrar pago</DialogTitle></DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                            <FormField control={form.control} name="idFactura" render={({ field }) => (
                                <FormItem><FormLabel>Factura (busca por placa o usuario)</FormLabel><FormControl>
                                    <BuscadorConFiltro
                                        items={facturasDisponibles}
                                        valorSeleccionado={field.value || null}
                                        obtenerId={(f) => f.idFactura}
                                        obtenerEtiqueta={descripcionFactura}
                                        obtenerTerminosBusqueda={(f) => {
                                            if (f.idUsuario) return usuarios.find(u => u.idUsuario === f.idUsuario)?.documento || "";
                                            if (f.idExterno) return externos.find(e => e.idExterno === f.idExterno)?.numeroDocumento || "";
                                            return "";
                                        }}
                                        onSeleccionar={(id) => {
                                            field.onChange(id);
                                            const factura = facturasDisponibles.find((item) => item.idFactura === id);
                                            form.setValue("monto", factura?.total ?? 0);
                                        }}
                                        placeholder={facturasDisponibles.length === 0 ? "No hay facturas pendientes" : "Escribe la placa, nombre o c\u00E9dula..."}
                                    />
                                </FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="monto" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Monto (tomado de la factura)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="text"
                                            readOnly
                                            value={formatoMoneda(field.value)}
                                            className="bg-muted text-muted-foreground cursor-not-allowed"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="metodoPago" render={({ field }) => (
                                <FormItem><FormLabel>Método de pago</FormLabel><FormControl>
                                    <select className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm" value={field.value} onChange={field.onChange}>
                                        {metodosPago.map((metodo) => <option key={metodo} value={metodo}>{metodo}</option>)}
                                    </select>
                                </FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="referencia" render={({ field }) => (
                                <FormItem><FormLabel>Referencia</FormLabel><FormControl><Input {...field} placeholder="Opcional" /></FormControl><FormMessage /></FormItem>
                            )} />
                            <DialogFooter><Button type="submit">Registrar pago</Button></DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>}
        </div>
    );
}

