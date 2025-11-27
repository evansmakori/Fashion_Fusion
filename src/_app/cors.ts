import { corsAllowAll } from '@liquidmetal-ai/raindrop-framework/core/cors';

/**
 * Application-wide CORS configuration.
 *
 * For production, set env.ALLOWED_ORIGINS to a comma-separated list of allowed origins.
 * If ALLOWED_ORIGINS is empty or unset, CORS will be denied by default (most secure).
 */
export const cors = corsAllowAll;
/* Reverted to permissive CORS for initial functionality. TODO: tighten for production.
export const cors = createCorsHandler({
  origin: (request: Request, env: any) => {
    const origin = request.headers.get('origin') || '';
    const allowed = (env.ALLOWED_ORIGINS || '')
      .split(',')
      .map((s: string) => s.trim())
      .filter(Boolean);
    if (allowed.length === 0) return null; // deny by default
    return allowed.includes(origin) ? origin : null;
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400,
});*/
