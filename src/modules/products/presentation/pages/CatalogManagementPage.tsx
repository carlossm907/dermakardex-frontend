import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCatalogStore } from "../../application/stores/catalog.store";
import { CatalogList } from "../components/CatalogList";
import { Card } from "@/shared/components/ui/Card";

type CatalogTab = "brands" | "categories" | "laboratories" | "suppliers";

export const CatalogManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<CatalogTab>("brands");

  const {
    brands,
    categories,
    laboratories,
    suppliers,
    isLoading,
    error,
    fetchAll,
    createBrand,
    createCategory,
    createLaboratory,
    createSupplier,
    updateBrand,
    updateCategory,
    updateLaboratory,
    updateSupplier,
    deleteBrand,
    deleteCategory,
    deleteLaboratory,
    deleteSupplier,
    clearError,
  } = useCatalogStore();

  useEffect(() => {
    fetchAll();
  }, []);

  const tabs = [
    {
      id: "brands" as CatalogTab,
      label: "Marcas",
      count: brands.length,
      icon: (
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
            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
          />
        </svg>
      ),
    },

    {
      id: "categories" as CatalogTab,
      label: "Categorías",
      count: categories.length,
      icon: (
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
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      ),
    },
    {
      id: "laboratories" as CatalogTab,
      label: "Laboratorios",
      count: laboratories.length,
      icon: (
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
            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
          />
        </svg>
      ),
    },
    {
      id: "suppliers" as CatalogTab,
      label: "Proveedores",
      count: suppliers.length,
      icon: (
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
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "brands":
        return (
          <CatalogList
            items={brands}
            title="marca"
            onAdd={(name) => createBrand({ name })}
            onEdit={(id, name) => updateBrand(id, { name })}
            onDelete={deleteBrand}
            isLoading={isLoading}
          />
        );

      case "categories":
        return (
          <CatalogList
            items={categories}
            title="categoría"
            onAdd={(name) => createCategory({ name })}
            onEdit={(id, name) => updateCategory(id, { name })}
            onDelete={deleteCategory}
            isLoading={isLoading}
          />
        );
      case "laboratories":
        return (
          <CatalogList
            items={laboratories}
            title="laboratorio"
            onAdd={(name) => createLaboratory({ name })}
            onEdit={(id, name) => updateLaboratory(id, { name })}
            onDelete={deleteLaboratory}
            isLoading={isLoading}
          />
        );
      case "suppliers":
        return (
          <CatalogList
            items={suppliers}
            title="proveedor"
            onAdd={(name) => createSupplier({ name })}
            onEdit={(id, name) => updateSupplier(id, { name })}
            onDelete={deleteSupplier}
            isLoading={isLoading}
          />
        );

      default:
        return null;
    }
  };

  const getTabDescription = () => {
    switch (activeTab) {
      case "brands":
        return "Gestiona las marcas de tus productos. Estas marcas se usarán al crear nuevos productos.";
      case "categories":
        return "Organiza tus productos por categorías para una mejor clasificación.";
      case "laboratories":
        return "Administra los laboratorios fabricantes de tus productos farmacéuticos.";
      case "suppliers":
        return "Gestiona la información de tus proveedores para el abastecimiento.";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/products")}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <div>
                <h1 className="text-3xl font-bold">Catálogo de Productos</h1>
                <p className="text-purple-100 mt-1">
                  Administra las entidades relacionadas a tus productos
                </p>
              </div>
            </div>
            <div className="hidden md:flex gap-2">
              {tabs.map((tab) => (
                <div
                  key={tab.id}
                  className="text-center bg-white/10 rounded-lg px-4 py-3 backdrop-blur-sm"
                >
                  <div className="text-2xl font-bold">{tab.count}</div>
                  <div className="text-xs text-purple-100">{tab.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? "border-purple-600 text-purple-600 bg-purple-50"
                    : "border-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    activeTab === tab.id
                      ? "bg-purple-100 text-purple-700"
                      : "bg-neutral-100 text-neutral-600"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-red-400 mt-0.5 mr-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
              <button
                onClick={clearError}
                className="text-red-400 hover:text-red-600"
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
          </div>
        )}

        {/* Description Card */}
        <Card className="mb-6 bg-gradient-to-r from-purple-50 to-white border-l-4 border-purple-500">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
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
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900">
                Sobre {tabs.find((t) => t.id === activeTab)?.label}
              </h3>
              <p className="text-sm text-neutral-600 mt-1">
                {getTabDescription()}
              </p>
            </div>
          </div>
        </Card>

        {/* Catalog List */}
        <Card>{renderContent()}</Card>
      </div>
    </div>
  );
};
