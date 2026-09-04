import { Skeleton } from '@/components/ui/skeleton';

/**
 * Shared grid classes for product card grids across the home page
 * (TrendingProducts, ProductSection). Kept in one place so the loading,
 * success and empty states always agree on the same responsive column
 * counts and can't drift apart and cause a layout shift when swapping
 * between them.
 */
export const PRODUCT_GRID_CLASSES =
  'grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5';

interface ProductGridSkeletonProps {
  /** Number of skeleton cards to render; should match the real result limit. */
  count: number;
  /** Screen-reader status text announced while loading. */
  label: string;
}

/**
 * Loading placeholder for a product grid. Mirrors SearchResultCard's
 * reserved dimensions (2-line title, price line, rating row) so the grid's
 * height doesn't change once real cards arrive, and exposes a single
 * concise status to assistive tech since the decorative skeleton grid
 * itself is hidden from it.
 */
export function ProductGridSkeleton({ count, label }: ProductGridSkeletonProps) {
  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">{label}</span>
      <div aria-hidden="true" className={PRODUCT_GRID_CLASSES}>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-lg border border-gray-100"
          >
            <Skeleton className="aspect-square rounded-none" />
            <div className="p-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="mt-1.5 h-6 w-1/2" />
              <Skeleton className="mt-1 h-4 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface ProductGridEmptyProps {
  message: string;
}

/**
 * Empty/error placeholder for a product grid. Renders a modest box instead
 * of nothing so the section doesn't collapse from the full skeleton grid
 * straight to zero height.
 */
export function ProductGridEmpty({ message }: ProductGridEmptyProps) {
  return (
    <div className="flex min-h-48 items-center justify-center rounded-lg border border-dashed border-gray-200 text-sm text-gray-500">
      {message}
    </div>
  );
}
