import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import axios from "axios";

export default function ForgotPasswordPage() {
    const [correo, setCorreo] = useState("");
    const [cargando, setCargando] = useState(false);
    const [enviado, setEnviado] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setCargando(true);
        try {
            // Este endpoint debe crearse en el backend
            await axios.post("http://localhost:8080/api/auth/forgot-password", { correo });
            setEnviado(true);
        } catch (err) {
            toast.error("Error al solicitar restablecimiento de contraseña");
        } finally {
            setCargando(false);
        }
    }

    return (
        <div className="flex h-screen items-center justify-center bg-muted">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <div className="flex flex-col items-center justify-center mb-4">
                        <img src="/logo.png" alt="Unimonpark Logo" className="w-24 h-24 object-contain rounded-full border-2 border-primary/20 shadow-sm" />
                    </div>
                    <CardTitle className="text-center">Restablecer Contraseña</CardTitle>
                    <CardDescription className="text-center">Ingresa tu correo para recibir un enlace</CardDescription>
                </CardHeader>
                <CardContent>
                    {!enviado ? (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="correo">Correo electrónico</Label>
                                <Input id="correo" type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
                            </div>
                            <Button type="submit" disabled={cargando} className="mt-2">
                                {cargando ? "Enviando..." : "Enviar enlace"}
                            </Button>
                        </form>
                    ) : (
                        <div className="text-center text-sm text-green-600 mb-4">
                            Se ha enviado un enlace a tu correo. Por favor, revisa tu bandeja de entrada.
                        </div>
                    )}
                    <div className="mt-4 text-center text-sm">
                        <Link to="/login" className="text-primary hover:underline">Volver al inicio de sesión</Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
