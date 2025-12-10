import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged
} from "firebase/auth";
import { auth, googleProvider } from "./firebase-config";

// Retry configuration for network failures
const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2
};

// Helper to check network connectivity
async function checkNetworkConnectivity() {
  try {
    const response = await fetch('https://www.google.com', { 
      method: 'HEAD',
      mode: 'no-cors'
    });
    return true;
  } catch (error) {
    console.error('Network connectivity check failed:', error);
    return false;
  }
}

// Helper function to retry operations with exponential backoff
async function retryOperation(operation, operationName = 'operation') {
  let lastError;
  
  for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt + 1}/${RETRY_CONFIG.maxRetries + 1} for ${operationName}`);
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Only retry on network errors
      if (error.code === 'auth/network-request-failed') {
        if (attempt < RETRY_CONFIG.maxRetries) {
          const delay = Math.min(
            RETRY_CONFIG.initialDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt),
            RETRY_CONFIG.maxDelay
          );
          console.warn(`Network error on attempt ${attempt + 1}, retrying in ${delay}ms...`, error);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          console.error(`All ${RETRY_CONFIG.maxRetries + 1} retry attempts failed for ${operationName}`);
        }
      } else {
        // Not a network error, don't retry
        throw error;
      }
    }
  }
  
  throw lastError;
}

// Sign up with email and password
export const signUpWithEmail = async (email, password, displayName) => {
  try {
    console.log('Starting sign up process for:', email);
    
    const result = await retryOperation(async () => {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return userCredential;
    }, 'Sign up');
    
    const user = result.user;
    
    // Update display name
    if (displayName) {
      await updateProfile(user, { displayName });
    }
    
    // Send email verification
    await sendEmailVerification(user);
    
    console.log('Sign up successful for:', email);
    
    return {
      success: true,
      user: {
        id: user.uid,
        email: user.email,
        name: displayName || user.email.split('@')[0],
        emailVerified: user.emailVerified
      },
      message: "Account created successfully! Please check your email for verification."
    };
  } catch (error) {
    console.error("Error signing up:", error);
    
    if (error.code === 'auth/network-request-failed') {
      // Provide more detailed network error message
      const isOnline = await checkNetworkConnectivity();
      console.log('Device online status:', isOnline);
      return {
        success: false,
        error: isOnline 
          ? 'Network error connecting to Firebase. Please try again or check your firewall/proxy settings.'
          : 'No internet connection detected. Please check your network and try again.'
      };
    }
    
    return {
      success: false,
      error: getErrorMessage(error.code)
    };
  }
};

// Sign in with email and password
export const signInWithEmail = async (email, password) => {
  try {
    console.log('Starting sign in process for:', email);
    
    const result = await retryOperation(async () => {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential;
    }, 'Sign in');
    
    const user = result.user;
    
    console.log('Sign in successful for:', email);
    
    return {
      success: true,
      user: {
        id: user.uid,
        email: user.email,
        name: user.displayName || user.email.split('@')[0],
        emailVerified: user.emailVerified
      }
    };
  } catch (error) {
    console.error("Error signing in:", error);
    
    if (error.code === 'auth/network-request-failed') {
      const isOnline = await checkNetworkConnectivity();
      console.log('Device online status:', isOnline);
      return {
        success: false,
        error: isOnline 
          ? 'Network error connecting to Firebase. Please try again or check your firewall/proxy settings.'
          : 'No internet connection detected. Please check your network and try again.'
      };
    }
    
    return {
      success: false,
      error: getErrorMessage(error.code)
    };
  }
};

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    console.log('Starting Google sign in process');
    
    const result = await retryOperation(async () => {
      const popupResult = await signInWithPopup(auth, googleProvider);
      return popupResult;
    }, 'Google sign in');
    
    const user = result.user;
    
    console.log('Google sign in successful for:', user.email);
    
    return {
      success: true,
      user: {
        id: user.uid,
        email: user.email,
        name: user.displayName || user.email.split('@')[0],
        emailVerified: user.emailVerified,
        photoURL: user.photoURL
      }
    };
  } catch (error) {
    console.error("Error signing in with Google:", error);
    
    if (error.code === 'auth/network-request-failed') {
      const isOnline = await checkNetworkConnectivity();
      console.log('Device online status:', isOnline);
      return {
        success: false,
        error: isOnline 
          ? 'Network error connecting to Firebase. Please try again or check your firewall/proxy settings.'
          : 'No internet connection detected. Please check your network and try again.'
      };
    }
    
    // Special handling for popup-closed error
    if (error.code === 'auth/popup-closed-by-user') {
      return {
        success: false,
        error: getErrorMessage(error.code)
      };
    }
    
    return {
      success: false,
      error: getErrorMessage(error.code)
    };
  }
};

// Sign out
export const logout = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error("Error signing out:", error);
    return {
      success: false,
      error: "Failed to sign out"
    };
  }
};

// Send password reset email
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return {
      success: true,
      message: "Password reset email sent! Check your inbox."
    };
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return {
      success: false,
      error: getErrorMessage(error.code)
    };
  }
};

// Resend email verification
export const resendVerificationEmail = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return {
        success: false,
        error: "No user is currently signed in"
      };
    }
    
    await sendEmailVerification(user);
    return {
      success: true,
      message: "Verification email sent! Check your inbox."
    };
  } catch (error) {
    console.error("Error sending verification email:", error);
    return {
      success: false,
      error: getErrorMessage(error.code)
    };
  }
};

// Get current user's ID token (for backend verification)
export const getIdToken = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return null;
    }
    return await user.getIdToken();
  } catch (error) {
    console.error("Error getting ID token:", error);
    return null;
  }
};

// Listen to auth state changes
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      callback({
        id: user.uid,
        email: user.email,
        name: user.displayName || user.email.split('@')[0],
        emailVerified: user.emailVerified,
        photoURL: user.photoURL
      });
    } else {
      callback(null);
    }
  });
};

// Helper function to get user-friendly error messages
const getErrorMessage = (errorCode) => {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists';
    case 'auth/invalid-email':
      return 'Invalid email address';
    case 'auth/operation-not-allowed':
      return 'Operation not allowed';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters';
    case 'auth/user-disabled':
      return 'This account has been disabled';
    case 'auth/user-not-found':
      return 'No account found with this email';
    case 'auth/wrong-password':
      return 'Invalid email or password';
    case 'auth/invalid-credential':
      return 'Invalid email or password';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection';
    case 'auth/popup-closed-by-user':
      return 'Sign in popup was closed';
    default:
      return 'An error occurred. Please try again';
  }
};
