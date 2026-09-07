import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button  } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

type RolUsuario = "ADMINISTRADOR" | "GESTION" | "SUPERVISOR";

interface OpcionMenu {
    etiqueta: string;
    ruta: string;
    roles: RolUsuario[];
}

const todosLosRoles: RolUsuario[] = ["ADMINISTRADOR", "GESTION", "SUPERVISOR"];

const opcionesMenu: OpcionMenu[] = [
    { etiqueta: "Roles", ruta: "/roles", roles: ["ADMINISTRADOR"] },
    { etiqueta: "Tipos de Vehículo", ruta: "/tipos-vehiculo", roles: ["ADMINISTRADOR", "GESTION"] },
    { etiqueta: "Usuarios", ruta: "/usuarios", roles: ["ADMINISTRADOR"] },
    { etiqueta: "Vehículos", ruta: "/vehiculos", roles: ["ADMINISTRADOR", "GESTION", "SUPERVISOR"] },
    { etiqueta: "Espacios Parqueo", ruta: "/espacios-parqueo", roles: ["ADMINISTRADOR", "GESTION", "SUPERVISOR"] },
    { etiqueta: "Tarifas", ruta: "/tarifas", roles: ["ADMINISTRADOR", "GESTION"] },
    { etiqueta: "Ingresos", ruta: "/ingresos", roles: ["ADMINISTRADOR", "GESTION", "SUPERVISOR"] },
    { etiqueta: "Salidas", ruta: "/salidas", roles: ["ADMINISTRADOR", "GESTION", "SUPERVISOR"] },
    { etiqueta: "Facturas", ruta: "/facturas", roles: ["ADMINISTRADOR", "GESTION", "SUPERVISOR"] },
    { etiqueta: "Pagos", ruta: "/pagos", roles: ["ADMINISTRADOR", "GESTION", "SUPERVISOR"] },
];

function normalizarRol(rol: string | null): RolUsuario | null {
    const valor = (rol ?? "").trim().toUpperCase().replace(/^ROLE_/, "");
    return todosLosRoles.includes(valor as RolUsuario) ? valor as RolUsuario : null;
}

export default function AppLayout() {
    const { nombreUsuario, rol, logout } = useAuth();
    const navigate = useNavigate();
    const rolActual = normalizarRol(rol);
    const opcionesVisibles = opcionesMenu.filter((opcion) => rolActual !== null && opcion.roles.includes(rolActual));

    function handleLogout() {
        logout();
        navigate("/login");
    }

    return (
        <div className="flex h-screen">
            {/* Barra Lateral */}
            <aside className="w-64 border-r bg-muted/40 p-4 flex flex-col">
                <h1 className="text-lg font-bold mb-6">Unimonpark</h1>

                <nav className="flex flex-col gap-1 flex-1">
                    <Link to="/dashboard" className="rounded px-3 py-2 text-sm hover:bg-muted">
                        Inicio
                    </Link>
                    {opcionesVisibles.map((opcion) => (
                        <Link key={opcion.ruta} to={opcion.ruta} className="rounded px-3 py-2 text-sm hover:bg-muted">
                            {opcion.etiqueta}
                        </Link>
                    ))}
                </nav>

                <Separator className="my-3" />

                <div className="text-sm">
                    <p className="font-medium">{nombreUsuario}</p>
                    <p className="text-muted-foreground">{rol}</p>
                </div>
                <Button variant="outline" size="sm" className="mt-3" onClick={handleLogout}>
                    Cerrar Sesion
                </Button>            
            </aside>
            {/* Contenido de cada una de las pantallas */}
            <main className="flex-1 overflow-auto p-6">
                <Outlet />
            </main>
        </div>
    );
}