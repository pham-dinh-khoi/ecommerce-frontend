/**
 * AdminCategoryListPage.tsx
 *
 * Purpose: Displays the administrative dashboard for managing categories.
 * Integration: Uses Redux Toolkit to fetch and display a flat list of categories.
 */

import { useEffect } from 'react';

// Components
import AdminLayout from '@/components/layout/AdminLayout';
import CategoryTable from '@/features/category/components/CategoryTable';

// Redux
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAllCategoriesFlat } from '@/features/category/categorySlice';

function AdminCategoryListPage() {
  // 1. Hooks & Selectors
  const dispatch = useAppDispatch();

  // Destructuring state from the Redux store.
  // flatList: The data to display.
  // flatListStatus: The current state of the fetch request ('idle', 'loading', 'succeeded', 'failed').
  const { flatList, flatListStatus } = useAppSelector(
    (state) => state.category
  );

  // 2. Data Fetching Effect
  // Triggered on component mount to load categories.
  // Dependency [dispatch] is safe here as RTK dispatch is stable.
  useEffect(() => {
    dispatch(fetchAllCategoriesFlat());
  }, [dispatch]);

  // 3. View Logic
  return (
    <AdminLayout>
      <h1 className="mb-6 text-xl font-bold text-[#1A1A1A]">
        Manage Categories
      </h1>

      {/* 
        Status-driven UI rendering.
        This approach ensures a clear user experience by providing visual
        feedback for loading and error states. 
      */}

      {/* State: Loading */}
      {flatListStatus === 'loading' && (
        <div className="rounded-lg border border-gray-200 bg-white p-16 text-center text-gray-400">
          Loading...
        </div>
      )}

      {/* State: Success */}
      {flatListStatus === 'succeeded' && (
        <CategoryTable categories={flatList} />
      )}

      {/* State: Error */}
      {flatListStatus === 'failed' && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-600">
          Failed to load category list.
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminCategoryListPage;
