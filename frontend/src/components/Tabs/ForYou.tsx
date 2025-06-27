import React from 'react';

const ForYou: React.FC = () => {
  const recommendations = [
    {
      id: 1,
      type: 'character',
      title: '새로운 AI 친구 "스텔라" ✨',
      description: '감정을 이해하고 공감해주는 따뜻한 AI 친구입니다.',
      image: '🌟',
      category: 'AI 캐릭터',
    },
    {
      id: 2,
      type: 'trend',
      title: '오늘의 인기 대화 주제 🔥',
      description: '많은 사람들이 이야기하고 있는 재미있는 주제들을 확인해보세요.',
      image: '📈',
      category: '트렌드',
    },
    {
      id: 3,
      type: 'tip',
      title: 'AI와 더 재미있게 대화하는 방법 💡',
      description: 'AI 친구와의 대화를 더욱 흥미롭게 만드는 팁들을 알아보세요.',
      image: '💭',
      category: '팁',
    },
    {
      id: 4,
      type: 'character',
      title: '모험가 "아르테미스" 🏹',
      description: '함께 상상의 모험을 떠날 수 있는 용감한 AI 친구입니다.',
      image: '🏹',
      category: 'AI 캐릭터',
    },
  ];

  const categories = ['전체', 'AI 캐릭터', '트렌드', '팁', '이벤트'];
  const [selectedCategory, setSelectedCategory] = React.useState('전체');

  const filteredRecommendations = selectedCategory === '전체' 
    ? recommendations 
    : recommendations.filter(item => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">For You</h1>
        <p className="text-gray-600 text-sm mt-1">당신을 위한 특별한 추천 콘텐츠</p>
      </div>

      {/* Category Filter */}
      <div className="px-4 py-4">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Banner */}
      <div className="px-4 mb-6">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-2">🎉 특별 이벤트</h2>
              <p className="text-purple-100 text-sm">
                새로운 AI 친구들과 만나면<br />특별한 보상을 받아보세요!
              </p>
              <button className="mt-4 bg-white text-purple-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
                참여하기
              </button>
            </div>
            <div className="text-4xl">🎁</div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="px-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">추천 콘텐츠</h2>
        <div className="space-y-4">
          {filteredRecommendations.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start space-x-4">
                <div className="text-4xl flex-shrink-0">{item.image}</div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                      {item.category}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-4 text-xs text-gray-500">
                      <span>❤️ 123</span>
                      <span>💬 45</span>
                      <span>📤 12</span>
                    </div>
                    <button className="text-purple-600 text-sm font-medium hover:text-purple-700">
                      자세히 보기
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Challenge */}
      <div className="px-4 mt-8 mb-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="text-center">
            <div className="text-4xl mb-3">🎯</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">오늘의 챌린지</h3>
            <p className="text-gray-600 text-sm mb-4">
              AI 친구와 5분 이상 대화하기
            </p>
            <div className="bg-gray-200 rounded-full h-2 mb-4">
              <div className="bg-purple-600 h-2 rounded-full w-3/4"></div>
            </div>
            <p className="text-xs text-gray-500 mb-4">75% 완료 (3분 30초 / 5분)</p>
            <button className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors">
              계속하기
            </button>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredRecommendations.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">추천 콘텐츠가 없어요</h3>
          <p className="text-gray-600 text-center text-sm">
            다른 카테고리를 선택해보세요
          </p>
        </div>
      )}
    </div>
  );
};

export default ForYou; 