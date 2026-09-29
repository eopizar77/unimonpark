import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

import {
  Home, ShieldCheck, Tags, Users, UserCheck, Car, MapPin, DollarSign,
  LogIn, LogOut, Receipt, CreditCard, CalendarCheck, AlertTriangle, BarChart3, Menu, X
} from "lucide-react";

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  roles?: string[];
}

const NAV_ITEMS: NavItem[] = [
  { to: "/dashboard", label: "Inicio", icon: Home },
  { to: "/roles", label: "Roles", icon: ShieldCheck, roles: ["ADMINISTRADOR"] },
  { to: "/tipos-vehiculo", label: "Tipos de vehÃ­culo", icon: Tags, roles: ["ADMINISTRADOR"] },
  { to: "/usuarios", label: "Usuarios", icon: Users, roles: ["ADMINISTRADOR"] },
  { to: "/externos", label: "Externos", icon: UserCheck, roles: ["ADMINISTRADOR", "GESTION"] },
  { to: "/espacios-parqueo", label: "Espacios de parqueo", icon: MapPin, roles: ["ADMINISTRADOR"] },
  { to: "/tarifas", label: "Tarifas", icon: DollarSign, roles: ["ADMINISTRADOR"] },
  { to: "/vehiculos", label: "VehÃ­culos", icon: Car, roles: ["ADMINISTRADOR", "GESTION"] },
  { to: "/salidas", label: "Salidas", icon: LogOut, roles: ["ADMINISTRADOR", "GESTION"] },
  { to: "/facturas", label: "Facturas", icon: Receipt, roles: ["ADMINISTRADOR", "GESTION"] },
  { to: "/pagos", label: "Pagos", icon: CreditCard, roles: ["ADMINISTRADOR", "GESTION"] },
  { to: "/membresias", label: "MembresÃ­as", icon: CalendarCheck, roles: ["ADMINISTRADOR", "GESTION", "SUPERVISOR"] },
  { to: "/penalizaciones", label: "Penalizaciones", icon: AlertTriangle, roles: ["ADMINISTRADOR", "GESTION", "SUPERVISOR"] },
  { to: "/ingresos", label: "Ingresos", icon: LogIn, roles: ["ADMINISTRADOR", "GESTION"] },
  { to: "/reportes", label: "Reportes Unimonpark", icon: BarChart3, roles: ["ADMINISTRADOR", "GESTION"]},
];

export default function AppLayout() {
  const { nombreUsuario, rol, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuAbierto, setMenuAbierto] = useState(false);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const itemsVisibles = NAV_ITEMS.filter("item) => !item.roles || (rol && item.roles.includes(rol)));

  return (
    <div className="flex h-screen flex-col md:flex-row overflow-hidden">
      <div className="md:hidden flex items-center justify-between p-4 border-b bg-muted/40 shrink-0">
        <h1 className="text-lg font-bold">Unimonpark</h1>
        <Button variant="ghost" size="icon" onClick={() => setMenuAbierto(!menuAbierto)}>
          {menuAbierto ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      <aside className={`${menuAbierto ? "flex absolute top-[65px] z-50 h-[calc(100vh-65px)] w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80" : "hidden"} md:flex w-full md:w-64 md:relative border-r bg-muted/40 p-4 flex-col shrink-0`}>
        <h1 className="hidden md:block text-lg font-bold mb-6">Unimonpark</h1>

        <nav className="flex flex-col gap-1 flex-1 overflow-y-auto">
          {itemsVisibles.map((item) => {
            const Icono = item.icon;
            const activo = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMenuAbierto(false)}
                className={`flex items-center gap-2 rounded px-3 py-2 text-sm hover:bg-muted ${activo ? "bg-muted font-medium" : ""}`}
              >
                <Icono className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })=
        </nav>

        <Separator className="my-3 shrink-0" />

        <div className="text-sm shrink-0">
          <p className="font-medium">{nombreUsuario}</p>
          <p className="text-muted-foreground">{rol}</p>
        </div>
        <Button variant="outline" size="sm" className="mt-3 shrink-0" onClick={handleLogout}>
          Cerrar sesiÃ³n
        </Button>
      </aside>

      <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 w-full min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
