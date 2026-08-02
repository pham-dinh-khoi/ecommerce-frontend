// =============================================================================
// Imports
// =============================================================================

// 1. UI Components
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

// 2. Libraries
import { toast } from 'sonner';

// 3. Store & State
import { useAppDispatch } from '@/store/hooks';
import {
  deleteCategoryThunk,
  invalidateTree,
} from '@/features/category/categorySlice';

// 4. Types & Constants
import type { Category } from '@/types/category.types';
import { SESSION_EXPIRED_MESSAGE } from '@/constants/errorMessages';

// =============================================================================
// Component Definition
// =============================================================================

interface DeleteCategoryDialogProps {
  /** The category object to be deleted. */
  category: Category | null;
  /** Controls visibility of the dialog. */
  open: boolean;
  /** Callback to change visibility state. */
  onOpenChange: (open: boolean) => void;
}

/**
 * A reusable confirmation dialog for deleting categories.
 *
 * It manages the delete API request, handles error states (including ignoring
 * global session errors), and triggers a state refresh upon success.
 */
function DeleteCategoryDialog({
  category,
  open,
  onOpenChange,
}: DeleteCategoryDialogProps) {
  const dispatch = useAppDispatch();

  /**
   * Triggers the deletion process.
   * Uses .unwrap() to manually handle the Promise rejection for UI feedback.
   */
  const handleDelete = async () => {
    if (!category) return;

    try {
      // 1. Execute the delete operation
      await dispatch(deleteCategoryThunk(category._id)).unwrap();

      // 2. Refresh state: Invalidate the tree cache so the header/sidebar updates
      dispatch(invalidateTree());

      // 3. Success Feedback
      toast.success(`Đã xóa danh mục "${category.name}"`);
      onOpenChange(false);
    } catch (err) {
      // 4. Error Handling
      // We check against SESSION_EXPIRED_MESSAGE because the global axios interceptor
      // likely already displays a toast for that specific error.
      if (err && err !== SESSION_EXPIRED_MESSAGE && (err as string).trim()) {
        toast.error(err as string);
      }
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa danh mục "{category?.name}"?</AlertDialogTitle>
          <AlertDialogDescription>
            Hành động này không thể hoàn tác. Danh mục sẽ bị xóa vĩnh viễn khỏi
            hệ thống.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700"
          >
            Xóa
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DeleteCategoryDialog;
