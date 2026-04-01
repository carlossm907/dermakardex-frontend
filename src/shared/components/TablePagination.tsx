import { PAGE_SIZE_OPTIONS, type PageSize } from "../hooks/usePagination";

interface Props {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: PageSize;
  rangeStart: number;
  rangeEnd: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: PageSize) => void;
}

export const TablePagination: React.FC<Props> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  rangeStart,
  rangeEnd,
  onPageChange,
  onPageSizeChange,
}) => {
  const getPageNumbers = (): number[] => {
    if (totalPages <= 5)
      return Array.from({ length: totalPages }, (_, i) => i + 1);

    if (currentPage <= 3) return [1, 2, 3, 4, 5];

    if (currentPage >= totalPages - 2)
      return [
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];

    return [
      currentPage - 2,
      currentPage - 1,
      currentPage,
      currentPage + 1,
      currentPage + 2,
    ];
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-neutral-200 bg-neutral-50">
      {/* LEFT */}
      <div className="flex items-center gap-3">
        <p className="text-sm text-neutral-500">
          {rangeStart}–{rangeEnd} de{" "}
          <span className="font-medium text-neutral-700">{totalItems}</span>
        </p>

        <div className="flex items-center gap-1.5">
          <span className="text-xs text-neutral-400">Mostrar</span>
          <div className="flex gap-1">
            {PAGE_SIZE_OPTIONS.map((size) => (
              <button
                key={size}
                onClick={() => onPageSizeChange(size)}
                className={`px-2.5 py-1 text-xs rounded-md border font-medium transition-colors ${
                  pageSize === size
                    ? "bg-primary-50 text-primary-700 border-primary-200"
                    : "bg-white text-neutral-500 border-neutral-200 hover:bg-neutral-100"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          {/* PREV */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-1.5 rounded-md border border-neutral-200 bg-white text-neutral-500 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* FIRST  */}
          {pageNumbers[0] > 1 && (
            <>
              <button
                onClick={() => onPageChange(1)}
                className="min-w-[32px] h-8 px-2 text-xs rounded-md border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-100 transition-colors"
              >
                1
              </button>

              {pageNumbers[0] > 2 && (
                <span className="px-1 text-neutral-400 text-sm">…</span>
              )}
            </>
          )}

          {/* NUMBERS */}
          {pageNumbers.map((p) => (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`min-w-[32px] h-8 px-2 text-xs rounded-md border font-medium transition-colors ${
                p === currentPage
                  ? "bg-primary-600 text-white border-primary-600"
                  : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-100"
              }`}
            >
              {p}
            </button>
          ))}

          {/* ... + LAST */}
          {pageNumbers[pageNumbers.length - 1] < totalPages && (
            <>
              {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                <span className="px-1 text-neutral-400 text-sm">…</span>
              )}

              <button
                onClick={() => onPageChange(totalPages)}
                className="min-w-[32px] h-8 px-2 text-xs rounded-md border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-100 transition-colors"
              >
                {totalPages}
              </button>
            </>
          )}

          {/* NEXT */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-md border border-neutral-200 bg-white text-neutral-500 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};
