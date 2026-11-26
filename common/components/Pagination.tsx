"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface PaginationProps {
  totalPages: number;
  page?: number;
  onChange?: (page: number) => void;
  getHref?: (page: number) => string;
}

export default function Pagination({
  totalPages,
  page,
  onChange,
  getHref,
}: PaginationProps) {
  const [internalPage, setInternalPage] = useState(1);
  const current = page ?? internalPage;
  const previousDisabled = current <= 1;
  const nextDisabled = current >= totalPages;

  const goTo = (target: number) => {
    const next = Math.min(Math.max(1, target), totalPages);
    if (page === undefined) setInternalPage(next);
    onChange?.(next);
  };

  const buttonClass = (disabled: boolean, active = false) =>
    `btn join-item btn-sm ${disabled ? "btn-disabled" : ""} ${active ? "btn-active" : ""}`.trim();

  const renderPrevious = () => {
    const className = buttonClass(previousDisabled);
    const content = <ChevronLeft className="size-4" strokeWidth={2.5} />;
    if (previousDisabled) {
      return (
        <button
          type="button"
          className={className}
          tabIndex={-1}
          aria-disabled
          aria-label="Página anterior"
          disabled
        >
          {content}
        </button>
      );
    }
    if (getHref) {
      return (
        <Link
          href={getHref(current - 1)}
          className={className}
          aria-label="Página anterior"
        >
          {content}
        </Link>
      );
    }
    return (
      <button
        type="button"
        className={className}
        aria-label="Página anterior"
        onClick={() => goTo(current - 1)}
      >
        {content}
      </button>
    );
  };

  const renderNext = () => {
    const className = buttonClass(nextDisabled);
    const content = <ChevronRight className="size-4" strokeWidth={2.5} />;
    if (nextDisabled) {
      return (
        <button
          type="button"
          className={className}
          tabIndex={-1}
          aria-disabled
          aria-label="Página siguiente"
          disabled
        >
          {content}
        </button>
      );
    }
    if (getHref) {
      return (
        <Link
          href={getHref(current + 1)}
          className={className}
          aria-label="Página siguiente"
        >
          {content}
        </Link>
      );
    }
    return (
      <button
        type="button"
        className={className}
        aria-label="Página siguiente"
        onClick={() => goTo(current + 1)}
      >
        {content}
      </button>
    );
  };

  return (
    <div className="mt-10 flex justify-center">
      <div className="join">
        {renderPrevious()}
        {Array.from({ length: totalPages }, (_, index) => index + 1).map(
          (pageNumber) => {
            const active = pageNumber === current;
            const className = buttonClass(false, active);
            const label = `Página ${pageNumber}`;
            return getHref ? (
              <Link
                key={pageNumber}
                href={getHref(pageNumber)}
                className={className}
                aria-label={label}
                aria-current={active ? "page" : undefined}
              >
                {pageNumber}
              </Link>
            ) : (
              <button
                key={pageNumber}
                type="button"
                className={className}
                aria-label={label}
                aria-current={active ? "page" : undefined}
                onClick={() => goTo(pageNumber)}
              >
                {pageNumber}
              </button>
            );
          }
        )}
        {renderNext()}
      </div>
    </div>
  );
}
