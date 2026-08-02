import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { useAppDispatch } from '@/store/hooks';
import { deleteProductThunk } from '@/features/product/productSlice';
import type { ProductListItem } from '@/types/product.types';

// ==========================================
// Types & Interfaces
// ==========================================

interface DeleteProductDialogProps {
  product: ProductListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ==========================================
// Component
// ==========================================

/**
 * DeleteProductDialog
 * A confirmation dialog used to archive a product.
 * It provides context that the action is reversible and explains the impact.
 */
function DeleteProductDialog({
  product,
  open,
  onOpenChange,
}: DeleteProductDialogProps) {
  const dispatch = useAppDispatch();

  // --- Handlers ---

  /**
   * Triggers the archive process via Redux thunk.
   * On success, it closes the dialog and displays a toast message.
   * On failure, it handles the error gracefully via toast.
   */
  const handleDelete = async () => {
    if (!product) return;

    try {
      await dispatch(deleteProductThunk(product._id)).unwrap();
      toast.success(` lưu trữ sản phẩm "${product.name}"`);
      onOpenChange(false);
    } catch (err) {
      if ((err as string).trim()) toast.error(err as string);
      onOpenChange(false);
    }
  };

  // --- Render ---
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Lưu trữ sản phẩm "{product?.name}"?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Sản phẩm sẽ được{' '}
            <span className="font-medium">lưu trữ (archived)</span> và ẩn khỏi
            cửa hàng, nhưng vẫn được giữ lại để đảm bảo tính toàn vẹn của các
            đơn hàng cũ liên quan. Bạn có thể khôi phục lại sau nếu cần.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700"
          >
            Lưu trữ sản phẩm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DeleteProductDialog;
