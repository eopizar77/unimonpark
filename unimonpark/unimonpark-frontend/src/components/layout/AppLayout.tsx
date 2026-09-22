import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { BarChart3 } from "lucide-react";

import {
  Home, ShieldCheck, Tags, Users, UserCheck, Car, MapPin, DollarSign,
  LogIn, LogOut, Receipt, CreditCard, CalendarCheck, AlertTriangle,
} from "lucide-react";

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  roles?: string[]; // si no se especifica, cualquier autenticado lo ve
}

const NAV_ITEMS: NavItem[] = [
  { to: "/dashboard", label: "Inicio", icon: Home },

  // Catálogos — solo Administrador
  { to: "/roles", label: "Roles", icon: ShieldCheck, roles: ["ADMINISTRADOR"] },
  { to: "/tipos-vehiculo", label: "Tipos de vehículo", icon: Tags, roles: ["ADMINISTRADOR"] },
  { to: "/usuarios", label: "Usuarios", icon: Users, roles: ["ADMINISTRADOR"] },
  { to: "/externos", label: "Externos", icon: UserCheck, roles: ["ADMINISTRADOR", "GESTION"] },
  { to: "/espacios-parqueo", label: "Espacios de parqueo", icon: MapPin, roles: ["ADMINISTRADOR"] },
  { to: "/tarifas", label: "Tarifas", icon: DollarSign, roles: ["ADMINISTRADOR"] },

  // Operación diaria — Administrador y Gestión
  { to: "/vehiculos", label: "Vehículos", icon: Car, roles: ["ADMINISTRADOR", "GESTION"] },
  { to: "/salidas", label: "Salidas", icon: LogOut, roles: ["ADMINISTRADOR", "GESTION"] },
  { to: "/facturas", label: "Facturas", icon: Receipt, roles: ["ADMINISTRADOR", "GESTION"] },
  { to: "/pagos", label: "Pagos", icon: CreditCard, roles: ["ADMINISTRADOR", "GESTION"] },
  { to: "/membresias", label: "Membresías", icon: CalendarCheck, roles: ["ADMINISTRADOR", "GESTION", "SUPERVISOR"] },
  { to: "/penalizaciones", label: "Penalizaciones", icon: AlertTriangle, roles: ["ADMINISTRADOR", "GESTION", "SUPERVISOR"] },

  // Ingresos — también lo usa Supervisor (autoriza vehículos de terceros)
  { to: "/ingresos", label: "Ingresos", icon: LogIn, roles: ["ADMINISTRADOR", "GESTION"] },
  { to: "/reportes", label: "Reportes Unimonpark", icon: BarChart3, roles: ["ADMINISTRADOR", "GESTION"]},
];

export default function AppLayout() {
  const { nombreUsuario, rol, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const itemsVisibles = NAV_ITEMS.filter((item) => !item.roles || (rol && item.roles.includes(rol)));

  return (
    <div className="flex h-screen">
      <aside className="w-64 border-r bg-muted/40 p-4 flex flex-col">
        <h1 className="text-lg font-bold mb-6">Unimonpark</h1>

        <nav className="flex flex-col gap-1 flex-1">
          {itemsVisibles.map((item) => {
            const Icono = item.icon;
            const activo = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-2 rounded px-3 py-2 text-sm hover:bg-muted ${
                  activo ? "bg-muted font-medium" : ""
                }`}
              >
                <Icono className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Separator className="my-3" />

        <div className="text-sm">
          <p className="font-medium">{nombreUsuario}</p>
          <p className="text-muted-foreground">{rol}</p>
        </div>
        <Button variant="outline" size="sm" className="mt-3" onClick={handleLogout}>
          Cerrar sesión
        </Button>
      </aside>

      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}