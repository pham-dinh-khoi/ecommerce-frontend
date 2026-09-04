// --- Imports ---
// External Libraries
import { Link } from 'react-router-dom';
import { Truck, ShieldCheck, RotateCcw, Headphones } from 'lucide-react';

// Internal Layout and Features
import MainLayout from '@/components/layout/MainLayout';
import TrendingProducts from '@/features/search/components/TrendingProducts';
import ProductSection from '@/features/search/components/ProductSection';
import FeaturedCategories from '@/features/category/components/FeaturedCategories';

// Hooks and Constants
import { ROUTES, buildSearchUrl } from '@/constants/routes';

// --- Constants ---
// Static configuration defined outside the component to prevent re-declaration
const USP_FEATURES = [
  {
    icon: Truck,
    title: 'Miễn phí vận chuyển',
    desc: 'Cho đơn hàng từ 500.000đ',
  },
  { icon: RotateCcw, title: 'Đổi trả dễ dàng', desc: 'Trong vòng 7 ngày' },
  {
    icon: ShieldCheck,
    title: 'Thanh toán an toàn',
    desc: 'Bảo mật với PayPal',
  },
  { icon: Headphones, title: 'Hỗ trợ 24/7', desc: 'Luôn sẵn sàng giúp đỡ' },
];

/**
 * HomePage Component
 *
 * Serves as the landing page for the application.
 * It integrates the MainLayout with modular content sections
 * (Hero, USP, Categories, Products, and Newsletter).
 */
function HomePage() {
  return (
    <MainLayout>
      {/* --- Hero Section --- */}
      <section className="bg-linear-to-r from-[#0047AB] to-[#003a8c] py-16 text-center text-white sm:py-20">
        <div className="mx-auto max-w-3xl px-4">
          <h1 className="text-3xl font-bold sm:text-4xl">
            Chào mừng đến với Ecommerce Store
          </h1>
          <p className="mt-3 text-blue-100">
            Khám phá hàng ngàn sản phẩm chất lượng với giá tốt nhất
          </p>
          <Link
            to={ROUTES.SEARCH}
            className="mt-6 inline-block rounded-md bg-white px-6 py-2.5 font-medium text-[#0047AB] transition-transform hover:scale-105 hover:bg-blue-50"
          >
            Mua sắm ngay
          </Link>
        </div>
      </section>

      {/* --- USP (Unique Selling Proposition) Strip --- */}
      <section className="border-b border-gray-100 bg-gray-50">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-6 sm:grid-cols-4">
          {USP_FEATURES.map((item) => (
            <div key={item.title} className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#0047AB]">
                <item.icon size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-[#1A1A1A]">
                  {item.title}
                </p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- Featured Categories --- */}
      {/* Reserves its own layout while loading so sections below it don't shift. */}
      <FeaturedCategories />

      {/* --- Best Selling Products Section --- */}
      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#1A1A1A]">
            Sản phẩm bán chạy
          </h2>
          <Link
            to={ROUTES.SEARCH}
            className="text-sm text-[#0047AB] hover:underline"
          >
            Xem tất cả →
          </Link>
        </div>
        <div className="mt-4">
          <TrendingProducts />
        </div>
      </section>

      {/* --- Newest Arrivals Section --- */}
      <section className="bg-gray-50 py-10">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#1A1A1A]">
              Sản phẩm mới nhất
            </h2>
            <Link
              to={buildSearchUrl('') + '&sort=newest'}
              className="text-sm text-[#0047AB] hover:underline"
            >
              Xem tất cả →
            </Link>
          </div>
          <div className="mt-4">
            <ProductSection sort="newest" limit={5} />
          </div>
        </div>
      </section>

      {/* --- Promotional / Discount Section --- */}
      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#1A1A1A]">Giảm giá sốc</h2>
          <Link
            to={buildSearchUrl('') + '&sort=discount'}
            className="text-sm text-[#0047AB] hover:underline"
          >
            Xem tất cả →
          </Link>
        </div>
        <div className="mt-4">
          <ProductSection sort="discount" limit={5} />
        </div>
      </section>

      {/* --- Newsletter Signup Section --- */}
      <section className="bg-[#1A1A1A] py-12 text-center text-white">
        <div className="mx-auto max-w-lg px-4">
          <h2 className="text-xl font-bold">Nhận ưu đãi mới nhất</h2>
          <p className="mt-2 text-sm text-gray-300">
            Đăng ký để nhận thông báo về sản phẩm mới và mã giảm giá đặc biệt
          </p>
          <form
            className="mt-4 flex gap-2"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              id="newsletter-email"
              name="email"
              autoComplete="email"
              aria-label="Email đăng ký nhận ưu đãi"
              placeholder="Email của bạn"
              className="flex-1 rounded-md border-0 px-4 py-2 text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#0047AB]"
            />
            <button
              type="submit"
              className="rounded-md bg-[#0047AB] px-5 py-2 text-sm font-medium hover:bg-[#003a8c]"
            >
              Đăng ký
            </button>
          </form>
        </div>
      </section>
    </MainLayout>
  );
}

export default HomePage;
