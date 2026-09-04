/**
 * src/components/common/RouteLoadingFallback.tsx
 *
 * Restrained, accessible fallback shown while a route-level lazy chunk is
 * downloading, or while a route guard is waiting on the auth bootstrap to
 * resolve. Announced to assistive tech via role="status" without stealing
 * focus, so it never blocks or blanks the screen.
 */

function RouteLoadingFallback() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="flex min-h-[50vh] w-full items-center justify-center py-16"
    >
      <div
        aria-hidden="true"
        className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-[#0047AB]"
      />
      <span className="sr-only">Đang tải…</span>
    </div>
  );
}

export default RouteLoadingFallback;
