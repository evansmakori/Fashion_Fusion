import { expect, test, describe, beforeEach, vi } from 'vitest';
import Service from './index';
import { Env } from './raindrop.gen';

type ExecutionContext = any;

describe('API Gateway - Product Analysis', () => {
  let service: Service;
  let mockEnv: Env;

  beforeEach(() => {
    mockEnv = {
      IMAGE_ANALYSIS_SERVICE: {
        analyzeImage: vi.fn(),
      } as any,
      PRODUCT_SERVICE: {
        saveProduct: vi.fn(),
        getCategories: vi.fn(),
        getProductsByCategory: vi.fn(),
        getProductDetails: vi.fn(),
        deleteProduct: vi.fn(),
      } as any,
      ORDER_SERVICE: {
        validateAddress: vi.fn(),
        createOrder: vi.fn(),
        getOrderStatus: vi.fn(),
      } as any,
      PAYMENT_SERVICE: {
        processPayment: vi.fn(),
      } as any,
    } as unknown as Env;
    const mockCtx = {} as ExecutionContext;
    service = new Service(mockCtx, mockEnv);
  });

  test('POST /api/products/analyze - successful image analysis with imageUrl', async () => {
    const mockAnalysisResult = {
      productId: 'prod_abc123',
      items: [
        {
          id: 'item_1',
          name: 'Professional Dress Shirt',
          type: 'shirt',
          category: 'formal_wear',
          estimatedPrice: 79.99,
          confidenceScore: 0.95,
        },
        {
          id: 'item_2',
          name: 'Tailored Trousers',
          type: 'pants',
          category: 'formal_wear',
          estimatedPrice: 129.99,
          confidenceScore: 0.92,
        },
      ],
      totalEstimatedPrice: 209.98,
      analysisTimestamp: '2025-11-25T10:30:00Z',
    };

    (mockEnv.IMAGE_ANALYSIS_SERVICE as any).analyzeImage = vi.fn().mockResolvedValue(mockAnalysisResult);

    const request = new Request('http://localhost/api/products/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl: 'https://example.com/outfit.jpg' }),
    });

    const response = await service.fetch(request);

    expect(response.status).toBe(200);
    const body = await response.json() as any;
    expect(body.productId).toBe('prod_abc123');
    expect(body.items).toHaveLength(2);
    expect(body.totalEstimatedPrice).toBe(209.98);
    expect((mockEnv.IMAGE_ANALYSIS_SERVICE as any).analyzeImage).toHaveBeenCalledWith({
      imageUrl: 'https://example.com/outfit.jpg',
    });
  });

  test('POST /api/products/analyze - returns 400 when neither imageUrl nor imageData provided', async () => {
    const request = new Request('http://localhost/api/products/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    const response = await service.fetch(request);

    expect(response.status).toBe(400);
    const body = await response.json() as any;
    expect(body.error).toBeDefined();
    expect(body.code).toBe('INVALID_IMAGE');
  });

  test('POST /api/products/analyze - returns 503 when service unavailable', async () => {
    (mockEnv.IMAGE_ANALYSIS_SERVICE as any).analyzeImage = vi.fn().mockRejectedValue(new Error('Service unavailable'));

    const request = new Request('http://localhost/api/products/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl: 'https://example.com/outfit.jpg' }),
    });

    const response = await service.fetch(request);

    expect(response.status).toBe(503);
    const body = await response.json() as any;
    expect(body.error).toContain('unavailable');
    expect(body.code).toBe('SERVICE_UNAVAILABLE');
  });
});

