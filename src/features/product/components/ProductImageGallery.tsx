import { useState } from 'react';
import type { ProductImage } from '@/types/product.types';

// ==========================================
// Types & Interfaces
// ==========================================

interface ProductImageGalleryProps {
  images: ProductImage[];
}

// ==========================================
// Component
// ==========================================

/**
 * A gallery component for displaying a product's main image
 * with a selectable thumbnail list.
 */
function ProductImageGallery({ images }: ProductImageGalleryProps) {
  // --- State Management ---
  const [activeIndex, setActiveIndex] = useState(0);

  // 'prevImages' acts as a snapshot to track changes in the 'images' prop.
  const [prevImages, setPrevImages] = useState(images);

  // --- Derived State Logic ---
  // Using the pattern: "Reset state on prop change."
  // By comparing the current 'images' prop with 'prevImages' during the render
  // pass, we can reset the activeIndex to 0 if the images array has changed.
  // This avoids the common pitfalls and potential visual flickering of 'useEffect'.
  if (images !== prevImages) {
    setPrevImages(images);
    setActiveIndex(0);
  }

  // Derive the active image to be displayed in the main viewport
  const activeImage = images[activeIndex];

  // --- Conditional Rendering ---

  // Guard clause for empty image arrays to prevent runtime errors
  if (images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-lg bg-gray-100 text-gray-300">
        Không có ảnh
      </div>
    );
  }

  // --- Main Render ---
  return (
    <div>
      {/* Primary Display: Shows the currently active image */}
      <div className="aspect-square overflow-hidden rounded-lg bg-gray-50">
        <img
          src={activeImage?.url}
          alt={activeImage?.alt ?? ''}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Thumbnails: Only rendered if there is more than one image available */}
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {images.map((img, idx) => (
            <button
              key={img.publicId}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 ${
                idx === activeIndex ? 'border-[#0047AB]' : 'border-transparent'
              }`}
            >
              <img
                src={img.url}
                alt=""
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductImageGallery;
