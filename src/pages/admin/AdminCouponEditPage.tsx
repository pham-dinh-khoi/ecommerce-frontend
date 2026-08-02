/**
 * AdminCouponEditPage.tsx
 *
 * Purpose: Provides a dedicated edit view for existing coupons.
 * Logic: Fetches specific coupon data via URL ID and provides a pre-populated
 * form for administrative updates.
 */

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

// Layout and UI Components
import AdminLayout from '@/components/layout/AdminLayout';
import CouponForm from '@/features/coupon/components/CouponForm';

// Services and Types
import { couponService } from '@/features/coupon/couponService';
import type { Coupon } from '@/types/coupon.types';

function AdminCouponEditPage() {
  // 1. Hooks & State Management
  // Extracting 'id' from the route. Type safety ensures it is treated as a string.
  const { id } = useParams<{ id: string }>();

  // State to hold the coupon entity; null indicates no data or initial state.
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  // Separate loading state prevents the UI from flickering an empty state while fetching.
  const [loading, setLoading] = useState(true);

  // 2. Data Fetching Effect
  // This effect runs once on mount or when the ID in the URL changes.
  useEffect(() => {
    if (!id) return;

    // Fetch the coupon data from the backend service.
    // .finally() ensures the loading state is disabled regardless of request success/failure.
    couponService
      .adminGetById(id)
      .then((res) => setCoupon(res.data))
      .catch(() => setCoupon(null))
      .finally(() => setLoading(false));
  }, [id]);

  // 3. Conditional Rendering (Guard Clauses)
  // Early return pattern: prevents rendering empty/broken components if data is missing
  // or still being fetched, ensuring a cleaner visual experience.

  // State: Loading
  if (loading) {
    return (
      <AdminLayout>
        <div className="text-gray-400">Loading...</div>
      </AdminLayout>
    );
  }

  // State: Not Found (or API error)
  if (!coupon) {
    return (
      <AdminLayout>
        <div className="text-red-500">Coupon not found</div>
      </AdminLayout>
    );
  }

  // 4. Main View
  return (
    <AdminLayout>
      <h1 className="mb-6 text-xl font-bold text-[#1A1A1A]">
        Edit coupon: {coupon.code}
      </h1>
      {/* 
        Pass initialData to the form to hydrate input fields.
        CouponForm should handle its own validation logic internally.
      */}
      <CouponForm initialData={coupon} />
    </AdminLayout>
  );
}

export default AdminCouponEditPage;
