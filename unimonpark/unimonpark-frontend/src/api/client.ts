import axios from "axios";

const apiClient = axios.create({
    baseURL: "http://localhost:8080/api",
});

export function obtenerMensajeError(error: unknown, mensajePredeterminado: string) {
    if (axios.isAxiosError(error)) {
        const data = error.response?.data as { mensaje?: string; message?: string } | undefined;
        return data?.mensaje ?? data?.message ?? mensajePredeterminado;
    }
    return mensajePredeterminado;
}

//Interceptor de la peticion: esta agrega el toekn a cada llamada automaticamente
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token){
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor de respuesta: en caso de que el token haya expirado o sea invalido, se redirige al login

apiClient.interceptors.response.use(
    (response) => response,
    (error) =>{
        if (error.response?.status === 401){
            localStorage.removeItem("token");
            localStorage.removeItem("nombreUsuario");
            localStorage.removeItem("rol");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default apiClient;