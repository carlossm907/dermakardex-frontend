import { useMemo, useState } from "react";

export interface PaginationOptions {
  initialPage?: number;
  initialPageSize?: PageSize;
}

export const PAGE_SIZE_OPTIONS = [10, 15, 20, 30] as const;
export type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];

export const usePagination = <T>(items: T[], options?: PaginationOptions) => {
  const [currentPage, setCurrentPage] = useState(options?.initialPage ?? 1);
  const [pageSize, setPageSize] = useState<PageSize>(
    options?.initialPageSize ?? 10,
  );

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  if (currentPage > totalPages) {
    setCurrentPage(1);
  }

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, currentPage, pageSize]);

  const rangeStart = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, totalItems);

  const changePage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const changePageSize = (size: PageSize) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  return {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedItems,
    rangeStart,
    rangeEnd,
    changePage,
    changePageSize,
  };
};
