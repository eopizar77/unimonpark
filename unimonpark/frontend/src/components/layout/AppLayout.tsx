import { Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import {
  Home, ShieldCheck, Tags, Users, UserCheck, Car, MapPin, DollarSign,
  LogIn, LogOut, Receipt, CreditCard, CalendarCheck, AlertTriangle, BarChart3, Bell, PanelLeft
} from "lucide-react";

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  roles?: string[];
}

const NAV_ITEMS: NavItem[] = [
  { to: "/dashboard", label: "Inicio", icon: Home },
  { to: "/ingresos", label: "Ingresos", icon: LogIn, roles: ["ADMINISTRADOR", "GESTION"] },
  { to: "/salidas", label: "Salidas", icon: LogOut, roles: ["ADMINISTRADOR", "GESTION"] },
  { to: "/vehiculos", label: "Vehículos", icon: Car, roles: ["ADMINISTRADOR", "GESTION"] },
  { to: "/facturas", label: "Facturas", icon: Receipt, roles: ["ADMINISTRADOR", "GESTION"] },
  { to: "/pagos", label: "Pagos", icon: CreditCard, roles: ["ADMINISTRADOR", "GESTION"] },
  { to: "/membresias", label: "Membresias", icon: CalendarCheck, roles: ["ADMINISTRADOR", "GESTION", "SUPERVISOR"] },
  { to: "/penalizaciones", label: "Penalizaciones", icon: AlertTriangle, roles: ["ADMINISTRADOR", "GESTION", "SUPERVISOR"] },
  { to: "/reportes", label: "Reportes", icon: BarChart3, roles: ["ADMINISTRADOR", "GESTION"]},
  { to: "/usuarios", label: "Usuarios", icon: Users, roles: ["ADMINISTRADOR"] },
  { to: "/externos", label: "Externos", icon: UserCheck, roles: ["ADMINISTRADOR", "GESTION"] },
  { to: "/roles", label: "Roles", icon: ShieldCheck, roles: ["ADMINISTRADOR"] },
  { to: "/tipos-vehiculo", label: "Tipos Vehículo", icon: Tags, roles: ["ADMINISTRADOR"] },
  { to: "/espacios-parqueo", label: "Celdas", icon: MapPin, roles: ["ADMINISTRADOR"] },
  { to: "/tarifas", label: "Tarifas", icon: DollarSign, roles: ["ADMINISTRADOR"] },
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
  const initials = nombreUsuario ? nombreUsuario.substring(0, 2).toUpperCase() : "AD";

  const SidebarContent = () => (
    <div className="flex h-full max-h-screen flex-col gap-2">
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Link to="/dashboard" className="flex items-center gap-2 font-bold text-xl tracking-tight text-blue-600">
          <Car className="h-6 w-6" />
          <span>Unimonpark</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4 gap-1">
          {itemsVisibles.map((item) => {
            const Icono = item.icon;
            const activo = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={"flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all " +
                  (activo 
                    ? "bg-blue-50 text-blue-700 font-semibold" 
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100")
                }
              >
                <Icono className={"h-4 w-4 " + (activo ? "text-blue-700" : "text-slate-400")} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="mt-auto p-4">
        <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3 border border-slate-200">
            <Avatar className="h-9 w-9 border">
                <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col flex-1 overflow-hidden">
                <span className="text-sm font-semibold truncate">{nombreUsuario}</span>
                <span className="text-xs text-slate-500 truncate">{rol}</span>
            </div>
        </div>
        <Button variant="outline" className="w-full mt-3 border-slate-300 text-slate-700 hover:bg-slate-100" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar sesión
        </Button>
      </div>
    </div>
  );

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[260px_1fr] bg-slate-50/50">
      <div className="hidden border-r bg-white md:block">
        <SidebarContent />
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-white px-4 lg:h-[60px] lg:px-6 sticky top-0 z-30">
          <Sheet>
            <SheetTrigger>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0 w-72">
              <SidebarContent />
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
             {/* Espacio para breadcrumbs o searchbar global en el futuro */}
          </div>
          <Button variant="ghost" size="icon" className="rounded-full">
             <Bell className="h-5 w-5 text-slate-500" />
             <span className="sr-only">Notificaciones</span>
          </Button>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
