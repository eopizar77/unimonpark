export interface LoginRequest {
    nombreUsuario: string;
    contrasena: string;
}

export interface LoginResponse {
    token: string;
    nombreUsuario: String;
    rol: String;
}

export interface UsuarioSesion{
    nombreUsuario: string;
    rol: string;
    token: string;
}