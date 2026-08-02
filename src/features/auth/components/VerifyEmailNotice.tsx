import { useLocation, Link } from 'react-router-dom';
import { Mail } from 'lucide-react';

// Application Components & Constants
import StatusCard from '@/components/common/StatusCard';
import { ROUTES } from '@/constants/routes';

/**
 * VerifyEmailNotice Component
 *
 * Displays a notification informing the user that an email verification link
 * has been sent to their registered address. It uses navigation state to
 * display a privacy-masked version of the user's email.
 */
function VerifyEmailNotice() {
  // Retrieve navigation state passed from the registration/sign-up page.
  // This allows the component to display the specific email that was registered.
  const location = useLocation();
  const email = (location.state as { email?: string })?.email;

  /**
   * Email Masking Logic:
   * Provides a privacy-friendly display of the email address.
   * Regex breakdown:
   * - ^(.{2}): Capture the first two characters.
   * - .+ : Matches the middle characters until the @.
   * - (@.+): Captures the domain portion (e.g., @gmail.com).
   * Result: ab********@example.com
   */
  const maskedEmail = email
    ? email.replace(/^(.{2}).+(@.+)$/, '$1********$2')
    : 'email của bạn';

  return (
    <StatusCard
      icon={<Mail size={24} />}
      title="Kiểm tra email của bạn"
      description={`Chúng tôi đã gửi link xác thực đến ${maskedEmail}. Vui lòng kiểm tra hộp thư (kể cả mục spam) để hoàn tất đăng ký.`}
      footerLink={
        // Navigation helper to allow the user to go back to the login screen
        <Link to={ROUTES.LOGIN} className="text-[#0047AB] hover:underline">
          ← Quay lại trang đăng nhập
        </Link>
      }
    >
      {/* 
        Feature Placeholder: 
        This section is reserved for future implementation of a "resend verification" 
        API call. It is currently disabled to prevent accidental usage.
      */}
      <div className="border-t border-gray-100 pt-4 text-center text-sm text-gray-600">
        Không nhận được email?{' '}
        <button
          type="button"
          disabled
          className="cursor-not-allowed font-medium text-gray-400"
          title="Tính năng sẽ được bổ sung sau"
        >
          Gửi lại email
        </button>
      </div>
    </StatusCard>
  );
}

export default VerifyEmailNotice;
