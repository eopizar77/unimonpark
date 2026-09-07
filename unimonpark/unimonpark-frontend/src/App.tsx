import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner"
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
import ProtectedRoute from "./routes/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";


function App() {
  return (
    <>
    <Toaster richColors position="top-right" />
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<div>Dashboard (EN CONSTRUCCION)</div>} />
        <Route path="/roles" element={<RolesPage />} />
        <Route path="/tipos-vehiculo" element={<TiposVehiculoPage />} />
        <Route path="/usuarios" element={<UsuariosPage />} />
        <Route path="/vehiculos" element={<VehiculosPage />} />
        <Route path="/espacios-parqueo" element={<EspaciosParqueoPage />} />
        <Route path="/tarifas" element={<TarifasPage />} />
        <Route path="/ingresos" element={<IngresosPage />} />
        <Route path="/salidas" element={<SalidasPage />} />
        <Route path="/facturas" element={<FacturasPage />} />
        <Route path="/pagos" element={<PagosPage />} />
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
      </>
  );
}
export default App;