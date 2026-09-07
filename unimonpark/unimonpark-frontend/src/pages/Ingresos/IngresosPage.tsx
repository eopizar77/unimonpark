import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { crearIngreso, listarIngresos } from "@/api/ingresos";
import { listarVehiculos } from "@/api/vehiculos";
import { listarEspaciosParqueo } from "@/api/espaciosParqueo";
import type { Ingreso } from "@/types/ingreso";
import type { Vehiculo } from "@/types/vehiculo";
import type { EspacioParqueo } from "@/types/espacioParqueo";
import { ingresoSchema, type IngresoFormValues } from "./ingresoSchema";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";

const rolesConPermiso = new Set(["ADMINISTRADOR", "GESTION", "SUPERVISOR"]);
const valoresIniciales: IngresoFormValues = {
    idVehiculo: 0,
    idEspacioParqueo: 0,
    lecturaInicialKm: null,
    tipoIngreso: "normal",
};

export default function IngresosPage() {
    const { rol } = useAuth();
    const puedeCrear = rolesConPermiso.has((rol ?? "").trim().toUpperCase());
    const [ingresos, setIngresos] = useState<Ingreso[]>([]);
    const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
    const [espacios, setEspacios] = useState<EspacioParqueo[]>([]);
    const [cargando, setCargando] = useState(true);
    const [dialogAbierto, setDialogAbierto] = useState(false);

    const form = useForm<IngresoFormValues>({
        resolver: zodResolver(ingresoSchema),
        defaultValues: valoresIniciales,
    });

    async function cargarDatos() {
        setCargando(true);
        try {
            const [ingresosData, vehiculosData, espaciosData] = await Promise.all([
                listarIngresos(),
                listarVehiculos(),
                listarEspaciosParqueo(),
            ]);
            setIngresos(ingresosData);
            setVehiculos(vehiculosData);
            setEspacios(espaciosData);
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
        try {
            await crearIngreso({
                ...valores,
                estado: "activo",
                tipoIngreso: valores.tipoIngreso.trim(),
            });
            toast.success("Ingreso registrado correctamente");
            setDialogAbierto(false);
            await cargarDatos();
        } catch {
            toast.error("No se pudo registrar el ingreso");
        }
    }

    function descripcionVehiculo(id: number) {
        const vehiculo = vehiculos.find((item) => item.idVehiculo === id);
        return vehiculo ? `${vehiculo.placa} - ${vehiculo.marca || "Vehículo"}` : "Vehículo no encontrado";
    }

    function descripcionEspacio(id: number) {
        const espacio = espacios.find((item) => item.idEspacio === id);
        return espacio ? `${espacio.codigo}${espacio.zona ? ` - ${espacio.zona}` : ""}` : "Espacio no encontrado";
    }

    function formatearFecha(fecha: string) {
        const fechaFormateada = new Date(fecha);
        return Number.isNaN(fechaFormateada.getTime()) ? fecha : fechaFormateada.toLocaleString("es-CO");
    }

    const vehiculosDisponibles = vehiculos.filter((vehiculo) => vehiculo.activo);
    const espaciosDisponibles = espacios.filter((espacio) => espacio.activo && espacio.estado.toLowerCase() === "disponible");

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
                    <TableHead>Espacio</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Lectura inicial (km)</TableHead>
                    <TableHead>Estado</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                    {cargando && <TableRow><TableCell colSpan={6}>Cargando...</TableCell></TableRow>}
                    {!cargando && ingresos.length === 0 && <TableRow><TableCell colSpan={6}>No hay ingresos registrados</TableCell></TableRow>}
                    {ingresos.map((ingreso) => (
                        <TableRow key={ingreso.idIngreso}>
                            <TableCell>{formatearFecha(ingreso.fechaIngreso)}</TableCell>
                            <TableCell>{descripcionVehiculo(ingreso.idVehiculo)}</TableCell>
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
                                <FormItem><FormLabel>Vehículo</FormLabel><FormControl>
                                    <select className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm" value={field.value || ""} onChange={(event) => field.onChange(Number(event.target.value))}>
                                        <option value="" disabled>Selecciona un vehículo</option>
                                        {vehiculosDisponibles.map((vehiculo) => <option key={vehiculo.idVehiculo} value={vehiculo.idVehiculo}>{vehiculo.placa} - {vehiculo.marca || "Vehículo"}</option>)}
                                    </select>
                                </FormControl><FormMessage /></FormItem>
                            )} />
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
                                <FormItem><FormLabel>Tipo de ingreso</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <DialogFooter><Button type="submit">Registrar ingreso</Button></DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>}
        </div>
    );
}
