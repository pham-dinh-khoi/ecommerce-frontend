/**
 * @file AdminUserListPage.tsx
 * @description Administrative dashboard page for managing the user base.
 * Handles the orchestration of fetching user data, applying filters,
 * pagination, and displaying the list via the UserTable component.
 */

// --- Imports ---
import { useEffect, useState, useCallback } from 'react';

// Layout & Components
import AdminLayout from '@/components/layout/AdminLayout';
import UserFilterBar from '@/features/user/components/UserFilterBar';
import UserTable from '@/features/user/components/UserTable';
import Pagination from '@/components/common/Pagination';

// State & Hooks
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAdminUsers } from '@/features/user/userSlice';
import type { AdminUserQueryParams } from '@/types/user.types';

/**
 * AdminUserListPage Component
 *
 * Manages the state for user list filtering and pagination.
 * It serves as a parent container that reacts to filter changes
 * and page transitions by triggering data re-fetches.
 */
function AdminUserListPage() {
  const dispatch = useAppDispatch();

  // Selectors: Extract user list state and pagination metadata
  const { adminList, adminPagination, adminListStatus } = useAppSelector(
    (state) => state.user
  );

  // Local State: Management of query parameters for the API
  const [filters, setFilters] = useState<Partial<AdminUserQueryParams>>({});
  const [page, setPage] = useState(1);

  /**
   * Data Loading Logic
   * Fetches the user list based on the current page and filter criteria.
   * Wrapped in useCallback to stabilize the dependency for the useEffect.
   */
  const loadUsers = useCallback(() => {
    dispatch(
      fetchAdminUsers({
        page,
        limit: 10,
        sort: 'createdAt',
        order: 'desc',
        ...filters,
      })
    );
  }, [dispatch, page, filters]);

  // Sync data whenever page or filters update
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  /**
   * Handler: Updates filters and resets the page to 1.
   * Essential for UX to ensure new results appear from the first page.
   */
  const handleFilterChange = (newFilters: Partial<AdminUserQueryParams>) => {
    setFilters(newFilters);
    setPage(1);
  };

  return (
    <AdminLayout>
      <h1 className="mb-6 text-xl font-bold text-[#1A1A1A]">
        Quản lý người dùng
      </h1>

      {/* Filter Toolbar */}
      <div className="mb-4">
        <UserFilterBar onFilterChange={handleFilterChange} />
      </div>

      {/* Loading State */}
      {adminListStatus === 'loading' && (
        <div className="rounded-lg border border-gray-200 bg-white p-16 text-center text-gray-400">
          Đang tải...
        </div>
      )}

      {/* Success State */}
      {adminListStatus === 'succeeded' && (
        <>
          <UserTable users={adminList} />
          {adminPagination && (
            <div className="mt-6">
              <Pagination pagination={adminPagination} onPageChange={setPage} />
            </div>
          )}
        </>
      )}

      {/* Error State */}
      {adminListStatus === 'failed' && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-600">
          Không thể tải danh sách người dùng
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminUserListPage;
