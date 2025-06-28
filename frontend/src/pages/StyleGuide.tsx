import React from 'react';
import { useNavigate } from 'react-router-dom';

const StyleGuide: React.FC = () => {
  const navigate = useNavigate();

  const colors = [
    { name: 'Mingle Rose', class: 'bg-mingle-rose', hex: '#F7BFD4', usage: '메인 포인트‧프라이머리 버튼' },
    { name: 'Mint Mix', class: 'bg-mint-mix', hex: '#C6EEE7', usage: '서브 포인트‧태그‧사용자 말풍선' },
    { name: 'Twilight Blue', class: 'bg-twilight-blue', hex: '#95B8F1', usage: 'hover/active 상태‧링크 강조' },
    { name: 'Peach Mingle', class: 'bg-peach-mingle', hex: '#FFD6B9', usage: '캐릭터 말풍선‧하이라이트 배경' },
    { name: 'Silky White', class: 'bg-silky-white', hex: '#FAFAFA', usage: '앱 기본 배경' },
    { name: 'Night Ink', class: 'bg-night-ink', hex: '#333333', usage: '기본 텍스트' },
  ];

  return (
    <div className="min-h-screen bg-silky-white mobile-container">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-4 safe-top">
        <div className="flex items-center space-x-3 mb-3">
          <button 
            onClick={() => navigate(-1)}
            className="touch-target p-1 hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors"
          >
            <span className="text-lg">←</span>
          </button>
          <h1 className="text-lg font-semibold text-night-ink">Mingling 스타일 가이드</h1>
        </div>
        <p className="text-sm text-gray-600">새로운 MINGLE_COLORS 팔레트와 UI 컴포넌트</p>
      </div>

      <div className="p-4 space-y-8">
        {/* Color Palette */}
        <section>
          <h2 className="text-xl font-bold text-night-ink mb-4">🎨 컬러 팔레트</h2>
          <div className="grid grid-cols-1 gap-4">
            {colors.map((color) => (
              <div key={color.name} className="card p-4">
                <div className="flex items-center space-x-4">
                  <div className={`w-16 h-16 rounded-xl ${color.class} border border-gray-200`}></div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-night-ink">{color.name}</h3>
                    <p className="text-sm text-gray-600 font-mono">{color.hex}</p>
                    <p className="text-xs text-gray-500 mt-1">{color.usage}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Buttons */}
        <section>
          <h2 className="text-xl font-bold text-night-ink mb-4">🔘 버튼 스타일</h2>
          <div className="space-y-4">
            <div className="card p-4">
              <h3 className="font-medium text-night-ink mb-3">Primary Button</h3>
              <button className="btn-primary">Primary Button</button>
            </div>
            <div className="card p-4">
              <h3 className="font-medium text-night-ink mb-3">Secondary Button</h3>
              <button className="btn-secondary">Secondary Button</button>
            </div>
            <div className="card p-4">
              <h3 className="font-medium text-night-ink mb-3">Button States</h3>
              <div className="flex space-x-3">
                <button className="bg-mingle-rose text-silky-white px-4 py-2 rounded-xl">Normal</button>
                <button className="bg-twilight-blue text-silky-white px-4 py-2 rounded-xl">Hover</button>
                <button className="bg-gray-300 text-gray-500 px-4 py-2 rounded-xl cursor-not-allowed">Disabled</button>
              </div>
            </div>
          </div>
        </section>

        {/* Chat Bubbles */}
        <section>
          <h2 className="text-xl font-bold text-night-ink mb-4">💬 채팅 말풍선</h2>
          <div className="card p-4">
            <div className="space-y-4">
              <div className="flex justify-end">
                <div className="chat-bubble-user">
                  안녕하세요! 오늘 기분이 어떠세요?
                </div>
              </div>
              <div className="flex justify-start">
                <div className="chat-bubble-character">
                  안녕하세요! 저는 오늘 정말 좋은 기분이에요. 여러분과 대화할 수 있어서 행복해요! ✨
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Input Fields */}
        <section>
          <h2 className="text-xl font-bold text-night-ink mb-4">📝 입력 필드</h2>
          <div className="space-y-4">
            <div className="card p-4">
              <h3 className="font-medium text-night-ink mb-3">기본 입력 필드</h3>
              <input className="input-field" placeholder="메시지를 입력하세요..." />
            </div>
            <div className="card p-4">
              <h3 className="font-medium text-night-ink mb-3">포커스 상태</h3>
              <input className="input-field focus:ring-2 focus:ring-mingle-rose" placeholder="포커스된 상태" />
            </div>
          </div>
        </section>

        {/* Links */}
        <section>
          <h2 className="text-xl font-bold text-night-ink mb-4">🔗 링크 스타일</h2>
          <div className="card p-4">
            <div className="space-y-2">
              <a href="#" className="link-primary block">기본 링크 스타일</a>
              <a href="#" className="text-mingle-rose hover:text-twilight-blue block">Primary 링크</a>
              <a href="#" className="text-gray-600 hover:text-night-ink block">Secondary 링크</a>
            </div>
          </div>
        </section>

        {/* Cards */}
        <section>
          <h2 className="text-xl font-bold text-night-ink mb-4">🃏 카드 스타일</h2>
          <div className="space-y-4">
            <div className="card p-4">
              <h3 className="font-medium text-night-ink mb-2">기본 카드</h3>
              <p className="text-gray-600 text-sm">이것은 기본 카드 스타일입니다.</p>
            </div>
            <div className="card p-4 border-2 border-mingle-rose">
              <h3 className="font-medium text-night-ink mb-2">강조 카드</h3>
              <p className="text-gray-600 text-sm">중요한 내용을 담은 강조 카드입니다.</p>
            </div>
          </div>
        </section>

        {/* Tags & Badges */}
        <section>
          <h2 className="text-xl font-bold text-night-ink mb-4">🏷️ 태그 & 배지</h2>
          <div className="card p-4">
            <div className="flex flex-wrap gap-2">
              <span className="bg-mingle-rose text-silky-white px-3 py-1 rounded-full text-sm">Primary Tag</span>
              <span className="bg-mint-mix text-night-ink px-3 py-1 rounded-full text-sm">Secondary Tag</span>
              <span className="bg-twilight-blue text-silky-white px-3 py-1 rounded-full text-sm">Info Tag</span>
              <span className="bg-peach-mingle text-night-ink px-3 py-1 rounded-full text-sm">Warning Tag</span>
            </div>
          </div>
        </section>

        {/* Typography */}
        <section>
          <h2 className="text-xl font-bold text-night-ink mb-4">📚 타이포그래피</h2>
          <div className="card p-4">
            <div className="space-y-3">
              <h1 className="text-3xl font-bold text-night-ink">Heading 1</h1>
              <h2 className="text-2xl font-bold text-night-ink">Heading 2</h2>
              <h3 className="text-xl font-semibold text-night-ink">Heading 3</h3>
              <h4 className="text-lg font-medium text-night-ink">Heading 4</h4>
              <p className="text-base text-night-ink">본문 텍스트입니다. 이것은 일반적인 문단 텍스트의 예시입니다.</p>
              <p className="text-sm text-gray-600">작은 텍스트입니다. 부가 정보나 설명에 사용됩니다.</p>
              <p className="text-xs text-gray-500">매우 작은 텍스트입니다. 주석이나 메타 정보에 사용됩니다.</p>
            </div>
          </div>
        </section>

        {/* Gradients */}
        <section>
          <h2 className="text-xl font-bold text-night-ink mb-4">🌈 그라디언트</h2>
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-mingle-rose to-twilight-blue rounded-xl p-6 text-silky-white">
              <h3 className="font-bold mb-2">Primary Gradient</h3>
              <p className="text-sm">Mingle Rose → Twilight Blue</p>
            </div>
            <div className="bg-gradient-to-r from-mint-mix to-peach-mingle rounded-xl p-6 text-night-ink">
              <h3 className="font-bold mb-2">Secondary Gradient</h3>
              <p className="text-sm">Mint Mix → Peach Mingle</p>
            </div>
          </div>
        </section>

        {/* Mobile Layout Example */}
        <section>
          <h2 className="text-xl font-bold text-night-ink mb-4">📱 모바일 레이아웃</h2>
          <div className="card p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-mingle-rose to-twilight-blue rounded-full flex items-center justify-center text-silky-white font-bold">
                    AI
                  </div>
                  <div>
                    <h3 className="font-medium text-night-ink">AI 친구</h3>
                    <p className="text-sm text-gray-600">온라인</p>
                  </div>
                </div>
                <div className="bg-mingle-rose text-silky-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  3
                </div>
              </div>
              <div className="border-t pt-4">
                <p className="text-sm text-gray-600">최신 메시지: 안녕하세요! 오늘 하루 어떠셨나요?</p>
                <p className="text-xs text-gray-500 mt-1">5분 전</p>
              </div>
            </div>
          </div>
        </section>

        <div className="pb-6">
          <div className="card p-4 text-center">
            <h3 className="font-medium text-night-ink mb-2">✅ 스타일 가이드 완료</h3>
            <p className="text-sm text-gray-600">
              모든 MINGLE_COLORS가 성공적으로 적용되었습니다!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StyleGuide; 