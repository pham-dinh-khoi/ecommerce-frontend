import { Badge } from '@/components/ui/badge';
import type { UserRole } from '@/types/user.types';

/**
 * roleConfig
 *
 * A lookup table defining the visual style and label for each user role.
 * This centralized configuration ensures that the UI remains consistent
 * throughout the application and makes adding new roles easy.
 */
const roleConfig: Record<UserRole, { label: string; className: string }> = {
  admin: { label: 'Admin', className: 'bg-purple-100 text-purple-700' },
  seller: { label: 'Seller', className: 'bg-blue-100 text-blue-700' },
  user: { label: 'User', className: 'bg-gray-100 text-gray-600' },
};

/**
 * UserRoleBadge Component
 *
 * Renders a visual badge to identify the user's role.
 *
 * @param role - The role string (must match UserRole type).
 *
 * @example
 * <UserRoleBadge role="admin" />
 */
function UserRoleBadge({ role }: { role: UserRole }) {
  const config = roleConfig[role];

  return (
    <Badge className={`${config.className} hover:${config.className}`}>
      {/* 
        Note: We repeat the config.className in the hover state 
        to prevent the Shadcn/UI default hover effect from overriding 
        our specific role colors.
      */}
      {config.label}
    </Badge>
  );
}

export default UserRoleBadge;
