import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

// Import Types
import type { CategoryAncestor } from '@/types/category.types';

// Import Constants & Utilities
import { ROUTES, buildCategoryUrl } from '@/constants/routes';

/**
 * Props definition for the Breadcrumb component.
 * 
 * @interface BreadcrumbProps
 * @property {CategoryAncestor[]} ancestors - A hierarchical list of parent categories to generate links.
 * @property {string} currentName - The display label for the current page (last item in the breadcrumb).
 */
interface BreadcrumbProps {
  ancestors: CategoryAncestor[];
  currentName: string;
}

/**
 * Breadcrumb Component
 * 
 * Renders a navigation trail showing the user's path from the Home page 
 * down to the current category level.
 */
function Breadcrumb({ ancestors, currentName }: BreadcrumbProps) {
  return (
    <nav 
      className="flex flex-wrap items-center gap-1 text-sm text-gray-500" 
      aria-label="Breadcrumb"
    >
      {/* Root: Home Link */}
      <Link to={ROUTES.HOME} className="hover:text-[#0047AB]">
        Trang chủ
      </Link>

      {/* Dynamic Path: Ancestor Links */}
      {ancestors.map((a) => (
        <span key={a._id} className="flex items-center gap-1">
          <ChevronRight size={22} />
          <Link 
            to={buildCategoryUrl(a.slug)} 
            className="hover:text-[#0047AB]"
          >
            {a.name}
          </Link>
        </span>
      ))}

      {/* Final Item: Current Page (Non-clickable) */}
      <span className="flex items-center gap-1">
        <ChevronRight size={14} />
        <span className="font-medium text-[#1A1A1A]">
          {currentName}
        </span>
      </span>
    </nav>
  );
}

export default Breadcrumb;