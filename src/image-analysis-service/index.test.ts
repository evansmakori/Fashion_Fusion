import { expect, test, describe, beforeEach, vi } from 'vitest';
import Service from './index';
import { Env } from './raindrop.gen';

type ExecutionContext = any;

describe('Image Analysis Service', () => {
  let service: Service;
  let mockEnv: Env;

  beforeEach(() => {
    mockEnv = {
      AI: {
        run: vi.fn(),
      } as any,
    } as unknown as Env;
    const mockCtx = {} as ExecutionContext;
    service = new Service(mockCtx, mockEnv);
  });

  test('analyzeImage - successfully analyzes image with imageUrl', async () => {
    const mockAIResponse = {
      response: JSON.stringify({
        items: [
          {
            name: 'Professional Dress Shirt',
            type: 'shirt',
            category: 'formal_wear',
            confidence: 0.95,
          },
          {
            name: 'Tailored Trousers',
            type: 'pants',
            category: 'formal_wear',
            confidence: 0.92,
          },
        ],
      }),
    };

    mockEnv.AI.run = vi.fn().mockResolvedValue(mockAIResponse);

    const result = await (service as unknown as { analyzeImage(req: unknown): Promise<unknown> }).analyzeImage({
      imageUrl: 'https://example.com/outfit.jpg',
    });

    expect(result).toBeDefined();
    expect((result as { productId: string }).productId).toBeDefined();
    expect((result as { items: unknown[] }).items).toHaveLength(2);
    expect((result as { totalEstimatedPrice: number }).totalEstimatedPrice).toBeGreaterThan(0);
    expect((result as { analysisTimestamp: string }).analysisTimestamp).toBeDefined();
  });

  test('analyzeImage - successfully analyzes image with base64 imageData', async () => {
    const mockAIResponse = {
      response: JSON.stringify({
        items: [
          {
            name: 'Casual T-Shirt',
            type: 'shirt',
            category: 'casual_wear',
            confidence: 0.89,
          },
        ],
      }),
    };

    mockEnv.AI.run = vi.fn().mockResolvedValue(mockAIResponse);

    const result = await (service as unknown as { analyzeImage(req: unknown): Promise<unknown> }).analyzeImage({
      imageData: 'base64encodedimagedata',
    });

    expect(result).toBeDefined();
    expect((result as { items: unknown[] }).items).toHaveLength(1);
  });

  test('analyzeImage - throws error when neither imageUrl nor imageData provided', async () => {
    await expect(
      (service as unknown as { analyzeImage(req: unknown): Promise<unknown> }).analyzeImage({})
    ).rejects.toThrow();
  });

  test('analyzeImage - throws error when AI service fails', async () => {
    mockEnv.AI.run = vi.fn().mockRejectedValue(new Error('AI service error'));

    await expect(
      (service as unknown as { analyzeImage(req: unknown): Promise<unknown> }).analyzeImage({
        imageUrl: 'https://example.com/outfit.jpg',
      })
    ).rejects.toThrow('AI service error');
  });

  test('analyzeImage - estimates prices based on item categories', async () => {
    const mockAIResponse = {
      response: JSON.stringify({
        items: [
          {
            name: 'Designer Jacket',
            type: 'jacket',
            category: 'luxury_wear',
            confidence: 0.93,
          },
          {
            name: 'Sneakers',
            type: 'shoes',
            category: 'casual_footwear',
            confidence: 0.91,
          },
        ],
      }),
    };

    mockEnv.AI.run = vi.fn().mockResolvedValue(mockAIResponse);

    const result = await (service as unknown as { analyzeImage(req: unknown): Promise<unknown> }).analyzeImage({
      imageUrl: 'https://example.com/outfit.jpg',
    });

    const items = (result as { items: Array<{ estimatedPrice: number }> }).items;
    expect(items[0]!.estimatedPrice).toBeGreaterThan(0);
    expect(items[1]!.estimatedPrice).toBeGreaterThan(0);
  });

  test('analyzeImage - assigns confidence scores to each item', async () => {
    const mockAIResponse = {
      response: JSON.stringify({
        items: [
          {
            name: 'Shirt',
            type: 'shirt',
            category: 'formal_wear',
            confidence: 0.95,
          },
        ],
      }),
    };

    mockEnv.AI.run = vi.fn().mockResolvedValue(mockAIResponse);

    const result = await (service as unknown as { analyzeImage(req: unknown): Promise<unknown> }).analyzeImage({
      imageUrl: 'https://example.com/outfit.jpg',
    });

    const items = (result as { items: Array<{ confidenceScore: number }> }).items;
    expect(items[0]!.confidenceScore).toBeGreaterThanOrEqual(0);
    expect(items[0]!.confidenceScore).toBeLessThanOrEqual(1);
  });

  test('analyzeImage - generates unique product ID', async () => {
    const mockAIResponse = {
      response: JSON.stringify({
        items: [
          {
            name: 'Shirt',
            type: 'shirt',
            category: 'formal_wear',
            confidence: 0.95,
          },
        ],
      }),
    };

    mockEnv.AI.run = vi.fn().mockResolvedValue(mockAIResponse);

    const result1 = await (service as unknown as { analyzeImage(req: unknown): Promise<unknown> }).analyzeImage({
      imageUrl: 'https://example.com/outfit1.jpg',
    });

    const result2 = await (service as unknown as { analyzeImage(req: unknown): Promise<unknown> }).analyzeImage({
      imageUrl: 'https://example.com/outfit2.jpg',
    });

    expect((result1 as { productId: string }).productId).not.toBe((result2 as { productId: string }).productId);
  });

  test('analyzeImage - handles empty AI response gracefully', async () => {
    const mockAIResponse = {
      response: JSON.stringify({
        items: [],
      }),
    };

    mockEnv.AI.run = vi.fn().mockResolvedValue(mockAIResponse);

    const result = await (service as unknown as { analyzeImage(req: unknown): Promise<unknown> }).analyzeImage({
      imageUrl: 'https://example.com/empty.jpg',
    });

    expect((result as { items: unknown[] }).items).toHaveLength(0);
    expect((result as { totalEstimatedPrice: number }).totalEstimatedPrice).toBe(0);
  });
});

describe('Image Analysis Service - Private Service (No fetch)', () => {
  let service: Service;

  test('fetch - returns 404 for unknown routes', async () => {
    const mockEnv = {} as Env;
    const mockCtx = {} as ExecutionContext;
    service = new Service(mockCtx, mockEnv);
    const request = new Request('http://localhost/');

    const response = await service.fetch(request);

    expect(response.status).toBe(404);
  });
});
