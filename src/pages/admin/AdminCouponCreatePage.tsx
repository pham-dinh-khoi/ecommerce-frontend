/**
 * AdminCouponCreatePage.tsx
 *
 * Purpose: Provides an administrative view for creating new coupons.
 * Logic: Simple functional component that renders the layout and the
 * coupon creation form.
 */

import AdminLayout from '@/components/layout/AdminLayout';
import CouponForm from '@/features/coupon/components/CouponForm';

function AdminCouponCreatePage() {
  /**
   * Rendering Logic:
   * We leverage AdminLayout to ensure consistent page structure (sidebar/header).
   * CouponForm is rendered without props here because it is a new entry (initial state is empty).
   */
  return (
    <AdminLayout>
      <h1 className="mb-6 text-xl font-bold text-[#1A1A1A]">
        Create new coupon
      </h1>

      {/* 
         CouponForm acts as the 'controlled' or 'uncontrolled' form handler.
         By not passing 'initialData', the component should initialize
         its form states to empty/default values automatically.
      */}
      <CouponForm />
    </AdminLayout>
  );
}

export default AdminCouponCreatePage;
