import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import axios from "axios";

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const navigate = useNavigate();

    const [nuevaContrasena, setNuevaContrasena] = useState("");
    const [confirmarContrasena, setConfirmarContrasena] = useState("");
    const [cargando, setCargando] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (nuevaContrasena !== confirmarContrasena) {
            toast.error("Las contraseñas no coinciden");
            return;
        }

        setCargando(true);
        try {
            // Este endpoint debe crearse en el backend
            await axios.post("http://localhost:8080/api/auth/reset-password", { token, nuevaContrasena });
            toast.success("Contraseña actualizada correctamente");
            navigate("/login");
        } catch (err) {
            toast.error("Error al actualizar la contraseña o token inválido");
        } finally {
            setCargando(false);
        }
    }

    if (!token) {
        return (
            <div className="flex h-screen items-center justify-center bg-muted">
                <Card className="w-full max-w-sm"><CardContent className="pt-6 text-center text-red-600">Token no válido o faltante.</CardContent></Card>
            </div>
        );
    }

    return (
        <div className="flex h-screen items-center justify-center bg-muted">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-center">Crear nueva contraseña</CardTitle>
                    <CardDescription className="text-center">Ingresa tu nueva contraseña</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="nuevaContrasena">Nueva contraseña</Label>
                            <Input id="nuevaContrasena" type="password" value={nuevaContrasena} onChange={(e) => setNuevaContrasena(e.target.value)} required />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="confirmarContrasena">Confirmar contraseña</Label>
                            <Input id="confirmarContrasena" type="password" value={confirmarContrasena} onChange={(e) => setConfirmarContrasena(e.target.value)} required />
                        </div>
                        <Button type="submit" disabled={cargando} className="mt-2">
                            {cargando ? "Actualizando..." : "Actualizar contraseña"}
                        </Button>
                    </form>
                    <div className="mt-4 text-center text-sm">
                        <Link to="/login" className="text-primary hover:underline">Volver al inicio de sesión</Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
