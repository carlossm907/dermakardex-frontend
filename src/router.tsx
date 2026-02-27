import { createBrowserRouter } from "react-router-dom";
import { LoginPage } from "./modules/iam/presentation/pages/LoginPage";
import { ProtectedRoute } from "./shared/components/ProtectedRoute";
import { DashboardLayout } from "./shared/pages/DashboardLayout";
import { ProductsListPage } from "./modules/products/presentation/pages/ProductsListPage";
import { ProductFormPage } from "./modules/products/presentation/pages/ProductFormPage";
import { CatalogManagementPage } from "./modules/products/presentation/pages/CatalogManagementPage";
import { StockEntriesPage } from "./modules/products/presentation/pages/StockEntriesPage";
import { DiscountsFormPage } from "./modules/products/presentation/pages/DiscountsFormPage";
import { SaleListPage } from "./modules/sales/presentation/pages/SalesListPage";
import { SaleFormPage } from "./modules/sales/presentation/pages/SaleFormPage";
import { SaleDetailPage } from "./modules/sales/presentation/pages/SaleDetailPage";
import { LowStockPage } from "./modules/products/presentation/pages/LowStockPage";
import { DashboardHomePage } from "./shared/pages/DashBoardHomePage";

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
        element: <DashboardHomePage />,
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
        element: <DiscountsFormPage />,
      },
      {
        path: "products/low-stock",
        element: <LowStockPage />,
      },
      {
        path: "sales",
        element: <SaleListPage />,
      },
      {
        path: "sales/new",
        element: <SaleFormPage />,
      },
      {
        path: "sales/:id",
        element: <SaleDetailPage />,
      },
    ],
  },
]);
