import { useProductStore } from "@/modules/products/application/stores/product.store";
import { useStockEntryStore } from "@/modules/products/application/stores/stock-entry.store";
import { DiscountType } from "@/modules/products/domain/models/discount.type";
import { useSaleStore } from "@/modules/sales/application/stores/sale.store";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { salesApi } from "@/modules/sales/infrastructure/api/sales.api";
import { useScheduledDiscountStore } from "@/modules/products/application/stores/scheduled-discount.store";
import { productsApi } from "@/modules/products/infrastructure/api/products.api";
import { isCurrentlyActive } from "@/modules/products/domain/models/scheduled-discount.model";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(
    value,
  );

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const DashboardHomePage: React.FC = () => {
  const navigate = useNavigate();

  const { products, lowStockProducts, fetchProducts, fetchLowStockProducts } =
    useProductStore();
  const { entries, fetchAllEntries } = useStockEntryStore();
  const { sales, fetchSales } = useSaleStore();
  const { discounts, fetchAll: fetchAllDiscounts } =
    useScheduledDiscountStore();

  const [todayProductsSold, setTodayProductsSold] = useState(0);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  const [monthSales, setMonthSales] = useState(0);
  const [monthRevenue, setMonthRevenue] = useState(0);
  const [isLoadingMonth, setIsLoadingMonth] = useState(false);

  //const [monthProfit, setMonthProfit] = useState(0);
  //const [isLoadingProfit, setIsLoadingProfit] = useState(false);

  const [yearRevenue, setYearRevenue] = useState(0);
  const [isLoadingYear, setIsLoadingYear] = useState(false);

  const [monthUniqueProducts, setMonthUniqueProducts] = useState(0);
  const [topProduct, setTopProduct] = useState<{
    name: string;
    quantity: number;
  } | null>(null);

  const [todayUniqueProducts, setTodayUniqueProducts] = useState(0);
  const [isLoadingTodayProductsReport, setIsLoadingTodayProductsReport] =
    useState(false);
  const [isLoadingProductsReport, setIsLoadingProductsReport] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchLowStockProducts();
    fetchAllEntries();
    fetchSales();
    fetchAllDiscounts();
  }, []);

  useEffect(() => {
    const calculateTodayProductsSold = async () => {
      const today = new Date().toLocaleDateString("sv-SE");
      const todaySales = sales.filter((sale) => sale.saleDate === today);

      if (todaySales.length === 0) {
        setTodayProductsSold(0);
        return;
      }

      setIsLoadingProducts(true);
      try {
        const saleDetails = await Promise.all(
          todaySales.map((sale) => salesApi.getSaleById(sale.id)),
        );
        const totalProducts = saleDetails.reduce((total, saleDetail) => {
          return (
            total +
            saleDetail.items.reduce((sum, item) => sum + item.quantity, 0)
          );
        }, 0);
        setTodayProductsSold(totalProducts);
      } catch (error) {
        console.error("Error al calcular productos vendidos:", error);
        setTodayProductsSold(0);
      } finally {
        setIsLoadingProducts(false);
      }
    };
    if (sales.length > 0) {
      calculateTodayProductsSold();
    }
  }, [sales]);

  useEffect(() => {
    const calculate = async () => {
      const now = new Date();
      setIsLoadingMonth(true);
      try {
        const monthlySales = await salesApi.getSalesByMonth(
          now.getFullYear(),
          now.getMonth() + 1,
        );
        setMonthSales(monthlySales.length);
        setMonthRevenue(monthlySales.reduce((sum, s) => sum + s.total, 0));
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoadingMonth(false);
      }
    };
    calculate();
  }, []);

  useEffect(() => {
    const calculate = async () => {
      const now = new Date();
      const from = new Date(
        now.getFullYear(),
        now.getMonth(),
        1,
      ).toLocaleDateString("sv-SE");
      const to = now.toLocaleDateString("sv-SE");
      setIsLoadingProductsReport(true);
      try {
        const report = await productsApi.getAllProductsSalesReport(from, to);
        const sold = report.filter((r) => r.quantity > 0);
        setMonthUniqueProducts(sold.length);
        if (sold.length > 0) {
          const top = sold.reduce((prev, curr) =>
            curr.quantity > prev.quantity ? curr : prev,
          );
          setTopProduct({ name: top.productName, quantity: top.quantity });
        } else {
          setTopProduct(null);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoadingProductsReport(false);
      }
    };
    calculate();
  }, []);

  useEffect(() => {
    const calculate = async () => {
      const today = new Date().toLocaleDateString("sv-SE");

      setIsLoadingTodayProductsReport(true);
      try {
        const report = await productsApi.getAllProductsSalesReport(
          today,
          today,
        );

        const sold = report.filter((r) => r.quantity > 0);

        setTodayUniqueProducts(sold.length);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoadingTodayProductsReport(false);
      }
    };

    calculate();
  }, []);

  useEffect(() => {
    const calculate = async () => {
      const now = new Date();
      const year = now.getFullYear();
      const currentMonth = now.getMonth() + 1;
      setIsLoadingYear(true);
      try {
        let total = 0;
        for (let m = 1; m <= currentMonth; m++) {
          const monthlySales = await salesApi.getSalesByMonth(year, m);
          total += monthlySales.reduce((sum, s) => sum + s.total, 0);
        }
        setYearRevenue(total);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoadingYear(false);
      }
    };
    calculate();
  }, []);

  const today = new Date().toLocaleDateString("sv-SE");

  const stats = {
    totalProducts: products.length,
    productsWithDiscount: products.filter(
      (p) => p.discountType !== DiscountType.NONE,
    ).length,
    activeProducts: products.filter((p) => p.isActive).length,
    lowStockProducts: lowStockProducts.length,

    todayStockEntries: entries.filter(
      (entry) => entry.registeredAt.toLocaleDateString("sv-SE") === today,
    ).length,

    todaySales: sales.filter((sale) => sale.saleDate === today).length,
    todayProductsSold: todayProductsSold,
    todayRevenue: sales
      .filter((sale) => sale.saleDate === today)
      .reduce((sum, sale) => sum + sale.total, 0),
  };

  const activeDiscounts = discounts.filter(isCurrentlyActive);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Dashboard</h1>
        <p className="text-neutral-600 mt-1">
          Resumen general del sistema DermaKardex
        </p>
      </div>

      {/* ── Inventario ── */}
      <div className="flex items-center gap-3 mb-4">
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest whitespace-nowrap">
          Inventario
        </p>
        <div className="flex-1 h-px bg-neutral-200" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card
          className="bg-gradient-to-br from-blue-50 to-white hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => navigate("/products")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Productos Activos</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {stats.activeProducts}
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
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
          </div>
        </Card>

        <Card
          className="bg-gradient-to-br from-red-50 to-white hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => navigate("/products/discounts")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Con Descuento</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {stats.productsWithDiscount}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-red-600"
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
            </div>
          </div>
        </Card>
        <Card
          className="bg-gradient-to-br from-amber-50 to-white hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => navigate("/products/low-stock")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Stock Bajo</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">
                {stats.lowStockProducts}
              </p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-amber-600"
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
            </div>
          </div>
        </Card>

        <Card
          className="bg-gradient-to-br from-purple-50 to-white hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => navigate("/products/stock-entries")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Entradas Hoy</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                {stats.todayStockEntries}
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
          </div>
        </Card>
        {/* Descuento programado */}
        <Card
          className={`hover:shadow-md transition-shadow cursor-pointer ${
            activeDiscounts.length > 0
              ? "bg-gradient-to-br from-rose-50 to-white border-l-4 border-rose-400"
              : "bg-gradient-to-br from-neutral-50 to-white"
          }`}
          onClick={() => navigate("/products/scheduled-discounts")}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 pr-2">
              <p className="text-sm text-neutral-600">Descuento Programado</p>
              {activeDiscounts.length > 0 ? (
                <>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse inline-block" />
                      Activo
                    </span>
                    <span className="text-sm font-medium text-neutral-700 truncate">
                      {activeDiscounts[0].name}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1.5">
                    {formatDate(activeDiscounts[0].startsAt)} →{" "}
                    {formatDate(activeDiscounts[0].endsAt)}
                  </p>
                  {activeDiscounts.length > 1 && (
                    <p className="text-xs text-rose-500 mt-0.5">
                      +{activeDiscounts.length - 1} más activo
                      {activeDiscounts.length - 1 > 1 ? "s" : ""}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <p className="text-base font-medium text-neutral-400 mt-1">
                    Sin descuentos activos
                  </p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    No hay campañas en curso
                  </p>
                </>
              )}
            </div>
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                activeDiscounts.length > 0 ? "bg-rose-100" : "bg-neutral-100"
              }`}
            >
              <svg
                className={`w-6 h-6 ${activeDiscounts.length > 0 ? "text-rose-500" : "text-neutral-400"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Ventas de Hoy ── */}
      <div className="flex items-center gap-3 mb-4">
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest whitespace-nowrap">
          Ventas de Hoy
        </p>
        <div className="flex-1 h-px bg-neutral-200" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card
          className="bg-gradient-to-br from-green-50 to-white hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => navigate("/sales")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Ventas Hoy</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {stats.todaySales}
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
          </div>
        </Card>

        <Card
          className="bg-gradient-to-br from-green-50 to-white hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => navigate("/sales")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Productos Vendidos Hoy</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {isLoadingProducts ? (
                  <span className="text-lg">Calculando...</span>
                ) : (
                  stats.todayProductsSold
                )}
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
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
          </div>
        </Card>
        <Card
          className="bg-gradient-to-br from-emerald-50 to-white hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => navigate("/sales")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Ganancia Hoy</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">
                {formatCurrency(stats.todayRevenue)}
              </p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-emerald-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </Card>
        <Card
          className="bg-gradient-to-br from-violet-50 to-white hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => navigate("/sales")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Productos Vendidos Hoy</p>

              <p className="text-2xl font-bold text-violet-600 mt-1">
                {isLoadingTodayProductsReport ? (
                  <span className="text-lg text-neutral-400">...</span>
                ) : (
                  todayUniqueProducts
                )}
              </p>

              <p className="text-xs text-neutral-400 mt-0.5">
                nombres distintos
              </p>
            </div>

            <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-violet-600"
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
            </div>
          </div>
        </Card>
      </div>

      {/* ── Resumen del Mes ── */}
      <div className="flex items-center gap-3 mb-4">
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest whitespace-nowrap">
          Resumen del Mes
        </p>
        <div className="flex-1 h-px bg-neutral-200" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {/* Ventas del mes */}
        <Card
          className="bg-gradient-to-br from-sky-50 to-white hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => navigate("/sales")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Ventas del Mes</p>
              <p className="text-2xl font-bold text-sky-600 mt-1">
                {isLoadingMonth ? (
                  <span className="text-lg text-neutral-400">...</span>
                ) : (
                  monthSales
                )}
              </p>
              <p className="text-xs text-neutral-400 mt-0.5">transacciones</p>
            </div>
            <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-sky-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
          </div>
        </Card>

        {/* Ingresos del mes */}
        <Card
          className="bg-gradient-to-br from-teal-50 to-white hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => navigate("/sales")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Ingresos del Mes</p>
              <p className="text-2xl font-bold text-teal-600 mt-1">
                {isLoadingMonth ? (
                  <span className="text-lg text-neutral-400">...</span>
                ) : (
                  formatCurrency(monthRevenue)
                )}
              </p>
              <p className="text-xs text-neutral-400 mt-0.5">total facturado</p>
            </div>
            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-teal-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </Card>

        {/* Productos distintos */}
        <Card
          className="bg-gradient-to-br from-violet-50 to-white hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => navigate("/sales")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Productos Vendidos</p>
              <p className="text-2xl font-bold text-violet-600 mt-1">
                {isLoadingProductsReport ? (
                  <span className="text-lg text-neutral-400">...</span>
                ) : (
                  monthUniqueProducts
                )}
              </p>
              <p className="text-xs text-neutral-400 mt-0.5">
                nombres distintos
              </p>
            </div>
            <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-violet-600"
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
            </div>
          </div>
        </Card>

        {/* Top producto */}
        <Card
          className="bg-gradient-to-br from-orange-50 to-white hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => navigate("/sales")}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0 pr-2">
              <p className="text-sm text-neutral-600">Producto Top del Mes</p>
              {isLoadingProductsReport ? (
                <p className="text-lg text-neutral-400 mt-1">...</p>
              ) : topProduct ? (
                <>
                  <p
                    className="text-base font-bold text-orange-600 mt-1 truncate"
                    title={topProduct.name}
                  >
                    {topProduct.name}
                  </p>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {topProduct.quantity} unidades
                  </p>
                </>
              ) : (
                <p className="text-base text-neutral-400 mt-1">
                  Sin ventas este mes
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg
                className="w-6 h-6 text-orange-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Resumen del Año ── */}
      <div className="flex items-center gap-3 mb-4">
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest whitespace-nowrap">
          Resumen del Año {new Date().getFullYear()}
        </p>
        <div className="flex-1 h-px bg-neutral-200" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Ingresos del año */}
        <Card
          className="bg-gradient-to-br from-indigo-50 to-white hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => navigate("/sales")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Ingresos del Año</p>
              <p className="text-2xl font-bold text-indigo-600 mt-1">
                {isLoadingYear ? (
                  <span className="text-lg text-neutral-400">...</span>
                ) : (
                  formatCurrency(yearRevenue)
                )}
              </p>
              <p className="text-xs text-neutral-400 mt-0.5">
                {new Date().getFullYear()}
              </p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
                />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Accesos Rápidos ── */}
      <div className="flex items-center gap-3 mb-4">
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest whitespace-nowrap">
          Accesos Rápidos
        </p>
        <div className="flex-1 h-px bg-neutral-200" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-primary-50 to-white border-l-4 border-primary-500">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg
                className="w-6 h-6 text-primary-600"
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
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-primary-900 mb-2">
                Gestión de Productos
              </h3>
              <p className="text-sm text-primary-700 mb-4">
                Administra tu inventario, catálogo, entradas de stock y
                descuentos.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => navigate("/products")}
                  className="text-xs px-3 py-1.5 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors"
                >
                  Ver Productos
                </button>
                <button
                  onClick={() =>
                    navigate("/products", { state: { openCreateModal: true } })
                  }
                  className="text-xs px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Nuevo Producto
                </button>
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white border-l-4 border-green-500">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-900 mb-2">
                Punto de Venta
              </h3>
              <p className="text-sm text-green-700 mb-4">
                Registra ventas, genera tickets y consulta el historial de
                transacciones.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => navigate("/sales")}
                  className="text-xs px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                >
                  Ver Ventas
                </button>
                <button
                  onClick={() =>
                    navigate("/sales", { state: { openNewSaleModal: true } })
                  }
                  className="text-xs px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Nueva Venta
                </button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
