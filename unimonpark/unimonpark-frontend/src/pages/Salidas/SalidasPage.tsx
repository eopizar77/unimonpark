import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { crearSalida, listarSalidas } from "@/api/salidas";
import { listarIngresos } from "@/api/ingresos";
import { listarTarifas } from "@/api/tarifas";
import { listarVehiculos } from "@/api/vehiculos";
import { listarEspaciosParqueo } from "@/api/espaciosParqueo";
import type { Salida } from "@/types/salida";
import type { Ingreso } from "@/types/ingreso";
import type { Tarifa } from "@/types/tarifa";
import type { Vehiculo } from "@/types/vehiculo";
import type { EspacioParqueo } from "@/types/espacioParqueo";
import { salidaSchema, type SalidaFormValues } from "./salidaSchema";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";

const rolesConPermiso = new Set(["ADMINISTRADOR", "GESTION", "SUPERVISOR"]);
const valoresIniciales: SalidaFormValues = {
    idIngreso: 0,
    lecturaFinalKm: null,
    tiempoPermanencia: null,
    valorTotal: 0,
    observaciones: "",
    idTarifa: 0,
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
    const [cargando, setCargando] = useState(true);
    const [dialogAbierto, setDialogAbierto] = useState(false);

    const form = useForm<SalidaFormValues>({
        resolver: zodResolver(salidaSchema),
        defaultValues: valoresIniciales,
    });

    async function cargarDatos() {
        setCargando(true);
        try {
            const [salidasData, ingresosData, tarifasData, vehiculosData, espaciosData] = await Promise.all([
                listarSalidas(),
                listarIngresos(),
                listarTarifas(),
                listarVehiculos(),
                listarEspaciosParqueo(),
            ]);
            setSalidas(salidasData);
            setIngresos(ingresosData);
            setTarifas(tarifasData);
            setVehiculos(vehiculosData);
            setEspacios(espaciosData);
        } catch {
            toast.error("No se pudieron cargar las salidas");
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

    async function onSubmit(valores: SalidaFormValues) {
        try {
            await crearSalida({
                ...valores,
                estado: "cerrado",
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

    function descripcionIngreso(id: number) {
        const ingreso = obtenerIngreso(id);
        if (!ingreso) return "Ingreso no encontrado";
        const vehiculo = vehiculos.find((item) => item.idVehiculo === ingreso.idVehiculo);
        const espacio = espacios.find((item) => item.idEspacio === ingreso.idEspacioParqueo);
        return `${vehiculo?.placa ?? "Vehículo"} - ${espacio?.codigo ?? "Espacio"}`;
    }

    function formatearFecha(fecha: string) {
        const fechaFormateada = new Date(fecha);
        return Number.isNaN(fechaFormateada.getTime()) ? fecha : fechaFormateada.toLocaleString("es-CO");
    }

    const ingresosActivos = ingresos.filter((ingreso) => ingreso.estado.toLowerCase() === "activo");
    const tarifasActivas = tarifas.filter((tarifa) => tarifa.activo);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Salidas</h2>
                    <p className="text-sm text-muted-foreground">Registro histórico de salidas del parqueadero</p>
                </div>
                {puedeCrear && <Button onClick={abrirCrear}>Registrar salida</Button>}
            </div>

            <Table>
                <TableHeader><TableRow>
                    <TableHead>Fecha</TableHead><TableHead>Ingreso / vehículo</TableHead><TableHead>Tarifa</TableHead>
                    <TableHead>Tiempo</TableHead><TableHead>Valor total</TableHead><TableHead>Estado</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                    {cargando && <TableRow><TableCell colSpan={6}>Cargando...</TableCell></TableRow>}
                    {!cargando && salidas.length === 0 && <TableRow><TableCell colSpan={6}>No hay salidas registradas</TableCell></TableRow>}
                    {salidas.map((salida) => (
                        <TableRow key={salida.idSalida}>
                            <TableCell>{formatearFecha(salida.fechaSalida)}</TableCell>
                            <TableCell>{descripcionIngreso(salida.idIngreso)}</TableCell>
                            <TableCell>{tarifas.find((tarifa) => tarifa.idTarifa === salida.idTarifa)?.nombre ?? "Tarifa no encontrada"}</TableCell>
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
                                <FormItem><FormLabel>Ingreso activo</FormLabel><FormControl>
                                    <select className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm" value={field.value || ""} onChange={(event) => field.onChange(Number(event.target.value))}>
                                        <option value="" disabled>Selecciona un ingreso</option>
                                        {ingresosActivos.map((ingreso) => <option key={ingreso.idIngreso} value={ingreso.idIngreso}>{descripcionIngreso(ingreso.idIngreso)}</option>)}
                                    </select>
                                </FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="idTarifa" render={({ field }) => (
                                <FormItem><FormLabel>Tarifa</FormLabel><FormControl>
                                    <select className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm" value={field.value || ""} onChange={(event) => field.onChange(Number(event.target.value))}>
                                        <option value="" disabled>Selecciona una tarifa</option>
                                        {tarifasActivas.map((tarifa) => <option key={tarifa.idTarifa} value={tarifa.idTarifa}>{tarifa.nombre} - {formatoMoneda(tarifa.valorHora)}/hora</option>)}
                                    </select>
                                </FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="lecturaFinalKm" render={({ field }) => (
                                <FormItem><FormLabel>Lectura final (km)</FormLabel><FormControl><Input type="number" min="0" step="1" value={field.value ?? ""} onChange={(event) => field.onChange(event.target.value === "" ? null : Number(event.target.value))} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="tiempoPermanencia" render={({ field }) => (
                                <FormItem><FormLabel>Tiempo de permanencia (minutos)</FormLabel><FormControl><Input type="number" min="0" step="1" value={field.value ?? ""} onChange={(event) => field.onChange(event.target.value === "" ? null : Number(event.target.value))} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="valorTotal" render={({ field }) => (
                                <FormItem><FormLabel>Valor total</FormLabel><FormControl><Input type="number" min="0" step="0.01" value={field.value} onChange={(event) => field.onChange(Number(event.target.value))} /></FormControl><FormMessage /></FormItem>
                            )} />
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
