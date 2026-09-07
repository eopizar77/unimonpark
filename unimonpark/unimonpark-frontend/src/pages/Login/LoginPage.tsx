import { useState, type SubmitEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import axios from "axios";

export default function LoginPage(){
    const [nombreUsuario, setNombreUsuario] = useState("");
    const [contrasena, setContrasena] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [cargando, setCargando] = useState(false);

    const { login } = useAuth() ;
    const navigate = useNavigate();
    
    async function handleSubmit(e: SubmitEvent<HTMLFormElement>){
        e.preventDefault();
        setError(null);
        setCargando(true);

        try{
            await login({ nombreUsuario, contrasena});
            navigate("/dashboard");
        } catch (err) {
            if(axios.isAxiosError(err) && err.response?.data?.mensaje){
                setError(err.response.data.mensaje);
            } else {
                setError("No fue posible el inicio de sesion. Intentar de nuevo.");
            }
        } finally {
            setCargando(false);
        }
    }

    return(
        <div className="flex h-screen items-center justify-center bg-muted">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Unimonpark</CardTitle>
          <CardDescription>Inicia sesión para continuar</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="nombreUsuario">Usuario</Label>
              <Input
                id="nombreUsuario"
                value={nombreUsuario}
                onChange={(e) => setNombreUsuario(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="contrasena">Contraseña</Label>
              <Input
                id="contrasena"
                type="password"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                required
              />
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <Button type="submit" disabled={cargando}>
              {cargando ? "Ingresando..." : "Ingresar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
    );
}