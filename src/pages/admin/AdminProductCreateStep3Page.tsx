/**
 * AdminProductCreateStep3Page.tsx
 *
 * The final step of the product creation wizard.
 * It displays a success message, provides a summary of the created product,
 * and allows the user to publish (activate) the product if it meets requirements.
 */

// --- React & Core Hooks ---
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

// --- External Libraries & Utilities ---
import { toast } from 'sonner';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

// --- Local Layouts & Features ---
import ProductWizardLayout from '@/components/layout/ProductWizardLayout';

// --- State Management (Redux) ---
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchProductById,
  updateProductThunk,
} from '@/features/product/productSlice';

// --- Constants ---
import { ROUTES } from '@/constants/routes';

function AdminProductCreateStep3Page() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { current: product, currentStatus } = useAppSelector(
    (state) => state.product
  );

  // --- Local State ---
  const [isActivating, setIsActivating] = useState<boolean>(false);

  // Fetch product data on mount to ensure we have the latest state (e.g., variant count)
  useEffect(() => {
    if (id) dispatch(fetchProductById(id));
  }, [id, dispatch]);

  /**
   * Triggers the API request to set the product status to 'active'.
   * This effectively publishes the product for store visibility.
   */
  const handleActivate = async () => {
    if (!id) return;
    setIsActivating(true);
    try {
      await dispatch(
        updateProductThunk({ id, payload: { status: 'active' } })
      ).unwrap();
      toast.success('Đã kích hoạt sản phẩm');
    } catch (err) {
      if (err) toast.error(err as string);
    } finally {
      setIsActivating(false);
    }
  };

  // --- Loading State ---
  if (currentStatus === 'loading' || !product) {
    return (
      <ProductWizardLayout currentStep={3}>
        <div className="text-gray-400">Đang tải...</div>
      </ProductWizardLayout>
    );
  }

  // Derived state to check for variant requirements
  const hasVariants = product.variants.length > 0;

  return (
    <ProductWizardLayout currentStep={3}>
      <div className="mx-auto max-w-md text-center">
        {/* --- Success Header --- */}
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
          <CheckCircle2 size={28} />
        </div>
        <h2 className="text-xl font-bold text-[#1A1A1A]">
          Tạo sản phẩm thành công!
        </h2>
        <p className="mt-2 text-gray-600">
          <strong>{product.name}</strong> đã được tạo với{' '}
          {product.variants.length} biến thể, hiện đang ở trạng thái{' '}
          <span className="font-medium">
            {product.status === 'active' ? 'Đang bán' : 'Nháp'}
          </span>
          .
        </p>

        {/* --- Validation Warning --- */}
        {!hasVariants && (
          <div className="mt-4 rounded-md bg-yellow-50 p-3 text-sm text-yellow-700">
            Sản phẩm chưa có biến thể nào — cần thêm ít nhất 1 biến thể trước
            khi kích hoạt bán.
          </div>
        )}

        {/* --- Activation Action --- */}
        {product.status !== 'active' && hasVariants && (
          <Button
            onClick={handleActivate}
            disabled={isActivating}
            className="mt-6 w-full bg-[#0047AB] hover:bg-[#003a8c]"
          >
            {isActivating ? 'Đang kích hoạt...' : 'Kích hoạt bán ngay'}
          </Button>
        )}

        {/* --- Navigation Footer --- */}
        <div className="mt-6 flex flex-col gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(ROUTES.ADMIN_PRODUCTS)}
            className="w-full"
          >
            Về danh sách sản phẩm
          </Button>
          <Link
            to={ROUTES.ADMIN_PRODUCT_CREATE_STEP1 ?? '/admin/products/new'}
            className="text-sm text-[#0047AB] hover:underline"
          >
            Tạo sản phẩm khác
          </Link>
        </div>
      </div>
    </ProductWizardLayout>
  );
}

export default AdminProductCreateStep3Page;
