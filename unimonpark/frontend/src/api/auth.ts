import apiClient from "./client";
import type { LoginRequest, LoginResponse } from "@/types/auth";

export async function login(credenciales: LoginRequest): Promise<LoginResponse>{
    const response = await apiClient.post<LoginResponse>("/auth/login", credenciales);
    return response.data;
}
