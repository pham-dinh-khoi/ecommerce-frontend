/**
 * @file product.types.ts
 * @description Domain models and DTOs for the Product management system.
 * Handles complex relationships like variants, image arrays, and paginated product lists.
 */

import type { Category } from './category.types';

// ==========================================
// 1. Core Domain Entities
// ==========================================

/** Represents an image associated with a product or variant. */
export interface ProductImage {
  url: string;
  /** Cloud storage ID (e.g., Cloudinary public ID) used for deletion/reordering. */
  publicId: string;
  alt?: string;
  /** Determines if this is the thumbnail/featured image for the product. */
  isPrimary: boolean;
  sortOrder: number;
}

/** Represents a dynamic attribute (e.g., { name: 'Size', value: 'XL' }). */
export interface VariantAttribute {
  name: string;
  value: string;
}

/** Represents a specific SKU-based version of a product. */
export interface ProductVariant {
  _id: string;
  sku: string;
  attributes: VariantAttribute[];
  price: number;
  comparePrice?: number;
  stock: number;
  images: ProductImage[];
  isActive: boolean;
  weight?: number;
  barcode?: string;
}

export type ProductStatus = 'draft' | 'active' | 'inactive' | 'archived';

/** The primary Product domain model. */
export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  /** 
   * Polymorphic: Can be a full Category object (if populated) 
   * or a string ID (if unpopulated). 
   */
  category: Pick<Category, '_id' | 'name' | 'slug'> | string;
  brand?: string;
  tags: string[];
  images: ProductImage[];
  variants: ProductVariant[];
  minPrice: number;
  maxPrice: number;
  totalStock: number;
  metaTitle?: string;
  metaDescription?: string;
  rating: { average: number; count: number };
  soldCount: number;
  viewCount: number;
  status: ProductStatus;
  isFeatured: boolean;
  createdBy: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 2. Responses & Utilities
// ==========================================

/** Used for list views where the full description is too heavy to fetch. */
export type ProductListItem = Omit<Product, 'description'>;

export interface PaginationResult {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/** 
 * Response structure for product lists. 
 * Note: Does NOT wrap in "data" property per project specification. 
 */
export interface ProductListResponse {
  success: boolean;
  message: string;
  products: ProductListItem[];
  pagination: PaginationResult;
}

/** Utility type for optimized Card/Thumbnail components. */
export type ProductCardData = Pick<
  Product,
  | '_id'
  | 'name'
  | 'slug'
  | 'images'
  | 'minPrice'
  | 'maxPrice'
  | 'rating'
  | 'totalStock'
  | 'variants'
  | 'soldCount'
>;

// ==========================================
// 3. Request Payloads
// ==========================================

/** Payload for creating a product. Uses 'File' objects for image uploads. */
export interface CreateProductPayload {
  name: string;
  description: string;
  shortDescription?: string;
  category: string;
  brand?: string;
  tags?: string[];
  status?: ProductStatus;
  isFeatured?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  imageFiles?: File[];
}

/** Partial updates for product details. */
export interface UpdateProductPayload {
  name?: string;
  description?: string;
  shortDescription?: string;
  category?: string;
  brand?: string;
  tags?: string[];
  status?: ProductStatus;
  isFeatured?: boolean;
  metaTitle?: string;
  metaDescription?: string;
}

/** Payload for adding a specific variant to a product. */
export interface CreateVariantPayload {
  sku: string;
  attributes: VariantAttribute[];
  price: number;
  comparePrice?: number;
  stock: number;
  weight?: number;
  barcode?: string;
  isActive?: boolean;
  imageFiles?: File[];
}

/** Partial updates for a specific product variant. */
export interface UpdateVariantPayload {
  sku?: string;
  attributes?: VariantAttribute[];
  price?: number;
  comparePrice?: number;
  stock?: number;
  weight?: number;
  barcode?: string;
  isActive?: boolean;
}

/** Search, filter, and sort parameters for products. */
export interface ProductQueryParams {
  page?: number;
  limit?: number;
  sort?: 'createdAt' | 'minPrice' | 'rating' | 'soldCount' | 'name';
  order?: 'asc' | 'desc';
  keyword?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: ProductStatus;
  isFeatured?: boolean;
  tags?: string;
  rating?: number;
}