"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface PaginationProps {
  totalPages: number;
  page?: number;
  onChange?: (page: number) => void;
}

export default function Pagination({
  totalPages,
  page,
  onChange,
}: PaginationProps) {
  const [internalPage, setInternalPage] = useState(1);
  const current = page ?? internalPage;

  const goTo = (target: number) => {
    const next = Math.min(Math.max(1, target), totalPages);
    if (page === undefined) setInternalPage(next);
    onChange?.(next);
  };

  return (
    <div className="mt-10 flex justify-center">
      <div className="join">
        <button
          className={`btn join-item btn-sm ${current <= 1 ? "btn-disabled" : ""}`}
          tabIndex={current <= 1 ? -1 : 0}
          role="button"
          aria-disabled={current <= 1}
          aria-label="Página anterior"
          onClick={() => goTo(current - 1)}
        >
          <ChevronLeft className="size-4" strokeWidth={2.5} />
        </button>
        {Array.from({ length: totalPages }, (_, index) => index + 1).map(
          (pageNumber) => (
            <button
              key={pageNumber}
              className={`btn join-item btn-sm ${
                pageNumber === current ? "btn-active" : ""
              }`}
              aria-label={`Página ${pageNumber}`}
              onClick={() => goTo(pageNumber)}
            >
              {pageNumber}
            </button>
          )
        )}
        <button
          className={`btn join-item btn-sm ${
            current >= totalPages ? "btn-disabled" : ""
          }`}
          tabIndex={current >= totalPages ? -1 : 0}
          role="button"
          aria-disabled={current >= totalPages}
          aria-label="Página siguiente"
          onClick={() => goTo(current + 1)}
        >
          <ChevronRight className="size-4" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
