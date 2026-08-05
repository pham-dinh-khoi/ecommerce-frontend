// =============================================================================
// Imports
// =============================================================================

import { useState, useRef, useEffect } from 'react';
import { ChevronRight, ChevronDown, Check, ChevronsUpDown } from 'lucide-react';
import type { Category } from '@/types/category.types';

// =============================================================================
// Types & Constants
// =============================================================================

interface ParentCategorySelectProps {
  categories: Category[];
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  /** ID to exclude from the list, usually to prevent assigning a category as its own parent. */
  excludeId?: string;
}

/**
 * Visual hierarchy mapping:
 * Level 0: Root categories (Bold/Dark)
 * Level 1: Sub-categories (Gray)
 * Level 2+: Deeper sub-categories (Faded)
 */
const textColorByLevel: Record<number, string> = {
  0: 'text-[#1A1A1A] font-medium',
  1: 'text-gray-600',
  2: 'text-gray-400',
};

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Transforms a flat list of categories into a linear, hierarchical, ordered list.
 *
 * Logic:
 * 1. Groups items by parent ID using a Map.
 * 2. Sorts siblings based on sortOrder and alphabetical name.
 * 3. Uses Depth-First Search (DFS) to flatten the tree into a displayable sequence.
 */
function buildOrderedList(categories: Category[]): Category[] {
  const byParent = new Map<string | null, Category[]>();

  // Group items by parent
  categories.forEach((cat) => {
    const parentKey = cat.parent ?? null;
    if (!byParent.has(parentKey)) byParent.set(parentKey, []);
    byParent.get(parentKey)!.push(cat);
  });

  // Sort siblings within each group
  byParent.forEach((group) => {
    group.sort(
      (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name)
    );
  });

  const result: Category[] = [];

  // Recursive traversal to order the list correctly for UI rendering
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

// =============================================================================
// Main Component
// =============================================================================

function ParentCategorySelect({
  categories,
  value,
  onChange,
  excludeId,
}: ParentCategorySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter valid parent options:
  // 1. Prevents nesting deeper than allowed (level < 2).
  // 2. Prevents a category from being its own parent.
  // 3. Prevents circular dependencies (cannot set a descendant as a parent).
  const validParents = categories.filter((cat) => {
    if (cat.level >= 2) return false;
    if (excludeId && cat._id === excludeId) return false;
    if (excludeId && cat.ancestors.some((a) => a._id === excludeId))
      return false;
    return true;
  });

  const orderedCategories = buildOrderedList(validParents);

  const hasChildren = (catId: string) =>
    validParents.some((c) => c.parent === catId);

  /**
   * Helper to find all ancestors of a category.
   * Required to auto-expand the tree if a pre-selected category is nested deep.
   */
  const getAncestorIds = (catId: string | undefined): Set<string> => {
    const result = new Set<string>();
    let current = validParents.find((c) => c._id === catId);
    while (current?.parent) {
      result.add(current.parent);
      current = validParents.find((c) => c._id === current!.parent);
    }
    return result;
  };

  // IDs that must be expanded so the current 'value' is visible to the user
  const forceVisibleIds = getAncestorIds(value);

  // Filter list to show only visible (expanded) nodes
  const visibleCategories = orderedCategories.filter((cat) => {
    if (cat.level === 0) return true;
    return cat.parent
      ? expandedIds.has(cat.parent) || forceVisibleIds.has(cat.parent)
      : true;
  });

  const selectedCategory = validParents.find((c) => c._id === value);

  // Click-outside logic to close dropdown
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

  const toggleExpand = (e: React.MouseEvent, catId: string) => {
    e.stopPropagation();
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  };

  const handleSelect = (catId: string | undefined) => {
    onChange(catId);
    setIsOpen(false);
  };

  // ===========================================================================
  // Render
  // ===========================================================================

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
            : '— Không có (danh mục gốc) —'}
        </span>
        <ChevronsUpDown size={14} className="shrink-0 text-gray-400" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-72 overflow-y-auto rounded-md border border-gray-100 bg-white py-1 shadow-lg">
          {/* 'None' Option */}
          <div
            onClick={() => handleSelect(undefined)}
            className={`flex cursor-pointer items-center gap-1.5 px-3 py-1.5 text-sm hover:bg-gray-50 ${
              !value ? 'bg-blue-50' : ''
            }`}
          >
            <span className="flex-1 text-gray-500">
              — Không có (danh mục gốc) —
            </span>
            {!value && <Check size={14} className="shrink-0 text-[#0047AB]" />}
          </div>

          {/* Empty State */}
          {visibleCategories.length === 0 && (
            <p className="px-3 py-2 text-sm text-gray-400">
              Không có danh mục phù hợp
            </p>
          )}

          {/* Category List */}
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
                style={{ paddingLeft: `${8 + cat.level * 16}px` }}
              >
                {/* Expand/Collapse Icon */}
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

                {/* Category Image Preview */}
                {cat.image?.url ? (
                  <img
                    src={cat.image.url}
                    alt=""
                    className="h-5 w-5 shrink-0 rounded object-cover"
                  />
                ) : (
                  <span className="h-5 w-5 shrink-0 rounded bg-gray-100" />
                )}

                {/* Category Name */}
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

export default ParentCategorySelect;
