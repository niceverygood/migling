import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth, signInWithGoogle, signOutUser } from '../lib/firebase';
import { authAPI, setAuthToken, removeAuthToken, getStoredToken } from '../lib/api';

interface AuthContextType {
  user: User | null;
  userProfile: any;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      
      if (firebaseUser) {
        setUser(firebaseUser);
        
        // Check if we have a stored JWT token
        const storedToken = getStoredToken();
        
        if (!storedToken) {
          // No JWT token, get one from backend
          try {
            const backendResponse = await authAPI.loginWithFirebase(firebaseUser);
            setAuthToken(backendResponse.token);
            setUserProfile(backendResponse.user);
          } catch (error) {
            console.error('Failed to authenticate with backend:', error);
            // If backend auth fails, sign out from Firebase
            await signOutUser();
            setUser(null);
            setUserProfile(null);
          }
        } else {
          // We have a token, get current user profile
          try {
            const currentUser = await authAPI.getCurrentUser();
            setUserProfile(currentUser);
          } catch (error) {
            console.error('Failed to get current user:', error);
            // Token might be expired, clear it and try to re-authenticate
            removeAuthToken();
            try {
              const backendResponse = await authAPI.loginWithFirebase(firebaseUser);
              setAuthToken(backendResponse.token);
              setUserProfile(backendResponse.user);
            } catch (reAuthError) {
              console.error('Re-authentication failed:', reAuthError);
              await signOutUser();
              setUser(null);
              setUserProfile(null);
            }
          }
        }
      } else {
        setUser(null);
        setUserProfile(null);
        removeAuthToken();
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (): Promise<void> => {
    try {
      setLoading(true);
      const result = await signInWithGoogle();
      // Firebase auth state change will handle the rest
      console.log('Signed in with Google:', result.user.email);
    } catch (error) {
      console.error('Login failed:', error);
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      await signOutUser();
      setUser(null);
      setUserProfile(null);
      removeAuthToken();
      setLoading(false);
    } catch (error) {
      console.error('Logout failed:', error);
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 