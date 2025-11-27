import { Service } from '@liquidmetal-ai/raindrop-framework';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { Env } from './raindrop.gen';

// Create Hono app with middleware
const app = new Hono<{ Bindings: Env }>();

// Add request logging middleware
app.use('*', logger());

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ status: 'ok', service: 'image-generation', timestamp: new Date().toISOString() });
});

// Debug endpoint to test Vultr API directly
app.get('/test-vultr', async (c) => {
  const apiKey = c.env.VULTR_API_KEY || 'EZIOUWTTRUSSUS2VWZVD6ZCA4N5O3HILSPDQ';
  
  try {
    const response = await fetch('https://api.vultrinference.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`
      }
    });
    
    const data = await response.json();
    return c.json({
      status: response.status,
      apiKeyPresent: !!apiKey,
      apiKeyLength: apiKey.length,
      apiKeyStart: apiKey.substring(0, 5),
      responseOk: response.ok,
      data: data
    });
  } catch (error) {
    return c.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Image generation endpoint
app.post('/generate-image', async (c) => {
  try {
    // Parse JSON body
    const body = await c.req.json();
    const { prompt, style } = body;

    // Validate required fields
    if (!prompt || typeof prompt !== 'string') {
      return c.json({ error: 'Missing or invalid prompt' }, 400);
    }

    if (!style || typeof style !== 'string') {
      return c.json({ error: 'Missing or invalid style' }, 400);
    }

    // Get API key from environment
    const apiKey = c.env.VULTR_API_KEY;
    if (!apiKey) {
      return c.json({ error: 'Server configuration error: API key not found' }, 500);
    }

    // Call Vultr AI image generation API
    const vultrResponse = await fetch('https://api.vultrinference.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: `${style} style: ${prompt}`,
        model: 'stabilityai/stable-diffusion-xl-base-1.0',
        n: 1,
        size: '1024x1024'
      })
    });

    if (!vultrResponse.ok) {
      const errorText = await vultrResponse.text();
      console.error('Vultr API error:', errorText);
      return c.json({ error: 'Image generation failed' }, 502);
    }

    const vultrData = await vultrResponse.json() as any;

    // Extract image URL from response
    const imageUrl = vultrData?.data?.[0]?.url;
    if (!imageUrl) {
      return c.json({ error: 'No image URL in response' }, 502);
    }

    // Return success response
    return c.json({ imageUrl }, 200);

  } catch (error) {
    console.error('Error in generate-image handler:', error);
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

  // RPC method for generating fashion descriptions using AI
  async generateFashionDescription(params: { prompt: string; style: string }): Promise<{ description?: string; stylingTips?: string[]; error?: string }> {
    const { prompt, style } = params;

    // Validate required fields
    if (!prompt || typeof prompt !== 'string') {
      return { error: 'Missing or invalid prompt' };
    }

    if (!style || typeof style !== 'string') {
      return { error: 'Missing or invalid style' };
    }

    // Get API key - using hardcoded key due to environment caching issue
    // TODO: Fix environment variable update in production
    const apiKey = 'EZIOUWTTRUSSUS2VWZVD6ZCA4N5O3HILSPDQ';
    
    console.log('API Key check:', apiKey ? `Present (length: ${apiKey.length}, starts: ${apiKey.substring(0, 5)}...)` : 'MISSING');
    
    if (!apiKey) {
      return { error: 'Server configuration error: API key not found' };
    }

    try {
      // Use Vultr's text generation to create fashion descriptions
      const requestBody = {
          model: 'qwen2.5-coder-32b-instruct',
          messages: [
            {
              role: 'system',
              content: 'You are a professional fashion stylist and consultant. Provide detailed, creative fashion descriptions and styling advice in JSON format only.'
            },
            {
              role: 'user',
              content: `Create a detailed fashion description for: "${prompt}" in ${style} style.

Return ONLY valid JSON with this exact structure (no other text):
{
  "description": "A vivid 2-3 sentence description of the outfit, including colors, fabrics, silhouette, and overall aesthetic",
  "stylingTips": ["specific styling tip 1", "specific styling tip 2", "specific styling tip 3"],
  "occasions": ["occasion 1", "occasion 2"]
}`
            }
          ],
          max_tokens: 600,
          temperature: 0.7
        };
      
      console.log('Making request to Vultr API...');
      console.log('Request body:', JSON.stringify(requestBody).substring(0, 200));
      
      const vultrResponse = await fetch('https://api.vultrinference.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!vultrResponse.ok) {
        const errorText = await vultrResponse.text();
        console.error('Vultr API error:', vultrResponse.status, errorText);
        return { error: `Fashion description generation failed: ${vultrResponse.status} ${errorText}` };
      }

      const vultrData = await vultrResponse.json() as any;
      const aiResponse = vultrData?.choices?.[0]?.message?.content;

      if (!aiResponse) {
        return { error: 'No response from AI' };
      }

      // Try to parse JSON response
      try {
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            description: parsed.description,
            stylingTips: parsed.stylingTips || []
          };
        }
      } catch (parseError) {
        // If JSON parsing fails, return raw text
        return {
          description: aiResponse,
          stylingTips: []
        };
      }

      return { description: aiResponse, stylingTips: [] };

    } catch (error) {
      console.error('Error in generateFashionDescription RPC:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : '';
      console.error('Error stack:', errorStack);
      return { 
        error: `Service error: ${errorMessage}`
      };
    }
  }

  // Helper method to get placeholder fashion image based on style
  private getPlaceholderImage(style: string, prompt: string): string {
    // Placeholder fashion images from Unsplash (free to use)
    const fashionImages: Record<string, string[]> = {
      'formal': [
        'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1024&h=1024&fit=crop',
        'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=1024&h=1024&fit=crop',
        'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=1024&h=1024&fit=crop'
      ],
      'casual': [
        'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1024&h=1024&fit=crop',
        'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=1024&h=1024&fit=crop',
        'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1024&h=1024&fit=crop'
      ],
      'professional': [
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1024&h=1024&fit=crop',
        'https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?w=1024&h=1024&fit=crop',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1024&h=1024&fit=crop'
      ],
      'streetwear': [
        'https://images.unsplash.com/photo-1495385794356-15371f348c31?w=1024&h=1024&fit=crop',
        'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=1024&h=1024&fit=crop',
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1024&h=1024&fit=crop'
      ],
      'elegant': [
        'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=1024&h=1024&fit=crop',
        'https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?w=1024&h=1024&fit=crop',
        'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1024&h=1024&fit=crop'
      ],
      'sporty': [
        'https://images.unsplash.com/photo-1522556189639-b150ed9c4330?w=1024&h=1024&fit=crop',
        'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1024&h=1024&fit=crop',
        'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1024&h=1024&fit=crop'
      ]
    };

    // Get images for the selected style, or default to casual
    const styleImages = fashionImages[style.toLowerCase()] || fashionImages['casual']!;
    
    // Use prompt hash to consistently select the same image for the same prompt
    const hash = prompt.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const index = hash % styleImages.length;
    
    return styleImages[index]!;
  }

  // Legacy method name for backward compatibility
  async generateImage(params: { prompt: string; style: string }): Promise<{ imageUrl?: string; description?: string; stylingTips?: string[]; error?: string }> {
    const result = await this.generateFashionDescription(params);
    if (result.error) {
      return { error: result.error };
    }
    
    // Return placeholder image with AI-generated description
    // TODO: Replace with real Stable Diffusion generation when API access is available
    return { 
      description: result.description,
      stylingTips: result.stylingTips,
      imageUrl: this.getPlaceholderImage(params.style, params.prompt)
    };
  }
}
