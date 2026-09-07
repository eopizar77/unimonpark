import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { crearFactura, listarFacturas } from "@/api/facturas";
import { listarSalidas } from "@/api/salidas";
import { listarUsuarios } from "@/api/usuarios";
import type { Factura } from "@/types/factura";
import type { Salida } from "@/types/salida";
import type { Usuario } from "@/types/usuario";
import { facturaSchema, type FacturaFormValues } from "./facturaSchema";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";

const rolesConPermiso = new Set(["ADMINISTRADOR", "GESTION", "SUPERVISOR"]);
const valoresIniciales: FacturaFormValues = {
    idUsuario: 0,
    idSalida: 0,
    subtotal: 0,
    descuento: 0,
    iva: 0,
};

function formatoMoneda(valor: number | null) {
    if (valor === null) return "-";
    return `$${valor.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function FacturasPage() {
    const { rol } = useAuth();
    const puedeCrear = rolesConPermiso.has((rol ?? "").trim().toUpperCase());
    const [facturas, setFacturas] = useState<Factura[]>([]);
    const [salidas, setSalidas] = useState<Salida[]>([]);
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [cargando, setCargando] = useState(true);
    const [dialogAbierto, setDialogAbierto] = useState(false);

    const form = useForm<FacturaFormValues>({
        resolver: zodResolver(facturaSchema),
        defaultValues: valoresIniciales,
    });
    const subtotal = form.watch("subtotal");
    const descuento = form.watch("descuento");
    const iva = form.watch("iva");
    const totalCalculado = Math.max(0, subtotal - descuento + iva);

    async function cargarDatos() {
        setCargando(true);
        try {
            const [facturasData, salidasData, usuariosData] = await Promise.all([
                listarFacturas(),
                listarSalidas(),
                listarUsuarios(),
            ]);
            setFacturas(facturasData);
            setSalidas(salidasData);
            setUsuarios(usuariosData);
        } catch {
            toast.error("No se pudieron cargar las facturas");
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

    async function onSubmit(valores: FacturaFormValues) {
        try {
            await crearFactura({
                ...valores,
                total: Math.max(0, valores.subtotal - valores.descuento + valores.iva),
                estado: "generada",
            });
            toast.success("Factura generada correctamente");
            setDialogAbierto(false);
            await cargarDatos();
        } catch {
            toast.error("No se pudo generar la factura");
        }
    }

    function nombreUsuario(id: number) {
        const usuario = usuarios.find((item) => item.idUsuario === id);
        return usuario ? `${usuario.nombres} ${usuario.apellidos}` : "Usuario no encontrado";
    }

    function descripcionSalida(id: number) {
        const salida = salidas.find((item) => item.idSalida === id);
        return salida ? `Salida #${salida.idSalida} - ${formatoMoneda(salida.valorTotal)}` : "Salida no encontrada";
    }

    function formatearFecha(fecha: string) {
        const fechaFormateada = new Date(fecha);
        return Number.isNaN(fechaFormateada.getTime()) ? fecha : fechaFormateada.toLocaleString("es-CO");
    }

    const salidasFacturadas = new Set(facturas.map((factura) => factura.idSalida));
    const salidasDisponibles = salidas.filter((salida) => salida.estado.toLowerCase() === "cerrado" && !salidasFacturadas.has(salida.idSalida));
    const usuariosActivos = usuarios.filter((usuario) => usuario.activo);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Facturas</h2>
                    <p className="text-sm text-muted-foreground">Documentos generados a partir de las salidas</p>
                </div>
                {puedeCrear && <Button onClick={abrirCrear}>Generar factura</Button>}
            </div>

            <Table>
                <TableHeader><TableRow>
                    <TableHead>Factura</TableHead><TableHead>Fecha</TableHead><TableHead>Usuario</TableHead>
                    <TableHead>Salida</TableHead><TableHead>Subtotal</TableHead><TableHead>Total</TableHead><TableHead>Estado</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                    {cargando && <TableRow><TableCell colSpan={7}>Cargando...</TableCell></TableRow>}
                    {!cargando && facturas.length === 0 && <TableRow><TableCell colSpan={7}>No hay facturas registradas</TableCell></TableRow>}
                    {facturas.map((factura) => (
                        <TableRow key={factura.idFactura}>
                            <TableCell className="font-medium">#{factura.idFactura}</TableCell>
                            <TableCell>{formatearFecha(factura.fecha)}</TableCell>
                            <TableCell>{nombreUsuario(factura.idUsuario)}</TableCell>
                            <TableCell>{descripcionSalida(factura.idSalida)}</TableCell>
                            <TableCell>{formatoMoneda(factura.subtotal)}</TableCell>
                            <TableCell>{formatoMoneda(factura.total)}</TableCell>
                            <TableCell><Badge variant="secondary">{factura.estado}</Badge></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {puedeCrear && <Dialog open={dialogAbierto} onOpenChange={setDialogAbierto}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader><DialogTitle>Generar factura</DialogTitle></DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                            <FormField control={form.control} name="idUsuario" render={({ field }) => (
                                <FormItem><FormLabel>Usuario</FormLabel><FormControl>
                                    <select className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm" value={field.value || ""} onChange={(event) => field.onChange(Number(event.target.value))}>
                                        <option value="" disabled>Selecciona un usuario</option>
                                        {usuariosActivos.map((usuario) => <option key={usuario.idUsuario} value={usuario.idUsuario}>{usuario.nombres} {usuario.apellidos}</option>)}
                                    </select>
                                </FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="idSalida" render={({ field }) => (
                                <FormItem><FormLabel>Salida</FormLabel><FormControl>
                                    <select className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm" value={field.value || ""} onChange={(event) => field.onChange(Number(event.target.value))}>
                                        <option value="" disabled>Selecciona una salida sin factura</option>
                                        {salidasDisponibles.map((salida) => <option key={salida.idSalida} value={salida.idSalida}>{descripcionSalida(salida.idSalida)}</option>)}
                                    </select>
                                </FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="subtotal" render={({ field }) => (
                                <FormItem><FormLabel>Subtotal</FormLabel><FormControl><Input type="number" min="0" step="0.01" value={field.value} onChange={(event) => field.onChange(Number(event.target.value))} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="descuento" render={({ field }) => (
                                <FormItem><FormLabel>Descuento</FormLabel><FormControl><Input type="number" min="0" step="0.01" value={field.value} onChange={(event) => field.onChange(Number(event.target.value))} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="iva" render={({ field }) => (
                                <FormItem><FormLabel>IVA</FormLabel><FormControl><Input type="number" min="0" step="0.01" value={field.value} onChange={(event) => field.onChange(Number(event.target.value))} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <p className="text-right text-sm font-semibold">Total calculado: {formatoMoneda(totalCalculado)}</p>
                            <DialogFooter><Button type="submit">Generar factura</Button></DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>}
        </div>
    );
}
