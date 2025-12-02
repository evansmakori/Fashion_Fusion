// Note: firebase-admin requires Node.js and cannot run in edge/worker environments
// This module is designed for backend verification but may not work in all environments
// For production, consider using Firebase Admin in a separate Node.js service

let admin: any = null;

// Try to import firebase-admin, but gracefully handle if it's not available
try {
  admin = require('firebase-admin');
} catch (e) {
  console.warn('firebase-admin not available in this environment. Token verification will be disabled.');
}

// Initialize Firebase Admin SDK
// In production, use service account key from environment variable
let firebaseApp: any = null;

export function initializeFirebaseAdmin() {
  if (!admin) {
    console.warn('Firebase Admin SDK not available - running without token verification');
    return null;
  }

  if (firebaseApp) {
    return firebaseApp;
  }

  try {
    // For Cloud Functions/deployed environments, credentials are automatic
    // For local development, you would need a service account key
    
    // Initialize with project ID only (works in serverless environments)
    firebaseApp = admin.initializeApp({
      projectId: 'fashion-fussion-app',
    });
    
    console.log('Firebase Admin initialized successfully');
    return firebaseApp;
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    // Return null if initialization fails
    return null;
  }
}

// Get Firebase Auth instance
export function getAuth(): any {
  if (!admin) {
    return null;
  }
  
  if (!firebaseApp) {
    initializeFirebaseAdmin();
  }
  return firebaseApp ? admin.auth(firebaseApp) : null;
}

// Verify Firebase ID token
export async function verifyIdToken(idToken: string): Promise<any> {
  try {
    const auth = getAuth();
    if (!auth) {
      console.warn('Firebase Admin not available - skipping token verification');
      // In development/edge environments without firebase-admin, we'll decode the token client-side
      // This is NOT secure for production - use a proper Node.js backend with Firebase Admin
      try {
        const parts = idToken.split('.');
        if (parts.length !== 3 || !parts[1]) return null;
        const payloadPart = parts[1];
        const payload = JSON.parse(atob(payloadPart));
        return payload;
      } catch {
        return null;
      }
    }
    
    const decodedToken = await auth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying ID token:', error);
    return null;
  }
}

// Get user by UID
export async function getUserById(uid: string): Promise<any> {
  try {
    const auth = getAuth();
    if (!auth) {
      console.warn('Firebase Admin not available');
      return null;
    }
    
    const user = await auth.getUser(uid);
    return user;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

// Update user profile
export async function updateUserProfile(uid: string, updates: {
  displayName?: string;
  photoURL?: string;
  email?: string;
  emailVerified?: boolean;
}): Promise<any> {
  try {
    const auth = getAuth();
    if (!auth) {
      console.warn('Firebase Admin not available - cannot update user profile');
      return null;
    }
    
    const user = await auth.updateUser(uid, updates);
    return user;
  } catch (error) {
    console.error('Error updating user:', error);
    return null;
  }
}

// Delete user
export async function deleteUser(uid: string): Promise<boolean> {
  try {
    const auth = getAuth();
    if (!auth) {
      console.warn('Firebase Admin not available');
      return false;
    }
    
    await auth.deleteUser(uid);
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    return false;
  }
}

// List users (for admin purposes)
export async function listUsers(maxResults: number = 1000): Promise<any[]> {
  try {
    const auth = getAuth();
    if (!auth) {
      console.warn('Firebase Admin not available');
      return [];
    }
    
    const listUsersResult = await auth.listUsers(maxResults);
    return listUsersResult.users;
  } catch (error) {
    console.error('Error listing users:', error);
    return [];
  }
}

// Set custom user claims (for roles/permissions)
export async function setUserClaims(uid: string, claims: Record<string, any>): Promise<boolean> {
  try {
    const auth = getAuth();
    if (!auth) {
      console.warn('Firebase Admin not available');
      return false;
    }
    
    await auth.setCustomUserClaims(uid, claims);
    return true;
  } catch (error) {
    console.error('Error setting custom claims:', error);
    return false;
  }
}
