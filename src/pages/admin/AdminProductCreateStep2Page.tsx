/**
 * AdminProductCreateStep2Page.tsx
 *
 * The second step of the product creation wizard.
 * It focuses on managing product variants, allowing the user to add,
 * view, and delete variants before moving to the final step.
 */

// --- React & Core Hooks ---
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// --- External Libraries & Utilities ---
import { toast } from 'sonner';

// --- Components (UI & Layout) ---
import { Button } from '@/components/ui/button';
import ProductWizardLayout from '@/components/layout/ProductWizardLayout';
import VariantList from '@/features/product/components/VariantList';
import VariantForm from '@/features/product/components/VariantForm';

// --- State Management (Redux) ---
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchProductById,
  addVariantThunk,
  deleteVariantThunk,
} from '@/features/product/productSlice';

// --- Constants & Types ---
import { buildWizardStep3Url } from '@/constants/routes';
import type { CreateVariantPayload } from '@/types/product.types';

function AdminProductCreateStep2Page() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { current: product, currentStatus } = useAppSelector(
    (state) => state.product
  );

  // --- Local UI State ---
  const [showForm, setShowForm] = useState<boolean>(false);
  const [isSubmittingVariant, setIsSubmittingVariant] =
    useState<boolean>(false);
  const [deletingVariantId, setDeletingVariantId] = useState<string | null>(
    null
  );

  /**
   * Syncs the local Redux state with the server on component mount.
   */
  useEffect(() => {
    if (id) dispatch(fetchProductById(id));
  }, [id, dispatch]);

  /**
   * Adds a new variant to the product.
   * On success, hides the form and resets the submission state.
   */
  const handleAddVariant = async (payload: CreateVariantPayload) => {
    if (!id) return;
    setIsSubmittingVariant(true);
    try {
      await dispatch(addVariantThunk({ productId: id, payload })).unwrap();
      toast.success('Thêm biến thể thành công');
      setShowForm(false);
    } catch (err) {
      if ((err as string).trim()) toast.error(err as string);
    } finally {
      setIsSubmittingVariant(false);
    }
  };

  /**
   * Removes a specific variant by ID.
   * Tracks deleting state per ID for UI feedback.
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

  /**
   * Navigates the user to the final step of the product wizard.
   */
  const handleFinish = () => {
    if (!id) return;
    navigate(buildWizardStep3Url(id));
  };

  // --- Loading State ---
  if (currentStatus === 'loading' || !product) {
    return (
      <ProductWizardLayout currentStep={2}>
        <div className="text-gray-400">Đang tải...</div>
      </ProductWizardLayout>
    );
  }

  // --- Render Tree ---
  return (
    <ProductWizardLayout currentStep={2}>
      <div className="max-w-3xl space-y-6">
        {/* Informational Header */}
        <div className="rounded-lg bg-blue-50 p-3 text-sm text-[#0047AB]">
          Sản phẩm <strong>"{product.name}"</strong> đã được tạo. Thêm ít nhất 1
          biến thể (VD: theo màu sắc, kích thước) trước khi kích hoạt bán.
        </div>

        {/* Variant List Table */}
        <VariantList
          variants={product.variants}
          onDelete={handleDeleteVariant}
          isDeleting={deletingVariantId}
        />

        {/* Variant Creation Logic */}
        {showForm ? (
          <VariantForm
            onSubmit={handleAddVariant}
            onCancel={() => setShowForm(false)}
            isSubmitting={isSubmittingVariant}
          />
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowForm(true)}
            className="w-full border-dashed"
          >
            + Thêm biến thể
          </Button>
        )}

        {/* Footer Navigation */}
        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
          <Button
            onClick={handleFinish}
            className="bg-[#0047AB] hover:bg-[#003a8c]"
          >
            Hoàn tất →
          </Button>
        </div>
      </div>
    </ProductWizardLayout>
  );
}

export default AdminProductCreateStep2Page;
