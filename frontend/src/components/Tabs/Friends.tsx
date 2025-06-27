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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">친구</h1>
        <p className="text-gray-600 text-sm mt-1">AI 친구들과 새로운 사람들을 만나보세요</p>
      </div>

      {/* Search Bar */}
      <div className="p-4">
        <div className="relative">
          <input
            type="text"
            placeholder="친구 검색..."
            className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
            <span className="text-gray-400">🔍</span>
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
              className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100"
            >
              <div className="text-3xl mb-2">{suggestion.avatar}</div>
              <h3 className="font-medium text-gray-900 text-sm">{suggestion.name}</h3>
              <p className="text-xs text-gray-500 mb-3">{suggestion.type}</p>
              <button className="w-full bg-purple-100 text-purple-700 py-2 px-3 rounded-lg text-xs font-medium hover:bg-purple-200 transition-colors">
                친구 추가
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 내 친구들 */}
      <div className="px-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">내 친구들</h2>
        <div className="space-y-2">
          {friends.map((friend) => (
            <div
              key={friend.id}
              className="bg-white rounded-xl p-4 flex items-center space-x-3 shadow-sm border border-gray-100"
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
                <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-lg transition-colors">
                  💬
                </button>
                <button className="bg-purple-100 hover:bg-purple-200 text-purple-700 p-2 rounded-lg transition-colors">
                  ⚙️
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Friend Button */}
      <div className="fixed bottom-20 right-4">
        <button className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-full shadow-lg transition-all">
          <span className="text-xl">+</span>
        </button>
      </div>
    </div>
  );
};

export default Friends; 