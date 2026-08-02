/**
 * AdminProductCreateStep1Page.tsx
 *
 * This is the first step of the product creation wizard.
 * It initializes the form state by fetching necessary category data
 * and ensuring that any previous product state is cleared,
 * guaranteeing a "fresh start" for the user.
 */

// --- React & Core Hooks ---
import { useEffect } from 'react';

// --- Local Components ---
import ProductWizardLayout from '@/components/layout/ProductWizardLayout';
import ProductStep1Form from '@/features/product/components/ProductStep1Form';

// --- State Management (Redux) ---
import { useAppDispatch } from '@/store/hooks';
import { fetchAllCategoriesFlat } from '@/features/category/categorySlice';
import { clearCurrentProduct } from '@/features/product/productSlice';

function AdminProductCreateStep1Page() {
  const dispatch = useAppDispatch();

  /**
   * Initializes the wizard environment:
   * 1. Fetches categories to populate dropdowns in the form.
   * 2. Clears the current product state to prevent data leakage
   *    from previously edited products.
   */
  useEffect(() => {
    dispatch(fetchAllCategoriesFlat());
    dispatch(clearCurrentProduct());
  }, [dispatch]);

  return (
    <ProductWizardLayout currentStep={1}>
      <ProductStep1Form />
    </ProductWizardLayout>
  );
}

export default AdminProductCreateStep1Page;
