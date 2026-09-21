import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { crearMensualidad, listarMensualidades } from "@/api/mensualidades";
import { listarUsuarios } from "@/api/usuarios";
import { listarVehiculos } from "@/api/vehiculos";
import { listarTarifas } from "@/api/tarifas";
import { obtenerMensajeError } from "@/api/client";
import type { Mensualidad } from "@/types/mensualidad";
import type { Usuario } from "@/types/usuario";
import type { Vehiculo } from "@/types/vehiculo";
import type { Tarifa } from "@/types/tarifa";
import { mensualidadSchema, type MensualidadFormValues } from "./mensualidadSchema";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";

const rolesConPermiso = new Set(["ADMINISTRADOR", "GESTION"]);
const hoy = new Date().toISOString().slice(0, 10);
const finMes = new Date();
finMes.setMonth(finMes.getMonth() + 1);
const valoresIniciales: MensualidadFormValues = {
    idUsuario: 0,
    idVehiculo: 0,
    idTarifa: 0,
    fechaInicio: hoy,
    fechaFin: finMes.toISOString().slice(0, 10),
};

function formatoMoneda(valor: number) {
    return `$${valor.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function MensualidadesPage() {
    const { rol } = useAuth();
    const puedeCrear = rolesConPermiso.has((rol ?? "").trim().toUpperCase());
    const [mensualidades, setMensualidades] = useState<Mensualidad[]>([]);
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
    const [tarifas, setTarifas] = useState<Tarifa[]>([]);
    const [dialogAbierto, setDialogAbierto] = useState(false);
    const [cargando, setCargando] = useState(true);

    const form = useForm<MensualidadFormValues>({ resolver: zodResolver(mensualidadSchema), defaultValues: valoresIniciales });
    const usuarioSeleccionado = form.watch("idUsuario");
    const vehiculosDelUsuario = vehiculos.filter((vehiculo) => vehiculo.activo && vehiculo.idUsuario === usuarioSeleccionado);
    const tarifasDePlanilla = tarifas.filter((tarifa) => tarifa.activo && (tarifa.tipoCalculo === "MENSUAL" || tarifa.tipoCalculo === "PLANA"));

    async function cargarDatos() {
        setCargando(true);
        try {
            const [mensualidadesData, usuariosData, vehiculosData, tarifasData] = await Promise.all([
                listarMensualidades(), listarUsuarios(), listarVehiculos(), listarTarifas(),
            ]);
            setMensualidades(mensualidadesData);
            setUsuarios(usuariosData);
            setVehiculos(vehiculosData);
            setTarifas(tarifasData);
        } catch {
            toast.error("No se pudieron cargar las mensualidades");
        } finally {
            setCargando(false);
        }
    }

    useEffect(() => { cargarDatos(); }, []);

    function abrirCrear() {
        form.reset(valoresIniciales);
        setDialogAbierto(true);
    }

    async function onSubmit(valores: MensualidadFormValues) {
        try {
            await crearMensualidad(valores);
            toast.success("Mensualidad registrada correctamente");
            setDialogAbierto(false);
            await cargarDatos();
        } catch (error: unknown) {
            toast.error(obtenerMensajeError(error, "No se pudo registrar la mensualidad"));
        }
    }

    function nombreUsuario(id: number) {
        const usuario = usuarios.find((item) => item.idUsuario === id);
        return usuario ? `${usuario.nombres} ${usuario.apellidos}` : "Usuario no encontrado";
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div><h2 className="text-2xl font-bold">Mensualidades</h2><p className="text-sm text-muted-foreground">Planillas vigentes por usuario y vehículo</p></div>
                {puedeCrear && <Button onClick={abrirCrear}>Registrar mensualidad</Button>}
            </div>
            <Table><TableHeader><TableRow><TableHead>Usuario</TableHead><TableHead>Vehículo</TableHead><TableHead>Periodo</TableHead><TableHead>Valor</TableHead><TableHead>Estado</TableHead></TableRow></TableHeader>
                <TableBody>
                    {cargando && <TableRow><TableCell colSpan={5}>Cargando...</TableCell></TableRow>}
                    {!cargando && mensualidades.length === 0 && <TableRow><TableCell colSpan={5}>No hay mensualidades registradas</TableCell></TableRow>}
                    {mensualidades.map((item) => <TableRow key={item.idMensualidadUsuario}><TableCell>{nombreUsuario(item.idUsuario)}</TableCell><TableCell>{item.placaVehiculo}</TableCell><TableCell>{item.fechaInicio} a {item.fechaFin}</TableCell><TableCell>{formatoMoneda(item.valorCalculado)}</TableCell><TableCell><Badge variant="secondary">{item.estado}</Badge></TableCell></TableRow>)}
                </TableBody>
            </Table>
            {puedeCrear && <Dialog open={dialogAbierto} onOpenChange={setDialogAbierto}><DialogContent><DialogHeader><DialogTitle>Registrar mensualidad</DialogTitle></DialogHeader><Form {...form}><form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <FormField control={form.control} name="idUsuario" render={({ field }) => <FormItem><FormLabel>Usuario</FormLabel><FormControl><select className="h-8 w-full rounded-lg border border-input px-2.5 text-sm" value={field.value || ""} onChange={(event) => { field.onChange(Number(event.target.value)); form.setValue("idVehiculo", 0); }}><option value="" disabled>Selecciona un usuario</option>{usuarios.filter((item) => item.activo).map((item) => <option key={item.idUsuario} value={item.idUsuario}>{item.nombres} {item.apellidos}</option>)}</select></FormControl><FormMessage /></FormItem>} />
                <FormField control={form.control} name="idVehiculo" render={({ field }) => <FormItem><FormLabel>Vehículo</FormLabel><FormControl><select className="h-8 w-full rounded-lg border border-input px-2.5 text-sm" value={field.value || ""} onChange={(event) => field.onChange(Number(event.target.value))}><option value="" disabled>Selecciona un vehículo</option>{vehiculosDelUsuario.map((item) => <option key={item.idVehiculo} value={item.idVehiculo}>{item.placa}</option>)}</select></FormControl><FormMessage /></FormItem>} />
                <FormField control={form.control} name="idTarifa" render={({ field }) => <FormItem><FormLabel>Tarifa de planilla</FormLabel><FormControl><select className="h-8 w-full rounded-lg border border-input px-2.5 text-sm" value={field.value || ""} onChange={(event) => field.onChange(Number(event.target.value))}><option value="" disabled>Selecciona una tarifa</option>{tarifasDePlanilla.map((item) => <option key={item.idTarifa} value={item.idTarifa}>{item.nombre} - {formatoMoneda(item.valorHora ?? item.valorHastaLimite ?? 0)}</option>)}</select></FormControl><FormMessage /></FormItem>} />
                <div className="grid grid-cols-2 gap-3"><FormField control={form.control} name="fechaInicio" render={({ field }) => <FormItem><FormLabel>Inicio</FormLabel><FormControl><input className="h-8 w-full rounded-lg border border-input px-2.5 text-sm" type="date" {...field} /></FormControl><FormMessage /></FormItem>} /><FormField control={form.control} name="fechaFin" render={({ field }) => <FormItem><FormLabel>Fin</FormLabel><FormControl><input className="h-8 w-full rounded-lg border border-input px-2.5 text-sm" type="date" {...field} /></FormControl><FormMessage /></FormItem>} /></div>
                <DialogFooter><Button type="submit">Registrar mensualidad</Button></DialogFooter>
            </form></Form></DialogContent></Dialog>}
        </div>
    );
}
