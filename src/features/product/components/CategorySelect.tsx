import { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronRight, ChevronDown, Check, ChevronsUpDown } from 'lucide-react';
import type { Category } from '@/types/category.types';

// ==========================================
// Types & Interfaces
// ==========================================

interface CategorySelectProps {
  categories: Category[];
  value: string | undefined;
  onChange: (value: string) => void;
}

// ==========================================
// Constants & Helpers
// ==========================================

/**
 * Map levels to specific text styles to create visual hierarchy.
 */
const textColorByLevel: Record<number, string> = {
  0: 'text-[#1A1A1A] font-medium',
  1: 'text-gray-600',
  2: 'text-gray-400',
};

/**
 * Flattens a hierarchical category tree into a sorted list
 * using a pre-order traversal (Parent -> Children).
 */
function buildOrderedList(categories: Category[]): Category[] {
  const byParent = new Map<string | null, Category[]>();

  categories.forEach((cat) => {
    const parentKey = cat.parent ?? null;
    if (!byParent.has(parentKey)) byParent.set(parentKey, []);
    byParent.get(parentKey)!.push(cat);
  });

  byParent.forEach((group) => {
    group.sort(
      (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name)
    );
  });

  const result: Category[] = [];

  function traverse(parentId: string | null) {
    const children = byParent.get(parentId) ?? [];
    for (const cat of children) {
      result.push(cat);
      traverse(cat._id);
    }
  }

  traverse(null);
  return result;
}

// ==========================================
// Component
// ==========================================

function CategorySelect({ categories, value, onChange }: CategorySelectProps) {
  // --- Local State ---
  const [isOpen, setIsOpen] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  // --- Derived State (Memoized for Performance) ---

  const activeCategories = useMemo(
    () => categories.filter((c) => c.isActive),
    [categories]
  );

  const orderedCategories = useMemo(
    () => buildOrderedList(activeCategories),
    [activeCategories]
  );

  /**
   * Determine which parents need to be forced open so that
   * the currently selected category is visible to the user.
   */
  const forceVisibleIds = useMemo(() => {
    const ancestors = new Set<string>();
    let current = activeCategories.find((c) => c._id === value);
    while (current?.parent) {
      ancestors.add(current.parent);
      current = activeCategories.find((c) => c._id === current!.parent);
    }
    return ancestors;
  }, [activeCategories, value]);

  /**
   * Filter the list to only show nodes that are:
   * 1. Top-level (level 0)
   * 2. Children of an expanded node
   * 3. Children of an ancestor node (to keep the path to selected value visible)
   */
  const visibleCategories = useMemo(() => {
    return orderedCategories.filter((cat) => {
      if (cat.level === 0) return true;
      return cat.parent
        ? expandedIds.has(cat.parent) || forceVisibleIds.has(cat.parent)
        : true;
    });
  }, [orderedCategories, expandedIds, forceVisibleIds]);

  const selectedCategory = useMemo(
    () => activeCategories.find((c) => c._id === value),
    [activeCategories, value]
  );

  // --- Effects ---

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- Handlers ---

  const toggleExpand = (e: React.MouseEvent, catId: string) => {
    e.stopPropagation();
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  };

  const handleSelect = (catId: string) => {
    onChange(catId);
    setIsOpen(false);
  };

  const hasChildren = (catId: string) =>
    activeCategories.some((c) => c.parent === catId);

  // --- Render ---
  return (
    <div ref={containerRef} className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-9 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 text-sm hover:border-gray-300 focus:border-[#0047AB] focus:outline-none"
      >
        <span className={selectedCategory ? 'text-[#1A1A1A]' : 'text-gray-400'}>
          {selectedCategory
            ? selectedCategory.name
            : value
              ? '⚠️ Danh mục không còn tồn tại — vui lòng chọn lại'
              : 'Chọn danh mục'}
        </span>
        <ChevronsUpDown size={14} className="shrink-0 text-gray-400" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-72 overflow-y-auto rounded-md border border-gray-100 bg-white py-1 shadow-lg">
          {visibleCategories.length === 0 && (
            <p className="px-3 py-2 text-sm text-gray-400">Không có danh mục</p>
          )}

          {visibleCategories.map((cat) => {
            const catHasChildren = hasChildren(cat._id);
            const isExpanded =
              expandedIds.has(cat._id) || forceVisibleIds.has(cat._id);
            const isSelected = cat._id === value;

            return (
              <div
                key={cat._id}
                onClick={() => handleSelect(cat._id)}
                className={`flex cursor-pointer items-center gap-1.5 px-2 py-1.5 hover:bg-gray-50 ${
                  isSelected ? 'bg-blue-50' : ''
                }`}
                // Indent based on category depth (level)
                style={{ paddingLeft: `${8 + cat.level * 16}px` }}
              >
                {/* Expand/Collapse Toggle */}
                <span className="flex w-4 shrink-0 items-center justify-center">
                  {catHasChildren && (
                    <button
                      type="button"
                      onClick={(e) => toggleExpand(e, cat._id)}
                      className="text-gray-400 hover:text-[#0047AB]"
                    >
                      {isExpanded ? (
                        <ChevronDown size={12} />
                      ) : (
                        <ChevronRight size={12} />
                      )}
                    </button>
                  )}
                </span>

                {/* Category Icon */}
                {cat.image?.url ? (
                  <img
                    src={cat.image.url}
                    alt=""
                    className="h-5 w-5 shrink-0 rounded object-cover"
                  />
                ) : (
                  <span className="h-5 w-5 shrink-0 rounded bg-gray-100" />
                )}

                {/* Label */}
                <span
                  className={`flex-1 text-sm ${textColorByLevel[cat.level] ?? 'text-gray-400'}`}
                >
                  {cat.name}
                </span>

                {/* Selected Indicator */}
                {isSelected && (
                  <Check size={14} className="shrink-0 text-[#0047AB]" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default CategorySelect;
