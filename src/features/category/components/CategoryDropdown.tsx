import { useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';

// Types & Constants
import type { Category } from '@/types/category.types';
import { buildCategoryUrl } from '@/constants/routes';

interface CategoryDropdownProps {
  /** The category object containing sub-categories */
  category: Category;
  /** Controls visibility of the dropdown */
  isOpen: boolean;
  /** The DOM element used to calculate the absolute position of the dropdown */
  anchorEl: HTMLElement | null;
}

/**
 * CategoryDropdown Component
 * Renders a floating dropdown menu positioned relative to an anchor element.
 * Uses React Portals to break out of parent stacking contexts.
 */
function CategoryDropdown({
  category,
  isOpen,
  anchorEl,
}: CategoryDropdownProps) {
  // Filter active children once on render
  const children = category.children?.filter((c) => c.isActive) ?? [];

  // State to track exact coordinates for absolute positioning
  const [position, setPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  /**
   * useLayoutEffect ensures the position calculation runs synchronously
   * after DOM mutations but before the browser paints. This prevents
   * visual "flickering" where the dropdown might appear at (0,0) before jumping.
   */
  useLayoutEffect(() => {
    if (isOpen && anchorEl) {
      const rect = anchorEl.getBoundingClientRect();

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPosition({ top: rect.bottom, left: rect.left });
    }
  }, [isOpen, anchorEl]);

  // Early return if component should not be visible or data is incomplete
  if (!isOpen || children.length === 0 || !position) return null;

  /**
   * Rendering via createPortal:
   * By injecting the dropdown into 'document.body', we ensure the element
   * is not clipped by parent containers with 'overflow: hidden' or 'z-index' constraints.
   */
  return createPortal(
    <div
      className="fixed z-50 w-56 rounded-md border border-gray-100 bg-white py-2 shadow-lg"
      style={{ top: position.top, left: position.left }}
    >
      {/* Sub-category list */}
      {children.map((child) => (
        <Link
          key={child._id}
          to={buildCategoryUrl(child.slug)}
          className="block px-4 py-2 text-sm text-[#1A1A1A] hover:bg-gray-50 hover:text-[#0047AB]"
        >
          {child.name}
        </Link>
      ))}

      {/* Footer link to main category */}
      <div className="mt-1 border-t border-gray-100 pt-1">
        <Link
          to={buildCategoryUrl(category.slug)}
          className="block px-4 py-2 text-sm font-medium text-[#0047AB] hover:bg-gray-50"
        >
          Xem tất cả {category.name} →
        </Link>
      </div>
    </div>,
    document.body
  );
}

export default CategoryDropdown;
