import type { ReactNode } from "react";
import Header from "./Header";

interface MainLayoutProps {
  children: ReactNode;
}

function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1">{children}</main>

      {/* Footer — tái sử dụng style từ AuthLayout */}
      <footer className="border-t border-gray-200 bg-gray-100 px-6 py-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-semibold text-[#1A1A1A]">Ecommerce Store</p>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <a href="#" className="hover:underline">Chính sách Bảo mật</a>
            <a href="#" className="hover:underline">Điều khoản Dịch vụ</a>
            <a href="#" className="hover:underline">Thông tin Vận chuyển</a>
            <a href="#" className="hover:underline">Liên hệ</a>
          </div>
          <p className="text-sm text-gray-600">© 2026 Ecommerce Store. Tất cả quyền được bảo lưu.</p>
        </div>
      </footer>
    </div>
  );
}

export default MainLayout;