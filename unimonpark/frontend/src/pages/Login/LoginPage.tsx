import { useState, type SubmitEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
                setError("No fue posible el inicio de sesión. Intentar de nuevo.");
            }
        } finally {
            setCargando(false);
        }
    }

    return(
      <div className="w-full min-h-screen grid lg:grid-cols-2 bg-background">
        <div className="hidden bg-slate-900 lg:flex flex-col items-center justify-center text-primary-foreground p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-blue-600/20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/20 to-transparent"></div>
          <div className="relative z-10 flex flex-col items-center text-center">
            <img src="/logo.png" alt="Unimonpark Logo" className="w-48 h-48 object-cover rounded-full border-4 border-slate-700 shadow-2xl mb-8 bg-white" />
            <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-white">Unimonpark</h1>
            <p className="text-lg font-medium text-slate-300 max-w-md">
              Gestiona el ingreso y parqueo de la comunidad con seguridad, agilidad y eficiencia.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center p-8 bg-slate-50">
          <Card className="w-full max-w-md border-none shadow-xl bg-white rounded-2xl">
            <CardHeader className="space-y-3 pb-8 text-center">
              <div className="lg:hidden flex flex-col items-center justify-center mb-2">
                <img src="/logo.png" alt="Unimonpark Logo" className="w-20 h-20 object-cover rounded-full border-2 border-slate-200 shadow-sm" />
              </div>
              <CardTitle className="text-3xl font-bold tracking-tight text-slate-900">Bienvenido</CardTitle>
              <CardDescription className="text-base text-slate-500">Inicia sesión en tu cuenta para continuar</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="nombreUsuario" className="text-sm font-medium text-slate-700">Usuario</Label>
                  <Input
                    id="nombreUsuario"
                    value={nombreUsuario}
                    onChange={(e) => setNombreUsuario(e.target.value)}
                    required
                    className="h-11 bg-slate-50 border-slate-200 focus:bg-white"
                    placeholder="Ingresa tu usuario"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="contrasena" className="text-sm font-medium text-slate-700">Contraseña</Label>
                    <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline font-medium">
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>
                  <Input
                    id="contrasena"
                    type="password"
                    value={contrasena}
                    onChange={(e) => setContrasena(e.target.value)}
                    required
                    className="h-11 bg-slate-50 border-slate-200 focus:bg-white"
                    placeholder="••••••••"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm border border-red-100">
                    {error}
                  </div>
                )}

                <Button type="submit" disabled={cargando} className="mt-4 h-11 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-sm">
                  {cargando ? "Ingresando..." : "Ingresar"}
                </Button>
              </form>
              
              <div className="mt-8 relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-slate-400 font-medium">Autoservicio</span>
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <p className="text-sm text-slate-500 mb-4">¿Eres de la comunidad y necesitas registrar tu vehículo?</p>
                <Link to="/registro-vehiculo" className="w-full block">
                  <Button variant="outline" className="w-full h-11 border-slate-200 text-slate-700 hover:bg-slate-50 font-medium">
                    Registrar Vehículo
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
}
