import { Link, useLocation } from 'react-router-dom';
import {
  LayoutGrid,
  FolderTree,
  ArrowLeft,
  Users,
  ShoppingBag,
  MessageSquare,
  Ticket,
} from 'lucide-react';
import { ROUTES } from '@/constants/routes';

/**
 * AdminSidebar Component
 * 
 * Provides navigation for the admin dashboard. 
 * Highlights the current active link based on the browser's URL path.
 */
function AdminSidebar() {
  const { pathname } = useLocation();

  /**
   * Checks if the provided path is the current active route.
   */
  const isActive = (path: string) => pathname.startsWith(path);

  /**
   * Generates dynamic Tailwind classes based on the active state.
   */
  const getLinkClass = (path: string) => 
    `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
      isActive(path)
        ? 'bg-blue-50 text-[#0047AB]'
        : 'text-gray-600 hover:bg-gray-50'
    }`;

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-gray-100 bg-white">
      {/* Sidebar Header */}
      <div className="border-b border-gray-100 p-6">
        <span className="text-lg font-bold text-[#0047AB]">
          Ecommerce Store
        </span>
        <p className="text-xs text-gray-400">Trang quản trị</p>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 space-y-1 p-4">
        <Link to={ROUTES.ADMIN_CATEGORIES} className={getLinkClass(ROUTES.ADMIN_CATEGORIES)}>
          <FolderTree size={18} />
          Danh mục
        </Link>

        <Link to={ROUTES.ADMIN_PRODUCTS} className={getLinkClass(ROUTES.ADMIN_PRODUCTS)}>
          <LayoutGrid size={18} />
          Sản phẩm
        </Link>

        <Link to={ROUTES.ADMIN_USERS} className={getLinkClass(ROUTES.ADMIN_USERS)}>
          <Users size={18} />
          Người dùng
        </Link>

        <Link to={ROUTES.ADMIN_COUPONS} className={getLinkClass(ROUTES.ADMIN_COUPONS)}>
          <Ticket size={18} />
          Mã giảm giá
        </Link>

        <Link to={ROUTES.ADMIN_ORDERS} className={getLinkClass(ROUTES.ADMIN_ORDERS)}>
          <ShoppingBag size={18} />
          Đơn hàng
        </Link>

        <Link to={ROUTES.ADMIN_REVIEWS} className={getLinkClass(ROUTES.ADMIN_REVIEWS)}>
          <MessageSquare size={18} />
          Đánh giá
        </Link>
      </nav>

      {/* Bottom Footer Link */}
      <div className="border-t border-gray-100 p-4">
        <Link
          to={ROUTES.HOME}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#0047AB]"
        >
          <ArrowLeft size={16} />
          Quay lại trang chủ
        </Link>
      </div>
    </aside>
  );
}

export default AdminSidebar;