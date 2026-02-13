import { useNavigate, useParams } from "react-router-dom";
import { useProductStore } from "../../application/stores/product.store";
import { useCatalogStore } from "../../application/stores/catalog.store";
import { useEffect, useState } from "react";
import {
  ProductPresentation,
  type CreateProductData,
  type UpdateProductData,
} from "../../domain/models/product.model";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { Input } from "@/shared/components/ui/Input";

export const ProductFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const {
    selectedProduct,
    fetchProductById,
    createProduct,
    updateProduct,
    isLoading,
  } = useProductStore();

  const {
    brands,
    categories,
    laboratories,
    suppliers,
    fetchAll: fetchCatalogs,
  } = useCatalogStore();

  const [formData, setFormData] = useState({
    name: "",
    brandId: "",
    laboratoryId: "",
    categoryId: "",
    supplierId: "",
    presentation: "",
    purchasePrice: "",
    salePrice: "",
    maxDiscountAmount: "",
    initialStock: "",
    stockAlertThreshold: "",
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchCatalogs();
  }, []);

  useEffect(() => {
    if (isEditMode && id) {
      fetchProductById(parseInt(id));
    }
  }, [isEditMode, id]);

  useEffect(() => {
    if (isEditMode && selectedProduct) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        name: selectedProduct.name,
        brandId: selectedProduct.brandId.toString(),
        laboratoryId: selectedProduct.laboratoryId.toString(),
        categoryId: selectedProduct.categoryId.toString(),
        supplierId: selectedProduct.supplierId.toString(),
        presentation: selectedProduct.presentation,
        purchasePrice: selectedProduct.purchasePrice.toString(),
        salePrice: selectedProduct.salePrice.toString(),
        maxDiscountAmount: selectedProduct.maxDiscountAmount.toString(),
        initialStock: selectedProduct.stock.toString(),
        stockAlertThreshold: selectedProduct.stockAlertThreshold.toString(),
        isActive: selectedProduct.isActive,
      });
    }
  }, [isEditMode, selectedProduct]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "El nombre debe tener al menos 3 caracteres";
    }

    if (!formData.brandId) newErrors.brandId = "Selecciona una marca";
    if (!formData.laboratoryId)
      newErrors.laboratoryId = "Selecciona un laboratorio";
    if (!formData.categoryId) newErrors.categoryId = "Selecciona una categoría";
    if (!formData.supplierId) newErrors.supplierId = "Selecciona un proveedor";

    if (!formData.presentation.trim()) {
      newErrors.presentation = "La presentación es requerida";
    }

    const purchasePrice = parseFloat(formData.purchasePrice);
    const salePrice = parseFloat(formData.salePrice);
    const maxDiscount = parseFloat(formData.maxDiscountAmount);

    if (!formData.purchasePrice || purchasePrice <= 0) {
      newErrors.purchasePrice = "El precio de compra debe ser mayor a 0";
    }

    if (!formData.salePrice || salePrice <= 0) {
      newErrors.salePrice = "El precio de venta debe ser mayor a 0";
    } else if (salePrice < purchasePrice) {
      newErrors.salePrice =
        "El precio de venta debe ser mayor al precio de compra";
    }

    if (!formData.maxDiscountAmount || maxDiscount < 0) {
      newErrors.maxDiscountAmount = "El descuento máximo no puede ser negativo";
    }

    if (!isEditMode) {
      const initialStock = parseInt(formData.initialStock);
      if (!formData.initialStock || initialStock < 0) {
        newErrors.initialStock = "El stock inicial no puede ser negativo";
      }
    }

    const threshold = parseInt(formData.stockAlertThreshold);
    if (!formData.stockAlertThreshold || threshold < 0) {
      newErrors.stockAlertThreshold =
        "El umbral de alerta debe ser mayor o igual a 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (isEditMode) {
        const updateData: UpdateProductData = {
          name: formData.name.trim(),
          brandId: parseInt(formData.brandId),
          laboratoryId: parseInt(formData.laboratoryId),
          categoryId: parseInt(formData.categoryId),
          supplierId: parseInt(formData.supplierId),
          presentation: formData.presentation.trim() as ProductPresentation,
          purchasePrice: parseFloat(formData.purchasePrice),
          salePrice: parseFloat(formData.salePrice),
          maxDiscountAmount: parseFloat(formData.maxDiscountAmount),
          stockAlertThreshold: parseInt(formData.stockAlertThreshold),
          isActive: formData.isActive,
        };

        await updateProduct(parseInt(id!), updateData);
      } else {
        const createData: CreateProductData = {
          name: formData.name.trim(),
          brandId: parseInt(formData.brandId),
          laboratoryId: parseInt(formData.laboratoryId),
          categoryId: parseInt(formData.categoryId),
          supplierId: parseInt(formData.supplierId),
          presentation: formData.presentation as ProductPresentation,
          purchasePrice: parseFloat(formData.purchasePrice),
          salePrice: parseFloat(formData.salePrice),
          maxDiscountAmount: parseFloat(formData.maxDiscountAmount),
          initialStock: parseInt(formData.initialStock),
          stockAlertThreshold: parseInt(formData.stockAlertThreshold),
          isActive: formData.isActive,
        };

        await createProduct(createData);
      }

      setSaveSuccess(true);

      setTimeout(() => {
        navigate("/products");
      }, 1000);
    } catch (error) {
      console.error("Error al guardar producto:", error);
    }
  };

  const calculateMargin = () => {
    const purchase = parseFloat(formData.purchasePrice) || 0;
    const sale = parseFloat(formData.salePrice) || 0;

    if (purchase > 0 && sale > 0) {
      const margin = ((sale - purchase) / purchase) * 100;
      return margin.toFixed(2);
    }
    return "0.00";
  };

  if (saveSuccess) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-2">
              ¡Producto {isEditMode ? "Actualizado" : "Creado"}!
            </h2>
            <p className="text-neutral-600">
              El producto ha sido guardado correctamente.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/products")}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <svg
                className="w-6 h-6 text-neutral-600"
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
              <h1 className="text-2xl font-bold text-neutral-900">
                {isEditMode ? "Editar Producto" : "Nuevo Producto"}
              </h1>
              <p className="text-neutral-600 mt-1">
                {isEditMode
                  ? "Modifica la información del producto"
                  : "Completa todos los campos para crear un nuevo producto"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit}>
          {/* Información Básica */}
          <Card className="mb-6">
            <div className="border-b border-neutral-200 pb-4 mb-6">
              <h2 className="text-lg font-semibold text-neutral-900">
                Información Básica
              </h2>
              <p className="text-sm text-neutral-600 mt-1">
                Datos principales del producto
              </p>
            </div>

            <div className="space-y-6">
              <Input
                label="Nombre del Producto"
                name="name"
                type="text"
                placeholder="Ej: Crema Hidratante Facial"
                value={formData.name}
                onChange={handleInputChange}
                error={errors.name}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="label">Marca</label>
                  <select
                    name="brandId"
                    value={formData.brandId}
                    onChange={handleInputChange}
                    className={`input ${errors.brandId ? "border-red-500" : ""}`}
                  >
                    <option value="">Selecciona una marca</option>
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                  {errors.brandId && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.brandId}
                    </p>
                  )}
                </div>

                <div>
                  <label className="label">Categoría</label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    className={`input ${errors.categoryId ? "border-red-500" : ""}`}
                  >
                    <option value="">Selecciona una categoría</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.categoryId && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.categoryId}
                    </p>
                  )}
                </div>

                <div>
                  <label className="label">Laboratorio</label>
                  <select
                    name="laboratoryId"
                    value={formData.laboratoryId}
                    onChange={handleInputChange}
                    className={`input ${errors.laboratoryId ? "border-red-500" : ""}`}
                  >
                    <option value="">Selecciona un laboratorio</option>
                    {laboratories.map((lab) => (
                      <option key={lab.id} value={lab.id}>
                        {lab.name}
                      </option>
                    ))}
                  </select>
                  {errors.laboratoryId && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.laboratoryId}
                    </p>
                  )}
                </div>

                <div>
                  <label className="label">Proveedor</label>
                  <select
                    name="supplierId"
                    value={formData.supplierId}
                    onChange={handleInputChange}
                    className={`input ${errors.supplierId ? "border-red-500" : ""}`}
                  >
                    <option value="">Selecciona un proveedor</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                  {errors.supplierId && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.supplierId}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="label">Presentación</label>
                <select
                  name="presentation"
                  value={formData.presentation}
                  onChange={handleInputChange}
                  className={`input ${errors.presentation ? "border-red-500" : ""}`}
                >
                  <option value="">Selecciona una presentación</option>
                  {Object.values(ProductPresentation).map((presentation) => (
                    <option key={presentation} value={presentation}>
                      {presentation}
                    </option>
                  ))}
                </select>
                {errors.presentation && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.presentation}
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Precios */}
          <Card className="mb-6">
            <div className="border-b border-neutral-200 pb-4 mb-6">
              <h2 className="text-lg font-semibold text-neutral-900">
                Precios
              </h2>
              <p className="text-sm text-neutral-600 mt-1">
                Define los precios de compra y venta
              </p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Precio de Compra (S/)"
                  name="purchasePrice"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.purchasePrice}
                  onChange={handleInputChange}
                  error={errors.purchasePrice}
                />

                <Input
                  label="Precio de Venta (S/)"
                  name="salePrice"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.salePrice}
                  onChange={handleInputChange}
                  error={errors.salePrice}
                />
              </div>

              {/* Indicador de margen */}
              {formData.purchasePrice && formData.salePrice && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-900">
                      Margen de Ganancia:
                    </span>
                    <span className="text-lg font-bold text-blue-600">
                      {calculateMargin()}%
                    </span>
                  </div>
                </div>
              )}

              <Input
                label="Descuento Máximo Permitido (S/)"
                name="maxDiscountAmount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.maxDiscountAmount}
                onChange={handleInputChange}
                error={errors.maxDiscountAmount}
              />
            </div>
          </Card>

          {/* Stock */}
          <Card className="mb-6">
            <div className="border-b border-neutral-200 pb-4 mb-6">
              <h2 className="text-lg font-semibold text-neutral-900">Stock</h2>
              <p className="text-sm text-neutral-600 mt-1">
                Gestiona el inventario del producto
              </p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {!isEditMode && (
                  <Input
                    label="Stock Inicial"
                    name="initialStock"
                    type="number"
                    placeholder="0"
                    value={formData.initialStock}
                    onChange={handleInputChange}
                    error={errors.initialStock}
                  />
                )}

                <Input
                  label="Umbral de Alerta de Stock"
                  name="stockAlertThreshold"
                  type="number"
                  placeholder="10"
                  value={formData.stockAlertThreshold}
                  onChange={handleInputChange}
                  error={errors.stockAlertThreshold}
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <svg
                    className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
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
                  <div>
                    <p className="text-sm font-medium text-amber-900">
                      Sobre el umbral de alerta
                    </p>
                    <p className="text-sm text-amber-700 mt-1">
                      Recibirás una alerta cuando el stock del producto caiga
                      por debajo de este número. Te ayudará a reabastecer a
                      tiempo.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Estado (solo en modo edición) */}
          {isEditMode && (
            <Card className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-neutral-900">
                    Estado del Producto
                  </h3>
                  <p className="text-sm text-neutral-600 mt-1">
                    Los productos inactivos no aparecerán en las ventas
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  <span className="ml-3 text-sm font-medium text-neutral-900">
                    {formData.isActive ? "Activo" : "Inactivo"}
                  </span>
                </label>
              </div>
            </Card>
          )}

          {/* Botones de acción */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate("/products")}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" isLoading={isLoading} className="flex-1">
              {isEditMode ? "Guardar Cambios" : "Crear Producto"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
