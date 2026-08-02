import AuthLayout from '@/components/layout/AuthLayout';
import RegisterForm from '@/features/auth/components/RegisterForm';

/**
 * RegisterPage
 *
 * A route-level container component for the user registration screen.
 *
 * This page serves as the entry point for new users. It is responsible for
 * injecting the `RegisterForm` into the standard `AuthLayout`, ensuring
 * consistent styling and page structure across all authentication views.
 */
function RegisterPage() {
  return (
    <AuthLayout>
      {/* 
        The specific registration business logic (validation, API submission, 
        state management) is encapsulated within RegisterForm. This separation 
        keeps the page component clean and reusable.
      */}
      <RegisterForm />
    </AuthLayout>
  );
}

export default RegisterPage;
