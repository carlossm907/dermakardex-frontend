import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";

interface DiscountBulkActionsProps {
  withDiscountCount: number;
  onApplyAll: () => void;
  onRemoveAll: () => void;
}

export const DiscountBulkActions: React.FC<DiscountBulkActionsProps> = ({
  withDiscountCount,
  onApplyAll,
  onRemoveAll,
}) => {
  return (
    <Card className="mb-6">
      <div className="flex flex-wrap gap-3">
        <Button
          variant="secondary"
          onClick={onApplyAll}
          className="flex items-center gap-1"
        >
          <svg
            className="w-5 h-5 mr-2"
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
          Aplicar Descuento a Todos
        </Button>

        {withDiscountCount > 0 && (
          <Button
            variant="secondary"
            onClick={onRemoveAll}
            className="flex items-center gap-1 text-red-600 hover:bg-red-50"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Eliminar Todos los Descuentos ({withDiscountCount})
          </Button>
        )}
      </div>
    </Card>
  );
};
