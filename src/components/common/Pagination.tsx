import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PaginationResult } from "@/types/product.types";

interface PaginationProps {
  /** The pagination state containing current page and limits */
  pagination: PaginationResult;
  /** Callback fired when a page number is clicked */
  onPageChange: (page: number) => void;
}

/**
 * Pagination Component
 * 
 * Provides navigation controls to move between data pages.
 * Implements a "sliding window" approach to handle large sets of pages
 * by showing truncated indices (e.g., 1 ... 5 6 7 ... 10).
 */
function Pagination({ pagination, onPageChange }: PaginationProps) {
  const { page, totalPages, hasNext, hasPrev } = pagination;

  // Do not render anything if there is only one page or no pages
  if (totalPages <= 1) return null;

  /**
   * Generates the array of page numbers or "..." separators.
   * Handles edge cases for start, middle, and end of the range.
   */
  const getPageNumbers = (): (number | "...")[] => {
    // Case 1: Minimal pages, show all
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Case 2: Near the beginning
    if (page <= 3) {
      return [1, 2, 3, 4, "...", totalPages];
    }

    // Case 3: Near the end
    if (page >= totalPages - 2) {
      return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    // Case 4: Middle section
    return [1, "...", page - 1, page, page + 1, "...", totalPages];
  };

  return (
    <nav className="flex items-center justify-center gap-1" aria-label="Pagination">
      {/* Previous Page Control */}
      <Button
        variant="outline"
        size="icon"
        disabled={!hasPrev}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft size={16} />
      </Button>

      {/* Page Number List */}
      {getPageNumbers().map((p, idx) =>
        p === "..." ? (
          <span key={`dots-${idx}`} className="px-2 text-gray-400">
            …
          </span>
        ) : (
          <Button
            key={p}
            variant={p === page ? "default" : "outline"}
            size="icon"
            onClick={() => onPageChange(p as number)}
            className={p === page ? "bg-[#0047AB] hover:bg-[#003a8c]" : ""}
          >
            {p}
          </Button>
        )
      )}

      {/* Next Page Control */}
      <Button
        variant="outline"
        size="icon"
        disabled={!hasNext}
        onClick={() => onPageChange(page + 1)}
      >
        <ChevronRight size={16} />
      </Button>
    </nav>
  );
}

export default Pagination;