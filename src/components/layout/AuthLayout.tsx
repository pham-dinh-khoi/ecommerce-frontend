import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/routes";

/**
 * Props for the AuthLayout component.
 * 
 * @interface AuthLayoutProps
 * @property {React.ReactNode} children - The authentication forms (login, register, etc.) to be rendered.
 */
interface AuthLayoutProps {
  children: React.ReactNode;
}

/**
 * AuthLayout Component
 * 
 * A specialized layout wrapper for authentication pages.
 * Features a minimalist header and footer to keep the user focused on the auth action,
 * and centers the child content within the viewport.
 */
function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[#F8F0FA]">
      
      {/* Minimalist Header */}
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
        <Link to={ROUTES.HOME} className="text-xl font-bold text-[#0047AB]">
          {/* TODO: Replace with dynamic brand name or logo */}
          Ecommerce Store
        </Link>
        <a href="#" className="text-sm text-[#0047AB] hover:underline">
          Hỗ trợ khách hàng
        </a>
      </header>

      {/* Main Content Area: Centered vertically and horizontally */}
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        {children}
      </main>

      {/* Standard Footer */}
      <footer className="border-t border-gray-200 bg-gray-100 px-6 py-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-[#1A1A1A]">Ecommerce Store</p>
          </div>
          
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <a href="#" className="hover:underline">Chính sách Bảo mật</a>
            <a href="#" className="hover:underline">Điều khoản Dịch vụ</a>
            <a href="#" className="hover:underline">Thông tin Vận chuyển</a>
            <a href="#" className="hover:underline">Liên hệ</a>
          </div>
          
          <p className="text-sm text-gray-500">© 2026 Ecommerce Store. Tất cả quyền được bảo lưu.</p>
        </div>
      </footer>
    </div>
  );
}

export default AuthLayout;