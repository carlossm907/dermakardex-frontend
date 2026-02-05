import {
  UserRole,
  type AuthenticatedUser,
} from "@/modules/iam/domain/models/user.model";
import {
  iamApi,
  type SignInRequest,
  type SignUpRequest,
} from "@/modules/iam/infrastructure/api/iam.api";
import { userMapper } from "@/modules/iam/infrastructure/mappers/user.mapper";
import { AxiosError } from "axios";

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  password: string;
  fullName: string;
  role?: UserRole;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthenticatedUser> {
    try {
      const request: SignInRequest = {
        username: credentials.username,
        password: credentials.password,
      };

      const response = await iamApi.signIn(request);
      const authenticatedUser = userMapper.toAuthenticatedUser(response);

      localStorage.setItem("token", authenticatedUser.token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: authenticatedUser.id,
          username: authenticatedUser.username,
          fullName: authenticatedUser.fullName,
          role: authenticatedUser.role,
        }),
      );

      return authenticatedUser;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          throw new Error("Usuario o contraseña incorrectos");
        }
      }
      throw new Error("Error al iniciar sesión, intente nuevamente");
    }
  }

  async register(data: RegisterData): Promise<void> {
    try {
      const request: SignUpRequest = {
        username: data.username,
        password: data.password,
        fullName: data.fullName,
        role: data.role ?? UserRole.USER,
      };

      await iamApi.signUp(request);
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        if (error.response?.data?.message) {
          throw new Error("Error al registrar usuario. Intente nuevamente.");
        }
      }
      throw new Error("No se pudo registrar el usuario");
    }
  }

  logout(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  getStoredUser(): AuthenticatedUser | null {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) {
      return null;
    }

    try {
      const user = JSON.parse(userStr);
      return { ...user, token, roles: [user.role] };
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem("token");
  }
}

export const authService = new AuthService();
