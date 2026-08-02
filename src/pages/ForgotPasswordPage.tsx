/**
 * @file ForgotPasswordPage.tsx
 * @description The dedicated page for the "Forgot Password" functionality.
 * This component acts as a routing destination that loads the necessary
 * authentication layout and the corresponding recovery form.
 */

// --- Imports ---
// Layout: Wraps authentication pages to provide consistent styling,
// background, and container constraints.
import AuthLayout from '@/components/layout/AuthLayout';

// Feature: The core logic component handling the input validation,
// API interaction, and form submission for password recovery.
import ForgotPasswordForm from '@/features/auth/components/ForgotPasswordForm';

/**
 * ForgotPasswordPage Component
 *
 * This is a structural page component. It does not contain direct business
 * logic for authentication; instead, it delegates that responsibility to the
 * 'ForgotPasswordForm' and ensures it is rendered within the standard
 * 'AuthLayout' wrapper.
 */
function ForgotPasswordPage() {
  return (
    // The AuthLayout provides the visual scaffolding for the authentication pages
    <AuthLayout>
      {/* The ForgotPasswordForm handles the user input and recovery state management */}
      <ForgotPasswordForm />
    </AuthLayout>
  );
}

export default ForgotPasswordPage;
