import type { DniLookupResult } from "../../domain/models/customer.model";

class DniLookupService {
  private cache: Map<string, string> = new Map();

  async lookupDni(dni: string): Promise<DniLookupResult> {
    try {
      const cleanDni = dni.trim();

      if (cleanDni.length !== 8) {
        return {
          success: false,
          fullName: null,
          error: "El dni debe tener 8 digitos",
        };
      }

      if (!/^\d{8}$/.test(cleanDni)) {
        return {
          success: false,
          fullName: null,
          error: "El dni solo puede contener numeros",
        };
      }

      if (this.cache.has(cleanDni)) {
        return {
          success: true,
          fullName: this.cache.get(cleanDni)!,
        };
      }

      return {
        success: true,
        fullName: null,
        error: undefined,
      };
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error al consultar DNI";
      return {
        success: false,
        fullName: null,
        error: message,
      };
    }
  }

  addToCache(dni: string, fullName: string): void {
    this.cache.set(dni.trim(), fullName);
  }

  clearCache(): void {
    this.cache.clear();
  }

  getFromCache(dni: string): string | null {
    return this.cache.get(dni.trim()) || null;
  }
}

export const dniLookupService = new DniLookupService();
