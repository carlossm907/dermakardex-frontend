import type { Product } from "@/modules/products/domain/models/product.model";
import type { StockReportScope } from "@/modules/products/domain/models/stock-report.model";
import { useState } from "react";
import { StockReportProductSearch } from "./StockReportProductSearch";

interface StockReportProductSelectorProps {
  scope: StockReportScope;
  products: Product[];
  selectedProductId: number | null;
  selectedProductIds: number[];
  onSelectSingle: (id: number | null) => void;
  onToggleMultiple: (id: number) => void;
}

export const StockReportProductSelector: React.FC<
  StockReportProductSelectorProps
> = ({
  scope,
  products,
  selectedProductId,
  selectedProductIds,
  onSelectSingle,
  onToggleMultiple,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  if (scope === "all" || scope === "affected") return null;

  const filtered = searchTerm.trim()
    ? products.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : products;

  if (scope === "single") {
    return (
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">
          Producto
        </p>

        <div className="space-y-2">
          <StockReportProductSearch onSearch={setSearchTerm} />

          <div className="border border-neutral-200 rounded-lg max-h-48 overflow-y-auto bg-white divide-y divide-neutral-100">
            {filtered.length === 0 ? (
              <p className="text-sm text-neutral-400 text-center py-4">
                No se encontraron productos
              </p>
            ) : (
              filtered.map((p) => {
                const isSelected = selectedProductId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onSelectSingle(isSelected ? null : p.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-neutral-50 ${
                      isSelected ? "bg-primary-50" : ""
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                        isSelected
                          ? "border-primary-600 bg-primary-600"
                          : "border-neutral-300"
                      }`}
                    >
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white block" />
                      )}
                    </span>
                    <span
                      className={`text-sm ${
                        isSelected
                          ? "text-primary-700 font-medium"
                          : "text-neutral-700"
                      }`}
                    >
                      {p.name}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {selectedProductId && (
            <p className="text-xs text-primary-600">
              Seleccionado:{" "}
              <span className="font-medium">
                {products.find((p) => p.id === selectedProductId)?.name}
              </span>
            </p>
          )}
        </div>
      </div>
    );
  }

  // multiple
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-2">
        Productos{" "}
        {selectedProductIds.length > 0 && (
          <span className="ml-1 text-primary-600 normal-case font-normal">
            ({selectedProductIds.length} seleccionados)
          </span>
        )}
      </p>

      <div className="space-y-2">
        <StockReportProductSearch onSearch={setSearchTerm} />

        <div className="border border-neutral-200 rounded-lg max-h-48 overflow-y-auto bg-white divide-y divide-neutral-100">
          {filtered.length === 0 ? (
            <p className="text-sm text-neutral-400 text-center py-4">
              No se encontraron productos
            </p>
          ) : (
            filtered.map((p) => {
              const checked = selectedProductIds.includes(p.id);
              return (
                <label
                  key={p.id}
                  className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors hover:bg-neutral-50 ${
                    checked ? "bg-primary-50" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggleMultiple(p.id)}
                    className="accent-primary-600 w-4 h-4 rounded flex-shrink-0"
                  />
                  <span
                    className={`text-sm ${
                      checked
                        ? "text-primary-700 font-medium"
                        : "text-neutral-700"
                    }`}
                  >
                    {p.name}
                  </span>
                </label>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
