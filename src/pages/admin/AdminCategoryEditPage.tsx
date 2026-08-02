/**
 * AdminCategoryEditPage.tsx
 *
 * Purpose: Handles the editing flow for a specific category.
 * Logic:
 * 1. Fetches a list of all categories (to populate "Parent Category" select inputs).
 * 2. Fetches the specific category details by ID.
 * 3. Provides initial data to the CategoryForm for "Edit Mode".
 */

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

// Layout & Components
import AdminLayout from '@/components/layout/AdminLayout';
import CategoryForm from '@/features/category/components/CategoryForm';

// State Management
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAllCategoriesFlat } from '@/features/category/categorySlice';

// Services & Types
import { categoryService } from '@/features/category/categoryService';
import type { Category } from '@/types/category.types';

function AdminCategoryEditPage() {
  // 1. Hooks & Initialization
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();

  // Select the flat list from global store (used to populate parent category dropdowns)
  const { flatList } = useAppSelector((state) => state.category);

  // Local state for the specific category being edited
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  // 2. Effects (Data Fetching)

  // Effect A: Load the global category list (to ensure the dropdown options exist)
  useEffect(() => {
    dispatch(fetchAllCategoriesFlat());
  }, [dispatch]);

  // Effect B: Load the specific category detail by ID
  useEffect(() => {
    if (!id) return;

    categoryService
      .getById(id)
      .then((res) => setCategory(res.data))
      .catch(() => setCategory(null)) // Handle errors by nullifying state
      .finally(() => setLoading(false)); // Ensure loading finishes regardless of success
  }, [id]);

  // 3. Conditional Rendering (Guard Clauses)

  // Show loading state while waiting for the API response
  if (loading) {
    return (
      <AdminLayout>
        <div className="text-gray-400">Loading...</div>
      </AdminLayout>
    );
  }

  // Handle case where category is not found or API request failed
  if (!category) {
    return (
      <AdminLayout>
        <div className="text-red-500">Category not found</div>
      </AdminLayout>
    );
  }

  // 4. Main Component Render
  return (
    <AdminLayout>
      <h1 className="mb-6 text-xl font-bold text-[#1A1A1A]">
        Edit category: {category.name}
      </h1>

      {/* 
        Hydration: 
        - 'categories': Passed to populate dependency/parent fields.
        - 'initialData': Pre-fills the form with current values, 
          triggering the internal "Edit Mode" logic inside CategoryForm.
      */}
      <CategoryForm categories={flatList} initialData={category} />
    </AdminLayout>
  );
}

export default AdminCategoryEditPage;
