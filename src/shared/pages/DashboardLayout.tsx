import React, { useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/modules/iam/application/stores/auth.store";

export const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>("productos");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleSubmenu = (menu: string) => {
    setOpenSubmenu(openSubmenu === menu ? null : menu);
  };

  const isSubmenuActive = (paths: string[]) =>
    paths.some((path) => location.pathname.startsWith(path));

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Sidebar */}
      <aside
        className={`bg-white border-r border-neutral-200 fixed left-0 top-0 h-full z-40 transition-all duration-300 ${
          isSidebarOpen ? "w-64" : "w-20"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-neutral-200">
            {isSidebarOpen ? (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">D</span>
                </div>
                <span className="text-lg font-bold text-neutral-900">
                  DermaKardex
                </span>
              </div>
            ) : (
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center mx-auto">
                <span className="text-white font-bold text-lg">D</span>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-2">
            {/* Dashboard */}
            <div className="mb-2">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary-50 text-primary-600"
                      : "text-neutral-700 hover:bg-neutral-100"
                  }`
                }
              >
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                {isSidebarOpen && (
                  <span className="font-medium text-sm">Dashboard</span>
                )}
              </NavLink>
            </div>

            {/* Productos Section */}
            <div className="mb-2">
              <button
                onClick={() => toggleSubmenu("productos")}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                  isSubmenuActive(["/products"])
                    ? "bg-primary-50 text-primary-600"
                    : "text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <svg
                    className="w-5 h-5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                  {isSidebarOpen && (
                    <span className="font-medium text-sm">Productos</span>
                  )}
                </div>
                {isSidebarOpen && (
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      openSubmenu === "productos" ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                )}
              </button>

              {/* Submenu Productos */}
              {isSidebarOpen && openSubmenu === "productos" && (
                <div className="mt-1 ml-4 space-y-1 border-l-2 border-neutral-200 pl-4">
                  <NavLink
                    to="/products"
                    end
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                        isActive
                          ? "bg-primary-50 text-primary-600 font-medium"
                          : "text-neutral-600 hover:bg-neutral-50"
                      }`
                    }
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 10h16M4 14h16M4 18h16"
                      />
                    </svg>
                    Lista de Productos
                  </NavLink>

                  <NavLink
                    to="/products/catalog"
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                        isActive
                          ? "bg-primary-50 text-primary-600 font-medium"
                          : "text-neutral-600 hover:bg-neutral-50"
                      }`
                    }
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                    Catálogo
                  </NavLink>

                  <NavLink
                    to="/products/low-stock"
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                        isActive
                          ? "bg-primary-50 text-primary-600 font-medium"
                          : "text-neutral-600 hover:bg-neutral-50"
                      }`
                    }
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    Stock Bajo
                  </NavLink>

                  <NavLink
                    to="/products/stock-entries"
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                        isActive
                          ? "bg-primary-50 text-primary-600 font-medium"
                          : "text-neutral-600 hover:bg-neutral-50"
                      }`
                    }
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Entradas de Stock
                  </NavLink>

                  <NavLink
                    to="/products/discounts"
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                        isActive
                          ? "bg-primary-50 text-primary-600 font-medium"
                          : "text-neutral-600 hover:bg-neutral-50"
                      }`
                    }
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      />
                    </svg>
                    Descuentos
                  </NavLink>
                </div>
              )}
            </div>

            {/* Ventas Section */}
            <div className="mb-2">
              <button
                onClick={() => toggleSubmenu("ventas")}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                  isSubmenuActive(["/sales"])
                    ? "bg-green-50 text-green-600"
                    : "text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <svg
                    className="w-5 h-5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  {isSidebarOpen && (
                    <span className="font-medium text-sm">Ventas</span>
                  )}
                </div>
                {isSidebarOpen && (
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      openSubmenu === "ventas" ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                )}
              </button>

              {/* Submenu Ventas */}
              {isSidebarOpen && openSubmenu === "ventas" && (
                <div className="mt-1 ml-4 space-y-1 border-l-2 border-neutral-200 pl-4">
                  <NavLink
                    to="/sales"
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                        isActive
                          ? "bg-green-50 text-green-600 font-medium"
                          : "text-neutral-600 hover:bg-neutral-50"
                      }`
                    }
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 10h16M4 14h16M4 18h16"
                      />
                    </svg>
                    Listado de Ventas
                  </NavLink>
                </div>
              )}
            </div>

            {/* Usuarios Section - Solo para Admin */}
            {user?.role === "ADMIN" && (
              <div className="mb-2">
                <NavLink
                  to="/users"
                  end
                  className={({ isActive }) =>
                    `w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? "bg-purple-50 text-purple-600"
                        : "text-neutral-700 hover:bg-neutral-100"
                    }`
                  }
                >
                  <svg
                    className="w-5 h-5 flex-shrink-0"
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
                  {isSidebarOpen && (
                    <span className="font-medium text-sm">Usuarios</span>
                  )}
                </NavLink>
              </div>
            )}
          </nav>

          {/* Toggle Sidebar Button */}
          <div className="border-t border-neutral-200 p-2">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="w-full flex items-center justify-center px-3 py-2 rounded-lg text-neutral-600 hover:bg-neutral-100 transition-colors"
            >
              <svg
                className={`w-5 h-5 transition-transform ${
                  isSidebarOpen ? "" : "rotate-180"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidebarOpen ? "ml-64" : "ml-20"
        }`}
      >
        {/* Top Navbar */}
        <nav className="bg-white border-b border-neutral-200 sticky top-0 z-30 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-lg font-semibold text-neutral-900">
                  {location.pathname === "/"
                    ? "Dashboard"
                    : location.pathname.includes("/products")
                      ? "Productos"
                      : location.pathname.includes("/sales")
                        ? "Ventas"
                        : "DermaKardex"}
                </h1>
              </div>

              {/* Usuario y logout */}
              <div className="flex items-center gap-4">
                {/* Usuario info */}
                <div className="hidden md:flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-neutral-900">
                      {user?.fullName}
                    </p>
                    <p className="text-xs text-neutral-600">{user?.role}</p>
                  </div>
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-semibold text-sm">
                      {user?.fullName?.charAt(0)}
                    </span>
                  </div>
                </div>

                {/* Botón de logout */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  <span className="hidden md:inline">Salir</span>
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Page Content */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
