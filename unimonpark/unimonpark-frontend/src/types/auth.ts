export interface LoginRequest {
    nombreUsuario: string;
    contrasena: string;
}

export interface LoginResponse {
    token: string;
    nombreUsuario: string;
    rol: string;
}

export interface UsuarioSesion{
    nombreUsuario: string;
    rol: string;
    token: string;
}