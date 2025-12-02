import { Hono } from 'hono';
import { requireAuth, getCurrentUser } from '../_app/auth-middleware';
import { getUserById, updateUserProfile } from '../_app/firebase-admin';
import { getUserFromBackend, updateUserViaBackend } from '../_app/firebase-backend-client';
import type { Env } from './raindrop.gen';

const profile = new Hono<{ Bindings: Env }>();

// Get current user's profile
profile.get('/me', requireAuth, async (c) => {
  try {
    const currentUser = getCurrentUser(c);
    
    if (!currentUser) {
      return c.json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      }, 404);
    }

    // Try to get user from backend service first
    const authHeader = c.req.header('Authorization');
    const token = authHeader ? authHeader.substring(7) : '';
    
    let userRecord = await getUserFromBackend(currentUser.uid, token);
    
    // Fallback to local Firebase Admin if backend unavailable
    if (!userRecord) {
      console.log('Backend unavailable, using local Firebase Admin');
      userRecord = await getUserById(currentUser.uid);
    }

    if (!userRecord) {
      return c.json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      }, 404);
    }

    return c.json({
      success: true,
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        emailVerified: userRecord.emailVerified,
        displayName: userRecord.displayName,
        photoURL: userRecord.photoURL,
        disabled: userRecord.disabled,
        metadata: {
          creationTime: userRecord.metadata.creationTime,
          lastSignInTime: userRecord.metadata.lastSignInTime,
          lastRefreshTime: userRecord.metadata.lastRefreshTime
        },
        providerData: userRecord.providerData.map((provider: any) => ({
          providerId: provider.providerId,
          uid: provider.uid,
          displayName: provider.displayName,
          email: provider.email,
          photoURL: provider.photoURL
        })),
        customClaims: userRecord.customClaims
      }
    });
  } catch (error) {
    console.error('Error getting profile:', error);
    return c.json({
      error: 'Failed to get profile',
      code: 'GET_PROFILE_FAILED',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Update current user's profile
profile.put('/me', requireAuth, async (c) => {
  try {
    const currentUser = getCurrentUser(c);
    
    if (!currentUser) {
      return c.json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      }, 404);
    }

    const body = await c.req.json();
    const { displayName, photoURL } = body;

    // Validate inputs
    const updates: any = {};
    
    if (displayName !== undefined) {
      if (typeof displayName !== 'string' || displayName.length === 0) {
        return c.json({
          error: 'Display name must be a non-empty string',
          code: 'INVALID_DISPLAY_NAME'
        }, 400);
      }
      updates.displayName = displayName;
    }

    if (photoURL !== undefined) {
      if (typeof photoURL !== 'string') {
        return c.json({
          error: 'Photo URL must be a string',
          code: 'INVALID_PHOTO_URL'
        }, 400);
      }
      updates.photoURL = photoURL;
    }

    if (Object.keys(updates).length === 0) {
      return c.json({
        error: 'No updates provided',
        code: 'NO_UPDATES'
      }, 400);
    }

    // Try to update via backend service first
    const authHeader = c.req.header('Authorization');
    const token = authHeader ? authHeader.substring(7) : '';
    
    let updatedUser = await updateUserViaBackend(currentUser.uid, token, updates);
    
    // Fallback to local Firebase Admin if backend unavailable
    if (!updatedUser) {
      console.log('Backend unavailable, using local Firebase Admin');
      updatedUser = await updateUserProfile(currentUser.uid, updates);
    }

    if (!updatedUser) {
      return c.json({
        error: 'Failed to update profile',
        code: 'UPDATE_FAILED'
      }, 500);
    }

    return c.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        uid: updatedUser.uid,
        email: updatedUser.email,
        emailVerified: updatedUser.emailVerified,
        displayName: updatedUser.displayName,
        photoURL: updatedUser.photoURL
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return c.json({
      error: 'Failed to update profile',
      code: 'UPDATE_PROFILE_FAILED',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Get user preferences (stored in database)
profile.get('/preferences', requireAuth, async (c) => {
  try {
    const currentUser = getCurrentUser(c);
    const db = c.env.FASHION_DB;

    if (!db) {
      return c.json({
        error: 'Database unavailable',
        code: 'SERVICE_UNAVAILABLE'
      }, 503);
    }

    // Get user preferences from database
    const result = await db.executeQuery({
      sqlQuery: `SELECT * FROM user_preferences WHERE user_id = '${currentUser?.uid}'`,
      format: 'json'
    });

    let preferences = {};
    if (result.results) {
      const rows = JSON.parse(result.results);
      if (rows && rows.length > 0) {
        preferences = JSON.parse(rows[0].preferences || '{}');
      }
    }

    return c.json({
      success: true,
      preferences
    });
  } catch (error) {
    console.error('Error getting preferences:', error);
    return c.json({
      error: 'Failed to get preferences',
      code: 'GET_PREFERENCES_FAILED'
    }, 500);
  }
});

// Update user preferences
profile.put('/preferences', requireAuth, async (c) => {
  try {
    const currentUser = getCurrentUser(c);
    const db = c.env.FASHION_DB;

    if (!db) {
      return c.json({
        error: 'Database unavailable',
        code: 'SERVICE_UNAVAILABLE'
      }, 503);
    }

    const body = await c.req.json();
    const preferencesJson = JSON.stringify(body).replace(/'/g, "''");

    // Upsert preferences
    await db.executeQuery({
      sqlQuery: `
        INSERT INTO user_preferences (user_id, preferences, updated_at)
        VALUES ('${currentUser?.uid}', '${preferencesJson}', CURRENT_TIMESTAMP)
        ON CONFLICT(user_id) DO UPDATE SET
          preferences = '${preferencesJson}',
          updated_at = CURRENT_TIMESTAMP
      `,
      format: 'json'
    });

    return c.json({
      success: true,
      message: 'Preferences updated successfully',
      preferences: body
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    return c.json({
      error: 'Failed to update preferences',
      code: 'UPDATE_PREFERENCES_FAILED'
    }, 500);
  }
});

// Get user's activity history
profile.get('/activity', requireAuth, async (c) => {
  try {
    const currentUser = getCurrentUser(c);
    const db = c.env.FASHION_DB;

    if (!db) {
      return c.json({
        error: 'Database unavailable',
        code: 'SERVICE_UNAVAILABLE'
      }, 503);
    }

    // Get user activity from database
    const result = await db.executeQuery({
      sqlQuery: `
        SELECT * FROM user_activity 
        WHERE user_id = '${currentUser?.uid}'
        ORDER BY created_at DESC
        LIMIT 50
      `,
      format: 'json'
    });

    let activities = [];
    if (result.results) {
      activities = JSON.parse(result.results);
    }

    return c.json({
      success: true,
      activities
    });
  } catch (error) {
    console.error('Error getting activity:', error);
    return c.json({
      error: 'Failed to get activity',
      code: 'GET_ACTIVITY_FAILED'
    }, 500);
  }
});

export default profile;
