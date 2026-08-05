// =============================================================================
// Imports
// =============================================================================

// 1. External Libraries
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Trash2, Plus, ChevronRight, ChevronDown } from 'lucide-react';

// 2. UI Components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import DeleteCategoryDialog from './DeleteCategoryDialog';

// 3. Types, Constants & Utils
import type { Category } from '@/types/category.types';
import { ROUTES, buildAdminCategoryEditUrl } from '@/constants/routes';

// =============================================================================
// Helper Functions
// =============================================================================

interface CategoryTableProps {
  categories: Category[];
}

/**
 * Transforms a flat category array into a structured, ordered list.
 *
 * Logic:
 * 1. Groups categories by their 'parent' ID into a Map for O(1) lookup.
 * 2. Sorts the siblings within each parent group (by sortOrder then by name).
 * 3. Uses Depth-First Search (DFS) to flatten the tree into a display-ready sequence.
 */
function buildOrderedList(categories: Category[]): Category[] {
  const byParent = new Map<string | null, Category[]>();

  // Group items by parent
  categories.forEach((cat) => {
    const parentKey = cat.parent ?? null;
    if (!byParent.has(parentKey)) byParent.set(parentKey, []);
    byParent.get(parentKey)!.push(cat);
  });

  // Sort siblings
  byParent.forEach((group) => {
    group.sort(
      (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name)
    );
  });

  const result: Category[] = [];

  // Recursive traversal for ordering
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
// Component Definition
// =============================================================================

function CategoryTable({ categories }: CategoryTableProps) {
  // --- State ---
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Track expanded branches in the tree. By default, all are collapsed.
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // --- Derived State & Logic ---
  const orderedCategories = buildOrderedList(categories);

  /**
   * Visibility logic:
   * Only show top-level items (level 0) OR items whose parent is actively expanded.
   */
  const visibleCategories = orderedCategories.filter((cat) => {
    if (cat.level === 0) return true;
    return cat.parent ? expandedIds.has(cat.parent) : true;
  });

  const hasChildren = (catId: string) =>
    categories.some((c) => c.parent === catId);

  /**
   * Toggles the expanded/collapsed state for a specific category node.
   */
  const toggleExpand = (catId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) {
        next.delete(catId);
      } else {
        next.add(catId);
      }
      return next;
    });
  };

  const handleDeleteClick = (category: Category) => {
    setDeleteTarget(category);
    setDialogOpen(true);
  };

  // ===========================================================================
  // Render
  // ===========================================================================

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      {/* Table Header */}
      <div className="flex items-center justify-between border-b border-gray-100 p-4">
        <h2 className="font-semibold text-[#1A1A1A]">
          Danh sách danh mục ({categories.length})
        </h2>
        <Button
          render={<Link to={ROUTES.ADMIN_CATEGORY_CREATE} />}
          className="bg-[#0047AB] hover:bg-[#003a8c]"
        >
          <Plus size={16} className="mr-1" />
          Thêm danh mục
        </Button>
      </div>

      {/* Category Table */}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-left text-gray-500">
            <th className="px-4 py-3 font-medium">Tên danh mục</th>
            <th className="px-4 py-3 font-medium">Slug</th>
            <th className="px-4 py-3 font-medium">Trạng thái</th>
            <th className="px-4 py-3 font-medium">Thứ tự</th>
            <th className="px-4 py-3 text-right font-medium">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {visibleCategories.map((cat) => {
            const catHasChildren = hasChildren(cat._id);
            const isExpanded = expandedIds.has(cat._id);

            return (
              <tr
                key={cat._id}
                className="border-b border-gray-50 hover:bg-gray-50"
              >
                {/* Category Name Column (Tree View) */}
                <td className="px-4 py-3">
                  <span
                    style={{ paddingLeft: `${cat.level * 24}px` }}
                    className="flex items-center gap-2"
                  >
                    {/* Toggle Button Container */}
                    <span className="w-4 shrink-0">
                      {catHasChildren && (
                        <button
                          type="button"
                          onClick={() => toggleExpand(cat._id)}
                          className="text-gray-400 hover:text-[#0047AB]"
                        >
                          {isExpanded ? (
                            <ChevronDown size={16} />
                          ) : (
                            <ChevronRight size={16} />
                          )}
                        </button>
                      )}
                    </span>

                    {/* Image Thumbnail */}
                    {cat.image?.url && (
                      <img
                        src={cat.image.url}
                        alt={cat.name}
                        className="h-6 w-6 rounded object-cover"
                      />
                    )}

                    <span className="font-medium text-[#1A1A1A]">
                      {cat.name}
                    </span>

                    {/* Child Count Badge */}
                    {catHasChildren && (
                      <span className="text-xs text-gray-400">
                        ({categories.filter((c) => c.parent === cat._id).length}
                        )
                      </span>
                    )}
                  </span>
                </td>

                <td className="px-4 py-3 text-gray-500">{cat.slug}</td>

                {/* Status Badge */}
                <td className="px-4 py-3">
                  {cat.isActive ? (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                      Hoạt động
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="bg-gray-100 text-gray-500"
                    >
                      Đã ẩn
                    </Badge>
                  )}
                </td>

                <td className="px-4 py-3 text-gray-500">{cat.sortOrder}</td>

                {/* Action Buttons */}
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Button
                      render={<Link to={buildAdminCategoryEditUrl(cat._id)} />}
                      variant="ghost"
                      size="icon"
                    >
                      <Pencil size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(cat)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Empty State */}
      {categories.length === 0 && (
        <div className="py-16 text-center text-gray-400">
          Chưa có danh mục nào
        </div>
      )}

      {/* Confirmation Dialog */}
      <DeleteCategoryDialog
        category={deleteTarget}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}

export default CategoryTable;
