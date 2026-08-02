import type { ReactNode } from "react";
import AdminSidebar from "./AdminSidebar";

/**
 * Props definition for the AdminLayout component.
 * 
 * @interface AdminLayoutProps
 * @property {ReactNode} children - The child components or page content to be rendered within the layout.
 */
interface AdminLayoutProps {
  children: ReactNode;
}

/**
 * AdminLayout Component
 * 
 * A high-level wrapper component that establishes the standard structure for admin pages.
 * It provides a persistent sidebar and a scrollable main content area to ensure
 * a consistent user experience throughout the admin dashboard.
 */
function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar Navigation: Consistent across all admin pages */}
      <AdminSidebar />

      {/* Main Content Area: Takes up remaining space and handles internal scrolling */}
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}

export default AdminLayout;