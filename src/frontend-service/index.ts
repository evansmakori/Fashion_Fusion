import { Service } from '@liquidmetal-ai/raindrop-framework';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { Env } from './raindrop.gen';
import { STATIC_FILES } from './static-bundle';

// Create Hono app with middleware
const app = new Hono<{ Bindings: Env }>();

// Add request logging middleware
app.use('*', logger());

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ status: 'ok', service: 'frontend', timestamp: new Date().toISOString() });
});

// Debug endpoint to test Vultr API
app.get('/api/test-vultr', async (c) => {
  // Using hardcoded key due to environment caching issue
  const apiKey = 'EZIOUWTTRUSSUS2VWZVD6ZCA4N5O3HILSPDQ';
  const rawApiKey = c.env.VULTR_API_KEY;
  
  // Debug info
  const debugInfo = {
    hasEnvKey: !!rawApiKey,
    envKeyLength: rawApiKey ? rawApiKey.length : 0,
    envKeyStart: rawApiKey ? rawApiKey.substring(0, 5) : 'N/A',
    envKeyEnd: rawApiKey ? rawApiKey.substring(rawApiKey.length - 5) : 'N/A',
    usingFallback: !rawApiKey,
    finalKeyLength: apiKey.length,
    finalKeyStart: apiKey.substring(0, 5),
    finalKeyEnd: apiKey.substring(apiKey.length - 5),
    hasWhitespace: apiKey !== apiKey.trim(),
    trimmedLength: apiKey.trim().length
  };
  
  try {
    // Test 1: Check if we can reach Vultr API
    const modelsResponse = await fetch('https://api.vultrinference.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`
      }
    });
    
    const modelsData = await modelsResponse.json();
    
    // Test 2: Try a simple chat completion
    const chatResponse = await fetch('https://api.vultrinference.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'qwen2.5-coder-32b-instruct',
        messages: [{ role: 'user', content: 'Say hi' }],
        max_tokens: 10
      })
    });
    
    const chatData = await chatResponse.json();
    
    return c.json({
      debug: debugInfo,
      modelsTest: {
        status: modelsResponse.status,
        ok: modelsResponse.ok,
        modelCount: (modelsData as any)?.data?.length || 0,
        error: (modelsData as any)?.message || null
      },
      chatTest: {
        status: chatResponse.status,
        ok: chatResponse.ok,
        hasChoices: !!(chatData as any)?.choices,
        error: (chatData as any)?.message || null
      }
    });
  } catch (error: any) {
    return c.json({ 
      error: error?.message || 'Unknown error',
      stack: error?.stack
    }, 500);
  }
});

function contentTypeFor(pathname: string): string {
  if (pathname.endsWith('.html')) return 'text/html; charset=utf-8';
  if (pathname.endsWith('.js')) return 'application/javascript; charset=utf-8';
  if (pathname.endsWith('.css')) return 'text/css; charset=utf-8';
  if (pathname.endsWith('.svg')) return 'image/svg+xml';
  if (pathname.endsWith('.png')) return 'image/png';
  if (pathname.endsWith('.jpg') || pathname.endsWith('.jpeg')) return 'image/jpeg';
  if (pathname.endsWith('.webp')) return 'image/webp';
  if (pathname.endsWith('.ico')) return 'image/x-icon';
  if (pathname.endsWith('.json')) return 'application/json; charset=utf-8';
  if (pathname.endsWith('.map')) return 'application/json; charset=utf-8';
  return 'text/plain; charset=utf-8';
}

// Serve index.html from embedded bundle
app.get('/', (c) => {
  const html = STATIC_FILES['index.html'] || '<!doctype html><title>App</title><h1>Build missing</h1>';
  return new Response(html, { status: 200, headers: { 'content-type': 'text/html; charset=utf-8' } });
});

