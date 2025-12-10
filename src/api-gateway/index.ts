import { Service } from '@liquidmetal-ai/raindrop-framework';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { QueueSendOptions } from '@liquidmetal-ai/raindrop-framework';
import { KvCachePutOptions, KvCacheGetOptions } from '@liquidmetal-ai/raindrop-framework';
import { BucketPutOptions, BucketListOptions } from '@liquidmetal-ai/raindrop-framework';
import { Env } from './raindrop.gen';
import profileRoutes from './profile-routes';

// Note: Firebase Admin SDK is not initialized here as we're in an edge environment
// The api-gateway uses firebase-backend-client which forwards requests to the Node.js backend
// This allows us to use Firebase Admin SDK features via the backend service

// Create Hono app with middleware
const app = new Hono<{ Bindings: Env }>();

// Add CORS middleware (must be before other routes)
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length', 'X-Request-Id'],
  maxAge: 600,
  credentials: false,
}));

// Add request logging middleware
app.use('*', logger());

// Root endpoint - API documentation page
app.get('/', (c) => {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fashion Fusion Shop API Gateway</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: #333;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 2rem;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem;
      text-align: center;
    }
    .header h1 {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
    }
    .header p {
      font-size: 1.1rem;
      opacity: 0.9;
    }
    .content {
      padding: 2rem;
    }
    .status {
      background: #d4edda;
      color: #155724;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 2rem;
      border-left: 4px solid #28a745;
    }
    .section {
      margin-bottom: 2rem;
    }
    .section h2 {
      color: #667eea;
      margin-bottom: 1rem;
      font-size: 1.5rem;
    }
    .endpoint {
      background: #f8f9fa;
      padding: 1rem;
      margin-bottom: 1rem;
      border-radius: 8px;
      border-left: 4px solid #667eea;
    }
    .endpoint-header {
      display: flex;
      align-items: center;
      margin-bottom: 0.5rem;
    }
    .method {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 4px;
      font-weight: bold;
      font-size: 0.85rem;
      margin-right: 1rem;
    }
    .method.get {
      background: #28a745;
      color: white;
    }
    .method.post {
      background: #007bff;
      color: white;
    }
    .path {
      font-family: 'Courier New', monospace;
      font-size: 1rem;
      color: #495057;
    }
    .description {
      color: #6c757d;
      font-size: 0.95rem;
      margin-top: 0.5rem;
    }
    .try-it {
      display: inline-block;
      background: #667eea;
      color: white;
      text-decoration: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      margin-top: 0.5rem;
      font-size: 0.9rem;
      transition: background 0.3s;
    }
    .try-it:hover {
      background: #764ba2;
    }
    .footer {
      text-align: center;
      padding: 1.5rem;
      color: #6c757d;
      border-top: 1px solid #dee2e6;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🛍️ Fashion Fusion Shop</h1>
      <p>API Gateway - Welcome</p>
    </div>
    
    <div class="content">
      <div class="status">
        <strong>✅ Status:</strong> API Gateway is running and healthy
      </div>

      <div class="section">
        <h2>Available Endpoints</h2>
        
        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/health</span>
          </div>
          <div class="description">
            Health check endpoint - Returns API status and timestamp
          </div>
          <a href="/health" class="try-it" target="_blank">Try it →</a>
        </div>

        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/api/hello</span>
          </div>
          <div class="description">
            Simple greeting endpoint - Returns a hello message
          </div>
          <a href="/api/hello" class="try-it" target="_blank">Try it →</a>
        </div>

        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/api/hello/:name</span>
          </div>
          <div class="description">
            Personalized greeting - Returns a hello message with your name
          </div>
          <a href="/api/hello/World" class="try-it" target="_blank">Try it →</a>
        </div>

        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method post">POST</span>
            <span class="path">/api/echo</span>
          </div>
          <div class="description">
            Echo endpoint - Returns whatever JSON you send to it
          </div>
        </div>

        <div class="endpoint">
          <div class="endpoint-header">
            <span class="method get">GET</span>
            <span class="path">/api/config</span>
          </div>
          <div class="description">
            Configuration endpoint - Shows available bindings and environment info
          </div>
          <a href="/api/config" class="try-it" target="_blank">Try it →</a>
        </div>
      </div>

      <div class="section">
        <h2>📚 Documentation</h2>
        <p>This is the Fashion Fusion Shop API Gateway. It orchestrates communication between various microservices including:</p>
        <ul style="margin-left: 2rem; margin-top: 1rem;">
          <li>Image Analysis Service</li>
          <li>Image Generation Service</li>
          <li>Product Service</li>
          <li>Order Service</li>
          <li>Payment Service</li>
        </ul>
      </div>
    </div>

    <div class="footer">
      <p>Powered by Raindrop Framework 🌧️</p>
      <p style="font-size: 0.85rem; margin-top: 0.5rem;">
        Timestamp: ${new Date().toISOString()}
      </p>
    </div>
  </div>
</body>
</html>
  `;
  
  return c.html(html);
});

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount profile routes (protected by Firebase auth middleware)
app.route('/api/profile', profileRoutes);

// === Authentication Routes ===

// Helper function to hash passwords (simple crypto hash - in production use bcrypt)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Helper function to generate JWT token (simplified - in production use proper JWT library)
function generateToken(userId: string, email: string): string {
  const payload = {
    userId,
    email,
    iat: Date.now(),
    exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  };
  // In production, this should be signed with a secret key
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

app.post('/api/auth/signup', async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, fullName } = body;

    // Validate input
    if (!email || !password) {
      return c.json({ 
        error: 'Email and password are required',
        code: 'INVALID_INPUT'
      }, 400);
    }

    if (password.length < 6) {
      return c.json({ 
        error: 'Password must be at least 6 characters',
        code: 'INVALID_PASSWORD'
      }, 400);
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return c.json({ 
        error: 'Invalid email format',
        code: 'INVALID_EMAIL'
      }, 400);
    }

    // Get database connection
    const db = c.env.FASHION_DB;
    if (!db) {
      return c.json({ 
        error: 'Database unavailable',
        code: 'SERVICE_UNAVAILABLE'
      }, 503);
    }

    // Check if user already exists
    const checkResult = await db.executeQuery({
      sqlQuery: `SELECT id FROM users WHERE email = '${email.toLowerCase().replace(/'/g, "''")}'`,
      format: 'json'
    });

    console.log('Check result:', JSON.stringify(checkResult));

    if (checkResult.results) {
      try {
        const rows = JSON.parse(checkResult.results);
        console.log('Parsed rows:', rows);
        if (rows && Array.isArray(rows) && rows.length > 0) {
          return c.json({ 
            error: 'User with this email already exists',
            code: 'USER_EXISTS'
          }, 409);
        }
      } catch (parseError) {
        console.error('Error parsing check results:', parseError);
        // If we can't parse, check the raw string
        if (checkResult.results.includes('"id"')) {
          return c.json({ 
            error: 'User with this email already exists',
            code: 'USER_EXISTS'
          }, 409);
        }
      }
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const userId = crypto.randomUUID();
    const insertResult = await db.executeQuery({
      sqlQuery: `INSERT INTO users (id, email, password_hash, full_name, created_at, updated_at)
        VALUES ('${userId}', '${email.toLowerCase().replace(/'/g, "''")}', '${passwordHash}', ${fullName ? `'${fullName.replace(/'/g, "''")}'` : 'NULL'}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      format: 'json'
    });

    // Generate token
    const token = generateToken(userId, email);

    return c.json({
      success: true,
      user: {
        id: userId,
        email: email.toLowerCase(),
        name: fullName || email.split('@')[0]
      },
      token
    }, 201);

  } catch (error) {
    console.error('Error in /api/auth/signup:', error);
    return c.json({ 
      error: 'Failed to create account',
      code: 'SIGNUP_FAILED',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

app.post('/api/auth/login', async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return c.json({ 
        error: 'Email and password are required',
        code: 'INVALID_INPUT'
      }, 400);
    }

    // Get database connection
    const db = c.env.FASHION_DB;
    if (!db) {
      return c.json({ 
        error: 'Database unavailable',
        code: 'SERVICE_UNAVAILABLE'
      }, 503);
    }

    // Find user
    const userResult = await db.executeQuery({
      sqlQuery: `SELECT id, email, password_hash, full_name 
        FROM users 
        WHERE email = '${email.toLowerCase().replace(/'/g, "''")}'`,
      format: 'json'
    });

    console.log('Login user result:', JSON.stringify(userResult));

    if (!userResult.results) {
      console.log('No results returned from query');
      return c.json({ 
        error: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      }, 401);
    }

    let users;
    try {
      users = JSON.parse(userResult.results);
      console.log('Parsed users:', users);
    } catch (parseError) {
      console.error('Error parsing user results:', parseError);
      return c.json({ 
        error: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      }, 401);
    }

    if (!users || !Array.isArray(users) || users.length === 0) {
      console.log('No users found or invalid format');
      return c.json({ 
        error: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      }, 401);
    }

    const user = users[0];
    console.log('Found user:', user.id, user.email);

    // Verify password
    const passwordHash = await hashPassword(password);
    if (passwordHash !== user.password_hash) {
      return c.json({ 
        error: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      }, 401);
    }

    // Update last login
    await db.executeQuery({
      sqlQuery: `UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = '${user.id}'`,
      format: 'json'
    });

    // Generate token
    const token = generateToken(user.id, user.email);

    return c.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.full_name || user.email.split('@')[0]
      },
      token
    }, 200);

  } catch (error) {
    console.error('Error in /api/auth/login:', error);
    return c.json({ 
      error: 'Failed to login',
      code: 'LOGIN_FAILED',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// === Basic API Routes ===
app.get('/api/hello', (c) => {
  return c.json({ message: 'Hello from Hono!' });
});

app.get('/api/hello/:name', (c) => {
  const name = c.req.param('name');
  return c.json({ message: `Hello, ${name}!` });
});

// Example POST endpoint
app.post('/api/echo', async (c) => {
  const body = await c.req.json();
  return c.json({ received: body });
});

// === RPC Examples: Service calling Actor ===
// Example: Call an actor method
/*
app.post('/api/actor-call', async (c) => {
  try {
    const { message, actorName } = await c.req.json();

    if (!actorName) {
      return c.json({ error: 'actorName is required' }, 400);
    }

    // Get actor namespace and create actor instance
    // Note: Replace MY_ACTOR with your actual actor binding name
    const actorNamespace = c.env.MY_ACTOR; // This would be bound in raindrop.manifest
    const actorId = actorNamespace.idFromName(actorName);
    const actor = actorNamespace.get(actorId);

    // Call actor method (assuming actor has a 'processMessage' method)
    const response = await actor.processMessage(message);

    return c.json({
      success: true,
      actorName,
      response
    });
  } catch (error) {
    return c.json({
      error: 'Failed to call actor',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});
*/

// Example: Get actor state
/*
app.get('/api/actor-state/:actorName', async (c) => {
  try {
    const actorName = c.req.param('actorName');

    // Get actor instance
    const actorNamespace = c.env.MY_ACTOR;
    const actorId = actorNamespace.idFromName(actorName);
    const actor = actorNamespace.get(actorId);

    // Get actor state (assuming actor has a 'getState' method)
    const state = await actor.getState();

    return c.json({
      success: true,
      actorName,
      state
    });
  } catch (error) {
    return c.json({
      error: 'Failed to get actor state',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});
*/

// === SmartBucket Examples ===
// Example: Upload file to SmartBucket
/*
app.post('/api/upload', async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const description = formData.get('description') as string;

    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    // Upload to SmartBucket (Replace MY_SMARTBUCKET with your binding name)
    const smartbucket = c.env.MY_SMARTBUCKET;
    const arrayBuffer = await file.arrayBuffer();

    const putOptions: BucketPutOptions = {
      httpMetadata: {
        contentType: file.type || 'application/octet-stream',
      },
      customMetadata: {
        originalName: file.name,
        size: file.size.toString(),
        description: description || '',
        uploadedAt: new Date().toISOString()
      }
    };

    const result = await smartbucket.put(file.name, new Uint8Array(arrayBuffer), putOptions);

    return c.json({
      success: true,
      message: 'File uploaded successfully',
      key: result.key,
      size: result.size,
      etag: result.etag
    });
  } catch (error) {
    return c.json({
      error: 'Failed to upload file',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});
*/

// Example: Get file from SmartBucket
/*
app.get('/api/file/:filename', async (c) => {
  try {
    const filename = c.req.param('filename');

    // Get file from SmartBucket
    const smartbucket = c.env.MY_SMARTBUCKET;
    const file = await smartbucket.get(filename);

    if (!file) {
      return c.json({ error: 'File not found' }, 404);
    }

    return new Response(file.body, {
      headers: {
        'Content-Type': file.httpMetadata?.contentType || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'X-Object-Size': file.size.toString(),
        'X-Object-ETag': file.etag,
        'X-Object-Uploaded': file.uploaded.toISOString(),
      }
    });
  } catch (error) {
    return c.json({
      error: 'Failed to retrieve file',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});
*/

// Example: Search SmartBucket documents
/*
app.post('/api/search', async (c) => {
  try {
    const { query, page = 1, pageSize = 10 } = await c.req.json();

    if (!query) {
      return c.json({ error: 'Query is required' }, 400);
    }

    const smartbucket = c.env.MY_SMARTBUCKET;

    // For initial search
    if (page === 1) {
      const requestId = `search-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      const results = await smartbucket.search({
        input: query,
        requestId
      });

      return c.json({
        success: true,
        message: 'Search completed',
        query,
        results: results.results,
        pagination: {
          ...results.pagination,
          requestId
        }
      });
    } else {
      // For paginated results
      const { requestId } = await c.req.json();
      if (!requestId) {
        return c.json({ error: 'Request ID required for pagination' }, 400);
      }

      const paginatedResults = await smartbucket.getPaginatedResults({
        requestId,
        page,
        pageSize
      });

      return c.json({
        success: true,
        message: 'Paginated results',
        query,
        results: paginatedResults.results,
        pagination: paginatedResults.pagination
      });
    }
  } catch (error) {
    return c.json({
      error: 'Search failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});
*/

// Example: Chunk search for finding specific sections
/*
app.post('/api/chunk-search', async (c) => {
  try {
    const { query } = await c.req.json();

    if (!query) {
      return c.json({ error: 'Query is required' }, 400);
    }

    const smartbucket = c.env.MY_SMARTBUCKET;
    const requestId = `chunk-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    const results = await smartbucket.chunkSearch({
      input: query,
      requestId
    });

    return c.json({
      success: true,
      message: 'Chunk search completed',
      query,
      results: results.results
    });
  } catch (error) {
    return c.json({
      error: 'Chunk search failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});
*/

// Example: Document chat/Q&A
/*
app.post('/api/document-chat', async (c) => {
  try {
    const { objectId, query } = await c.req.json();

    if (!objectId || !query) {
      return c.json({ error: 'objectId and query are required' }, 400);
    }

    const smartbucket = c.env.MY_SMARTBUCKET;
    const requestId = `chat-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    const response = await smartbucket.documentChat({
      objectId,
      input: query,
      requestId
    });

    return c.json({
      success: true,
      message: 'Document chat completed',
      objectId,
      query,
      answer: response.answer
    });
  } catch (error) {
    return c.json({
      error: 'Document chat failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});
*/

// Example: List objects in bucket
/*
app.get('/api/list', async (c) => {
  try {
    const url = new URL(c.req.url);
    const prefix = url.searchParams.get('prefix') || undefined;
    const limit = url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : undefined;

    const smartbucket = c.env.MY_SMARTBUCKET;

    const listOptions: BucketListOptions = {
      prefix,
      limit
    };

    const result = await smartbucket.list(listOptions);

    return c.json({
      success: true,
      objects: result.objects.map(obj => ({
        key: obj.key,
        size: obj.size,
        uploaded: obj.uploaded,
        etag: obj.etag
      })),
      truncated: result.truncated,
      cursor: result.truncated ? result.cursor : undefined
    });
  } catch (error) {
    return c.json({
      error: 'List failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});
*/

// === KV Cache Examples ===
// Example: Store data in KV cache
/*
app.post('/api/cache', async (c) => {
  try {
    const { key, value, ttl } = await c.req.json();

    if (!key || value === undefined) {
      return c.json({ error: 'key and value are required' }, 400);
    }

    const cache = c.env.MY_CACHE;

    const putOptions: KvCachePutOptions = {};
    if (ttl) {
      putOptions.expirationTtl = ttl;
    }

    await cache.put(key, JSON.stringify(value), putOptions);

    return c.json({
      success: true,
      message: 'Data cached successfully',
      key
    });
  } catch (error) {
    return c.json({
      error: 'Cache put failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});
*/

// Example: Get data from KV cache
/*
app.get('/api/cache/:key', async (c) => {
  try {
    const key = c.req.param('key');

    const cache = c.env.MY_CACHE;

    const getOptions: KvCacheGetOptions<'json'> = {
      type: 'json'
    };

    const value = await cache.get(key, getOptions);

    if (value === null) {
      return c.json({ error: 'Key not found in cache' }, 404);
    }

    return c.json({
      success: true,
      key,
      value
    });
  } catch (error) {
    return c.json({
      error: 'Cache get failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});
*/

// === Queue Examples ===
// Example: Send message to queue
/*
app.post('/api/queue/send', async (c) => {
  try {
    const { message, delaySeconds } = await c.req.json();

    if (!message) {
      return c.json({ error: 'message is required' }, 400);
    }

    const queue = c.env.MY_QUEUE;

    const sendOptions: QueueSendOptions = {};
    if (delaySeconds) {
      sendOptions.delaySeconds = delaySeconds;
    }

    await queue.send(message, sendOptions);

    return c.json({
      success: true,
      message: 'Message sent to queue'
    });
  } catch (error) {
    return c.json({
      error: 'Queue send failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});
*/

// === Environment Variable Examples ===
app.get('/api/config', (c) => {
  return c.json({
    hasEnv: !!c.env,
    availableBindings: {
      // These would be true if the resources are bound in raindrop.manifest
      // MY_ACTOR: !!c.env.MY_ACTOR,
      // MY_SMARTBUCKET: !!c.env.MY_SMARTBUCKET,
      // MY_CACHE: !!c.env.MY_CACHE,
      // MY_QUEUE: !!c.env.MY_QUEUE,
    },
    // Example access to environment variables:
    // MY_SECRET_VAR: c.env.MY_SECRET_VAR // This would be undefined if not set
  });
});

// === Product Analysis Routes ===
app.post('/api/products/analyze', async (c) => {
  try {
    const body = await c.req.json();
    const { imageUrl, imageData } = body;

    // Validate input
    if (!imageUrl && !imageData) {
      return c.json({ 
        error: 'Missing imageUrl or imageData',
        code: 'INVALID_IMAGE'
      }, 400);
    }

    // Call image analysis service
    const analysisService = c.env.IMAGE_ANALYSIS_SERVICE;
    if (!analysisService) {
      return c.json({ 
        error: 'Image analysis service unavailable',
        code: 'SERVICE_UNAVAILABLE'
      }, 503);
    }

    const result = await analysisService.analyzeImage({ imageUrl, imageData });
    return c.json(result, 200);

  } catch (error) {
    console.error('Error in /api/products/analyze:', error);
    return c.json({ 
      error: 'Image analysis service unavailable',
      code: 'SERVICE_UNAVAILABLE',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 503);
  }
});

// === Product Management Routes ===
app.post('/api/products/save', async (c) => {
  try {
    const body = await c.req.json();
    const { productId, categoryId, imageUrl, items } = body;

    // Validate input
    if (!productId || !categoryId) {
      return c.json({ 
        error: 'Missing required fields: productId and categoryId',
        code: 'INVALID_INPUT'
      }, 400);
    }

    // Call product service
    const productService = c.env.PRODUCT_SERVICE;
    if (!productService) {
      return c.json({ 
        error: 'Product service unavailable',
        code: 'SERVICE_UNAVAILABLE'
      }, 503);
    }

    const result = await productService.saveProduct({ productId, categoryId, imageUrl, items });
    return c.json(result, 201);

  } catch (error) {
    console.error('Error in /api/products/save:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Check if it's a not found error
    if (errorMessage.includes('not found') || errorMessage.includes('Category not found')) {
      return c.json({ 
        error: errorMessage,
        code: 'CATEGORY_NOT_FOUND'
      }, 404);
    }

    return c.json({ 
      error: 'Failed to save product',
      code: 'SAVE_FAILED',
      message: errorMessage
    }, 500);
  }
});

app.get('/api/categories', async (c) => {
  try {
    const userId = c.req.query('userId');

    if (!userId) {
      return c.json({ 
        error: 'Missing userId parameter',
        code: 'INVALID_INPUT'
      }, 400);
    }

    // Call product service
    const productService = c.env.PRODUCT_SERVICE;
    if (!productService) {
      return c.json({ 
        error: 'Product service unavailable',
        code: 'SERVICE_UNAVAILABLE'
      }, 503);
    }

    const result = await productService.getCategories({ userId });
    return c.json(result, 200);

  } catch (error) {
    console.error('Error in /api/categories:', error);
    return c.json({ 
      error: 'Failed to retrieve categories',
      code: 'RETRIEVAL_FAILED',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

app.get('/api/categories/:categoryId/products', async (c) => {
  try {
    const categoryId = c.req.param('categoryId');
    const page = parseInt(c.req.query('page') || '1', 10);
    const limit = parseInt(c.req.query('limit') || '20', 10);

    // Call product service
    const productService = c.env.PRODUCT_SERVICE;
    if (!productService) {
      return c.json({ 
        error: 'Product service unavailable',
        code: 'SERVICE_UNAVAILABLE'
      }, 503);
    }

    const result = await productService.getProductsByCategory({ categoryId, page, limit });
    return c.json(result, 200);

  } catch (error) {
    console.error('Error in /api/categories/:categoryId/products:', error);
    return c.json({ 
      error: 'Failed to retrieve products',
      code: 'RETRIEVAL_FAILED',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

app.get('/api/products/:productId', async (c) => {
  try {
    const productId = c.req.param('productId');

    // Call product service
    const productService = c.env.PRODUCT_SERVICE;
    if (!productService) {
      return c.json({ 
        error: 'Product service unavailable',
        code: 'SERVICE_UNAVAILABLE'
      }, 503);
    }

    const result = await productService.getProductDetails({ productId });
    return c.json(result, 200);

  } catch (error) {
    console.error('Error in /api/products/:productId:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Check if it's a not found error
    if (errorMessage.includes('not found') || errorMessage.includes('Product not found')) {
      return c.json({ 
        error: errorMessage,
        code: 'PRODUCT_NOT_FOUND'
      }, 404);
    }

    return c.json({ 
      error: 'Failed to retrieve product',
      code: 'RETRIEVAL_FAILED',
      message: errorMessage
    }, 500);
  }
});

app.delete('/api/products/:productId', async (c) => {
  try {
    const productId = c.req.param('productId');

    // Call product service
    const productService = c.env.PRODUCT_SERVICE;
    if (!productService) {
      return c.json({ 
        error: 'Product service unavailable',
        code: 'SERVICE_UNAVAILABLE'
      }, 503);
    }

    const result = await productService.deleteProduct({ productId });
    return c.json(result, 200);

  } catch (error) {
    console.error('Error in /api/products/:productId (DELETE):', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Check if it's a not found error
    if (errorMessage.includes('not found') || errorMessage.includes('Product not found')) {
      return c.json({ 
        error: errorMessage,
        code: 'PRODUCT_NOT_FOUND'
      }, 404);
    }

    return c.json({ 
      error: 'Failed to delete product',
      code: 'DELETE_FAILED',
      message: errorMessage
    }, 500);
  }
});

// === Checkout & Order Routes ===
app.post('/api/checkout/validate-address', async (c) => {
  try {
    const body = await c.req.json();
    
    // Accept the address fields directly or as an 'address' object
    const address = body.address || body;

    // Call order service
    const orderService = c.env.ORDER_SERVICE;
    if (!orderService) {
      return c.json({ 
        error: 'Order service unavailable',
        code: 'SERVICE_UNAVAILABLE'
      }, 503);
    }

    const result = await orderService.validateAddress(address);
    
    // If the result has valid: false, return 422
    if (result && typeof result === 'object' && 'valid' in result && !result.valid) {
      return c.json(result, 422);
    }
    
    return c.json(result, 200);

  } catch (error) {
    console.error('Error in /api/checkout/validate-address:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Check if it's a validation error
    if (errorMessage.includes('Invalid') || errorMessage.includes('invalid')) {
      return c.json({ 
        error: errorMessage,
        code: 'INVALID_ADDRESS'
      }, 422);
    }

    return c.json({ 
      error: 'Failed to validate address',
      code: 'VALIDATION_FAILED',
      message: errorMessage
    }, 500);
  }
});

app.post('/api/orders', async (c) => {
  try {
    const body = await c.req.json();
    const { userId, items, shippingAddress, paymentMethod } = body;

    if (!userId || !items || !shippingAddress || !paymentMethod) {
      return c.json({ 
        error: 'Missing required fields',
        code: 'INVALID_INPUT'
      }, 400);
    }

    // Call order service
    const orderService = c.env.ORDER_SERVICE;
    if (!orderService) {
      return c.json({ 
        error: 'Order service unavailable',
        code: 'SERVICE_UNAVAILABLE'
      }, 503);
    }

    const result = await orderService.createOrder({ userId, items, shippingAddress, paymentMethod });
    return c.json(result, 201);

  } catch (error) {
    console.error('Error in /api/orders:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Check if it's an address validation error
    if (errorMessage.includes('address') || errorMessage.includes('Address')) {
      return c.json({ 
        error: errorMessage,
        code: 'INVALID_ADDRESS'
      }, 422);
    }

    return c.json({ 
      error: 'Failed to create order',
      code: 'ORDER_CREATION_FAILED',
      message: errorMessage
    }, 500);
  }
});

app.get('/api/orders/:orderId', async (c) => {
  try {
    const orderId = c.req.param('orderId');

    // Call order service
    const orderService = c.env.ORDER_SERVICE;
    if (!orderService) {
      return c.json({ 
        error: 'Order service unavailable',
        code: 'SERVICE_UNAVAILABLE'
      }, 503);
    }

    const result = await orderService.getOrderStatus({ orderId });
    return c.json(result, 200);

  } catch (error) {
    console.error('Error in /api/orders/:orderId:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Check if it's a not found error
    if (errorMessage.includes('not found') || errorMessage.includes('Order not found')) {
      return c.json({ 
        error: errorMessage,
        code: 'ORDER_NOT_FOUND'
      }, 404);
    }

    return c.json({ 
      error: 'Failed to retrieve order',
      code: 'RETRIEVAL_FAILED',
      message: errorMessage
    }, 500);
  }
});

// === Payment Routes ===
app.post('/api/payments', async (c) => {
  try {
    const body = await c.req.json();
    const { orderId, paymentMethod, paymentDetails } = body;

    if (!orderId || !paymentMethod) {
      return c.json({ 
        error: 'Missing required fields',
        code: 'INVALID_INPUT'
      }, 400);
    }

    // Call payment service
    const paymentService = c.env.PAYMENT_SERVICE;
    if (!paymentService) {
      return c.json({ 
        error: 'Payment service unavailable',
        code: 'SERVICE_UNAVAILABLE'
      }, 503);
    }

    const result = await paymentService.processPayment({ orderId, paymentMethod, paymentDetails });
    
    // If payment failed (success: false in response), return 422
    if (result && typeof result === 'object' && 'success' in result && !result.success) {
      return c.json(result, 422);
    }
    
    return c.json(result, 200);

  } catch (error) {
    console.error('Error in /api/payments:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Check if it's a payment declined error
    if (errorMessage.includes('declined') || errorMessage.includes('Declined')) {
      return c.json({ 
        error: errorMessage,
        code: 'PAYMENT_DECLINED'
      }, 402);
    }

    return c.json({ 
      error: 'Failed to process payment',
      code: 'PAYMENT_FAILED',
      message: errorMessage
    }, 500);
  }
});

export default class extends Service<Env> {
  async fetch(request: Request): Promise<Response> {
    return app.fetch(request, this.env);
  }
}
