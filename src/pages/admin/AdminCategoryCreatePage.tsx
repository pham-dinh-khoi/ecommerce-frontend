/**
 * AdminCategoryCreatePage.tsx
 *
 * Purpose: Provides an administrative view for creating new categories.
 * Logic:
 * 1. Fetches all existing categories via Redux.
 * 2. Passes the list to the form so the admin can select a "Parent Category" (if needed).
 */

import { useEffect } from 'react';

// Components
import AdminLayout from '@/components/layout/AdminLayout';
import CategoryForm from '@/features/category/components/CategoryForm';

// State Management
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAllCategoriesFlat } from '@/features/category/categorySlice';

function AdminCategoryCreatePage() {
  // 1. Hooks & Selectors
  const dispatch = useAppDispatch();

  // Access the list of categories from the Redux store.
  const { flatList } = useAppSelector((state) => state.category);

  // 2. Data Fetching Effect
  // We trigger the fetch on mount to ensure the 'Parent Category'
  // dropdown in the form is populated with valid options.
  useEffect(() => {
    dispatch(fetchAllCategoriesFlat());
  }, [dispatch]);

  // 3. Render
  return (
    <AdminLayout>
      <h1 className="mb-6 text-xl font-bold text-[#1A1A1A]">
        Create new category
      </h1>

      {/* 
         'categories={flatList}': 
         We pass the full list to the form so it can generate the 
         hierarchical selector (e.g., if this new category is a child 
         of an existing one).
      */}
      <CategoryForm categories={flatList} />
    </AdminLayout>
  );
}

export default AdminCategoryCreatePage;
