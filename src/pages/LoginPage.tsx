/**
 * @file LoginPage.tsx
 * @description Serves as the main authentication page. This page acts as a container
 * that leverages the 'AuthLayout' wrapper to maintain UI consistency across
 * authentication-related views (e.g., Login, Register, Forgot Password).
 */

// --- Imports ---
// Layout components provide the structural scaffolding for the page
import AuthLayout from '@/components/layout/AuthLayout';

// Feature-specific components keep the business logic and UI separate from the page definition
import LoginForm from '@/features/auth/components/LoginForm';

/**
 * LoginPage Component
 *
 * This component orchestrates the login screen. By encapsulating 'LoginForm'
 * within 'AuthLayout', we adhere to the composition pattern, ensuring that
 * global layout concerns (like backgrounds, spacing, or branding) are
 * managed independently of the form submission logic.
 */
function LoginPage() {
  return (
    // The AuthLayout acts as a shell providing consistent layout constraints
    <AuthLayout>
      {/* The LoginForm component handles state, validation, and submission logic */}
      <LoginForm />
    </AuthLayout>
  );
}

export default LoginPage;
