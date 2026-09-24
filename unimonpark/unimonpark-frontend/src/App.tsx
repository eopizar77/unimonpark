import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner"
import ForgotPasswordPage from "@/pages/Login/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/Login/ResetPasswordPage";
import LoginPage from "@/pages/Login/LoginPage";
import RolesPage from "@/pages/Roles/RolesPage";
import TiposVehiculoPage from "@/pages/TiposVehiculo/TiposVehiculoPage";
import UsuariosPage from "@/pages/Usuarios/UsuariosPage";
import VehiculosPage from "@/pages/Vehiculos/VehiculosPage";
import EspaciosParqueoPage from "@/pages/EspaciosParqueo/EspaciosParqueoPage";
import TarifasPage from "@/pages/Tarifas/TarifasPage";
import IngresosPage from "@/pages/Ingresos/IngresosPage";
import SalidasPage from "@/pages/Salidas/SalidasPage";
import FacturasPage from "@/pages/Facturas/FacturasPage";
import PagosPage from "@/pages/Pagos/PagosPage";
import MensualidadesPage from "@/pages/Mensualidades/MensualidadesPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";
import MembresiasPage from "./pages/Membresias/MembresiasPage";
import PenalizacionesPage from "./pages/Penalizaciones/penalizacionesPage";
import DashboardPage from "@/pages/Dashboard/DashboardPage";
import ReportesPage from "./pages/reportes/ReportesPage";
import UnauthorizedPage from "./pages/Unauthorized/UnauthorizedPage";
import ExternosPage from "./pages/Externos/ExternosPage";

function App() {
  return (
    <>
    <Toaster richColors position="top-right" />
    <Routes>
      <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/roles" element={<RolesPage />} />
        <Route path="/tipos-vehiculo" element={<TiposVehiculoPage />} />
        <Route path="/usuarios" element={<UsuariosPage />} />
        <Route path="/externos" element={<ExternosPage />} />
        <Route path="/vehiculos" element={<VehiculosPage />} />
        <Route path="/espacios-parqueo" element={<EspaciosParqueoPage />} />
        <Route path="/tarifas" element={<TarifasPage />} />
        <Route path="/ingresos" element={<IngresosPage />} />
        <Route path="/salidas" element={<SalidasPage />} />
        <Route path="/facturas" element={<FacturasPage />} />
        <Route path="/mensualidades" element={<MensualidadesPage />} />
        <Route path="/membresias" element={<MembresiasPage />} />
        <Route path="/penalizaciones" element={<PenalizacionesPage />} />
        <Route path="/pagos" element={<PagosPage />} />
        <Route path="/reportes" element={<ReportesPage />} />
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      </>
  );
}
export default App;
