import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { characterAPI, userAPI } from '../../lib/api';

const My: React.FC = () => {
  const { user, userProfile, logout } = useAuth();
  const [myCharacters, setMyCharacters] = useState([]);
  const [userStats, setUserStats] = useState({
    gems: 1250,
    level: 5,
    totalChats: 42,
    friendsCount: 8,
  });

  useEffect(() => {
    loadMyCharacters();
    loadUserStats();
  }, []);

  const loadMyCharacters = async () => {
    try {
      const characters = await characterAPI.getMyCharacters();
      setMyCharacters(characters);
    } catch (error) {
      console.error('Failed to load characters:', error);
      // Mock data for demo
      setMyCharacters([
        { id: 1, name: '애니', avatar: '🤖', description: '친근한 AI 친구', personality: '활발함' },
        { id: 2, name: '루나', avatar: '🌙', description: '신비로운 밤의 친구', personality: '신비로움' },
        { id: 3, name: '레오', avatar: '🦁', description: '용감한 모험가', personality: '대담함' },
      ]);
    }
  };

  const loadUserStats = async () => {
    try {
      const profile = await userAPI.getProfile();
      setUserStats(profile.stats || userStats);
    } catch (error) {
      console.error('Failed to load user stats:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">MY</h1>
          <button 
            onClick={handleLogout}
            className="text-gray-500 hover:text-gray-700 p-2"
          >
            ⚙️
          </button>
        </div>
      </div>

      {/* User Profile */}
      <div className="px-4 py-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-2xl text-white font-bold">
              {user?.displayName?.charAt(0) || '👤'}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">
                {user?.displayName || '사용자'}
              </h2>
              <p className="text-gray-600 text-sm">{user?.email}</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
                  Lv.{userStats.level}
                </span>
                <span className="text-gray-500 text-xs">
                  💬 {userStats.totalChats}회 대화
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gems Balance */}
      <div className="px-4 mb-6">
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold mb-1">보유 잼</h3>
              <p className="text-2xl font-bold">{userStats.gems.toLocaleString()} 💎</p>
              <p className="text-yellow-100 text-sm mt-1">AI 친구 생성에 사용하세요</p>
            </div>
            <button className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              충전하기
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-4 mb-6">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
            <div className="text-2xl mb-2">👥</div>
            <p className="text-gray-600 text-xs mb-1">친구</p>
            <p className="font-bold text-gray-900">{userStats.friendsCount}</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
            <div className="text-2xl mb-2">💬</div>
            <p className="text-gray-600 text-xs mb-1">대화</p>
            <p className="font-bold text-gray-900">{userStats.totalChats}</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
            <div className="text-2xl mb-2">🏆</div>
            <p className="text-gray-600 text-xs mb-1">레벨</p>
            <p className="font-bold text-gray-900">{userStats.level}</p>
          </div>
        </div>
      </div>

      {/* My Characters */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">내 캐릭터</h2>
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            + 추가
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {myCharacters.map((character: any) => (
            <div
              key={character.id}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="text-center">
                <div className="text-3xl mb-3">{character.avatar}</div>
                <h3 className="font-medium text-gray-900 mb-1">{character.name}</h3>
                <p className="text-xs text-gray-600 mb-2">{character.description}</p>
                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                  {character.personality}
                </span>
                <div className="flex space-x-2 mt-3">
                  <button className="flex-1 bg-purple-100 text-purple-700 py-2 px-3 rounded-lg text-xs font-medium hover:bg-purple-200 transition-colors">
                    채팅
                  </button>
                  <button className="bg-gray-100 text-gray-700 p-2 rounded-lg hover:bg-gray-200 transition-colors">
                    ⚙️
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Add Character Card */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer border-dashed border-2">
            <div className="text-center h-full flex flex-col justify-center">
              <div className="text-3xl mb-3 text-gray-400">➕</div>
              <h3 className="font-medium text-gray-600 mb-1">새 캐릭터</h3>
              <p className="text-xs text-gray-500">AI 친구 생성하기</p>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Menu */}
      <div className="px-4 mt-8 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="divide-y divide-gray-100">
            <button className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <span className="text-lg">🔔</span>
                <span className="text-gray-900 font-medium">알림 설정</span>
              </div>
              <span className="text-gray-400">›</span>
            </button>
            
            <button className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <span className="text-lg">🎨</span>
                <span className="text-gray-900 font-medium">테마 설정</span>
              </div>
              <span className="text-gray-400">›</span>
            </button>
            
            <button className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <span className="text-lg">❓</span>
                <span className="text-gray-900 font-medium">도움말</span>
              </div>
              <span className="text-gray-400">›</span>
            </button>
            
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors text-red-600"
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">🚪</span>
                <span className="font-medium">로그아웃</span>
              </div>
              <span className="text-gray-400">›</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default My; 