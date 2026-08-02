/**
 * @file review.types.ts
 * @description Domain models and DTOs for the Product Review system.
 * Handles user reviews, moderator oversight, seller replies, and rating analytics.
 */

// ==========================================
// 1. Core Domain Models & Moderation
// ==========================================

export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'hidden';

/** Represents an uploaded image attached to a review. */
export interface ReviewImage {
  url: string;
  publicId: string;
}

/**
 * Moderation data used by admins to manage content quality.
 */
export interface ModerationInfo {
  status: ReviewStatus;
  /** Reason for rejection or hidden status. */
  reason?: string;
  /** List of system-generated flags (e.g., "spam", "profanity"). */
  autoFlags?: string[];
}

/** Represents a response from a seller or admin to a user review. */
export interface SellerReply {
  content: string;
  /** Polymorphic: Can be populated with name/id or just a string ID. */
  repliedBy: { _id: string; name: string } | string;
  repliedAt: string;
}

/**
 * The primary Review entity.
 */
export interface Review {
  _id: string;
  product: string;
  /** Polymorphic user data: populated object or simple reference string. */
  user: { _id: string; name: string; avatar?: { url: string } } | string;
  order?: string;
  rating: number;
  title: string;
  content: string;
  images: ReviewImage[];
  isVerifiedPurchase: boolean;
  moderation: ModerationInfo;
  helpfulCount: number;
  isVotedByMe?: boolean;
  notHelpfulCount: number;
  sellerReply?: SellerReply;
  isEdited: boolean;
  editedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 2. Rating Statistics & Summaries
// ==========================================

/**
 * Aggregate statistics for a product's ratings.
 * distribution: Key is the rating (e.g., '5', '4'), value is the count.
 */
export interface RatingSummary {
  average: number;
  count: number;
  distribution: Record<string, number>;
}

export interface ProductReviewListResponse {
  success: boolean;
  message: string;
  reviews: Review[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  summary: RatingSummary;
}

// ==========================================
// 3. Payloads & Interactions
// ==========================================

export interface CreateReviewPayload {
  productId: string;
  rating: number;
  title: string;
  content: string;
  imageFiles?: File[];
}

export interface UpdateReviewPayload {
  rating?: number;
  title?: string;
  content?: string;
  imageFiles?: File[];
}

/** Admin-only payload for managing review visibility. */
export interface ModerateReviewPayload {
  status: 'approved' | 'rejected' | 'hidden';
  reason?: string;
}

export interface ReplyReviewPayload {
  content: string;
}

/** Result of a user interaction (e.g., clicking "Helpful"). */
export interface VoteHelpfulResult {
  helpfulCount: number;
  notHelpfulCount: number;
  /** Whether the current user voted helpful (true), not helpful (false), or hasn't voted (null). */
  userVote: boolean | null;
}

// ==========================================
// 4. Query Parameters
// ==========================================

/** Filters for customer-facing views (Product Detail pages). */
export interface ReviewQueryParams {
  page?: number;
  limit?: number;
  sort?: 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful' | 'verified';
  rating?: number;
  verified?: boolean;
  withImages?: boolean;
}

/** Extensive filters for Admin dashboard management. */
export interface AdminReviewQueryParams {
  page?: number;
  limit?: number;
  status?: ReviewStatus;
  productId?: string;
  userId?: string;
  rating?: number;
  sort?: 'createdAt' | 'rating' | 'helpfulCount';
  order?: 'asc' | 'desc';
}
