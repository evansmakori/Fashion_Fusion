// Client for Firebase Backend Service
// Forwards token verification to Node.js backend with Firebase Admin SDK

const FIREBASE_BACKEND_URL = process.env.FIREBASE_BACKEND_URL || 'http://localhost:3001';

export interface VerifiedUser {
  uid: string;
  email: string;
  emailVerified: boolean;
  name?: string;
  picture?: string;
  authTime?: number;
  exp?: number;
  iat?: number;
  [key: string]: any;
}

/**
 * Verify Firebase ID token using backend service
 * This forwards the token to a Node.js service that uses Firebase Admin SDK
 */
export async function verifyTokenWithBackend(token: string): Promise<VerifiedUser | null> {
  try {
    const response = await fetch(`${FIREBASE_BACKEND_URL}/verify-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      console.error('Backend token verification failed:', response.status);
      return null;
    }

    const result = await response.json() as any;
    
    if (!result.success) {
      return null;
    }

    return {
      uid: result.uid,
      email: result.email,
      emailVerified: result.emailVerified,
      name: result.name,
      picture: result.picture,
      authTime: result.authTime,
      exp: result.exp,
      iat: result.iat,
    };
  } catch (error) {
    console.error('Error verifying token with backend:', error);
    return null;
  }
}

/**
 * Get user information from backend
 */
export async function getUserFromBackend(uid: string, token: string): Promise<any> {
  try {
    const response = await fetch(`${FIREBASE_BACKEND_URL}/users/${uid}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const result = await response.json() as any;
    return result.success ? result.user : null;
  } catch (error) {
    console.error('Error getting user from backend:', error);
    return null;
  }
}

/**
 * Update user profile via backend
 */
export async function updateUserViaBackend(
  uid: string, 
  token: string, 
  updates: { displayName?: string; photoURL?: string }
): Promise<any> {
  try {
    const response = await fetch(`${FIREBASE_BACKEND_URL}/users/${uid}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      return null;
    }

    const result = await response.json() as any;
    return result.success ? result.user : null;
  } catch (error) {
    console.error('Error updating user via backend:', error);
    return null;
  }
}

/**
 * Check if backend is available
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${FIREBASE_BACKEND_URL}/health`, {
      method: 'GET',
    });

    return response.ok;
  } catch (error) {
    console.warn('Firebase backend not available:', error);
    return false;
  }
}
