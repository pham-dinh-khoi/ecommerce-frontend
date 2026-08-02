import { useState } from 'react';
import { Star, ThumbsUp, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { voteHelpfulThunk } from '@/features/review/reviewSlice';
import { ROUTES } from '@/constants/routes';
import type { Review } from '@/types/review.types';

interface ReviewCardProps {
  review: Review;
}

/**
 * ReviewCard Component
 *
 * Displays an individual product review including user details, rating,
 * content, images, seller reply, and a 'helpful' voting mechanism.
 */
function ReviewCard({ review }: ReviewCardProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // Local state for UI interactivity
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(review.isVotedByMe ?? false);

  // Safety check: Ensure the user field is an object (handle populated vs ref IDs)
  const userInfo = typeof review.user === 'object' ? review.user : null;

  /**
   * Handles the 'helpful' vote action.
   * Redirects to login if the user is unauthenticated.
   */
  const handleVote = async () => {
    if (!isAuthenticated) {
      toast.info('Vui lòng đăng nhập để đánh giá hữu ích');
      navigate(ROUTES.LOGIN);
      return;
    }

    setIsVoting(true);
    try {
      // Dispatch async thunk to update vote status on the server
      const result = await dispatch(
        voteHelpfulThunk({ reviewId: review._id, isHelpful: true })
      ).unwrap();

      // Update local state based on server response
      setHasVoted(result.userVote === true);
    } catch (err) {
      if ((err as string)?.trim()) toast.error(err as string);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="border-b border-gray-100 py-5">
      {/* --- User Header --- */}
      <div className="flex items-center gap-3">
        {/* User Avatar with fallback to name initial */}
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0047AB] text-sm font-medium text-white">
          {userInfo?.avatar?.url ? (
            <img
              src={userInfo.avatar.url}
              alt=""
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            (userInfo?.name?.charAt(0).toUpperCase() ?? '?')
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-[#1A1A1A]">
            {userInfo?.name ?? 'Người dùng'}
          </p>

          {/* Rating and Verification badge */}
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  className={
                    i < review.rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-200'
                  }
                />
              ))}
            </div>
            {review.isVerifiedPurchase && (
              <span className="flex items-center gap-0.5 text-xs text-green-600">
                <CheckCircle2 size={12} /> Đã mua hàng
              </span>
            )}
          </div>
        </div>
      </div>

      {/* --- Content --- */}
      <h4 className="mt-3 font-medium text-[#1A1A1A]">{review.title}</h4>
      <p className="mt-1 text-sm text-gray-600">{review.content}</p>

      {/* --- Images Gallery --- */}
      {review.images.length > 0 && (
        <div className="mt-3 flex gap-2">
          {review.images.map((img) => (
            <img
              key={img.publicId}
              src={img.url}
              alt=""
              className="h-16 w-16 rounded-md object-cover"
            />
          ))}
        </div>
      )}

      {/* --- Seller Reply --- */}
      {review.sellerReply && (
        <div className="mt-3 rounded-md bg-gray-50 p-3">
          <p className="text-xs font-medium text-[#0047AB]">
            Phản hồi từ người bán
          </p>
          <p className="mt-1 text-sm text-gray-600">
            {review.sellerReply.content}
          </p>
        </div>
      )}

      {/* --- Helpful Vote Button --- */}
      <button
        type="button"
        onClick={handleVote}
        disabled={isVoting}
        className={`mt-3 flex items-center gap-1.5 text-xs transition-colors ${
          hasVoted
            ? 'font-medium text-[#0047AB]'
            : 'text-gray-500 hover:text-[#0047AB]'
        }`}
      >
        <ThumbsUp size={14} className={hasVoted ? 'fill-[#0047AB]' : ''} />
        Hữu ích ({review.helpfulCount})
      </button>
    </div>
  );
}

export default ReviewCard;
