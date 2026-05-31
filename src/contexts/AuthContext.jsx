import { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  updatePassword as firebaseUpdatePassword,
  EmailAuthProvider,
  linkWithCredential,
  linkWithPopup,
  reauthenticateWithCredential,
  deleteUser,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../config/firebase';

const AuthContext = createContext({});
const firebaseNotConfiguredMessage =
  'Firebase is not configured for this local environment. Add VITE_FIREBASE_* values to .env to enable accounts.';

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(isFirebaseConfigured);

  const requireFirebase = () => {
    if (!auth || !db) {
      throw new Error(firebaseNotConfiguredMessage);
    }
  };

  const ensureUserProfile = async (user, overrides = {}) => {
    requireFirebase();
    if (!user) throw new Error('No user available');

    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    const baseProfile = {
      email: user.email || '',
      displayName: user.displayName || overrides.displayName || '',
      photoURL: user.photoURL || '',
      isAnonymous: user.isAnonymous,
      authProvider: user.isAnonymous ? 'anonymous' : (user.providerData?.[0]?.providerId || 'password'),
      lastLoginAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      preferences: {
        defaultMatSize: 'medium',
        defaultColorScheme: 'pastel'
      },
      ...overrides
    };

    if (!userDoc.exists()) {
      await setDoc(userRef, {
        ...baseProfile,
        createdAt: serverTimestamp()
      });
    } else {
      await setDoc(userRef, baseProfile, { merge: true });
    }
  };

  const ensureGuestSession = async () => {
    requireFirebase();
    if (auth.currentUser) {
      await ensureUserProfile(auth.currentUser);
      return auth.currentUser;
    }

    const userCredential = await signInAnonymously(auth);
    await ensureUserProfile(userCredential.user);
    return userCredential.user;
  };

  const linkOrMigrateGuestSession = async () => {
    // Anonymous accounts are linked in signup/login providers when possible.
    return true;
  };

  // Sign up with email and password
  const signup = async (email, password, displayName) => {
    try {
      requireFirebase();
      const credential = EmailAuthProvider.credential(email, password);
      let userCredential;

      if (auth.currentUser?.isAnonymous) {
        try {
          userCredential = await linkWithCredential(auth.currentUser, credential);
        } catch (linkError) {
          if (
            linkError.code === 'auth/credential-already-in-use' ||
            linkError.code === 'auth/email-already-in-use'
          ) {
            throw { ...linkError, code: 'auth/email-already-in-use' };
          }
          throw linkError;
        }
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      }

      const user = userCredential.user;

      // Update profile with display name
      await updateProfile(user, { displayName });

      await ensureUserProfile(user, {
        displayName,
        isAnonymous: false,
        authProvider: 'password'
      });

      return user;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  // Login with email and password
  const login = async (email, password) => {
    try {
      requireFirebase();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await ensureUserProfile(userCredential.user, {
        isAnonymous: false,
        authProvider: 'password'
      });
      return userCredential.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Login with Google (using popup)
  const loginWithGoogle = async () => {
    try {
      requireFirebase();
      const provider = new GoogleAuthProvider();
      let userCredential;

      if (auth.currentUser?.isAnonymous) {
        try {
          userCredential = await linkWithPopup(auth.currentUser, provider);
        } catch (linkError) {
          if (
            linkError.code === 'auth/credential-already-in-use' ||
            linkError.code === 'auth/email-already-in-use'
          ) {
            await signOut(auth);
            userCredential = await signInWithPopup(auth, provider);
          } else {
            throw linkError;
          }
        }
      } else {
        userCredential = await signInWithPopup(auth, provider);
      }

      const user = userCredential.user;

      await ensureUserProfile(user, {
        isAnonymous: false,
        authProvider: 'google.com'
      });

      return user;
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      if (!auth) return;
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // Update user profile
  const updateUserProfile = async (updates) => {
    try {
      requireFirebase();
      if (!currentUser) throw new Error('No user logged in');

      await updateProfile(currentUser, updates);

      // Update Firestore document
      await setDoc(doc(db, 'users', currentUser.uid), {
        displayName: updates.displayName || currentUser.displayName,
        photoURL: updates.photoURL || currentUser.photoURL || '',
        updatedAt: serverTimestamp()
      }, { merge: true });

      return currentUser;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  // Update password
  const updatePassword = async (currentPassword, newPassword) => {
    try {
      requireFirebase();
      if (!currentUser) throw new Error('No user logged in');

      // Re-authenticate user before password change
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        currentPassword
      );
      await reauthenticateWithCredential(currentUser, credential);

      // Update password
      await firebaseUpdatePassword(currentUser, newPassword);
    } catch (error) {
      console.error('Update password error:', error);
      throw error;
    }
  };

  // Delete account
  const deleteAccount = async () => {
    try {
      requireFirebase();
      if (!currentUser) throw new Error('No user logged in');

      // Note: In a production app, you'd also want to delete user data from Firestore
      // This would typically be done via a Cloud Function for security
      await deleteUser(currentUser);
    } catch (error) {
      console.error('Delete account error:', error);
      throw error;
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    if (!auth) {
      setCurrentUser(null);
      setLoading(false);
      return undefined;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
    ensureGuestSession,
    ensureUserProfile,
    linkOrMigrateGuestSession,
    signup,
    login,
    loginWithGoogle,
    logout,
    updateUserProfile,
    updatePassword,
    deleteAccount
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
