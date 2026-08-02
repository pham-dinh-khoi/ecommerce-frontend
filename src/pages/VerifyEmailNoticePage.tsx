import AuthLayout from '@/components/layout/AuthLayout';
import VerifyEmailNotice from '@/features/auth/components/VerifyEmailNotice';

/**
 * VerifyEmailNoticePage
 *
 * A route-level container component responsible for displaying the
 * "Email Verification Notice" screen.
 *
 * This component acts as a bridge between the router configuration
 * and the specialized feature component, ensuring the content is
 * correctly wrapped within the standard authentication layout.
 */
function VerifyEmailNoticePage() {
  return (
    <AuthLayout>
      {/* 
        Delegating rendering to the feature component allows for 
        better modularity and easier maintenance of the authentication flow.
      */}
      <VerifyEmailNotice />
    </AuthLayout>
  );
}

export default VerifyEmailNoticePage;
