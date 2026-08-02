import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Trash2, RotateCcw, Trash } from 'lucide-react';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import ProductStatusBadge from './ProductStatusBadge';
import DeleteProductDialog from './DeleteProductDialog';
import PermanentDeleteProductDialog from './PermanentDeleteProductDialog';

import { useAppDispatch } from '@/store/hooks';
import { updateProductThunk } from '@/features/product/productSlice';
import type { ProductListItem } from '@/types/product.types';
import { buildAdminProductEditUrl } from '@/constants/routes';

// =============================================================================
// Interfaces
// =============================================================================

interface ProductTableProps {
  /** Array of products to display */
  products: ProductListItem[];
  /** Callback triggered after a successful restoration to refresh the parent list */
  onRestoreSuccess?: () => void;
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Formats a numeric price into a currency string (e.g., 100.000₫)
 */
function formatCurrency(value: number): string {
  return value.toLocaleString('vi-VN') + '₫';
}

// =============================================================================
// Component
// =============================================================================

function ProductTable({ products, onRestoreSuccess }: ProductTableProps) {
  const dispatch = useAppDispatch();

  // --- State Management ---
  // Standard deletion dialog state
  const [deleteTarget, setDeleteTarget] = useState<ProductListItem | null>(
    null
  );
  const [dialogOpen, setDialogOpen] = useState(false);

  // Permanent deletion dialog state
  const [permanentDeleteTarget, setPermanentDeleteTarget] =
    useState<ProductListItem | null>(null);
  const [permanentDialogOpen, setPermanentDialogOpen] = useState(false);

  // UI state for ongoing async actions
  const [restoringId, setRestoringId] = useState<string | null>(null);

  // --- Action Handlers ---

  const handleDeleteClick = (product: ProductListItem) => {
    setDeleteTarget(product);
    setDialogOpen(true);
  };

  const handlePermanentDeleteClick = (product: ProductListItem) => {
    setPermanentDeleteTarget(product);
    setPermanentDialogOpen(true);
  };

  /**
   * Restores an archived product by updating its status to 'draft'.
   */
  const handleRestore = async (product: ProductListItem) => {
    setRestoringId(product._id);
    try {
      await dispatch(
        updateProductThunk({ id: product._id, payload: { status: 'draft' } })
      ).unwrap();

      toast.success(
        `Đã khôi phục sản phẩm "${product.name}" về trạng thái Nháp`
      );
      onRestoreSuccess?.();
    } catch (err) {
      if ((err as string).trim()) toast.error(err as string);
    } finally {
      setRestoringId(null);
    }
  };

  // --- Render ---

  // Handle empty state
  if (products.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white py-16 text-center text-gray-400">
        Không tìm thấy sản phẩm nào
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-left text-gray-500">
            <th className="px-4 py-3 font-medium">Sản phẩm</th>
            <th className="px-4 py-3 font-medium">Danh mục</th>
            <th className="px-4 py-3 font-medium">Giá</th>
            <th className="px-4 py-3 font-medium">Tồn kho</th>
            <th className="px-4 py-3 font-medium">Trạng thái</th>
            <th className="px-4 py-3 text-right font-medium">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => {
            // Determine primary image for display
            const primaryImage =
              p.images.find((img) => img.isPrimary) ?? p.images[0];

            // Format category name safely
            const categoryName =
              p.category && typeof p.category === 'object'
                ? p.category.name
                : '—';

            // Check if product is in archived state
            const isArchived = p.status === 'archived';

            return (
              <tr
                key={p._id}
                className="border-b border-gray-50 hover:bg-gray-50"
              >
                {/* Product Column */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-gray-100">
                      {primaryImage ? (
                        <img
                          src={primaryImage.url}
                          alt={p.name}
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div>
                      <p className="font-medium text-[#1A1A1A]">{p.name}</p>
                      <p className="text-xs text-gray-400">
                        {p.variants.length} biến thể
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-3 text-gray-500">{categoryName}</td>

                <td className="px-4 py-3 text-gray-700">
                  {p.minPrice === p.maxPrice
                    ? formatCurrency(p.minPrice)
                    : `${formatCurrency(p.minPrice)} - ${formatCurrency(p.maxPrice)}`}
                </td>

                <td className="px-4 py-3 text-gray-500">{p.totalStock}</td>

                <td className="px-4 py-3">
                  <ProductStatusBadge status={p.status} />
                </td>

                {/* Actions Column */}
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    {isArchived ? (
                      // Actions for Archived Products: Restore & Permanent Delete
                      <>
                        <button
                          type="button"
                          onClick={() => handleRestore(p)}
                          disabled={restoringId === p._id}
                          className="flex items-center gap-1 rounded-md px-2 py-1 text-[#0047AB] hover:bg-blue-50 disabled:opacity-50"
                          title="Khôi phục sản phẩm"
                        >
                          <RotateCcw size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handlePermanentDeleteClick(p)}
                          className="flex items-center gap-1 rounded-md px-2 py-1 text-red-600 hover:bg-red-50"
                          title="Xóa vĩnh viễn"
                        >
                          <Trash size={16} />
                        </button>
                      </>
                    ) : (
                      // Actions for Standard Products: Edit & Archive
                      <>
                        <Link
                          to={buildAdminProductEditUrl(p._id)}
                          className={cn(
                            buttonVariants({ variant: 'ghost', size: 'icon' })
                          )}
                        >
                          <Pencil size={16} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(p)}
                          className="rounded-md p-2 text-red-500 hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Dialogs */}
      <DeleteProductDialog
        product={deleteTarget}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />

      <PermanentDeleteProductDialog
        product={permanentDeleteTarget}
        open={permanentDialogOpen}
        onOpenChange={setPermanentDialogOpen}
      />
    </div>
  );
}

export default ProductTable;
