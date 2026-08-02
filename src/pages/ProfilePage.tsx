import { useEffect, useState } from 'react';

// Layout & UI Components
import MainLayout from '@/components/layout/MainLayout';

// Feature Components
import AvatarUploader from '@/features/user/components/AvatarUploader';
import ProfileInfoForm from '@/features/user/components/ProfileInfoForm';
import ChangePasswordForm from '@/features/user/components/ChangePasswordForm';
import AddressList from '@/features/user/components/AddressList';

// Store & Slices
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchProfile } from '@/features/user/userSlice';

// Types
type TabKey = 'info' | 'password' | 'addresses';

const tabs: { key: TabKey; label: string }[] = [
  { key: 'info', label: 'Thông tin cá nhân' },
  { key: 'password', label: 'Đổi mật khẩu' },
  { key: 'addresses', label: 'Sổ địa chỉ' },
];

/**
 * ProfilePage
 *
 * A dashboard-style page for managing user account settings.
 * It provides navigation between profile information, password management,
 * and address book management.
 */
function ProfilePage() {
  const dispatch = useAppDispatch();
  const { profile, profileStatus } = useAppSelector((state) => state.user);
  const [activeTab, setActiveTab] = useState<TabKey>('info');

  // Fetch profile data on component mount
  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  // Handle Loading/Initialization State
  if (profileStatus === 'loading' || profileStatus === 'idle' || !profile) {
    return (
      <MainLayout>
        <div className="mx-auto max-w-5xl px-4 py-12">
          {/* Skeleton loader to indicate data fetching */}
          <div className="h-6 w-48 animate-pulse rounded bg-gray-200" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Tài khoản của tôi</h1>

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
          {/* Sidebar Navigation: User Summary & Tab Switcher */}
          <aside>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <AvatarUploader avatar={profile.avatar} name={profile.name} />
              <p className="mt-3 font-medium text-[#1A1A1A]">{profile.name}</p>
              <p className="text-sm text-gray-500">{profile.email}</p>
            </div>

            <nav className="mt-4 space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`w-full rounded-md px-3 py-2 text-left text-sm font-medium transition-colors ${
                    activeTab === tab.key
                      ? 'bg-blue-50 text-[#0047AB]'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main Content Area: Conditional rendering based on active tab */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            {activeTab === 'info' && (
              <>
                <h2 className="mb-4 font-semibold text-[#1A1A1A]">
                  Thông tin cá nhân
                </h2>
                <ProfileInfoForm profile={profile} />
              </>
            )}

            {activeTab === 'password' && (
              <>
                <h2 className="mb-4 font-semibold text-[#1A1A1A]">
                  Đổi mật khẩu
                </h2>
                <ChangePasswordForm />
              </>
            )}

            {activeTab === 'addresses' && (
              <>
                <h2 className="mb-4 font-semibold text-[#1A1A1A]">
                  Sổ địa chỉ
                </h2>
                <AddressList addresses={profile.addresses} />
              </>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default ProfilePage;
