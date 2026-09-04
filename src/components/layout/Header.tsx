import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  ShoppingCart,
  Search,
  Menu,
  ChevronDown,
  LayoutDashboard,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchCategoryTree } from '@/features/category/categorySlice';
import { logoutThunk } from '@/features/auth/authSlice';
import { ROUTES } from '@/constants/routes';
import MobileMenu from './MobileMenu';
import CategoryScrollNav from './CategoryScrollNav';
import { resetWishlist } from '@/features/wishlist/wishlistSlice';
import SearchAutocomplete from '@/features/search/components/SearchAutocomplete';
import { fetchCart } from '@/features/cart/cartSlice';

// CART ICON
function CartIcon() {
  const dispatch = useAppDispatch();
  const { cart } = useAppSelector((state) => state.cart);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const itemCount = cart?.totalItems ?? 0;
  const cartLabel =
    itemCount > 0 ? `Giỏ hàng, ${itemCount} sản phẩm` : 'Giỏ hàng';

  return (
    <Link
      to={ROUTES.CART}
      aria-label={cartLabel}
      className="relative rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-50 hover:text-[#0047AB]"
    >
      <ShoppingCart size={22} aria-hidden="true" />
      {itemCount > 0 && (
        <span
          aria-hidden="true"
          className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white"
        >
          {itemCount > 9 ? '9+' : itemCount}
        </span>
      )}
    </Link>
  );
}

// USER MENU
function UserMenu() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await dispatch(logoutThunk());
    dispatch(resetWishlist());
    setIsUserMenuOpen(false);
    navigate(ROUTES.HOME);
  };

  const initials = user?.name?.charAt(0).toUpperCase() ?? '?';

  return (
    <div className="relative">
      <button
        onClick={() => setIsUserMenuOpen((prev) => !prev)}
        aria-label="Tài khoản"
        aria-expanded={isUserMenuOpen}
        className="flex items-center gap-2 rounded-full p-1 hover:bg-gray-50 sm:pr-3"
      >
        {isAuthenticated ? (
          <>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#0047AB] text-sm font-medium text-white">
              {user?.avatar?.url ? (
                <img
                  src={user.avatar.url}
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
            <span className="hidden max-w-25 truncate text-sm font-medium text-[#1A1A1A] sm:block">
              {user?.name}
            </span>
          </>
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500">
            <ChevronDown size={0} className="hidden" />
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
        )}
      </button>

      {isUserMenuOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-md border border-gray-100 bg-white py-1 shadow-lg">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#0047AB] text-sm font-medium text-white">
                  {user?.avatar?.url ? (
                    <img
                      src={user.avatar.url}
                      alt={user.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[#1A1A1A]">
                    {user?.name}
                  </p>
                  <p className="truncate text-xs text-gray-500">
                    {user?.email}
                  </p>
                </div>
              </div>

              {user?.role === 'admin' && (
                <Link
                  to={ROUTES.ADMIN_PRODUCTS}
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-2 border-b border-gray-100 px-4 py-2.5 text-sm font-medium text-[#0047AB] hover:bg-blue-50"
                >
                  <LayoutDashboard size={15} />
                  Trang quản trị
                </Link>
              )}

              <Link
                to={ROUTES.PROFILE}
                onClick={() => setIsUserMenuOpen(false)}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Tài khoản của tôi
              </Link>
              <Link
                to={ROUTES.WISHLIST}
                onClick={() => setIsUserMenuOpen(false)}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Sản phẩm yêu thích
              </Link>
              <Link
                to={ROUTES.MY_ORDERS}
                onClick={() => setIsUserMenuOpen(false)}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Đơn hàng của tôi
              </Link>
              <button
                onClick={handleLogout}
                className="mt-1 block w-full border-t border-gray-100 px-4 py-2 pt-2.5 text-left text-sm text-red-600 hover:bg-gray-50"
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <div className="px-4 py-2">
                <p className="text-sm text-gray-500">Chào mừng bạn!</p>
              </div>
              <Link
                to={ROUTES.LOGIN}
                onClick={() => setIsUserMenuOpen(false)}
                className="block px-4 py-2 text-sm font-medium text-[#0047AB] hover:bg-blue-50"
              >
                Đăng nhập
              </Link>
              <Link
                to={ROUTES.REGISTER}
                onClick={() => setIsUserMenuOpen(false)}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Đăng ký tài khoản mới
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// HEADER
function Header() {
  const dispatch = useAppDispatch();
  const { tree, status } = useAppSelector((state) => state.category);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchCategoryTree());
  }, [dispatch]);

  const rootCategories = tree.filter((c) => c.isActive);

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-4 py-3 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center gap-4">
          <button
            className="lg:hidden"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Mở menu"
          >
            <Menu size={24} className="text-[#1A1A1A]" />
          </button>

          <Link
            to={ROUTES.HOME}
            className="shrink-0 text-xl font-bold text-[#0047AB]"
          >
            Ecommerce Store
          </Link>

          <div className="relative hidden flex-1 lg:block">
            <div className="hidden flex-1 lg:block">
              <SearchAutocomplete />
            </div>
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>

          <div className="ml-auto flex items-center gap-1">
            {/* Wishlist */}
            <Link
              to={ROUTES.WISHLIST}
              className="hidden rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-50 hover:text-[#0047AB] sm:block"
              aria-label="Yêu thích"
            >
              <Heart size={22} />
            </Link>
            {/* Cart */}
            <CartIcon />
            {/* User */}
            <UserMenu />
          </div>
        </div>
      </div>

      <nav className="hidden border-b border-gray-100 px-8 lg:block">
        <div className="mx-auto max-w-7xl">
          {status === 'loading' && (
            <div className="flex gap-6 py-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-4 w-16 animate-pulse rounded bg-gray-200"
                />
              ))}
            </div>
          )}
          {status === 'succeeded' && (
            <CategoryScrollNav categories={rootCategories} />
          )}
        </div>
      </nav>

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        categories={rootCategories}
      />
    </header>
  );
}

export default Header;
