import AuthLayout from '@/components/layout/AuthLayout';
import ResetPasswordForm from '@/features/auth/components/ResetPasswordForm';

/**
 * ResetPasswordPage
 *
 * A route-level container component for the "Reset Password" screen.
 *
 * This component handles the structural layout for the page, ensuring
 * that the ResetPasswordForm is presented within the standard authentication
 * environment (e.g., specific padding, background, or shared styles).
 */
function ResetPasswordPage() {
  return (
    <AuthLayout>
      {/* 
        The actual form logic and state management are encapsulated 
        within the feature component, keeping this page file clean 
        and focused solely on routing and layout.
      */}
      <ResetPasswordForm />
    </AuthLayout>
  );
}

export default ResetPasswordPage;