// Serve assets
app.get('/assets/*', (c) => {
  const pathname = c.req.path.replace(/^\//, '');
  const rel = pathname.replace(/^assets\//, 'assets/');
  const body = STATIC_FILES[rel];
  if (!body) return c.notFound();
  return new Response(body, { status: 200, headers: { 'content-type': contentTypeFor(rel) } });
});

// Fallback to SPA index
app.get('*', (c) => {
  const html = STATIC_FILES['index.html'];
  if (!html) return c.text('Build missing', 500);
  return new Response(html, { status: 200, headers: { 'content-type': 'text/html; charset=utf-8' } });
});

// API endpoint for generating AI fashion descriptions with placeholder images
app.post('/api/generate-image', async (c) => {
  try {
    const body = await c.req.json();
    const { prompt, style } = body;

    // Use ServiceStub to call the image-generation-service via RPC
    const imageGenService = c.env.IMAGE_GENERATION_SERVICE;
    if (!imageGenService) {
      return c.json({ error: 'Fashion AI service not available' }, 503);
    }

    // Call RPC method that returns both description AND placeholder image
    const result = await imageGenService.generateImage({ prompt, style });
    
    if (result.error) {
      return c.json({ error: result.error }, 500);
    }

    return c.json({ 
      description: result.description,
      stylingTips: result.stylingTips || [],
      imageUrl: result.imageUrl || '',
      isPlaceholder: true, // Flag to indicate this is a placeholder, not AI-generated
      success: true
    }, 200);
  } catch (error: any) {
    console.error('Fashion AI generation error:', error);
    return c.json({ error: error?.message || 'Proxy error' }, 500);
  }
});

// API endpoint for generating AI styling advice based on uploaded photo with Stability AI
app.post('/api/generate-styled-image', async (c) => {
  try {
    const body = await c.req.json();
    const { imageData, style } = body;

    if (!imageData || !style) {
      return c.json({ error: 'Missing imageData or style' }, 400);
    }

    // Get Stability AI API key from environment
    const stabilityApiKey = c.env.STABILITY_API_KEY || 'sk-FWrcztSoZmHT9sGKXpK92EB75jGOKtqiyhfMpqmgPrmdXhF7';

    // Create a prompt based on the style - keeping the person consistent
    const stylePrompts: Record<string, string> = {
      'Professional': 'professional business attire, elegant formal office fashion, sophisticated executive style, business suit, same person',
      'Casual': 'casual comfortable everyday fashion, relaxed style, modern casual wear, jeans and shirt, same person',
      'Streetwear': 'urban streetwear fashion, trendy modern style, contemporary street fashion, hoodie and sneakers, same person',
      'Dinner': 'elegant dinner outfit, sophisticated evening wear, upscale restaurant fashion, formal attire, same person'
    };

    const imagePrompt = `${stylePrompts[style] || style}, high quality fashion photography, maintain same person and features, professional lighting, detailed clothing, same face and body type`;

    try {
      // Generate image using Stability AI
      // Extract base64 data
      const base64Data = imageData.split(',')[1] || imageData;
      
      // Create multipart/form-data boundary
      const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
      
      // Build multipart form data manually
      const parts: string[] = [];
      
      // Add init_image field
      parts.push(`--${boundary}`);
      parts.push('Content-Disposition: form-data; name="init_image"; filename="image.png"');
      parts.push('Content-Type: image/png');
      parts.push('');
      parts.push(base64Data);
      
      // Add other fields - increase image_strength to preserve person better
      const fields: Record<string, string> = {
        'init_image_mode': 'IMAGE_STRENGTH',
        'image_strength': '0.5',
        'text_prompts[0][text]': imagePrompt,
        'text_prompts[0][weight]': '1',
        'cfg_scale': '8',
        'samples': '1',
        'steps': '40'
      };
      
      for (const [key, value] of Object.entries(fields)) {
        parts.push(`--${boundary}`);
        parts.push(`Content-Disposition: form-data; name="${key}"`);
        parts.push('');
        parts.push(value);
      }
      
      parts.push(`--${boundary}--`);
      
      const body = parts.join('\r\n');

      const stabilityResponse = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/image-to-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${stabilityApiKey}`,
          'Accept': 'application/json',
          'Content-Type': `multipart/form-data; boundary=${boundary}`
        },
        body: body
      });

      if (!stabilityResponse.ok) {
        const errorData: any = await stabilityResponse.json();
        console.error('Stability AI error:', errorData);
        
        // Fallback to placeholder image if Stability AI fails
        const placeholderImages: Record<string, string> = {
          'Professional': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1024&h=1024&fit=crop',
          'Casual': 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1024&h=1024&fit=crop',
          'Streetwear': 'https://images.unsplash.com/photo-1495385794356-15371f348c31?w=1024&h=1024&fit=crop',
          'Dinner': 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=1024&h=1024&fit=crop'
        };
        
        return c.json({ 
          imageUrl: placeholderImages[style] || placeholderImages['Casual'],
          isPlaceholder: true,
          stabilityError: errorData.message || 'Stability AI unavailable, using placeholder',
          success: true
        }, 200);
      }

      const result: any = await stabilityResponse.json();
      
      if (result.artifacts && result.artifacts.length > 0) {
        const imageBase64 = result.artifacts[0].base64;
        const imageUrl = `data:image/png;base64,${imageBase64}`;
        
        return c.json({ 
          imageUrl: imageUrl,
          isPlaceholder: false,
          success: true
        }, 200);
      } else {
        throw new Error('No image generated');
      }
    } catch (imageGenError: any) {
      console.error('Image generation error:', imageGenError);
      
      // Fallback to placeholder
      const placeholderImages: Record<string, string> = {
        'Professional': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1024&h=1024&fit=crop',
        'Casual': 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1024&h=1024&fit=crop',
        'Streetwear': 'https://images.unsplash.com/photo-1495385794356-15371f348c31?w=1024&h=1024&fit=crop',
        'Dinner': 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=1024&h=1024&fit=crop'
      };
      
      return c.json({ 
        imageUrl: placeholderImages[style] || placeholderImages['Casual'],
        isPlaceholder: true,
        error: imageGenError.message,
        success: true
      }, 200);
    }
  } catch (error: any) {
    console.error('Fashion styling advice error:', error);
    return c.json({ error: error?.message || 'Failed to generate styling advice' }, 500);
  }
});

// API endpoint for analyzing images with Vultr AI text analysis
app.post('/api/analyze-image', async (c) => {
  try {
    const body = await c.req.json();
    const { imageUrl, style } = body;

    if (!imageUrl) {
      return c.json({ error: 'Missing imageUrl' }, 400);
    }

    // Call image analysis service (for item detection and price estimation)
    const imageAnalysisService = c.env.IMAGE_ANALYSIS_SERVICE;
    if (!imageAnalysisService) {
      return c.json({ error: 'Image analysis service not available' }, 503);
    }

    // Use RPC call instead of fetch to avoid Workers API issues
    let analysisResult;
    try {
      analysisResult = await imageAnalysisService.analyzeImage({ imageUrl });
    } catch (error: any) {
      return c.json({ error: error?.message || 'Analysis failed' }, 500);
    }

    const data: any = analysisResult;
    
    // Enhance with Vultr AI text description based on the actual detected items
    try {
      const vultrApiKey = c.env.VULTR_API_KEY || 'EZIOUWTTRUSSUS2VWZVD6ZCA4N5O3HILSPDQ';
      
      // Build detailed description from detected items
      const itemsList = data.items?.map((item: any) => 
        `${item.name} (${item.type}, ${item.category}, $${item.estimatedPrice})`
      ).join(', ') || 'fashion items';
      
      const styleContext = style ? ` in ${style} style` : '';
      
      const analysisPrompt = `You are a professional fashion stylist. Analyze this outfit${styleContext} consisting of: ${itemsList}.

Provide:
1. A brief 2-3 sentence outfit description focusing on the style, colors, and overall impression
2. Three specific styling tips for this exact outfit

Format:
Description: [your 2-3 sentence description]
Tips:
1. [first tip]
2. [second tip]
3. [third tip]`;
      
      const vultrResponse = await fetch('https://api.vultrinference.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${vultrApiKey.trim()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'qwen2.5-coder-32b-instruct',
          messages: [{ role: 'user', content: analysisPrompt }],
          max_tokens: 400,
          temperature: 0.7
        })
      });
      
      if (vultrResponse.ok) {
        const vultrData: any = await vultrResponse.json();
        const aiAnalysis = vultrData.choices?.[0]?.message?.content || '';
        
        // Parse AI analysis - look for Description: and Tips:
        let description = '';
        let stylingTips: string[] = [];
        
        // Try to extract Description section
        const descMatch = aiAnalysis.match(/Description:\s*(.*?)(?=\n\s*Tips:|$)/is);
        if (descMatch) {
          description = descMatch[1].trim().replace(/\*\*/g, '');
        }
        
        // Try to extract Tips section
        const tipsMatch = aiAnalysis.match(/Tips:\s*([\s\S]*?)$/i);
        if (tipsMatch) {
          const tipsText = tipsMatch[1];
          // Extract numbered tips
          const tipLines = tipsText.match(/\d+\.\s*(.+?)(?=\n\d+\.|\n*$)/gs);
          if (tipLines) {
            stylingTips = tipLines.map((tip: string) => {
              return tip.replace(/^\d+\.\s*/, '').replace(/\*\*/g, '').trim();
            });
          }
        }
        
        // Fallback: if structured parsing failed, try to extract any content
        if (!description && !stylingTips.length && aiAnalysis) {
          // Split by newlines and look for numbered lists
          const lines = aiAnalysis.split('\n').filter((l: string) => l.trim());
          
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (/^\d+\./.test(line)) {
              // This is a tip
              stylingTips.push(line.replace(/^\d+\.\s*/, '').replace(/\*\*/g, '').trim());
            } else if (!description && line.length > 20) {
              // This might be the description
              description = line.replace(/\*\*/g, '').trim();
            }
          }
          
          // If still no description, use first paragraph
          if (!description) {
            description = aiAnalysis.substring(0, 300).replace(/\*\*/g, '').replace(/###/g, '').trim();
          }
        }
        
        // Add parsed AI analysis to response
        data.aiDescription = description;
        data.aiStylingTips = stylingTips.length > 0 ? stylingTips : undefined;
      }
    } catch (aiError) {
      console.error('Vultr AI enhancement error:', aiError);
      // Continue without AI enhancement
    }
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Image analysis error:', error);
    return c.json({ error: error?.message || 'Failed to analyze image' }, 500);
  }
});

export default class extends Service<Env> {
  async fetch(request: Request): Promise<Response> {
    return app.fetch(request, this.env);
  }
}
