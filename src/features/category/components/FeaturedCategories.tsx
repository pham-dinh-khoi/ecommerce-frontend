import { useEffect } from 'react';
import { Link } from 'react-router-dom';

import { Skeleton } from '@/components/ui/skeleton';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchCategoryTree } from '../categorySlice';

const CATEGORY_GRID_CLASSES =
  'mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6';

/** Matches the number of categories the section actually renders (tree.slice(0, 6)). */
const SKELETON_COUNT = 6;

/**
 * FeaturedCategories
 *
 * Renders the home page's category shortcuts. While the category tree is
 * loading (or hasn't started fetching yet), a skeleton grid reserves the
 * same layout as the final cards so the sections below it don't jump once
 * data arrives. If the request succeeds with no categories, or fails, the
 * whole section is omitted rather than showing an empty/misleading skeleton.
 */
function FeaturedCategories() {
  const dispatch = useAppDispatch();
  const { tree, status } = useAppSelector((state) => state.category);

  // Dispatch is a no-op if a fetch is already in flight or has succeeded
  // (see the `condition` guard on fetchCategoryTree) — Header also
  // dispatches this on mount, so this just makes the component resilient
  // on its own.
  useEffect(() => {
    dispatch(fetchCategoryTree());
  }, [dispatch]);

  // Nothing meaningful to show: don't leave a permanent skeleton or invent data.
  if (status === 'failed' || (status === 'succeeded' && tree.length === 0)) {
    return null;
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <h2 className="text-xl font-bold text-[#1A1A1A]">Danh mục nổi bật</h2>

      {status === 'succeeded' ? (
        <div className={CATEGORY_GRID_CLASSES}>
          {tree.slice(0, 6).map((cat) => (
            <Link
              key={cat._id}
              to={`/category/${cat.slug}`}
              className="group flex flex-col items-center gap-2 rounded-lg border border-gray-100 p-4 text-center transition-all hover:-translate-y-0.5 hover:border-[#0047AB] hover:shadow-md"
            >
              {cat.image?.url ? (
                <img
                  src={cat.image.url}
                  alt={cat.name}
                  className="h-12 w-12 rounded-full object-cover transition-transform group-hover:scale-110"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-gray-100 transition-transform group-hover:scale-110" />
              )}
              {/* Two-line height is always reserved (min-h-10, matching the
                  skeleton) and centered so 1-line and 2-line names produce
                  the same card height. */}
              <span className="flex min-h-10 w-full items-center justify-center">
                <span className="line-clamp-2 text-center text-sm font-medium text-[#1A1A1A] group-hover:text-[#0047AB]">
                  {cat.name}
                </span>
              </span>
            </Link>
          ))}
        </div>
      ) : (
        // Loading (idle/loading): skeleton reserves the same grid, card
        // count and approximate dimensions as the final cards above.
        <div role="status" aria-live="polite" aria-busy="true">
          <span className="sr-only">Đang tải danh mục...</span>
          <div aria-hidden="true" className={CATEGORY_GRID_CLASSES}>
            {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-2 rounded-lg border border-gray-100 p-4 text-center"
              >
                <Skeleton className="h-12 w-12 rounded-full" />
                {/* Two lines reserved (min-h-10) to match real names that
                    frequently wrap, centered the same way as the real span. */}
                <div className="flex min-h-10 w-full flex-col items-center justify-center gap-1">
                  <Skeleton className="h-3.5 w-14" />
                  <Skeleton className="h-3.5 w-10" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default FeaturedCategories;
