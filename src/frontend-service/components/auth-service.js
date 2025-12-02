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

// Sign up with email and password
export const signUpWithEmail = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update display name
    if (displayName) {
      await updateProfile(user, { displayName });
    }
    
    // Send email verification
    await sendEmailVerification(user);
    
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
    return {
      success: false,
      error: getErrorMessage(error.code)
    };
  }
};

// Sign in with email and password
export const signInWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
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
    return {
      success: false,
      error: getErrorMessage(error.code)
    };
  }
};

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
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
