import axios from "axios";

const apiClient = axios.create({
    baseURL: "http://localhost:8080/api",
});

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