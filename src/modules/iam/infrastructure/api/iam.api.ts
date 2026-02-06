import apiClient from "@/shared/config/api.config";
import type { UserRole } from "../../domain/models/user.model";

export interface SignInRequest {
  username: string;
  password: string;
}

export interface SignUpRequest {
  username: string;
  password: string;
  role: UserRole;
  fullName: string;
}

export interface AuthenticatedUserResponse {
  id: number;
  fullName: string;
  username: string;
  roles: UserRole[];
  token: string;
}

export interface UserResponse {
  id: number;
  username: string;
  fullName: string;
  role: UserRole;
}

export const iamApi = {
  signIn: async (data: SignInRequest): Promise<AuthenticatedUserResponse> => {
    const response = await apiClient.post<AuthenticatedUserResponse>(
      "/authentication/sign-in",
      data,
    );

    return response.data;
  },

  signUp: async (data: SignUpRequest): Promise<void> => {
    await apiClient.post("/authentication/sign-up", data);
  },

  getUserById: async (id: number): Promise<UserResponse> => {
    const response = await apiClient.get<UserResponse>(`/users/${id}`);
    return response.data;
  },

  getAllUsers: async (): Promise<UserResponse[]> => {
    const response = await apiClient.get<UserResponse[]>(`/users`);
    return response.data;
  },
};
