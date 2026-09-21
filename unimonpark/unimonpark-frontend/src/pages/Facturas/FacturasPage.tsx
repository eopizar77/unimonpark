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
import { BuscadorConFiltro } from "@/components/BuscadorConFiltro";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";

const rolesConPermiso = new Set(["ADMINISTRADOR", "GESTION"]);
const valoresIniciales: FacturaFormValues = {
    idUsuario: 0,
    idSalida: 0,
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
    const idSalidaSeleccionada = form.watch("idSalida");
    const descuento = form.watch("descuento");
    const iva = form.watch("iva");
    const salidaSeleccionada = salidas.find((salida) => salida.idSalida === idSalidaSeleccionada);
    const subtotal = salidaSeleccionada?.valorTotal ?? 0;
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
                idUsuario: valores.idUsuario,
                idSalida: valores.idSalida,
                descuento: valores.descuento,
                iva: valores.iva,
            });
            toast.success("Factura generada correctamente");
            setDialogAbierto(false);
            await cargarDatos();
        } catch {
            toast.error("No se pudo generar la factura");
        }
    }

    function nombreUsuarioSelect(usuario: Usuario) {
        return `${usuario.nombres} ${usuario.apellidos}`;
    }

    function descripcionSalida(salida: Salida) {
        return `${salida.placaVehiculo || "Bicicleta"} - Salida #${salida.idSalida} - ${formatoMoneda(salida.valorTotal)}`;
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
                    <TableHead>Vehículo</TableHead><TableHead>Subtotal</TableHead><TableHead>Total</TableHead><TableHead>Estado</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                    {cargando && <TableRow><TableCell colSpan={7}>Cargando...</TableCell></TableRow>}
                    {!cargando && facturas.length === 0 && <TableRow><TableCell colSpan={7}>No hay facturas registradas</TableCell></TableRow>}
                    {facturas.map((factura) => (
                        <TableRow key={factura.idFactura}>
                            <TableCell className="font-medium">#{factura.idFactura}</TableCell>
                            <TableCell>{formatearFecha(factura.fecha)}</TableCell>
                            <TableCell>{factura.nombres} {factura.apellidos}</TableCell>
                            <TableCell>{factura.placaVehiculo || "Bicicleta"}</TableCell>
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
                                <FormItem><FormLabel>Usuario (busca por nombre)</FormLabel><FormControl>
                                    <BuscadorConFiltro
                                        items={usuariosActivos}
                                        valorSeleccionado={field.value || null}
                                        obtenerId={(u) => u.idUsuario}
                                        obtenerEtiqueta={nombreUsuarioSelect}
                                        onSeleccionar={(id) => field.onChange(id)}
                                        placeholder="Escribe el nombre..."
                                    />
                                </FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="idSalida" render={({ field }) => (
                                <FormItem><FormLabel>Salida (busca por placa)</FormLabel><FormControl>
                                    <BuscadorConFiltro
                                        items={salidasDisponibles}
                                        valorSeleccionado={field.value || null}
                                        obtenerId={(s) => s.idSalida}
                                        obtenerEtiqueta={descripcionSalida}
                                        onSeleccionar={(id) => field.onChange(id)}
                                        placeholder={salidasDisponibles.length === 0 ? "No hay salidas sin facturar" : "Escribe la placa..."}
                                    />
                                </FormControl><FormMessage /></FormItem>
                            )} />
                            <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                                <p><strong>Subtotal de la salida:</strong> {salidaSeleccionada ? formatoMoneda(subtotal) : "Selecciona una salida"}</p>
                                <p className="text-muted-foreground">El subtotal se toma automáticamente del valor calculado al cerrar la salida.</p>
                            </div>
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