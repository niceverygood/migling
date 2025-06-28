import React from 'react';

const Friends: React.FC = () => {
  const friends = [
    { id: 1, name: '사라', status: '온라인', avatar: '👩‍🦰', lastSeen: '방금 전' },
    { id: 2, name: '민수', status: '오프라인', avatar: '👨‍💼', lastSeen: '2시간 전' },
    { id: 3, name: '지은', status: '온라인', avatar: '👩‍🎨', lastSeen: '방금 전' },
    { id: 4, name: '현우', status: '바쁨', avatar: '👨‍🎓', lastSeen: '30분 전' },
  ];

  const suggestions = [
    { id: 1, name: '애니', avatar: '🤖', type: 'AI 캐릭터' },
    { id: 2, name: '루나', avatar: '🌙', type: 'AI 캐릭터' },
    { id: 3, name: '레오', avatar: '🦁', type: 'AI 캐릭터' },
  ];

  return (
    <div className="min-h-screen bg-silky-white pb-20 safe-top">
      {/* Header */}
      <div className="bg-white px-4 py-6 border-b border-gray-200 safe-top">
        <h1 className="text-2xl font-bold text-gray-900">친구</h1>
        <p className="text-gray-600 text-sm mt-1">AI 친구들과 새로운 사람들을 만나보세요</p>
      </div>

      {/* Search Bar */}
      <div className="p-4">
        <div className="relative">
          <input
            type="text"
            placeholder="친구 검색..."
            className="input-field pl-12"
          />
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
            <span className="text-gray-400 text-lg">🔍</span>
          </div>
        </div>
      </div>

      {/* AI 친구 추천 */}
      <div className="px-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">AI 친구 추천</h2>
        <div className="grid grid-cols-3 gap-3">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="card p-4 text-center hover:shadow-lg transition-all"
            >
              <div className="text-3xl mb-2">{suggestion.avatar}</div>
              <h3 className="font-medium text-gray-900 text-sm">{suggestion.name}</h3>
              <p className="text-xs text-gray-500 mb-3">{suggestion.type}</p>
              <button className="w-full bg-mint-mix text-night-ink py-2 px-3 rounded-lg text-xs font-medium hover:bg-twilight-blue hover:text-silky-white active:bg-twilight-blue active:text-silky-white transition-colors touch-target">
                친구 추가
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 내 친구들 */}
      <div className="px-4 pb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">내 친구들</h2>
        <div className="space-y-3">
          {friends.map((friend) => (
            <div
              key={friend.id}
              className="card p-4 flex items-center space-x-3 hover:shadow-lg transition-all"
            >
              <div className="relative">
                <div className="text-3xl">{friend.avatar}</div>
                <div
                  className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                    friend.status === '온라인'
                      ? 'bg-green-400'
                      : friend.status === '바쁨'
                      ? 'bg-yellow-400'
                      : 'bg-gray-300'
                  }`}
                ></div>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{friend.name}</h3>
                <p className="text-sm text-gray-500">{friend.lastSeen}</p>
              </div>
              <div className="flex space-x-2">
                <button className="bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 p-2 rounded-lg transition-colors touch-target">
                  💬
                </button>
                <button className="bg-mint-mix hover:bg-twilight-blue hover:text-silky-white active:bg-twilight-blue active:text-silky-white text-night-ink p-2 rounded-lg transition-colors touch-target">
                  ⚙️
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Friend Button */}
      <div className="fixed bottom-24 right-4 z-40 max-w-[430px] mx-auto">
        <button className="bg-mingle-rose hover:bg-twilight-blue active:bg-twilight-blue text-silky-white p-4 rounded-full shadow-lg transition-all touch-target">
          <span className="text-xl">+</span>
        </button>
      </div>
    </div>
  );
};

export default Friends; 