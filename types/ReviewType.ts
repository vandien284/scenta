export interface ReviewType {
  id: string;
  productId?: number;
  productSlug: string;
  productName: string;
  reviewerName: string;
  rating: number;
  content: string;
  avatar?: string;
  role?: string;
  createdAt: string;
}

export interface ReviewStoreSchema {
  reviews: ReviewType[];
}

export interface CreateReviewPayload {
  productId?: number;
  productSlug: string;
  productName: string;
  reviewerName: string;
  rating: number;
  content: string;
  avatar?: string;
  role?: string;
}
