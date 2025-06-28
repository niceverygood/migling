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
        
        // 임시: 백엔드 API 없이 Firebase 사용자 정보로 프로필 설정
        const tempUserProfile = {
          id: firebaseUser.uid,
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          jamPoints: 1000, // 기본 잼 포인트
        };
        setUserProfile(tempUserProfile);
        
        // 백엔드 연결을 시도하되, 실패해도 로그인은 성공시킴
        try {
          const backendResponse = await authAPI.loginWithFirebase(firebaseUser);
          setAuthToken(backendResponse.token);
          setUserProfile(backendResponse.user);
          console.log('✅ Backend authentication successful');
        } catch (error) {
          console.warn('⚠️ Backend authentication failed, using Firebase only:', error);
          // 백엔드 실패해도 Firebase 인증으로 계속 진행
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
      console.log('✅ Signed in with Google:', result.user.email);
    } catch (error) {
      console.error('❌ Login failed:', error);
      setLoading(false);
      throw error;
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
      console.log('✅ Logged out successfully');
    } catch (error) {
      console.error('❌ Logout failed:', error);
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