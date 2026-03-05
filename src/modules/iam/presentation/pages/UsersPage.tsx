import { useEffect, useState } from "react";
import { useAuthStore } from "../../application/stores/auth.store";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { Input } from "@/shared/components/ui/Input";
import { EmptyState } from "@/modules/products/presentation/components/EmptyState";
import { LoadingSpinner } from "@/modules/products/presentation/components/LoadingSpinner";
import { UserRole } from "../../domain/models/user.model";

export const UsersPage: React.FC = () => {
  const {
    user: currentUser,
    users,
    isLoading,
    register,
    fetchUsers,
  } = useAuthStore();
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    fullName: "",
    role: UserRole.USER,
  });

  const [formErrors, setFormErrors] = useState({
    username: "",
    password: "",
    fullName: "",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const validateForm = (): boolean => {
    const errors = {
      username: "",
      password: "",
      fullName: "",
    };

    if (!formData.username.trim()) {
      errors.username = "El nombre de usuario es requerido";
    } else if (formData.username.length < 3) {
      errors.username = "El usuario debe tener al menos 3 caracteres";
    }

    if (!formData.password) {
      errors.password = "La contraseña es requerida";
    } else if (formData.password.length < 6) {
      errors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    if (!formData.fullName.trim()) {
      errors.fullName = "El nombre completo es requerido";
    } else if (formData.fullName.length < 3) {
      errors.fullName = "El nombre debe tener al menos 3 caracteres";
    }

    setFormErrors(errors);
    return !errors.username && !errors.password && !errors.fullName;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await register(formData);
      await fetchUsers();
      handleCloseModal();
    } catch (error) {
      console.error("Error al crear usuario:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      username: "",
      password: "",
      fullName: "",
      role: UserRole.USER,
    });
    setFormErrors({
      username: "",
      password: "",
      fullName: "",
    });
  };

  const getRoleBadge = (role: UserRole) => {
    if (role === UserRole.ADMIN) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          Administrador
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        Usuario
      </span>
    );
  };

  const isAdmin = currentUser?.roles?.includes(UserRole.ADMIN);

  if (!isAdmin) {
    return (
      <div className="p-8">
        <Card>
          <EmptyState
            icon={
              <svg
                className="w-16 h-16 text-neutral-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            }
            title="Acceso Denegado"
            description="Solo los administradores pueden acceder a esta sección."
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">
              Gestión de Usuarios
            </h1>
            <p className="text-neutral-600 mt-1">
              Administra los usuarios del sistema
            </p>
          </div>
          <Button onClick={handleOpenModal} className="flex items-center gap-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Nuevo Usuario
          </Button>
        </div>
      </div>

      {/* Card de estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-purple-50 to-white hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Total Usuarios</p>
              <p className="text-2xl font-bold text-purple-700 mt-1">
                {users.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Administradores</p>
              <p className="text-2xl font-bold text-blue-700 mt-1">
                {users.filter((u) => u.role === UserRole.ADMIN).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Usuarios Estándar</p>
              <p className="text-2xl font-bold text-green-700 mt-1">
                {users.filter((u) => u.role === UserRole.USER).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabla de usuarios */}
      <Card>
        {isLoading ? (
          <LoadingSpinner message="Cargando usuarios..." />
        ) : users.length === 0 ? (
          <EmptyState
            icon={
              <svg
                className="w-16 h-16 text-neutral-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            }
            title="No hay usuarios registrados"
            description="Comienza creando el primer usuario del sistema."
            actionLabel="Crear Usuario"
            onAction={handleOpenModal}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50">
                  <th className="text-left p-4 text-sm font-semibold text-neutral-700">
                    ID
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-neutral-700">
                    Usuario
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-neutral-700">
                    Nombre Completo
                  </th>
                  <th className="text-center p-4 text-sm font-semibold text-neutral-700">
                    Rol
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
                  >
                    <td className="p-4">
                      <span className="text-sm font-mono text-neutral-600">
                        {user.id}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 font-semibold text-xs">
                            {user.fullName?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium text-neutral-900">
                          {user.username}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-neutral-900">
                        {user.fullName}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {getRoleBadge(user.role)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal de Nuevo Usuario */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <div className="border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-neutral-900">
                Crear Nuevo Usuario
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <Input
                label="Nombre de Usuario"
                name="username"
                type="text"
                placeholder="Ej: jperez"
                value={formData.username}
                onChange={handleInputChange}
                error={formErrors.username}
                autoComplete="username"
              />

              <Input
                label="Nombre Completo"
                name="fullName"
                type="text"
                placeholder="Ej: Juan Pérez"
                value={formData.fullName}
                onChange={handleInputChange}
                error={formErrors.fullName}
                autoComplete="name"
              />

              <Input
                label="Contraseña"
                name="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChange={handleInputChange}
                error={formErrors.password}
                autoComplete="new-password"
              />

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Rol
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value={UserRole.USER}>Usuario Estándar</option>
                  <option value={UserRole.ADMIN}>Administrador</option>
                </select>
                <p className="mt-1 text-xs text-neutral-500">
                  Los administradores tienen acceso completo al sistema
                </p>
              </div>
            </form>

            <div className="border-t border-neutral-200 px-6 py-4 flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={handleCloseModal}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleSubmit}
                isLoading={isSubmitting}
                disabled={isSubmitting}
              >
                Crear Usuario
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
