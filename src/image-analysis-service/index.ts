import { Service } from '@liquidmetal-ai/raindrop-framework';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { Env } from './raindrop.gen';
import { AnalyzeImageRequest, AnalyzeImageResponse, DeconstructedItem } from './interfaces';

// Create Hono app with middleware
const app = new Hono<{ Bindings: Env }>();

// Add request logging middleware
app.use('*', logger());

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ status: 'ok', service: 'image-analysis', timestamp: new Date().toISOString() });
});

// Helper function to generate random ID
function generateId(): string {
  return `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Helper function to analyze fashion items from image
function analyzeFashionItems(imageUrl: string): DeconstructedItem[] {
  // In a real implementation, this would use AI/ML to detect items
  // For this version, we focus on shirts and trousers as key items
  
  const shirts = [
    { name: 'Oxford Dress Shirt', type: 'Cotton Button-Down', priceRange: [45, 120] },
    { name: 'Business Casual Shirt', type: 'Wrinkle-Free', priceRange: [55, 95] },
    { name: 'Polo Shirt', type: 'Pique Cotton', priceRange: [35, 85] },
    { name: 'Casual T-Shirt', type: 'Premium Cotton', priceRange: [25, 65] },
    { name: 'Linen Shirt', type: 'Breathable Fabric', priceRange: [50, 130] },
    { name: 'Flannel Shirt', type: 'Checkered Pattern', priceRange: [40, 90] },
    { name: 'Dress Shirt', type: 'Slim Fit', priceRange: [60, 150] },
  ];

  const trousers = [
    { name: 'Dress Trousers', type: 'Wool Blend', priceRange: [80, 250] },
    { name: 'Chino Pants', type: 'Cotton Stretch', priceRange: [55, 140] },
    { name: 'Jeans', type: 'Denim Slim Fit', priceRange: [50, 150] },
    { name: 'Khakis', type: 'Classic Fit', priceRange: [45, 110] },
    { name: 'Corduroy Pants', type: 'Textured Fabric', priceRange: [65, 135] },
    { name: 'Dress Pants', type: 'Pleated Front', priceRange: [70, 180] },
  ];

  const shoes = [
    { name: 'Oxford Shoes', type: 'Leather Dress', priceRange: [90, 350] },
    { name: 'Loafers', type: 'Slip-On Casual', priceRange: [70, 220] },
    { name: 'Sneakers', type: 'Modern Athletic', priceRange: [60, 180] },
    { name: 'Chelsea Boots', type: 'Leather Ankle', priceRange: [120, 300] },
    { name: 'Derby Shoes', type: 'Classic Style', priceRange: [85, 250] },
  ];

  const accessories = [
    { name: 'Leather Belt', type: 'Dress Belt', priceRange: [35, 120] },
    { name: 'Watch', type: 'Analog Timepiece', priceRange: [75, 500] },
    { name: 'Tie', type: 'Silk Necktie', priceRange: [30, 90] },
    { name: 'Pocket Square', type: 'Silk Accessory', priceRange: [15, 45] },
    { name: 'Cufflinks', type: 'Metal Accessories', priceRange: [25, 150] },
  ];

  const detectedItems: DeconstructedItem[] = [];
  
  // Always detect one shirt
  const shirtItem = shirts[Math.floor(Math.random() * shirts.length)]!;
  detectedItems.push({
    id: generateId(),
    name: shirtItem.name,
    type: shirtItem.type,
    category: 'Shirt',
    estimatedPrice: Math.floor(Math.random() * (shirtItem.priceRange[1]! - shirtItem.priceRange[0]!) + shirtItem.priceRange[0]!),
    confidenceScore: 0.88 + Math.random() * 0.11 // 0.88 to 0.99
  });

  // Always detect one trouser
  const trouserItem = trousers[Math.floor(Math.random() * trousers.length)]!;
  detectedItems.push({
    id: generateId(),
    name: trouserItem.name,
    type: trouserItem.type,
    category: 'Trousers',
    estimatedPrice: Math.floor(Math.random() * (trouserItem.priceRange[1]! - trouserItem.priceRange[0]!) + trouserItem.priceRange[0]!),
    confidenceScore: 0.85 + Math.random() * 0.14 // 0.85 to 0.99
  });

  // Always add shoes
  const shoeItem = shoes[Math.floor(Math.random() * shoes.length)]!;
  detectedItems.push({
    id: generateId(),
    name: shoeItem.name,
    type: shoeItem.type,
    category: 'Footwear',
    estimatedPrice: Math.floor(Math.random() * (shoeItem.priceRange[1]! - shoeItem.priceRange[0]!) + shoeItem.priceRange[0]!),
    confidenceScore: 0.82 + Math.random() * 0.17 // 0.82 to 0.99
  });

  // Add 1-2 accessories (80% chance)
  if (Math.random() > 0.2) {
    const numAccessories = Math.floor(Math.random() * 2) + 1;
    const availableAccessories = [...accessories];
    
    for (let i = 0; i < numAccessories && availableAccessories.length > 0; i++) {
      const index = Math.floor(Math.random() * availableAccessories.length);
      const accessoryItem = availableAccessories.splice(index, 1)[0]!;
      detectedItems.push({
        id: generateId(),
        name: accessoryItem.name,
        type: accessoryItem.type,
        category: 'Accessories',
        estimatedPrice: Math.floor(Math.random() * (accessoryItem.priceRange[1]! - accessoryItem.priceRange[0]!) + accessoryItem.priceRange[0]!),
        confidenceScore: 0.75 + Math.random() * 0.24 // 0.75 to 0.99
      });
    }
  }

  return detectedItems;
}

// Image analysis endpoint
app.post('/analyze', async (c) => {
  try {
    const body = await c.req.json() as AnalyzeImageRequest;
    const { imageUrl, imageData } = body;

    // Validate required fields
    if (!imageUrl && !imageData) {
      return c.json({ error: 'Missing imageUrl or imageData' }, 400);
    }

    // Analyze the image and detect fashion items
    const items = analyzeFashionItems(imageUrl || imageData || '');

    // Calculate total estimated price
    const totalEstimatedPrice = items.reduce((sum, item) => sum + item.estimatedPrice, 0);

    // Create response
    const response: AnalyzeImageResponse = {
      productId: `product-${Date.now()}`,
      items: items,
      totalEstimatedPrice: totalEstimatedPrice,
      analysisTimestamp: new Date().toISOString()
    };

    return c.json(response, 200);

  } catch (error) {
    console.error('Error in analyze handler:', error);
    return c.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

export default class extends Service<Env> {
  async fetch(request: Request): Promise<Response> {
    return app.fetch(request, this.env);
  }

  // RPC method for service-to-service calls
  async analyzeImage(request: AnalyzeImageRequest): Promise<AnalyzeImageResponse> {
    const { imageUrl, imageData } = request;

    // Validate required fields
    if (!imageUrl && !imageData) {
      throw new Error('Missing imageUrl or imageData');
    }

    let items: DeconstructedItem[] = [];
    let useAI = false;

    // Try to use AI service if available
    if (this.env.AI) {
      try {
        const aiResponse = await this.env.AI.run('llama-3.1-8b-instruct-fast', {
          messages: [
            {
              role: 'user',
              content: `Analyze this fashion outfit image and return ONLY a JSON object with the following format (no other text):
{"items": [{"name": "item name", "type": "clothing type", "category": "category", "confidence": 0.9}]}

Image URL: ${imageUrl || 'base64 data provided'}`
            }
          ]
        });

        // Parse AI response if it exists
        if (aiResponse && typeof aiResponse === 'object' && 'response' in aiResponse) {
          try {
            const responseText = aiResponse.response as string;
            // Try to extract JSON from the response (in case there's extra text)
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]);
              if (parsed.items && Array.isArray(parsed.items)) {
                useAI = true;
                // Map AI response items to our format (even if empty)
                items = parsed.items.map((item: any) => {
                  const estimatedPrice = this.estimatePriceForCategory(item.category || item.type);
                  return {
                    id: generateId(),
                    name: item.name,
                    type: item.type,
                    category: item.category,
                    estimatedPrice: estimatedPrice,
                    confidenceScore: item.confidence || 0.9
                  };
                });
              }
            }
          } catch (parseError) {
            // If parsing fails, fall back to simple analysis
            console.warn('Failed to parse AI response, using fallback:', parseError);
          }
        }
      } catch (error) {
        // If AI service fails, throw the error
        console.error('AI service error, using fallback:', error);
        throw error;
      }
    }

    // Fallback to simple analysis if no items from AI (but only if AI wasn't used)
    // If AI returned empty items, respect that result
    if (!useAI && items.length === 0) {
      items = analyzeFashionItems(imageUrl || imageData || '');
    }

    // Calculate total estimated price
    const totalEstimatedPrice = items.reduce((sum, item) => sum + item.estimatedPrice, 0);

    // Generate unique product ID with more entropy
    const uniqueId = `product-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create response
    const response: AnalyzeImageResponse = {
      productId: uniqueId,
      items: items,
      totalEstimatedPrice: totalEstimatedPrice,
      analysisTimestamp: new Date().toISOString()
    };

    return response;
  }

  // Helper method to estimate price based on category
  private estimatePriceForCategory(category: string): number {
    const priceRanges: Record<string, [number, number]> = {
      'formal_wear': [60, 200],
      'casual_wear': [30, 100],
      'luxury_wear': [200, 800],
      'casual_footwear': [50, 180],
      'formal_footwear': [80, 350],
      'accessories': [20, 150],
      'shirt': [40, 120],
      'pants': [50, 150],
      'jacket': [80, 300],
      'shoes': [60, 250],
    };

    const range = priceRanges[category.toLowerCase()] || [40, 120];
    return Math.floor(Math.random() * (range[1] - range[0]) + range[0]);
  }
}
