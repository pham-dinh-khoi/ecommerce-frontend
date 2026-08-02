import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import type { Category } from "@/types/category.types";
import { buildCategoryUrl } from "@/constants/routes";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
}

/**
 * CategoryItem Component
 * Handles the rendering of individual categories, including expandable sub-menus.
 */
function CategoryItem({ 
  category, 
  onClose 
}: { 
  category: Category; 
  onClose: () => void 
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = category.children && category.children.length > 0;

  return (
    <div className="border-b border-gray-50">
      <div className="flex items-center justify-between">
        <Link
          to={buildCategoryUrl(category.slug)}
          onClick={onClose}
          className="flex-1 px-2 py-3 text-sm font-medium text-[#1A1A1A]"
        >
          {category.name}
        </Link>
        
        {hasChildren && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-gray-400"
            aria-label={isExpanded ? "Thu gọn" : "Mở rộng"}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        )}
      </div>

      {hasChildren && isExpanded && (
        <div className="bg-gray-50 pb-2 pl-4">
          {category.children?.map((child) => (
            <Link
              key={child._id}
              to={buildCategoryUrl(child.slug)}
              onClick={onClose}
              className="block px-2 py-2 text-sm text-gray-600 hover:text-[#0047AB]"
            >
              {child.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * MobileMenu Component
 * An off-canvas side drawer for mobile category navigation.
 */
function MobileMenu({ isOpen, onClose, categories }: MobileMenuProps) {
  // Close menu when pressing "Escape"
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      {/* Drawer */}
      <div className="absolute left-0 top-0 h-full w-72 overflow-y-auto bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 p-4">
          <span className="font-bold text-[#0047AB]">Danh mục</span>
          <button onClick={onClose} aria-label="Đóng menu">
            <X size={22} className="text-gray-600" />
          </button>
        </div>

        <nav className="p-2">
          {categories.map((cat) => (
            <CategoryItem key={cat._id} category={cat} onClose={onClose} />
          ))}
        </nav>
      </div>
    </div>
  );
}

export default MobileMenu;