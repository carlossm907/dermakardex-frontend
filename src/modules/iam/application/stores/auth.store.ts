import type {
  AuthenticatedUser,
  User,
} from "@/modules/iam/domain/models/user.model";
import {
  authService,
  type LoginCredentials,
  type RegisterData,
} from "../services/auth.service";
import { create } from "zustand";

const token = localStorage.getItem("token");
const storedUser = authService.getStoredUser();

interface AuthState {
  user: AuthenticatedUser | null;
  users: User[];
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  fetchUsers: () => Promise<void>;
  logout: () => void;
  initialize: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: storedUser,
  users: [],
  isAuthenticated: !!token,
  isLoading: false,
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const user = await authService.login(credentials);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error al iniciar sesion";
      set({
        error: message,
        isLoading: false,
        isAuthenticated: false,
        user: null,
      });
      throw error;
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await authService.register(data);
      set({ isLoading: false });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error al registrar usuario";

      set({
        error: message,
        isLoading: false,
      });
      throw error;
    }
  },

  fetchUsers: async () => {
    set({ isLoading: true, error: null });

    try {
      const users = await authService.fetchUsers();

      set({
        users,
        isLoading: false,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error al obtener usuarios";

      set({
        error: message,
        isLoading: false,
      });
    }
  },

  logout: () => {
    authService.logout();
    set({
      user: null,
      isAuthenticated: false,
      error: null,
    });
  },

  initialize: () => {
    const user = authService.getStoredUser();
    if (user) {
      set({ user, isAuthenticated: true });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
