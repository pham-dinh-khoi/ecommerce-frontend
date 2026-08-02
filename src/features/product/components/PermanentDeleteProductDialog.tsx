import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

// Components & UI
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Store & Hooks
import { useAppDispatch } from '@/store/hooks';
import { permanentlyDeleteProductThunk } from '@/features/product/productSlice';

// Types
import type { ProductListItem } from '@/types/product.types';

// ==========================================
// Types & Interfaces
// ==========================================

interface PermanentDeleteProductDialogProps {
  product: ProductListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ==========================================
// Component
// ==========================================

/**
 * PermanentDeleteProductDialog
 * A high-risk action confirmation dialog. Requires the user to type
 * the exact product name to unlock the delete action.
 */
function PermanentDeleteProductDialog({
  product,
  open,
  onOpenChange,
}: PermanentDeleteProductDialogProps) {
  // --- Hooks & State ---
  const dispatch = useAppDispatch();
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // --- Derived State ---
  // Verification: Ensure the user typed the exact name (ignoring surrounding whitespace)
  const isConfirmValid = confirmText.trim() === product?.name;

  // --- Handlers ---

  /**
   * Closes the dialog and resets the input field.
   * Ensures the UI is clean the next time the dialog is opened.
   */
  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) setConfirmText('');
    onOpenChange(nextOpen);
  };

  /**
   * Executes the deletion via Redux thunk.
   * Uses .unwrap() to handle success/failure via the try/catch block.
   */
  const handleDelete = async () => {
    if (!product || !isConfirmValid) return;

    setIsDeleting(true);
    try {
      await dispatch(permanentlyDeleteProductThunk(product._id)).unwrap();
      toast.success(`Đã xóa vĩnh viễn sản phẩm "${product.name}"`);
      handleClose(false);
    } catch (err) {
      if ((err as string)?.trim()) toast.error(err as string);
    } finally {
      setIsDeleting(false);
    }
  };

  // --- Render ---
  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          {/* Warning Icon Container */}
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
            <AlertTriangle size={22} className="text-red-600" />
          </div>

          <AlertDialogTitle className="text-center">
            Xóa vĩnh viễn "{product?.name}"?
          </AlertDialogTitle>

          <AlertDialogDescription className="text-center">
            Hàng động này{' '}
            <span className="font-semibold text-red-600">
              không thể hoàn tác
            </span>
            . Toàn bộ sản phẩm, ảnh, và các đánh giá liên quan sẽ bị xóa vĩnh
            viễn khỏi hệ thống.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Confirmation Input Section */}
        <div className="px-1">
          <Label htmlFor="confirmDeleteName" className="text-sm text-gray-600">
            Nhập{' '}
            <span className="font-semibold text-[#1A1A1A]">
              "{product?.name}"
            </span>{' '}
            để xác nhận
          </Label>
          <Input
            id="confirmDeleteName"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="mt-1"
            autoComplete="off"
            placeholder="Nhập chính xác tên sản phẩm..."
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={!isConfirmValid || isDeleting}
            className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
          >
            {isDeleting ? 'Đang xóa...' : 'Xóa vĩnh viễn'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default PermanentDeleteProductDialog;
