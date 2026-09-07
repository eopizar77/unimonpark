import {createContext, useContext, useState, type ReactNode} from "react";
import {login as loginRequest} from "@/api/auth";
import type {LoginRequest} from "@/types/auth";

interface AuthState{
    nombreUsuario: string | null;
    rol: string | null;
    isAuthenticated: boolean;
}

interface AuthContextType extends AuthState{
    login: (credenciales: LoginRequest) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }:{children: ReactNode}){
    const [nombreUsuario, setNombreUsuario] = useState<string | null>(
        localStorage.getItem("nombreUsuario")
    );
    const [rol, setRol] = useState<string | null>(localStorage.getItem("rol"));
    
    async function login(credenciales: LoginRequest){
        const data = await loginRequest(credenciales);

        localStorage.setItem("token", data.token);
        localStorage.setItem("nombreUsuario", String(data.nombreUsuario));
        localStorage.setItem("rol", String(data.rol));

        setNombreUsuario(String(data.nombreUsuario));
        setRol(String(data.rol));
    }

    function logout(){
        localStorage.removeItem("token");
        localStorage.removeItem("nombreUsuario");
        localStorage.removeItem("rol");
        setNombreUsuario(null);
        setRol(null);
    }

    return(
        <AuthContext.Provider
            value={{
                nombreUsuario,
                rol,
                isAuthenticated:  !!nombreUsuario,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

    export function useAuth(): AuthContextType{
        const context = useContext(AuthContext);
        if(!context){
            throw new Error("useAuth debe usarse dentro de un AuthProvider")
        }
    return context;
}
