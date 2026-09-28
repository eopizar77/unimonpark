import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { crearPago, listarPagos } from "@/api/pagos";
import { listarFacturas } from "@/api/facturas";
import type { Pago } from "@/types/pago";
import type { Factura } from "@/types/factura";
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
            const [pagosData, facturasData] = await Promise.all([listarPagos(), listarFacturas()]);
            setPagos(pagosData);
            setFacturas(facturasData);
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

    function formatearFecha(fecha: string) {
        const fechaFormateada = new Date(fecha);
        return Number.isNaN(fechaFormateada.getTime()) ? fecha : fechaFormateada.toLocaleString("es-CO");
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

    const pagosFiltrados = pagos.filter((pago) => {
        const dFactura = `#${pago.idFactura}`;
        const uNombre = nombreUsuarioPago(pago.idFactura).toLowerCase();
        const vPlaca = placaVehiculoPago(pago.idFactura).toLowerCase();
        const search = busqueda.toLowerCase();
        return dFactura.includes(search) || uNombre.includes(search) || vPlaca.includes(search) || `#${pago.idPago}`.includes(search);
    });

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Pagos</h2>
                    <p className="text-sm text-muted-foreground">Registro histórico de pagos recibidos</p>
                </div>
                {puedeCrear && <Button onClick={abrirCrear}>Registrar pago</Button>}
            </div>

            <div className="flex items-center mb-2">
                <Input 
                    type="search" 
                    placeholder="Buscar por placa, usuario o # de factura..." 
                    className="max-w-md" 
                    value={busqueda} 
                    onChange={(e) => setBusqueda(e.target.value)} 
                />
            </div>

            <Table>
                <TableHeader><TableRow>
                    <TableHead>Pago</TableHead><TableHead>Factura</TableHead><TableHead>Usuario</TableHead><TableHead>Vehículo</TableHead><TableHead>Fecha</TableHead>
                    <TableHead>Monto</TableHead><TableHead>Método</TableHead><TableHead>Referencia</TableHead><TableHead>Estado</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                    {cargando && <TableRow><TableCell colSpan={9}>Cargando...</TableCell></TableRow>}
                    {!cargando && pagosFiltrados.length === 0 && <TableRow><TableCell colSpan={9}>No hay pagos registrados</TableCell></TableRow>}
                    {pagosFiltrados.map((pago) => (
                        <TableRow key={pago.idPago}>
                            <TableCell className="font-medium">#{pago.idPago}</TableCell>
                            <TableCell>#{pago.idFactura}</TableCell>
                            <TableCell>{nombreUsuarioPago(pago.idFactura)}</TableCell>
                            <TableCell>{placaVehiculoPago(pago.idFactura)}</TableCell>
                            <TableCell>{formatearFecha(pago.fecha)}</TableCell>
                            <TableCell>{formatoMoneda(pago.monto)}</TableCell>
                            <TableCell>{pago.metodoPago}</TableCell>
                            <TableCell>{pago.referencia || "-"}</TableCell>
                            <TableCell><Badge variant="secondary">{pago.estado}</Badge></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {puedeCrear && <Dialog open={dialogAbierto} onOpenChange={setDialogAbierto}>
                <DialogContent className="sm:max-w-lg">
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
                                        onSeleccionar={(id) => {
                                            field.onChange(id);
                                            const factura = facturasDisponibles.find((item) => item.idFactura === id);
                                            form.setValue("monto", factura?.total ?? 0);
                                        }}
                                        placeholder={facturasDisponibles.length === 0 ? "No hay facturas pendientes" : "Escribe la placa o el nombre..."}
                                    />
                                </FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="monto" render={({ field }) => (
                                <FormItem><FormLabel>Monto</FormLabel><FormControl><Input type="number" min="0" step="0.01" value={field.value} onChange={(event) => field.onChange(Number(event.target.value))} /></FormControl><FormMessage /></FormItem>
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

