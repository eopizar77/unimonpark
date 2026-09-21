export interface Usuario {
    idUsuario: number;
    nombres: string;
    apellidos: string;
    documento: string;
    correo: string;
    telefono: string | null;
    nombreUsuario: string | null;
    idRol: number;
    activo: boolean;
    fechaCreacion?: string;
    fechaActualizacion?: string | null;
    valorMatricula: number | null;
    valorSalario: number | null;
}

export interface UsuarioPayload {
    nombres: string;
    apellidos: string;
    documento: string;
    correo: string;
    telefono: string;
    nombreUsuario?: string;
    contrasena?: string;
    idRol: number;
    activo: boolean;
    valorMatricula: number | null;
    valorSalario: number | null;
}
