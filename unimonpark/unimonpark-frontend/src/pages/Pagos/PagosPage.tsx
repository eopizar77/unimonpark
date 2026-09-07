import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { crearPago, listarPagos } from "@/api/pagos";
import { listarFacturas } from "@/api/facturas";
import type { Pago } from "@/types/pago";
import type { Factura } from "@/types/factura";
import { pagoSchema, type PagoFormValues } from "./pagoSchema";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";

const rolesConPermiso = new Set(["ADMINISTRADOR", "GESTION", "SUPERVISOR"]);
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

    const pagosRegistrados = new Set(pagos.map((pago) => pago.idFactura));
    const facturasDisponibles = facturas.filter((factura) => !pagosRegistrados.has(factura.idFactura));

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Pagos</h2>
                    <p className="text-sm text-muted-foreground">Registro histórico de pagos recibidos</p>
                </div>
                {puedeCrear && <Button onClick={abrirCrear}>Registrar pago</Button>}
            </div>

            <Table>
                <TableHeader><TableRow>
                    <TableHead>Pago</TableHead><TableHead>Factura</TableHead><TableHead>Fecha</TableHead>
                    <TableHead>Monto</TableHead><TableHead>Método</TableHead><TableHead>Referencia</TableHead><TableHead>Estado</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                    {cargando && <TableRow><TableCell colSpan={7}>Cargando...</TableCell></TableRow>}
                    {!cargando && pagos.length === 0 && <TableRow><TableCell colSpan={7}>No hay pagos registrados</TableCell></TableRow>}
                    {pagos.map((pago) => (
                        <TableRow key={pago.idPago}>
                            <TableCell className="font-medium">#{pago.idPago}</TableCell>
                            <TableCell>#{pago.idFactura}</TableCell>
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
                                <FormItem><FormLabel>Factura</FormLabel><FormControl>
                                    <select
                                        className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                                        value={field.value || ""}
                                        onChange={(event) => {
                                            const idFactura = Number(event.target.value);
                                            field.onChange(idFactura);
                                            const factura = facturasDisponibles.find((item) => item.idFactura === idFactura);
                                            form.setValue("monto", factura?.total ?? 0);
                                        }}
                                    >
                                        <option value="" disabled>Selecciona una factura pendiente</option>
                                        {facturasDisponibles.map((factura) => <option key={factura.idFactura} value={factura.idFactura}>Factura #{factura.idFactura} - {formatoMoneda(factura.total)}</option>)}
                                    </select>
                                </FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="monto" render={({ field }) => (
                                <FormItem><FormLabel>Monto</FormLabel><FormControl><Input type="number" min="0.01" step="0.01" value={field.value} onChange={(event) => field.onChange(Number(event.target.value))} /></FormControl><FormMessage /></FormItem>
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
