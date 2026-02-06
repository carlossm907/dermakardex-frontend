import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../application/stores/auth.store";
import { useState } from "react";
import { Card } from "../../../../shared/components/ui/Card";
import { Input } from "../../../../shared/components/ui/Input";
import { Button } from "../../../../shared/components/ui/Button";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [formErrors, setFormErrors] = useState({
    username: "",
    password: "",
  });

  const validateForm = (): boolean => {
    const errors = {
      username: "",
      password: "",
    };

    if (!formData.username.trim()) {
      errors.username = "El nombre de usuario es requerido";
    } else if (formData.username.length < 3) {
      errors.username = "El usuario debe tener al menos 3 caracteres";
    }

    if (!formData.password) {
      errors.password = "La contraseña es requerida";
    }

    setFormErrors(errors);
    return !errors.username && !errors.password;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) {
      return;
    }

    try {
      await login(formData);
      navigate("/dashboard");
    } catch {
      // El error ya fue manejado por el store
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            DermaKardex
          </h1>
          <p className="text-neutral-600">Sistema de Gestión de Inventario</p>
        </div>

        <Card>
          <h2 className="text-2xl font-semibold text-neutral-900 mb-6">
            Iniciar Sesión
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Input
              label="Usuario"
              name="username"
              type="text"
              placeholder="Ingrese su usuario"
              value={formData.username}
              onChange={handleInputChange}
              error={formErrors.username}
              autoComplete="username"
            />

            <Input
              label="Contraseña"
              name="password"
              type="password"
              placeholder="Ingrese su contraseña"
              value={formData.password}
              onChange={handleInputChange}
              error={formErrors.password}
              autoComplete="current-password"
            />

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Iniciar Sesión
            </Button>
          </form>
        </Card>

        <p className="text-center text-xs text-neutral-500 mt-8">
          © 2026 DermaKardex. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
};
