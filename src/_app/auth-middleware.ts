import { Context, Next } from 'hono';
import { verifyIdToken } from './firebase-admin';
import { verifyTokenWithBackend, checkBackendHealth } from './firebase-backend-client';

// Extend Context type to include user
declare module 'hono' {
  interface ContextVariableMap {
    user?: {
      uid: string;
      email: string;
      emailVerified: boolean;
      name?: string;
      picture?: string;
      [key: string]: any;
    };
  }
}

/**
 * Middleware to verify Firebase ID token
 * Extracts token from Authorization header and verifies it
 */
export async function requireAuth(c: Context, next: Next) {
  try {
    // Get token from Authorization header
    const authHeader = c.req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({
        error: 'Unauthorized',
        message: 'No authentication token provided',
        code: 'NO_TOKEN'
      }, 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Try to verify token with backend service first (more secure)
    let decodedToken = await verifyTokenWithBackend(token);
    
    // Fallback to local verification if backend is unavailable
    if (!decodedToken) {
      console.log('Backend verification unavailable, using local verification');
      decodedToken = await verifyIdToken(token);
    }

    if (!decodedToken) {
      return c.json({
        error: 'Unauthorized',
        message: 'Invalid or expired token',
        code: 'INVALID_TOKEN'
      }, 401);
    }

    // Add user info to context
    c.set('user', {
      ...decodedToken,
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      emailVerified: decodedToken.email_verified || false,
      name: decodedToken.name,
      picture: decodedToken.picture
    });

    await next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return c.json({
      error: 'Unauthorized',
      message: 'Authentication failed',
      code: 'AUTH_FAILED'
    }, 401);
  }
}

/**
 * Optional auth middleware - doesn't fail if no token
 * But will add user to context if valid token is provided
 */
export async function optionalAuth(c: Context, next: Next) {
  try {
    const authHeader = c.req.header('Authorization');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decodedToken = await verifyIdToken(token);

      if (decodedToken) {
        c.set('user', {
          ...decodedToken,
          uid: decodedToken.uid,
          email: decodedToken.email || '',
          emailVerified: decodedToken.email_verified || false,
          name: decodedToken.name,
          picture: decodedToken.picture
        });
      }
    }

    await next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    // Continue even if auth fails
    await next();
  }
}

/**
 * Middleware to require email verification
 */
export async function requireEmailVerified(c: Context, next: Next) {
  const user = c.get('user');

  if (!user) {
    return c.json({
      error: 'Unauthorized',
      message: 'Authentication required',
      code: 'NOT_AUTHENTICATED'
    }, 401);
  }

  if (!user.emailVerified) {
    return c.json({
      error: 'Forbidden',
      message: 'Email verification required',
      code: 'EMAIL_NOT_VERIFIED'
    }, 403);
  }

  await next();
}

/**
 * Middleware to check custom claims (roles/permissions)
 */
export function requireClaim(claimKey: string, claimValue?: any) {
  return async (c: Context, next: Next) => {
    const user = c.get('user');

    if (!user) {
      return c.json({
        error: 'Unauthorized',
        message: 'Authentication required',
        code: 'NOT_AUTHENTICATED'
      }, 401);
    }

    const userClaim = user[claimKey];

    if (userClaim === undefined) {
      return c.json({
        error: 'Forbidden',
        message: `Missing required claim: ${claimKey}`,
        code: 'INSUFFICIENT_PERMISSIONS'
      }, 403);
    }

    if (claimValue !== undefined && userClaim !== claimValue) {
      return c.json({
        error: 'Forbidden',
        message: `Insufficient permissions`,
        code: 'INSUFFICIENT_PERMISSIONS'
      }, 403);
    }

    await next();
  };
}

/**
 * Helper to get current user from context
 */
export function getCurrentUser(c: Context) {
  return c.get('user');
}
