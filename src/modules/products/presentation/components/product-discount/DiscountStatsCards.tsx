import { Card } from "@/shared/components/ui/Card";

interface DiscountStatsCardsProps {
  withDiscountCount: number;
  withoutDiscountCount: number;
  totalActiveCount: number;
}

export const DiscountStatsCards: React.FC<DiscountStatsCardsProps> = ({
  withDiscountCount,
  withoutDiscountCount,
  totalActiveCount,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card className="bg-gradient-to-br from-red-50 to-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-600">Con Descuento</p>
            <p className="text-2xl font-bold text-red-600 mt-1">
              {withDiscountCount}
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

      <Card className="bg-gradient-to-br from-blue-50 to-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-600">Sin Descuento</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {withoutDiscountCount}
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

      <Card className="bg-gradient-to-br from-green-50 to-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-600">Total Productos</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {totalActiveCount}
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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
      </Card>
    </div>
  );
};
