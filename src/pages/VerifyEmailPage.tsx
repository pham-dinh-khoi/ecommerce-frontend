import AuthLayout from '@/components/layout/AuthLayout';
import VerifyEmailStatus from '@/features/auth/components/VerifyEmailStatus';

/**
 * VerifyEmailPage
 *
 * This component acts as a route-level container for the email verification process.
 *
 * It is responsible for providing the consistent visual frame (via AuthLayout)
 * and delegating the business logic (token validation, API status handling)
 * to the feature-specific component (VerifyEmailStatus).
 */
function VerifyEmailPage() {
  return (
    <AuthLayout>
      {/* 
        Encapsulating the specific feature component here keeps the page
        file lightweight and decoupled from the actual authentication logic.
      */}
      <VerifyEmailStatus />
    </AuthLayout>
  );
}

export default VerifyEmailPage;