describe('API Gateway - Product Management', () => {
  let service: Service;
  let mockEnv: Env;

  beforeEach(() => {
    mockEnv = {
      PRODUCT_SERVICE: {
        saveProduct: vi.fn(),
        getCategories: vi.fn(),
        getProductsByCategory: vi.fn(),
        getProductDetails: vi.fn(),
        deleteProduct: vi.fn(),
      } as any,
    } as unknown as Env;
    const mockCtx = {} as ExecutionContext;
    service = new Service(mockCtx, mockEnv);
  });

  test('POST /api/products/save - successfully saves product to category', async () => {
    const mockSaveResult = {
      savedProductId: 'saved_prod_def456',
      categoryId: 'cat_xyz789',
      message: 'Product saved successfully',
    };

    (mockEnv.PRODUCT_SERVICE as any).saveProduct = vi.fn().mockResolvedValue(mockSaveResult);

    const request = new Request('http://localhost/api/products/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: 'prod_abc123',
        categoryId: 'cat_xyz789',
        imageUrl: 'https://example.com/outfit.jpg',
        items: [{ name: 'Shirt', type: 'shirt', category: 'formal', estimatedPrice: 79.99 }],
      }),
    });

    const response = await service.fetch(request);

    expect(response.status).toBe(201);
    const body = await response.json() as any;
    expect(body.savedProductId).toBe('saved_prod_def456');
    expect(body.categoryId).toBe('cat_xyz789');
  });

  test('POST /api/products/save - returns 404 when category not found', async () => {
    (mockEnv.PRODUCT_SERVICE as any).saveProduct = vi.fn().mockRejectedValue(new Error('Category not found'));

    const request = new Request('http://localhost/api/products/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: 'prod_abc123',
        categoryId: 'invalid_cat',
        imageUrl: 'https://example.com/outfit.jpg',
        items: [],
      }),
    });

    const response = await service.fetch(request);

    expect(response.status).toBe(404);
    const body = await response.json() as any;
    expect(body.code).toBe('CATEGORY_NOT_FOUND');
  });

  test('GET /api/categories - retrieves user categories', async () => {
    const mockCategories = {
      categories: [
        {
          id: 'cat_xyz789',
          name: 'Professional Outfits',
          description: 'Work attire',
          productCount: 12,
          createdAt: '2025-11-20T14:00:00Z',
        },
      ],
    };

    (mockEnv.PRODUCT_SERVICE as any).getCategories = vi.fn().mockResolvedValue(mockCategories);

    const request = new Request('http://localhost/api/categories?userId=user_123');

    const response = await service.fetch(request);

    expect(response.status).toBe(200);
    const body = await response.json() as any;
    expect(body.categories).toHaveLength(1);
    expect(body.categories[0].name).toBe('Professional Outfits');
  });

  test('GET /api/categories/:categoryId/products - retrieves products with pagination', async () => {
    const mockProducts = {
      categoryId: 'cat_xyz789',
      categoryName: 'Professional Outfits',
      products: [
        {
          id: 'saved_prod_def456',
          imageUrl: 'https://example.com/outfit.jpg',
          items: [],
          totalEstimatedPrice: 209.98,
          savedAt: '2025-11-25T10:45:00Z',
        },
      ],
      pagination: {
        page: 1,
        limit: 20,
        total: 12,
      },
    };

    (mockEnv.PRODUCT_SERVICE as any).getProductsByCategory = vi.fn().mockResolvedValue(mockProducts);

    const request = new Request('http://localhost/api/categories/cat_xyz789/products?page=1&limit=20');

    const response = await service.fetch(request);

    expect(response.status).toBe(200);
    const body = await response.json() as any;
    expect(body.products).toHaveLength(1);
    expect(body.pagination.page).toBe(1);
    expect(body.pagination.total).toBe(12);
  });

  test('GET /api/products/:productId - retrieves product details', async () => {
    const mockProduct = {
      id: 'saved_prod_def456',
      imageUrl: 'https://example.com/outfit.jpg',
      categoryId: 'cat_xyz789',
      items: [],
      totalEstimatedPrice: 79.99,
      savedAt: '2025-11-25T10:45:00Z',
    };

    (mockEnv.PRODUCT_SERVICE as any).getProductDetails = vi.fn().mockResolvedValue(mockProduct);

    const request = new Request('http://localhost/api/products/saved_prod_def456');

    const response = await service.fetch(request);

    expect(response.status).toBe(200);
    const body = await response.json() as any;
    expect(body.id).toBe('saved_prod_def456');
    expect(body.totalEstimatedPrice).toBe(79.99);
  });

  test('GET /api/products/:productId - returns 404 for non-existent product', async () => {
    (mockEnv.PRODUCT_SERVICE as any).getProductDetails = vi.fn().mockRejectedValue(new Error('Product not found'));

    const request = new Request('http://localhost/api/products/invalid_prod');

    const response = await service.fetch(request);

    expect(response.status).toBe(404);
    const body = await response.json() as any;
    expect(body.code).toBe('PRODUCT_NOT_FOUND');
  });

  test('DELETE /api/products/:productId - successfully deletes product', async () => {
    (mockEnv.PRODUCT_SERVICE as any).deleteProduct = vi.fn().mockResolvedValue({ message: 'Product deleted successfully' });

    const request = new Request('http://localhost/api/products/saved_prod_def456', {
      method: 'DELETE',
    });

    const response = await service.fetch(request);

    expect(response.status).toBe(200);
    const body = await response.json() as any;
    expect(body.message).toBe('Product deleted successfully');
  });
});

