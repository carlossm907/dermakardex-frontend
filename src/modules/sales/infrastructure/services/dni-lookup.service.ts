import apiClient from "@/shared/config/api.config";
import type { DniLookupResult } from "../../domain/models/customer.model";

class DniLookupService {
  private cache: Map<string, string> = new Map();

  async lookupDni(dni: string): Promise<DniLookupResult> {
    const cleanDni = dni.trim();

    if (cleanDni.length !== 8) {
      return {
        success: false,
        fullName: null,
        error: "El DNI debe tener 8 dígitos",
      };
    }

    if (!/^\d{8}$/.test(cleanDni)) {
      return {
        success: false,
        fullName: null,
        error: "El DNI solo puede contener números",
      };
    }

    if (this.cache.has(cleanDni)) {
      return { success: true, fullName: this.cache.get(cleanDni)! };
    }

    try {
      const response = await apiClient.get<{ fullName: string }>(
        `/sales/dni/${cleanDni}`,
      );

      const fullName = response.data.fullName;
      this.cache.set(cleanDni, fullName);
      return { success: true, fullName };
    } catch (error: unknown) {
      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        (error as { response?: { status?: number } }).response?.status === 404
      ) {
        return {
          success: false,
          fullName: null,
          error: "DNI no encontrado en el padrón",
        };
      }

      const message =
        error instanceof Error ? error.message : "Error al consultar DNI";
      return { success: false, fullName: null, error: message };
    }
  }

  addToCache(dni: string, fullName: string): void {
    this.cache.set(dni.trim(), fullName);
  }

  clearCache(): void {
    this.cache.clear();
  }

  getFromCache(dni: string): string | null {
    return this.cache.get(dni.trim()) ?? null;
  }
}

export const dniLookupService = new DniLookupService();
