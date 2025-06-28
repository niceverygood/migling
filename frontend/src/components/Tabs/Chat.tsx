import React from 'react';
import { useNavigate } from 'react-router-dom';

const Chat: React.FC = () => {
  const navigate = useNavigate();
  
  const chatRooms = [
    {
      id: 1,
      name: '애니',
      avatar: '🤖',
      lastMessage: '오늘 하루 어떠셨나요? 재미있는 이야기 들려주세요!',
      lastTime: '방금 전',
      unreadCount: 2,
      isOnline: true,
    },
    {
      id: 2,
      name: '루나',
      avatar: '🌙',
      lastMessage: '잠자리에 들기 전에 따뜻한 차 한잔 어때요?',
      lastTime: '5분 전',
      unreadCount: 0,
      isOnline: true,
    },
    {
      id: 3,
      name: '레오',
      avatar: '🦁',
      lastMessage: '새로운 도전에 대해 이야기해볼까요?',
      lastTime: '1시간 전',
      unreadCount: 1,
      isOnline: false,
    },
    {
      id: 4,
      name: '사라',
      avatar: '👩‍🦰',
      lastMessage: '오늘 날씨가 정말 좋네요!',
      lastTime: '2시간 전',
      unreadCount: 0,
      isOnline: true,
    },
  ];

  return (
    <div className="min-h-screen bg-silky-white pb-20 safe-top">
      {/* Header */}
      <div className="bg-white px-4 py-6 border-b border-gray-200 safe-top">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">채팅</h1>
            <p className="text-gray-600 text-sm mt-1">AI 친구들과 대화를 나누세요</p>
          </div>
          <button className="bg-mint-mix hover:bg-twilight-blue active:bg-twilight-blue text-night-ink p-2 rounded-lg transition-colors touch-target">
            ✏️
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4">
        <div className="relative">
          <input
            type="text"
            placeholder="대화 검색..."
            className="input-field pl-12"
          />
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
            <span className="text-gray-400 text-lg">🔍</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 mb-4">
        <div className="flex space-x-3">
          <button className="flex-1 btn-primary py-3 px-4 touch-target">
            🤖 새로운 AI 친구
          </button>
          <button className="flex-1 btn-secondary py-3 px-4 touch-target">
            👥 그룹 채팅
          </button>
        </div>
      </div>

      {/* Chat Rooms */}
      <div className="px-4 pb-6">
        <div className="space-y-3">
          {chatRooms.map((room) => (
            <div
              key={room.id}
              onClick={() => navigate(`/chat/${room.id}`)}
              className="card p-4 flex items-center space-x-3 hover:shadow-lg transition-shadow cursor-pointer touch-target"
            >
              <div className="relative">
                <div className="text-3xl">{room.avatar}</div>
                {room.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900 truncate">{room.name}</h3>
                  <span className="text-xs text-gray-500 flex-shrink-0">{room.lastTime}</span>
                </div>
                <p className="text-sm text-gray-600 truncate mt-1">{room.lastMessage}</p>
              </div>
              
              {room.unreadCount > 0 && (
                <div className="bg-mingle-rose text-silky-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {room.unreadCount}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Empty State (if no chats) */}
      {chatRooms.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 px-4">
          <div className="text-6xl mb-4">💭</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">아직 대화가 없어요</h3>
          <p className="text-gray-600 text-center text-sm mb-6">
            새로운 AI 친구를 추가하고<br />첫 대화를 시작해보세요!
          </p>
          <button className="btn-primary touch-target">
            AI 친구 추가하기
          </button>
        </div>
      )}

      {/* New Chat Button */}
      <div className="fixed bottom-24 right-4 z-40 max-w-[430px] mx-auto">
        <button className="bg-mingle-rose hover:bg-twilight-blue active:bg-twilight-blue text-silky-white p-4 rounded-full shadow-lg transition-all touch-target">
          <span className="text-xl">💬</span>
        </button>
      </div>
    </div>
  );
};

export default Chat; 