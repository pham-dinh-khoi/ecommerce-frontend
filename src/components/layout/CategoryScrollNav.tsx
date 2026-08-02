import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

// Constants & Types
import { buildCategoryUrl } from '@/constants/routes';
import type { Category } from '@/types/category.types';

// Components
import CategoryDropdown from '@/features/category/components/CategoryDropdown';

interface CategoryScrollNavProps {
  categories: Category[];
}

const SCROLL_AMOUNT = 300;

/**
 * CategoryScrollNav Component
 * 
 * A horizontal scrollable navigation bar that adjusts scroll controls based on
 * the container's scroll position. It features hover-based category dropdowns.
 */
function CategoryScrollNav({ categories }: CategoryScrollNavProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  /**
   * Updates state based on the current scroll position relative to the container width.
   * Uses a small threshold (4px) to prevent flickering at the edges.
   */
  const checkScrollability = () => {
    const el = scrollRef.current;
    if (!el) return;
    
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    checkScrollability();
    const el = scrollRef.current;
    if (!el) return;

    el.addEventListener('scroll', checkScrollability);
    window.addEventListener('resize', checkScrollability);
    
    return () => {
      el.removeEventListener('scroll', checkScrollability);
      window.removeEventListener('resize', checkScrollability);
    };
  }, [categories]);

  const scroll = (direction: 'left' | 'right') => {
    scrollRef.current?.scrollBy({
      left: direction === 'left' ? -SCROLL_AMOUNT : SCROLL_AMOUNT,
      behavior: 'smooth',
    });
  };

  return (
    <div className="relative flex items-center">
      {/* Scroll Left Button */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scroll('left')}
          className="absolute left-0 z-10 flex h-full w-10 items-center justify-center bg-linear-to from-white via-white to-transparent text-gray-600 hover:text-[#0047AB]"
          aria-label="Scroll left"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-gray-200">
            <ChevronLeft size={18} />
          </span>
        </button>
      )}

      {/* Categories Scrollable Container */}
      <div
        ref={scrollRef}
        className="scrollbar-hide flex gap-6 overflow-x-auto scroll-smooth"
      >
        {categories.map((cat) => (
          <CategoryNavItem
            key={cat._id}
            category={cat}
            isHovered={hoveredId === cat._id}
            onMouseEnter={() => setHoveredId(cat._id)}
            onMouseLeave={() => setHoveredId(null)}
          />
        ))}
      </div>

      {/* Scroll Right Button */}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => scroll('right')}
          className="absolute right-0 z-10 flex h-full w-10 items-center justify-center bg-linear-to from-white via-white to-transparent text-gray-600 hover:text-[#0047AB]"
          aria-label="Scroll right"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-gray-200">
            <ChevronRight size={18} />
          </span>
        </button>
      )}
    </div>
  );
}

interface CategoryNavItemProps {
  category: Category;
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

/**
 * CategoryNavItem Component
 * 
 * Individual navigation item. Uses a callback ref to capture its DOM node,
 * which is passed to the CategoryDropdown for proper positioning.
 */
function CategoryNavItem({
  category,
  isHovered,
  onMouseEnter,
  onMouseLeave,
}: CategoryNavItemProps) {
  // Callback ref: React calls this function when the element mounts
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);

  return (
    <div
      ref={setAnchorEl}
      className="relative shrink-0"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Link
        to={buildCategoryUrl(category.slug)}
        className="flex items-center gap-1 whitespace-nowrap py-3 text-sm font-medium text-[#1A1A1A] hover:text-[#0047AB]"
      >
        {category.name}
        {category.children && category.children.length > 0 && (
          <ChevronDown size={14} />
        )}
      </Link>
      
      <CategoryDropdown
        category={category}
        isOpen={isHovered}
        anchorEl={anchorEl}
      />
    </div>
  );
}

export default CategoryScrollNav;