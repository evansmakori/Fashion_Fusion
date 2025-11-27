// API Gateway Interface Definitions

export interface AnalyzeProductRequest {
  imageUrl?: string;
  imageData?: string;
}

export interface DeconstructedItem {
  id: string;
  name: string;
  type: string;
  category: string;
  estimatedPrice: number;
  confidenceScore?: number;
}

export interface AnalyzeProductResponse {
  productId: string;
  items: DeconstructedItem[];
  totalEstimatedPrice: number;
  analysisTimestamp: string;
}

export interface SaveProductRequest {
  productId: string;
  categoryId: string;
  imageUrl: string;
  items: Array<{
    name: string;
    type: string;
    category: string;
    estimatedPrice: number;
  }>;
}

export interface SaveProductResponse {
  savedProductId: string;
  categoryId: string;
  message: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  productCount: number;
  createdAt: string;
}

export interface GetCategoriesResponse {
  categories: Category[];
}

export interface SavedProduct {
  id: string;
  imageUrl: string;
  items: Array<{
    id: string;
    name: string;
    type: string;
    estimatedPrice: number;
  }>;
  totalEstimatedPrice: number;
  savedAt: string;
}

export interface GetProductsByCategoryResponse {
  categoryId: string;
  categoryName: string;
  products: SavedProduct[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface ProductDetailsResponse {
  id: string;
  imageUrl: string;
  categoryId: string;
  items: DeconstructedItem[];
  totalEstimatedPrice: number;
  savedAt: string;
}

export interface ShippingAddress {
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface ValidateAddressRequest {
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface ValidateAddressResponse {
  valid: boolean;
  normalized?: ShippingAddress;
  error?: string;
  code?: string;
  details?: Record<string, string>;
}

export interface OrderItem {
  productId: string;
  itemId: string;
  quantity: number;
}

export interface CreateOrderRequest {
  userId: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: 'paypal' | 'crypto';
}

export interface CreateOrderResponse {
  orderId: string;
  totalAmount: number;
  currency: string;
  status: string;
  estimatedDelivery: string;
  createdAt: string;
}

export interface ProcessPaymentRequest {
  orderId: string;
  paymentMethod: 'paypal' | 'crypto';
  paymentDetails: Record<string, unknown>;
}

export interface ProcessPaymentResponse {
  success: boolean;
  orderId: string;
  transactionId?: string;
  totalCost?: number;
  currency?: string;
  estimatedDeliveryDate?: string;
  paymentMethod?: string;
  confirmedAt?: string;
  error?: string;
  code?: string;
  details?: Record<string, unknown>;
}

export interface OrderStatusResponse {
  orderId: string;
  status: string;
  totalAmount: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: string;
  transactionId: string;
  shippingAddress: ShippingAddress;
  items: Array<{
    itemId: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  estimatedDeliveryDate: string;
  createdAt: string;
  completedAt?: string;
}

export interface ErrorResponse {
  error: string;
  code: string;
  details?: Record<string, unknown>;
}
