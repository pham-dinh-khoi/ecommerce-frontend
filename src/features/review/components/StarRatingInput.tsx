import { useState } from 'react';
import { Star } from 'lucide-react';

/**
 * Interface representing the props for the StarRatingInput component.
 */
interface StarRatingInputProps {
  /** The current rating value (1 to 5). */
  value: number;
  /** Function triggered when a user clicks a star to select a rating. */
  onChange: (value: number) => void;
}

/**
 * StarRatingInput Component
 *
 * Provides an interactive star rating system where users can hover to preview
 * and click to select a rating.
 */
function StarRatingInput({ value, onChange }: StarRatingInputProps) {
  // Local state to track which star is currently being hovered over for visual feedback
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-1">
      {/* Generate an array of 5 items to render exactly 5 star icons */}
      {Array.from({ length: 5 }).map((_, i) => {
        const starValue = i + 1;

        // Determines if the star should be filled (highlighted):
        // 1. If the user is currently hovering, highlight up to the hovered star.
        // 2. Otherwise, highlight up to the selected value (prop).
        const isFilled = starValue <= (hovered || value);

        return (
          <button
            key={i}
            type="button"
            onClick={() => onChange(starValue)}
            onMouseEnter={() => setHovered(starValue)}
            onMouseLeave={() => setHovered(0)}
            className="p-0.5 transition-colors focus:outline-none"
          >
            <Star
              size={28}
              className={
                isFilled ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'
              }
            />
          </button>
        );
      })}
    </div>
  );
}

export default StarRatingInput;
