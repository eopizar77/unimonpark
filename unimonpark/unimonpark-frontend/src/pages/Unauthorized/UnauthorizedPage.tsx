import { useNavigate } from "react-router-dom";
import { ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
    const navigate = useNavigate();

    return (
        <div className="flex h-screen flex-col items-center justify-center gap-4 text-center">
            <ShieldX className="h-16 w-16 text-destructive" />
            <h1 className="text-2xl font-bold">Acceso denegado</h1>
            <p className="text-sm text-muted-foreground max-w-sm">
                No tienes permisos para acceder a esta sección. Contacta al administrador si crees
                que esto es un error.
            </p>
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
                Volver al inicio
            </Button>
        </div>
    );
}
