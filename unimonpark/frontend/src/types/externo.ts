export type TipoDocumento = "CC" | "TI" | "CE" | "PASAPORTE" | "OTRO";

export interface Externo {
    idExterno: number;
    tipoDocumento: TipoDocumento;
    numeroDocumento: string;
    nombres: string;
    apellidos: string;
    telefono?: string | null;
    correo?: string | null;
    empresa?: string | null;
    activo: boolean;
    fechaCreacion?: string;
}

export type ExternoPayload = Omit<Externo, "idExterno" | "fechaCreacion">;