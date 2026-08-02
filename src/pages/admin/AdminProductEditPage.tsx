/**
 * AdminProductEditPage.tsx
 *
 * This page serves as the editor interface for a specific product.
 * It manages product information, image uploads, and variant administration.
 */

// --- React & Core Hooks ---
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

// --- External Libraries ---
import { toast } from 'sonner';

// --- Components (Layout & Features) ---
import AdminLayout from '@/components/layout/AdminLayout';
import ProductEditForm from '@/features/product/components/ProductEditForm';
import ProductImageManager from '@/features/product/components/ProductImageManager';
import VariantList from '@/features/product/components/VariantList';
import VariantForm from '@/features/product/components/VariantForm';
import { Button } from '@/components/ui/button';

// --- State Management (Redux) ---
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchProductById,
  addVariantThunk,
  deleteVariantThunk,
  clearCurrentProduct,
} from '@/features/product/productSlice';
import { fetchAllCategoriesFlat } from '@/features/category/categorySlice';

// --- Types ---
import type { CreateVariantPayload } from '@/types/product.types';

function AdminProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { current: product, currentStatus } = useAppSelector(
    (state) => state.product
  );

  // --- Local UI State ---
  const [showVariantForm, setShowVariantForm] = useState<boolean>(false);
  const [isSubmittingVariant, setIsSubmittingVariant] =
    useState<boolean>(false);
  const [deletingVariantId, setDeletingVariantId] = useState<string | null>(
    null
  );

  /**
   * Fetch initial data on mount.
   * Cleans up the state when unmounting to ensure next loads are fresh.
   */
  useEffect(() => {
    dispatch(fetchAllCategoriesFlat());
    if (id) dispatch(fetchProductById(id));

    return () => {
      dispatch(clearCurrentProduct());
    };
  }, [id, dispatch]);

  /**
   * Handles adding a new variant.
   * .unwrap() is used to catch rejected promise errors from the thunk.
   */
  const handleAddVariant = async (payload: CreateVariantPayload) => {
    if (!id) return;
    setIsSubmittingVariant(true);
    try {
      await dispatch(addVariantThunk({ productId: id, payload })).unwrap();
      toast.success('Thêm biến thể thành công');
      setShowVariantForm(false);
    } catch (err) {
      if ((err as string).trim()) toast.error(err as string);
    } finally {
      setIsSubmittingVariant(false);
    }
  };

  /**
   * Handles deletion of a specific variant by ID.
   */
  const handleDeleteVariant = async (variantId: string) => {
    if (!id) return;
    setDeletingVariantId(variantId);
    try {
      await dispatch(deleteVariantThunk({ productId: id, variantId })).unwrap();
      toast.success('Đã xóa biến thể');
    } catch (err) {
      if ((err as string).trim()) toast.error(err as string);
    } finally {
      setDeletingVariantId(null);
    }
  };

  // --- Loading State ---
  if (currentStatus === 'loading' || !product) {
    return (
      <AdminLayout>
        <div className="text-gray-400">Đang tải...</div>
      </AdminLayout>
    );
  }

  // --- Main Render ---
  return (
    <AdminLayout>
      <h1 className="mb-6 text-xl font-bold text-[#1A1A1A]">
        Sửa sản phẩm: {product.name}
      </h1>

      <div className="max-w-3xl space-y-8">
        {/* Section: Basic Product Information */}
        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="mb-4 font-semibold text-[#1A1A1A]">
            Thông tin cơ bản
          </h2>
          <ProductEditForm product={product} />
        </section>

        {/* Section: Product Images */}
        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="mb-4 font-semibold text-[#1A1A1A]">
            Hình ảnh sản phẩm
          </h2>
          <ProductImageManager
            productId={product._id}
            images={product.images}
          />
        </section>

        {/* Section: Variant Management */}
        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="mb-4 font-semibold text-[#1A1A1A]">
            Biến thể ({product.variants.length})
          </h2>

          <VariantList
            variants={product.variants}
            onDelete={handleDeleteVariant}
            isDeleting={deletingVariantId}
          />

          {showVariantForm ? (
            <div className="mt-4">
              <VariantForm
                onSubmit={handleAddVariant}
                onCancel={() => setShowVariantForm(false)}
                isSubmitting={isSubmittingVariant}
              />
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowVariantForm(true)}
              className="mt-4 w-full border-dashed"
            >
              + Thêm biến thể
            </Button>
          )}
        </section>
      </div>
    </AdminLayout>
  );
}

export default AdminProductEditPage;
