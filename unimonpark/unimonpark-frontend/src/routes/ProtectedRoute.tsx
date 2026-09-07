import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
    children: ReactNode;
    rolesPermitidos?: string[];

}

export default function ProtectedRoute({ children, rolesPermitidos }: ProtectedRouteProps) {
    const { isAuthenticated, rol } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (rolesPermitidos && (!rol || !rolesPermitidos.includes(rol))) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <>{children}</>;
}