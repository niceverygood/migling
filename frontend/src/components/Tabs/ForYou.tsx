import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { characterAPI, personaAPI } from '../../lib/api';

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
}

interface Persona {
  id: number;
  name: string;
  description: string;
  is_default: boolean;
}

const ForYou: React.FC = () => {
  const navigate = useNavigate();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [showPersonaModal, setShowPersonaModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // 검색 및 필터 상태
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // 캐릭터 데이터 로딩
  useEffect(() => {
    const loadCharacters = async () => {
      try {
        setIsLoading(true);
        // For You 탭에서는 공개 캐릭터만 가져오기
        const response = await characterAPI.getAllCharacters({
          is_private: false
        });
        console.log('📄 For You characters response:', response);
        
        const charactersData = Array.isArray(response) ? response : response.characters || [];
        console.log('📄 For You characters data:', charactersData);
        
        setCharacters(charactersData);
        
        if (charactersData.length === 0) {
          console.log('❌ No public characters found');
        }
      } catch (error) {
        console.error('Failed to load characters:', error);
        // 네트워크 에러 시 빈 배열로 설정
        setCharacters([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadCharacters();
  }, []);

  // 필터링된 캐릭터 목록
  const filteredCharacters = useMemo(() => {
    return characters.filter(character => {
      const matchesSearch = character.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           character.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           character.occupation.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || character.category === selectedCategory;
      const matchesGender = selectedGender === 'all' || character.gender === selectedGender;
      
      return matchesSearch && matchesCategory && matchesGender;
    });
  }, [characters, searchQuery, selectedCategory, selectedGender]);

  // 필터가 변경될 때 현재 인덱스 재설정
  useEffect(() => {
    if (currentCardIndex >= filteredCharacters.length) {
      setCurrentCardIndex(0);
    }
  }, [filteredCharacters.length, currentCardIndex]);

  // 고유한 카테고리 목록 생성
  const uniqueCategories = useMemo(() => {
    const categories = [...new Set(characters.map(char => char.category))];
    return categories.filter(Boolean);
  }, [characters]);

  // 페르소나 데이터 로딩
  const loadPersonas = async () => {
    try {
      const response = await personaAPI.getAllPersonas();
      const personasData = Array.isArray(response) ? response : response.personas || [];
      setPersonas(personasData);
    } catch (error) {
      console.error('Failed to load personas:', error);
    }
  };

  // 다음 카드로 이동
  const nextCard = () => {
    if (currentCardIndex < filteredCharacters.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    }
  };

  // 이전 카드로 이동
  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
    }
  };

  // 채팅 시작 버튼 클릭
  const handleChatStart = async (character: Character) => {
    setSelectedCharacter(character);
    await loadPersonas();
    setShowPersonaModal(true);
  };

  // 페르소나 선택
  const handlePersonaSelect = (persona: Persona) => {
    if (selectedCharacter) {
      // 선택된 페르소나 정보를 저장
      localStorage.setItem('selectedPersonaId', persona.id.toString());
      setShowPersonaModal(false);
      navigate(`/chat/${selectedCharacter.id}`);
    }
  };

  // 페르소나 생성하기
  const handleCreatePersona = () => {
    if (selectedCharacter) {
      localStorage.setItem('pendingChatId', selectedCharacter.id.toString());
      setShowPersonaModal(false);
      navigate('/persona/create');
    }
  };

  // 검색 및 필터 초기화
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedGender('all');
    setCurrentCardIndex(0);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-silky-white mobile-container">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mingle-rose mx-auto mb-4"></div>
            <p className="text-night-ink">캐릭터를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  const currentCharacter = filteredCharacters[currentCardIndex];

  return (
    <div className="min-h-screen bg-silky-white pb-20 safe-top mobile-container">
      {/* Header */}
      <div className="bg-white px-4 py-6 border-b border-gray-200 safe-top">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">For You</h1>
            <p className="text-gray-600 text-sm mt-1">새로운 AI 친구들을 만나보세요</p>
          </div>
          <div className="text-sm text-gray-500">
            {filteredCharacters.length > 0 ? currentCardIndex + 1 : 0} / {filteredCharacters.length}
          </div>
        </div>

        {/* 검색바 */}
        <div className="relative mb-3">
          <input
            type="text"
            placeholder="캐릭터 이름, 직업으로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-mingle-rose focus:border-transparent"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            🔍
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* 필터 토글 버튼 */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span className="text-sm font-medium text-gray-700">필터</span>
            <span className="text-xs text-gray-500">
              {showFilters ? '▲' : '▼'}
            </span>
          </button>
          
          {(searchQuery || selectedCategory !== 'all' || selectedGender !== 'all') && (
            <button
              onClick={clearFilters}
              className="text-sm text-mingle-rose hover:text-twilight-blue transition-colors"
            >
              필터 초기화
            </button>
          )}
        </div>

        {/* 필터 옵션 */}
        {showFilters && (
          <div className="mt-3 space-y-3 bg-gray-50 p-4 rounded-lg">
            {/* 카테고리 필터 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === 'all' 
                      ? 'bg-mingle-rose text-silky-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  전체
                </button>
                {uniqueCategories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === category 
                        ? 'bg-mingle-rose text-silky-white' 
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* 성별 필터 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">성별</label>
              <div className="flex gap-2">
                {[
                  { value: 'all', label: '전체' },
                  { value: 'male', label: '남성' },
                  { value: 'female', label: '여성' }
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedGender(option.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedGender === option.value 
                        ? 'bg-twilight-blue text-silky-white' 
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Character Cards */}
      <div className="flex-1 flex items-center justify-center p-4">
        {filteredCharacters.length === 0 ? (
          <div className="text-center">
            {characters.length === 0 ? (
              <>
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">공개 캐릭터가 없어요</h3>
                <p className="text-gray-600 text-sm mb-6">
                  아직 다른 사용자들이 만든 공개 캐릭터가 없습니다.<br/>
                  직접 캐릭터를 만들어보세요!
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setIsLoading(true);
                      window.location.reload();
                    }}
                    className="w-full bg-twilight-blue text-silky-white py-3 px-6 rounded-lg font-medium hover:bg-opacity-90 transition-colors touch-target"
                  >
                    🔄 새로고침
                  </button>
                  <button
                    onClick={() => navigate('/character/create')}
                    className="w-full bg-mingle-rose text-silky-white py-3 px-6 rounded-lg font-medium hover:bg-opacity-90 transition-colors touch-target"
                  >
                    ✨ 내 캐릭터 만들기
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">😔</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">검색 결과가 없어요</h3>
                <p className="text-gray-600 text-sm mb-6">
                  선택한 조건에 맞는 캐릭터가 없습니다.<br/>
                  다른 조건으로 검색해보세요.
                </p>
                <button
                  onClick={clearFilters}
                  className="bg-mingle-rose text-silky-white py-3 px-6 rounded-lg font-medium hover:bg-opacity-90 transition-colors touch-target"
                >
                  🔄 필터 초기화
                </button>
              </>
            )}
          </div>
        ) : currentCharacter ? (
          <div className="w-full max-w-sm">
            {/* Character Card */}
            <div className="card p-6 bg-white shadow-xl relative">
              {/* Character Avatar */}
              <div className="text-center mb-6">
                <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden border-4 border-mingle-rose border-opacity-20">
                  {currentCharacter.avatar_url ? (
                    <img 
                      src={currentCharacter.avatar_url.startsWith('http') 
                        ? currentCharacter.avatar_url 
                        : `http://localhost:3003${currentCharacter.avatar_url}`
                      }
                      alt={`${currentCharacter.name} 프로필`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // 이미지 로드 실패 시 기본 아바타로 대체
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `
                            <div class="w-full h-full bg-gradient-to-br from-mingle-rose to-twilight-blue flex items-center justify-center text-silky-white font-bold text-2xl">
                              ${currentCharacter.name[0]}
                            </div>
                          `;
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-mingle-rose to-twilight-blue flex items-center justify-center text-silky-white font-bold text-2xl">
                      {currentCharacter.name[0]}
                    </div>
                  )}
                </div>
                <h2 className="text-xl font-bold text-gray-900">{currentCharacter.name}</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {currentCharacter.age}세 • {currentCharacter.occupation}
                </p>
              </div>

              {/* Character Info */}
              <div className="space-y-4 mb-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">한 마디</h3>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                    "{currentCharacter.one_liner}"
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">소개</h3>
                  <p className="text-sm text-gray-700">{currentCharacter.description}</p>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="bg-mint-mix text-night-ink px-3 py-1 rounded-full text-xs font-medium">
                    {currentCharacter.category}
                  </span>
                  <span className="bg-twilight-blue text-silky-white px-3 py-1 rounded-full text-xs font-medium">
                    {currentCharacter.gender === 'male' ? '남성' : currentCharacter.gender === 'female' ? '여성' : '미지정'}
                  </span>
                </div>
              </div>

              {/* Chat Button */}
              <button
                onClick={() => handleChatStart(currentCharacter)}
                className="w-full bg-mingle-rose hover:bg-twilight-blue active:bg-twilight-blue text-silky-white py-4 rounded-lg font-medium text-lg transition-colors touch-target"
              >
                💬 채팅하기
              </button>
            </div>

            {/* Navigation Buttons */}
            {filteredCharacters.length > 1 && (
              <div className="flex justify-between items-center mt-6">
                <button
                  onClick={prevCard}
                  disabled={currentCardIndex === 0}
                  className="p-3 bg-white rounded-full shadow-md hover:shadow-lg active:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-shadow touch-target"
                >
                  <span className="text-xl">←</span>
                </button>
                
                <div className="flex space-x-2">
                  {filteredCharacters.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentCardIndex ? 'bg-mingle-rose' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={nextCard}
                  disabled={currentCardIndex === filteredCharacters.length - 1}
                  className="p-3 bg-white rounded-full shadow-md hover:shadow-lg active:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-shadow touch-target"
                >
                  <span className="text-xl">→</span>
                </button>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Persona Selection Modal */}
      {showPersonaModal && selectedCharacter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">채팅 프로필</h3>
              <p className="text-sm text-gray-600 mt-1">
                {selectedCharacter.name}과 대화할 페르소나를 선택해주세요
              </p>
            </div>

            {personas.length === 0 ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-3">👤</div>
                <p className="text-gray-600 text-sm mb-4">
                  아직 페르소나가 없어요.<br />
                  새로운 페르소나를 만들어주세요!
                </p>
                <button
                  onClick={handleCreatePersona}
                  className="w-full bg-mingle-rose text-silky-white py-3 rounded-lg font-medium transition-colors touch-target"
                >
                  페르소나 만들기
                </button>
              </div>
            ) : (
              <div className="space-y-3 mb-4">
                {personas.map(persona => (
                  <button
                    key={persona.id}
                    onClick={() => handlePersonaSelect(persona)}
                    className="w-full p-3 border border-gray-200 rounded-lg hover:border-mingle-rose active:border-mingle-rose hover:bg-gray-50 active:bg-gray-50 transition-colors text-left touch-target"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{persona.name}</h4>
                        {persona.description && (
                          <p className="text-sm text-gray-600 mt-1">{persona.description}</p>
                        )}
                      </div>
                      {persona.is_default && (
                        <span className="bg-twilight-blue text-silky-white px-2 py-1 rounded-full text-xs">
                          기본
                        </span>
                      )}
                    </div>
                  </button>
                ))}
                
                <button
                  onClick={handleCreatePersona}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-mingle-rose active:border-mingle-rose text-gray-600 hover:text-mingle-rose active:text-mingle-rose transition-colors touch-target"
                >
                  <div className="text-center">
                    <span className="text-xl">➕</span>
                    <p className="text-sm font-medium mt-1">새 페르소나 만들기</p>
                  </div>
                </button>
              </div>
            )}

            <button
              onClick={() => setShowPersonaModal(false)}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 active:bg-gray-200 transition-colors touch-target"
            >
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForYou; 