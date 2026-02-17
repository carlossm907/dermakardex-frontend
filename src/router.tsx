import { createBrowserRouter } from "react-router-dom";
import { LoginPage } from "./modules/iam/presentation/pages/LoginPage";
import { ProtectedRoute } from "./shared/components/ProtectedRoute";
import { DashboardLayout } from "./shared/pages/DashboardLayout";
import { ProductsListPage } from "./modules/products/presentation/pages/ProductsListPage";
import { ProductFormPage } from "./modules/products/presentation/pages/ProductFormPage";
import { CatalogManagementPage } from "./modules/products/presentation/pages/CatalogManagementPage";
import { StockEntriesPage } from "./modules/products/presentation/pages/StockEntriesPage";
import { DiscountsPage } from "./modules/products/presentation/pages/DiscountsPage";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-8">
              <h1 className="text-3xl font-bold text-neutral-900">
                Bienvenido a DermaKardex
              </h1>
              <p className="text-neutral-600 mt-2">
                Sistema de gestión de inventario farmacéutico
              </p>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-primary-50 rounded-lg border border-primary-200">
                  <h3 className="font-semibold text-primary-900 mb-2">
                    Módulo Productos
                  </h3>
                  <p className="text-sm text-primary-700">
                    Gestiona tu inventario, catálogo, entradas de stock y
                    descuentos.
                  </p>
                </div>

                <div className="p-6 bg-green-50 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-green-900 mb-2">
                    Módulo Usuarios
                  </h3>
                  <p className="text-sm text-green-700">
                    Administra usuarios y permisos del sistema.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ),
      },
      {
        path: "products",
        element: <ProductsListPage />,
      },
      {
        path: "products/new",
        element: <ProductFormPage />,
      },
      {
        path: "products/:id/edit",
        element: <ProductFormPage />,
      },
      {
        path: "products/catalog",
        element: <CatalogManagementPage />,
      },
      {
        path: "products/stock-entries",
        element: <StockEntriesPage />,
      },
      {
        path: "products/discounts",
        element: <DiscountsPage />,
      },
    ],
  },
]);
