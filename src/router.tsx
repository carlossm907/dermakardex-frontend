import { createBrowserRouter } from "react-router-dom";
import { LoginPage } from "./modules/iam/presentation/pages/LoginPage";
import { ProtectedRoute } from "./shared/components/ProtectedRoute";
import { DashboardLayout } from "./shared/pages/DashboardLayout";
import { ProductsListPage } from "./modules/products/presentation/pages/ProductsListPage";
import { ProductFormPage } from "./modules/products/presentation/pages/ProductFormPage";
import { CatalogManagementPage } from "./modules/products/presentation/pages/CatalogManagementPage";
import { StockEntriesPage } from "./modules/products/presentation/pages/StockEntriesPage";
import { SaleListPage } from "./modules/sales/presentation/pages/SalesListPage";
import { SaleDetailPage } from "./modules/sales/presentation/pages/SaleDetailPage";
import { LowStockPage } from "./modules/products/presentation/pages/LowStockPage";
import { DashboardHomePage } from "./shared/pages/DashBoardHomePage";
import { DiscountsPage } from "./modules/products/presentation/pages/DiscountsPage";
import { DiscountsFormPage } from "./modules/products/presentation/pages/DiscountsFormPage";
import { UsersPage } from "./modules/iam/presentation/pages/UsersPage";
import { ScheduledDiscountsPage } from "./modules/products/presentation/pages/ScheduledDiscountsPage";
import { StockReportPage } from "./modules/products/presentation/pages/StockReportPage";
import { SalesReportPage } from "./modules/products/presentation/pages/SalesReportPage";
import { SalesReportByClientPage } from "./modules/sales/presentation/pages/SalesReportByClientPage";

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
        path: "users",
        element: <UsersPage />,
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
      {
        path: "products/discounts/new",
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
        path: "sales/:id",
        element: <SaleDetailPage />,
      },
      {
        path: "products/scheduled-discounts",
        element: <ScheduledDiscountsPage />,
      },
      {
        path: "/reports/sales-by-client",
        element: <SalesReportByClientPage />,
      },
      {
        path: "/reports/stock-report",
        element: <StockReportPage />,
      },
      {
        path: "/reports/sales-report",
        element: <SalesReportPage />,
      },
    ],
  },
]);