describe('API Gateway - Checkout & Orders', () => {
  let service: Service;
  let mockEnv: Env;

  beforeEach(() => {
    mockEnv = {
      ORDER_SERVICE: {
        validateAddress: vi.fn(),
        createOrder: vi.fn(),
        getOrderStatus: vi.fn(),
      } as any,
      PAYMENT_SERVICE: {
        processPayment: vi.fn(),
      } as any,
    } as unknown as Env;
    const mockCtx = {} as ExecutionContext;
    service = new Service(mockCtx, mockEnv);
  });

  test('POST /api/checkout/validate-address - validates correct address', async () => {
    const mockValidation = {
      valid: true,
      normalized: {
        streetAddress: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        country: 'USA',
      },
    };

    (mockEnv.ORDER_SERVICE as any).validateAddress = vi.fn().mockResolvedValue(mockValidation);

    const request = new Request('http://localhost/api/checkout/validate-address', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        streetAddress: '123 Main Street',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        country: 'USA',
      }),
    });

    const response = await service.fetch(request);

    expect(response.status).toBe(200);
    const body = await response.json() as any;
    expect(body.valid).toBe(true);
    expect(body.normalized).toBeDefined();
  });

  test('POST /api/checkout/validate-address - returns 422 for invalid address', async () => {
    const mockValidation = {
      valid: false,
      error: 'Invalid or incomplete address',
      code: 'INVALID_ADDRESS',
      details: { zipCode: 'ZIP code format invalid' },
    };

    (mockEnv.ORDER_SERVICE as any).validateAddress = vi.fn().mockResolvedValue(mockValidation);

    const request = new Request('http://localhost/api/checkout/validate-address', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        streetAddress: '123 Main Street',
        city: 'San Francisco',
        state: 'CA',
        zipCode: 'invalid',
        country: 'USA',
      }),
    });

    const response = await service.fetch(request);

    expect(response.status).toBe(422);
    const body = await response.json() as any;
    expect(body.valid).toBe(false);
    expect(body.code).toBe('INVALID_ADDRESS');
  });

  test('POST /api/orders - successfully creates order', async () => {
    const mockOrder = {
      orderId: 'order_ghi789',
      totalAmount: 79.99,
      currency: 'USD',
      status: 'pending_payment',
      estimatedDelivery: '2025-12-02',
      createdAt: '2025-11-25T11:00:00Z',
    };

    (mockEnv.ORDER_SERVICE as any).createOrder = vi.fn().mockResolvedValue(mockOrder);

    const request = new Request('http://localhost/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'user_123',
        items: [{ productId: 'prod_1', itemId: 'item_1', quantity: 1 }],
        shippingAddress: {
          streetAddress: '123 Main Street',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94102',
          country: 'USA',
        },
        paymentMethod: 'paypal',
      }),
    });

    const response = await service.fetch(request);

    expect(response.status).toBe(201);
    const body = await response.json() as any;
    expect(body.orderId).toBe('order_ghi789');
    expect(body.status).toBe('pending_payment');
  });

  test('POST /api/orders - returns 422 for invalid address', async () => {
    (mockEnv.ORDER_SERVICE as any).createOrder = vi.fn().mockRejectedValue(new Error('Invalid shipping address'));

    const request = new Request('http://localhost/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'user_123',
        items: [{ productId: 'prod_1', itemId: 'item_1', quantity: 1 }],
        shippingAddress: {
          streetAddress: '',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94102',
          country: 'USA',
        },
        paymentMethod: 'paypal',
      }),
    });

    const response = await service.fetch(request);

    expect(response.status).toBe(422);
    const body = await response.json() as any;
    expect(body.code).toBe('INVALID_ADDRESS');
  });

  test('POST /api/payments - successfully processes payment', async () => {
    const mockPayment = {
      success: true,
      orderId: 'order_ghi789',
      transactionId: 'txn_jkl012',
      totalCost: 79.99,
      currency: 'USD',
      estimatedDeliveryDate: '2025-12-02',
      paymentMethod: 'paypal',
      confirmedAt: '2025-11-25T11:05:00Z',
    };

    (mockEnv.PAYMENT_SERVICE as any).processPayment = vi.fn().mockResolvedValue(mockPayment);

    const request = new Request('http://localhost/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: 'order_ghi789',
        paymentMethod: 'paypal',
        paymentDetails: { paypalOrderId: 'PAYPAL_ORD_123' },
      }),
    });

    const response = await service.fetch(request);

    expect(response.status).toBe(200);
    const body = await response.json() as any;
    expect(body.success).toBe(true);
    expect(body.transactionId).toBe('txn_jkl012');
  });

  test('POST /api/payments - returns 422 for payment failure', async () => {
    const mockPayment = {
      success: false,
      error: 'Payment authorization failed',
      code: 'PAYMENT_FAILED',
      details: { reason: 'Insufficient funds', canRetry: true },
    };

    (mockEnv.PAYMENT_SERVICE as any).processPayment = vi.fn().mockResolvedValue(mockPayment);

    const request = new Request('http://localhost/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: 'order_ghi789',
        paymentMethod: 'paypal',
        paymentDetails: { paypalOrderId: 'PAYPAL_ORD_123' },
      }),
    });

    const response = await service.fetch(request);

    expect(response.status).toBe(422);
    const body = await response.json() as any;
    expect(body.success).toBe(false);
    expect(body.code).toBe('PAYMENT_FAILED');
  });

  test('GET /api/orders/:orderId - retrieves order status', async () => {
    const mockOrderStatus = {
      orderId: 'order_ghi789',
      status: 'completed',
      totalAmount: 79.99,
      currency: 'USD',
      paymentMethod: 'paypal',
      paymentStatus: 'completed',
      transactionId: 'txn_jkl012',
      shippingAddress: {
        streetAddress: '123 Main Street',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        country: 'USA',
      },
      items: [],
      estimatedDeliveryDate: '2025-12-02',
      createdAt: '2025-11-25T11:00:00Z',
      completedAt: '2025-11-25T11:05:00Z',
    };

    (mockEnv.ORDER_SERVICE as any).getOrderStatus = vi.fn().mockResolvedValue(mockOrderStatus);

    const request = new Request('http://localhost/api/orders/order_ghi789');

    const response = await service.fetch(request);

    expect(response.status).toBe(200);
    const body = await response.json() as any;
    expect(body.orderId).toBe('order_ghi789');
    expect(body.status).toBe('completed');
  });

  test('GET /api/orders/:orderId - returns 404 for non-existent order', async () => {
    (mockEnv.ORDER_SERVICE as any).getOrderStatus = vi.fn().mockRejectedValue(new Error('Order not found'));

    const request = new Request('http://localhost/api/orders/invalid_order');

    const response = await service.fetch(request);

    expect(response.status).toBe(404);
    const body = await response.json() as any;
    expect(body.code).toBe('ORDER_NOT_FOUND');
  });
});

describe('API Gateway - CORS', () => {
  let service: Service;
  let mockEnv: Env;

  beforeEach(() => {
    mockEnv = {} as Env;
    const mockCtx = {} as ExecutionContext;
    service = new Service(mockCtx, mockEnv);
  });

  test('OPTIONS request returns correct CORS headers', async () => {
    const request = new Request('http://localhost/api/products/analyze', {
      method: 'OPTIONS',
    });

    const response = await service.fetch(request);

    expect(response.status).toBe(204);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST');
    expect(response.headers.get('Access-Control-Allow-Headers')).toContain('Content-Type');
  });

  test('All endpoints include CORS headers in response', async () => {
    const request = new Request('http://localhost/health');

    const response = await service.fetch(request);

    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
  });
});
