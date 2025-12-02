const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Firebase Admin SDK
const serviceAccount = require('../fashion-fussion-app-firebase-adminsdk-fbsvc-1b0d339527.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'fashion-fussion-app'
});

console.log('Firebase Admin SDK initialized successfully');

// Middleware
app.use(cors({
  origin: [
    'https://svc-01kb2kaj6e225wh9hdv8rwfpfc.01kaabs55f12xsvgzarqrjkdsa.lmapp.run',
    'https://svc-01kb2kaj6e225wh9hdv8rwfpfb.01kaabs55f12xsvgzarqrjkdsa.lmapp.run',
    'http://localhost:3000',
    'http://localhost:5173'
  ],
  credentials: true
}));

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'Firebase Backend',
    timestamp: new Date().toISOString() 
  });
});

// Verify Firebase ID token
app.post('/verify-token', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        error: 'Token is required',
        code: 'NO_TOKEN'
      });
    }

    // Verify the token with Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Return decoded token information
    res.json({
      success: true,
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      name: decodedToken.name,
      picture: decodedToken.picture,
      authTime: decodedToken.auth_time,
      exp: decodedToken.exp,
      iat: decodedToken.iat
    });

  } catch (error) {
    console.error('Token verification error:', error);
    
    // Handle specific Firebase errors
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        error: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    if (error.code === 'auth/argument-error') {
      return res.status(400).json({
        error: 'Invalid token format',
        code: 'INVALID_TOKEN_FORMAT'
      });
    }

    res.status(401).json({
      error: 'Invalid token',
      code: 'INVALID_TOKEN',
      message: error.message
    });
  }
});

// Get user by UID
app.get('/users/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    
    // Verify authorization token first
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.substring(7);
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Users can only get their own information
    if (decodedToken.uid !== uid) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const userRecord = await admin.auth().getUser(uid);

    res.json({
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
        providerData: userRecord.providerData,
        customClaims: userRecord.customClaims
      }
    });

  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({
      error: 'Failed to get user',
      message: error.message
    });
  }
});

// Update user profile
app.put('/users/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const { displayName, photoURL } = req.body;
    
    // Verify authorization token first
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.substring(7);
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Users can only update their own information
    if (decodedToken.uid !== uid) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const updates = {};
    if (displayName !== undefined) updates.displayName = displayName;
    if (photoURL !== undefined) updates.photoURL = photoURL;

    const userRecord = await admin.auth().updateUser(uid, updates);

    res.json({
      success: true,
      message: 'User updated successfully',
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        photoURL: userRecord.photoURL
      }
    });

  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      error: 'Failed to update user',
      message: error.message
    });
  }
});

// Set custom user claims (admin only)
app.post('/users/:uid/claims', async (req, res) => {
  try {
    const { uid } = req.params;
    const { claims } = req.body;
    
    // Verify authorization token first
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.substring(7);
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Check if user has admin claim
    if (!decodedToken.admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    await admin.auth().setCustomUserClaims(uid, claims);

    res.json({
      success: true,
      message: 'Custom claims set successfully',
      uid,
      claims
    });

  } catch (error) {
    console.error('Error setting custom claims:', error);
    res.status(500).json({
      error: 'Failed to set custom claims',
      message: error.message
    });
  }
});

// List users (admin only, paginated)
app.get('/users', async (req, res) => {
  try {
    const maxResults = parseInt(req.query.limit) || 100;
    const pageToken = req.query.pageToken;
    
    // Verify authorization token first
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.substring(7);
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Check if user has admin claim
    if (!decodedToken.admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const listUsersResult = await admin.auth().listUsers(maxResults, pageToken);

    res.json({
      success: true,
      users: listUsersResult.users.map(user => ({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified,
        disabled: user.disabled,
        metadata: {
          creationTime: user.metadata.creationTime,
          lastSignInTime: user.metadata.lastSignInTime
        }
      })),
      pageToken: listUsersResult.pageToken
    });

  } catch (error) {
    console.error('Error listing users:', error);
    res.status(500).json({
      error: 'Failed to list users',
      message: error.message
    });
  }
});

// Delete user (admin only)
app.delete('/users/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    
    // Verify authorization token first
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.substring(7);
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Check if user has admin claim
    if (!decodedToken.admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    await admin.auth().deleteUser(uid);

    res.json({
      success: true,
      message: 'User deleted successfully',
      uid
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      error: 'Failed to delete user',
      message: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Firebase Backend running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Token verification: POST http://localhost:${PORT}/verify-token`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});
