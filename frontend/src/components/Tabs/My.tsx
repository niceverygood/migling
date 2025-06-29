import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { characterAPI, userAPI, personaAPI } from '../../lib/api';

interface Character {
  id: number;
  name: string;
  description: string;
  avatar_url?: string;
  category: string;
  gender: string;
  age: number;
  occupation: string;
  one_liner: string;
  is_private: boolean;
}

interface Persona {
  id: number;
  name: string;
  description: string;
  is_default: boolean;
  age?: number;
  occupation?: string;
  gender?: string;
  basic_info?: string;
  habits?: string;
}

const My: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [myCharacters, setMyCharacters] = useState<Character[]>([]);
  const [myPersonas, setMyPersonas] = useState<Persona[]>([]);
  const [isLoadingCharacters, setIsLoadingCharacters] = useState(true);
  const [isLoadingPersonas, setIsLoadingPersonas] = useState(true);
  const [userStats, setUserStats] = useState({
    gems: 1250,
    level: 5,
    totalChats: 42,
    friendsCount: 8,
  });

  useEffect(() => {
    loadMyCharacters();
    loadMyPersonas();
    loadUserStats();
  }, []);

  const loadMyCharacters = async () => {
    try {
      setIsLoadingCharacters(true);
      const response = await characterAPI.getAllCharacters({ user_id: 1 }); // 임시로 user_id 1 사용
      // API 응답이 배열인지 확인하고 처리
      if (Array.isArray(response)) {
        setMyCharacters(response);
      } else if (response && Array.isArray(response.characters)) {
        setMyCharacters(response.characters);
      } else {
        console.warn('Characters API returned unexpected format:', response);
        setMyCharacters([]);
      }
    } catch (error) {
      console.error('Failed to load characters:', error);
      // 에러 발생 시 빈 배열로 초기화
      setMyCharacters([]);
    } finally {
      setIsLoadingCharacters(false);
    }
  };

  const loadMyPersonas = async () => {
    try {
      setIsLoadingPersonas(true);
      const response = await personaAPI.getAllPersonas();
      const personasData = Array.isArray(response) ? response : response.personas || [];
      setMyPersonas(personasData);
      console.log('📊 Loaded personas:', personasData);
    } catch (error) {
      console.error('Failed to load personas:', error);
      setMyPersonas([]);
    } finally {
      setIsLoadingPersonas(false);
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

  const getCharacterAvatar = (character: Character) => {
    if (character.avatar_url) {
      return character.avatar_url.startsWith('http') 
        ? character.avatar_url 
        : `http://localhost:3003${character.avatar_url}`;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-silky-white pb-20 safe-top">
      {/* Header */}
      <div className="bg-white px-4 py-6 border-b border-gray-200 safe-top">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">MY</h1>
          <button 
            onClick={handleLogout}
            className="text-gray-500 hover:text-gray-700 active:text-gray-900 p-2 touch-target"
          >
            ⚙️
          </button>
        </div>
      </div>

      {/* User Profile */}
      <div className="px-4 py-6">
        <div className="card p-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-mingle-rose to-twilight-blue rounded-full flex items-center justify-center text-2xl text-silky-white font-bold">
              {user?.displayName?.charAt(0) || '👤'}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">
                {user?.displayName || '사용자'}
              </h2>
              <p className="text-gray-600 text-sm">{user?.email}</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="bg-mint-mix text-night-ink px-2 py-1 rounded-full text-xs font-medium">
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
            <button className="bg-white bg-opacity-20 hover:bg-opacity-30 active:bg-opacity-40 px-4 py-2 rounded-lg text-sm font-medium transition-colors touch-target">
              충전하기
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-4 mb-6">
        <div className="grid grid-cols-3 gap-3">
          <div className="card p-4 text-center">
            <div className="text-2xl mb-2">👥</div>
            <p className="text-gray-600 text-xs mb-1">페르소나</p>
            <p className="font-bold text-gray-900">{myPersonas.length}</p>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl mb-2">🤖</div>
            <p className="text-gray-600 text-xs mb-1">내 캐릭터</p>
            <p className="font-bold text-gray-900">{myCharacters.length}</p>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl mb-2">🏆</div>
            <p className="text-gray-600 text-xs mb-1">레벨</p>
            <p className="font-bold text-gray-900">{userStats.level}</p>
          </div>
        </div>
      </div>

      {/* My Personas */}
      <div className="px-4 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">내 페르소나</h2>
          <button 
            onClick={() => navigate('/persona/create')}
            className="bg-mingle-rose hover:bg-twilight-blue active:bg-twilight-blue text-silky-white px-4 py-2 rounded-lg text-sm font-medium transition-colors touch-target"
          >
            + 추가
          </button>
        </div>

        {isLoadingPersonas ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mingle-rose"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {myPersonas.map((persona) => (
              <div key={persona.id} className="card p-4">
                <div className="text-center">
                  <div className="text-3xl mb-3">
                    {persona.gender === 'male' ? '👨' : persona.gender === 'female' ? '👩' : '👤'}
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">{persona.name}</h3>
                  <p className="text-xs text-gray-600 mb-2">
                    {persona.age && persona.occupation 
                      ? `${persona.age}세 • ${persona.occupation}`
                      : persona.description || '내 페르소나'
                    }
                  </p>
                  {persona.is_default && (
                    <span className="bg-twilight-blue text-silky-white px-2 py-1 rounded-full text-xs mb-3 inline-block">
                      기본
                    </span>
                  )}
                  <div className="flex space-x-2 mt-3">
                    <button 
                      onClick={() => navigate(`/persona/edit/${persona.id}`)}
                      className="flex-1 bg-mint-mix text-night-ink py-2 px-3 rounded-lg text-xs font-medium hover:bg-twilight-blue hover:text-silky-white active:bg-twilight-blue active:text-silky-white transition-colors touch-target"
                    >
                      편집
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Add Persona Card */}
            <div 
              onClick={() => navigate('/persona/create')}
              className="card p-4 hover:shadow-lg cursor-pointer border-dashed border-2 touch-target"
            >
              <div className="text-center h-full flex flex-col justify-center">
                <div className="text-3xl mb-3 text-gray-400">➕</div>
                <h3 className="font-medium text-gray-600 mb-1">새 페르소나</h3>
                <p className="text-xs text-gray-500">나의 새로운 모습</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* My Characters */}
      <div className="px-4 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">내 캐릭터</h2>
          <button 
            onClick={() => navigate('/character/create')}
            className="btn-primary text-sm px-4 py-2 touch-target"
          >
            + 추가
          </button>
        </div>

        {isLoadingCharacters ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mingle-rose"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {Array.isArray(myCharacters) && myCharacters.map((character) => (
              <div
                key={character.id}
                className="card p-4 hover:shadow-lg transition-shadow"
              >
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full mx-auto mb-3 overflow-hidden border-2 border-mingle-rose border-opacity-20">
                    {getCharacterAvatar(character) ? (
                      <img 
                        src={getCharacterAvatar(character)!}
                        alt={`${character.name} 프로필`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = `
                              <div class="w-full h-full bg-gradient-to-br from-mingle-rose to-twilight-blue flex items-center justify-center text-silky-white font-bold text-lg">
                                ${character.name[0]}
                              </div>
                            `;
                          }
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-mingle-rose to-twilight-blue flex items-center justify-center text-silky-white font-bold text-lg">
                        {character.name[0]}
                      </div>
                    )}
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">{character.name}</h3>
                  <p className="text-xs text-gray-600 mb-2">
                    {character.age}세 • {character.occupation}
                  </p>
                  <div className="flex items-center justify-center space-x-1 mb-3">
                    <span className="bg-mint-mix text-night-ink px-2 py-1 rounded-full text-xs font-medium">
                      {character.category}
                    </span>
                    {character.is_private && (
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                        🔒
                      </span>
                    )}
                  </div>
                  <div className="flex space-x-2 mt-3">
                    <button 
                      onClick={() => navigate(`/chat/${character.id}`)}
                      className="flex-1 bg-mint-mix text-night-ink py-2 px-3 rounded-lg text-xs font-medium hover:bg-twilight-blue hover:text-silky-white active:bg-twilight-blue active:text-silky-white transition-colors touch-target"
                    >
                      채팅
                    </button>
                    <button 
                      onClick={() => navigate(`/character/edit/${character.id}`)}
                      className="bg-gray-100 text-gray-700 p-2 rounded-lg hover:bg-gray-200 active:bg-gray-300 transition-colors touch-target"
                    >
                      ⚙️
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Add Character Card */}
            <div 
              onClick={() => navigate('/character/create')}
              className="card p-4 hover:shadow-lg cursor-pointer border-dashed border-2 touch-target"
            >
              <div className="text-center h-full flex flex-col justify-center">
                <div className="text-3xl mb-3 text-gray-400">➕</div>
                <h3 className="font-medium text-gray-600 mb-1">새 캐릭터</h3>
                <p className="text-xs text-gray-500">AI 친구 생성하기</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Settings Menu */}
      <div className="px-4 mb-6">
        <div className="card">
          <div className="divide-y divide-gray-100">
            <button className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors touch-target">
              <div className="flex items-center space-x-3">
                <span className="text-lg">🔔</span>
                <span className="text-gray-900 font-medium">알림 설정</span>
              </div>
              <span className="text-gray-400">›</span>
            </button>
            
            <button 
              onClick={() => navigate('/styleguide')}
              className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors touch-target"
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">🎨</span>
                <span className="text-gray-900 font-medium">스타일 가이드</span>
              </div>
              <span className="text-gray-400">›</span>
            </button>
            
            <button className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors touch-target">
              <div className="flex items-center space-x-3">
                <span className="text-lg">❓</span>
                <span className="text-gray-900 font-medium">도움말</span>
              </div>
              <span className="text-gray-400">›</span>
            </button>
            
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors text-red-600 touch-target"
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