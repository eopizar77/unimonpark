import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Car, Loader2, Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { sincronizarPublico, enviarRegistroPublico, type RegistroPublicoPayload } from "@/api/registroPublico";
import { listarTiposVehiculo } from "@/api/tiposVehiculo";
import type { TipoVehiculo } from "@/types/tipoVehiculo";

const registroSchema = z.object({
    documento: z.string().min(1, "El documento es requerido"),
    nombres: z.string().min(1, "Requerido"),
    apellidos: z.string().min(1, "Requerido"),
    correo: z.string().email("Correo inválido"),
    idRol: z.number(),
    tipoVehiculoId: z.string().min(1, "Seleccione un tipo de vehículo"),
    placa: z.string().optional(),
    marca: z.string().min(1, "La marca es requerida"),
    modelo: z.string().min(1, "El modelo es requerido"),
    color: z.string().min(1, "El color es requerido"),
}).superRefine(() => {
    // Si no es bicicleta, placa es requerida
    // Asumimos que id 3 es Bicicleta o si pasamos el nombre. 
    // Para validación frontend, verificaremos luego, pero por seguridad exigimos placa si viene vacía y no es bici.
});

export default function RegistroPublicoPage() {
    const [tipos, setTipos] = useState<TipoVehiculo[]>([]);
    const [buscando, setBuscando] = useState(false);
    const [enviando, setEnviando] = useState(false);
    const [verificado, setVerificado] = useState(false);
    const [nombresFaltantes, setNombresFaltantes] = useState(false);
    const navigate = useNavigate();

    const form = useForm<z.infer<typeof registroSchema>>({
        resolver: zodResolver(registroSchema),
        defaultValues: {
            documento: "",
            nombres: "",
            apellidos: "",
            correo: "",
            tipoVehiculoId: "",
            placa: "",
            marca: "",
            modelo: "",
            color: "",
        },
    });

    const tipoVehiculoSeleccionado = form.watch("tipoVehiculoId");
    const esBicicleta = tipos.find(t => t.idTipoVehiculo.toString() === tipoVehiculoSeleccionado)?.nombre.toLowerCase().includes("bici");

    useEffect(() => {
        // Obtenemos los tipos usando axios normal para no chocar con token, o podríamos hacer un endpoint público.
        // Por practicidad, si `/api/tipos-vehiculo` requiere auth, crearemos un array estático o lo pediremos.
        // Asumiendo que la API original tiene token, si estamos deslogueados fallará.
        // Crearemos un endpoint público para tipos si falla, o por ahora quemaremos los básicos:
        setTipos([
            { idTipoVehiculo: 1, nombre: "Carro", descripcion: "", activo: true },
            { idTipoVehiculo: 2, nombre: "Moto", descripcion: "", activo: true },
            { idTipoVehiculo: 3, nombre: "Bicicleta", descripcion: "", activo: true }
        ]);
        
        listarTiposVehiculo().then(setTipos).catch(() => {
            // Falla silenciosa, usamos los quemados
        });
    }, []);

    const buscarDocumento = async () => {
        const doc = form.getValues("documento");
        if (!doc) {
            form.setError("documento", { message: "Ingrese su documento" });
            return;
        }

        setBuscando(true);
        try {
            const data = await sincronizarPublico(doc);
            form.setValue("nombres", data.nombres);
            form.setValue("apellidos", data.apellidos);
            form.setValue("correo", data.correo || "");
            form.setValue("idRol", data.idRol || 7); // Default estudiante
            if (!data.nombres || !data.apellidos) {
                setNombresFaltantes(true);
            } else {
                setNombresFaltantes(false);
            }
            setVerificado(true);
            toast.success("¡Datos verificados con la Universidad!");
        } catch (error: any) {
            toast.error(error.response?.data?.error || "No encontrado en la BD universitaria");
            setVerificado(false);
        } finally {
            setBuscando(false);
        }
    };

    const onSubmit = async (values: z.infer<typeof registroSchema>) => {
        if (!verificado) {
            toast.error("Por favor verifique su documento primero.");
            return;
        }
        
        if (!esBicicleta && !values.placa) {
            form.setError("placa", { message: "La placa es requerida" });
            return;
        }

        setEnviando(true);
        try {
            const payload: RegistroPublicoPayload = {
                documento: values.documento,
                nombres: values.nombres,
                apellidos: values.apellidos,
                correo: values.correo,
                idRol: values.idRol,
                tipoVehiculoId: parseInt(values.tipoVehiculoId),
                placa: esBicicleta ? undefined : values.placa,
                marca: values.marca,
                modelo: values.modelo,
                color: values.color,
            };

            await enviarRegistroPublico(payload);
            toast.success("Vehículo registrado exitosamente");
            navigate("/login");
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Error registrando vehículo");
        } finally {
            setEnviando(false);
        }
    };

    

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col p-4 md:p-8 items-center justify-center">
            <div className="max-w-2xl w-full">
                <div className="mb-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 text-white mb-4">
                        <Car className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Registro de Vehículos</h1>
                    <p className="text-slate-500 mt-2">Comunidad Unimonserrate</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 md:p-8 space-y-8">
                            
                            {/* PASO 1 */}
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                    <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full inline-flex items-center justify-center text-sm">1</span>
                                    Validación Institucional
                                </h3>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <FormField control={form.control} name="documento" render={({ field }) => (
                                        <FormItem className="md:col-span-2">
                                            <FormLabel>Número de Documento (Cédula/TI)</FormLabel>
                                            <FormControl>
                                                <div className="flex gap-2">
                                                    <Input {...field} readOnly={verificado} className={verificado ? "bg-slate-50 cursor-not-allowed" : ""} placeholder="Ej: 1019985455" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); buscarDocumento(); } }} />
                                                    {!verificado && (
                                                        <Button type="button" onClick={buscarDocumento} disabled={buscando || !field.value}>
                                                            {buscando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
                                                            Buscar
                                                        </Button>
                                                    )}
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />

                                    {verificado && (
                                        <>
                                            <FormField control={form.control} name="nombres" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Nombres</FormLabel>
                                                    <FormControl><Input {...field} readOnly={!nombresFaltantes} className={!nombresFaltantes ? "bg-slate-50 cursor-not-allowed" : ""} placeholder={nombresFaltantes ? "Ingrese sus nombres" : ""} /></FormControl>
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name="apellidos" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Apellidos</FormLabel>
                                                    <FormControl><Input {...field} readOnly={!nombresFaltantes} className={!nombresFaltantes ? "bg-slate-50 cursor-not-allowed" : ""} placeholder={nombresFaltantes ? "Ingrese sus apellidos" : ""} /></FormControl>
                                                </FormItem>
                                            )} />
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* PASO 2 */}
                            {verificado && (
                                <div className="pt-6 border-t border-slate-100">
                                    <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                        <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full inline-flex items-center justify-center text-sm">2</span>
                                        Datos del Vehículo
                                    </h3>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <FormField control={form.control} name="tipoVehiculoId" render={({ field }) => (
                                            <FormItem className="md:col-span-2">
                                                <FormLabel>Tipo de Vehículo</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Seleccione el tipo..." />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {tipos.map((t) => (
                                                            <SelectItem key={t.idTipoVehiculo} value={t.idTipoVehiculo.toString()}>
                                                                {t.nombre}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )} />

                                        {!esBicicleta && (
                                            <FormField control={form.control} name="placa" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Placa</FormLabel>
                                                    <FormControl><Input {...field} placeholder="Ej: ABC-123" className="uppercase" onChange={e => field.onChange(e.target.value.toUpperCase())} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        )}

                                        <FormField control={form.control} name="marca" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Marca</FormLabel>
                                                <FormControl><Input {...field} placeholder={esBicicleta ? "Ej: GW, Trek" : "Ej: Chevrolet"} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />

                                        <FormField control={form.control} name="modelo" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Modelo / Referencia</FormLabel>
                                                <FormControl><Input {...field} placeholder={esBicicleta ? "Ej: MTB rin 29" : "Ej: Onix 2022"} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />

                                        <FormField control={form.control} name="color" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Color</FormLabel>
                                                <FormControl><Input {...field} placeholder="Ej: Negro, Rojo..." /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                    
                                    <div className="mt-8 flex gap-4 justify-end">
                                        <Link to="/login">
                                            <Button type="button" variant="ghost">Cancelar</Button>
                                        </Link>
                                        <Button type="submit" disabled={enviando} className="bg-blue-600 hover:bg-blue-700">
                                            {enviando && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                            Registrar Vehículo
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </form>
                    </Form>
                </div>
            </div>
        </div>
    );
}
