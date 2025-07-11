import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Login: React.FC = () => {
  const { login, loading } = useAuth();

  const handleGoogleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center p-4 safe-top safe-bottom">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-sm mx-auto">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Mingling</h1>
          <p className="text-gray-600 text-sm">감성 AI 캐릭터와 함께하는 특별한 대화</p>
        </div>

        {/* Welcome Message */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">💫</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            새로운 AI 친구들을 만나보세요
          </h2>
          <p className="text-gray-600 text-sm">
            구글 계정으로 간편하게 시작하기
          </p>
        </div>

        {/* Login Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-white border-2 border-gray-300 rounded-lg py-4 px-6 flex items-center justify-center space-x-3 hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg touch-target"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
          ) : (
            <>
              {/* Google Logo */}
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-gray-700 font-medium">Google로 계속하기</span>
            </>
          )}
        </button>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-6">
          계속 진행하면 서비스 약관 및 개인정보 처리방침에 동의하는 것으로 간주됩니다.
        </p>
      </div>
    </div>
  );
};

export default Login; 