import { useState } from 'react';
import { characterAPI } from '../lib/api';
import { useNavigate } from 'react-router-dom';

interface CharacterFormData {
  // 기본 정보
  name: string;
  age: number | '';
  occupation: string;
  one_liner: string;
  
  // 카테고리
  category: string;
  
  // 성별 & 설정
  gender: 'male' | 'female' | 'unspecified';
  background_info: string;
  personality: string;
  habits: string;
  
  // 해시태그
  hashtags: string[];
  
  // 첫 장면 설정
  first_scene_setting: string;
  chat_ending: string;
  
  // 공개 설정
  is_private: boolean;
  chat_room_code: string;
  
  // 기타
  description: string;
  avatar_url: string;
}

const CATEGORIES = [
  { id: 'animation', label: '애니메이션 & 만화 주인공' },
  { id: 'game', label: '게임 캐릭터' },
  { id: 'original', label: '순수창작 캐릭터' },
  { id: 'celebrity', label: '셀러브리티' },
  { id: 'drama', label: '영화 & 드라마 주인공' },
  { id: 'vtuber', label: '버튜버' },
  { id: 'other', label: '기타' }
];

const HASHTAGS = [
  '#소유욕', '#츤데레', '#능글맞', '#진착남',
  '#연상남', '#집투', '#까칠남', '#다정남주',
  '#무심남', '#대형견남', '#잠생길', '#순정남',
  '#계탁', '#첫사랑', '#아한', '#상처남',
  '#직진남', '#집착', '#감을관계', '#엄하남',
  '#인의', '#금지된사랑', '#무독독', '#소꿉친구',
  '#위여웁', '#다정남', '#순애', '#재벌남',
  '#웹링', '#싸가지', '#능글', '#로맨스코미디',
  '#남자', '#협관', '#로맨스', '#기철',
  '#연상', '#자개', '#간수위', '#집착',
  '#순차남', '#신분차이', '#조잘', '#미남',
  '#초월적존재', '#미친놈', '#학원물', '#반말',
  '#운명적사랑', '#햇살개', '#여자', '#오만남',
  '#피페', '#판타지', '#독점욕', '#너드',
  '#육망', '#아저씨'
];

export default function CharacterCreation() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CharacterFormData>({
    name: '',
    age: '',
    occupation: '',
    one_liner: '',
    category: '',
    gender: 'unspecified',
    background_info: '',
    personality: '',
    habits: '',
    hashtags: [],
    first_scene_setting: '',
    chat_ending: '',
    is_private: false,
    chat_room_code: '',
    description: '',
    avatar_url: ''
  });

  const updateFormData = (updates: Partial<CharacterFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const characterData = {
        ...formData,
        age: formData.age === '' ? null : Number(formData.age)
      };
      
      const newCharacter = await characterAPI.createCharacter(characterData);
      console.log('✅ Character created:', newCharacter);
      
      // 성공 시 캐릭터 상세 페이지로 이동
      navigate(`/characters/${newCharacter.id}`);
    } catch (error) {
      console.error('Failed to create character:', error);
      alert('캐릭터 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleHashtag = (hashtag: string) => {
    updateFormData({
      hashtags: formData.hashtags.includes(hashtag)
        ? formData.hashtags.filter(h => h !== hashtag)
        : [...formData.hashtags, hashtag]
    });
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-2">프로필</h2>
        <div className="w-24 h-24 bg-pink-100 rounded-full mx-auto mb-6 flex items-center justify-center">
          <span className="text-2xl">👤</span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => updateFormData({ name: e.target.value })}
            placeholder="이름을 입력해주세요"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
            maxLength={15}
          />
          <div className="text-right text-xs text-gray-500 mt-1">
            {formData.name.length}/15
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">나이</label>
          <input
            type="number"
            value={formData.age}
            onChange={(e) => updateFormData({ age: e.target.value === '' ? '' : Number(e.target.value) })}
            placeholder="나이를 입력해주세요"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
            min="1"
            max="999"
          />
          <div className="text-right text-xs text-gray-500 mt-1">
            0/15
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">직업</label>
          <input
            type="text"
            value={formData.occupation}
            onChange={(e) => updateFormData({ occupation: e.target.value })}
            placeholder="직업을 입력해주세요"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">캐릭터 한 마디</label>
          <textarea
            value={formData.one_liner}
            onChange={(e) => updateFormData({ one_liner: e.target.value })}
            placeholder="대사를 입력해주세요"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 h-20 resize-none"
            maxLength={80}
          />
          <div className="text-right text-xs text-gray-500 mt-1">
            {formData.one_liner.length}/80
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-6">카테고리를 선택해주세요.</h2>
      </div>

      <div className="space-y-3">
        {CATEGORIES.map((category) => (
          <button
            key={category.id}
            onClick={() => updateFormData({ category: category.id })}
            className={`w-full py-4 px-6 rounded-full border text-center transition-colors ${
              formData.category === category.id
                ? 'bg-pink-500 text-white border-pink-500'
                : 'bg-white text-gray-700 border-gray-300 hover:border-pink-500'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-6">캐릭터 기본 설정</h2>
      </div>

      {/* 성별 선택 */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-3">성별</h3>
        <div className="flex space-x-4">
          {[
            { id: 'male', label: '남성' },
            { id: 'female', label: '여성' },
            { id: 'unspecified', label: '설정하지 않음' }
          ].map((option) => (
            <label key={option.id} className="flex items-center">
              <input
                type="radio"
                name="gender"
                value={option.id}
                checked={formData.gender === option.id}
                onChange={(e) => updateFormData({ gender: e.target.value as 'male' | 'female' | 'unspecified' })}
                className="w-4 h-4 text-pink-500 border-gray-300 focus:ring-pink-500"
              />
              <span className="ml-2 text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 기본 설정 */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-3">기본 설정</h3>
        <textarea
          value={formData.background_info}
          onChange={(e) => updateFormData({ background_info: e.target.value })}
          placeholder="배경, 가족, MBTI, 키 등을 입력해주세요"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 h-32 resize-none"
          maxLength={700}
        />
        <div className="text-right text-xs text-gray-500 mt-1">
          {formData.background_info.length}/700
        </div>
      </div>

      {/* 성격 */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-3">성격</h3>
        <textarea
          value={formData.personality}
          onChange={(e) => updateFormData({ personality: e.target.value })}
          placeholder="성격을 입력해주세요"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 h-32 resize-none"
          maxLength={700}
        />
        <div className="text-right text-xs text-gray-500 mt-1">
          {formData.personality.length}/700
        </div>
      </div>

      {/* 습관적인 말과 행동 */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-3">습관적인 말과 행동</h3>
        <textarea
          value={formData.habits}
          onChange={(e) => updateFormData({ habits: e.target.value })}
          placeholder="예시를 입력해주세요"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 h-32 resize-none"
        />
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-2">해시태그 추가</h2>
        <p className="text-sm text-gray-600 mb-6">선택된 태그</p>
        <input
          type="text"
          placeholder="#없이 해시태그를 입력해주세요"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 mb-6"
        />
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-3">해시태그 선택</h3>
        <div className="flex flex-wrap gap-2">
          {HASHTAGS.map((hashtag) => (
            <button
              key={hashtag}
              onClick={() => toggleHashtag(hashtag)}
              className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                formData.hashtags.includes(hashtag)
                  ? 'bg-pink-500 text-white border-pink-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-pink-500'
              }`}
            >
              {hashtag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-6">채팅 첫 장면 설정</h2>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-3">첫 상황 (선택)</h3>
        <textarea
          value={formData.first_scene_setting}
          onChange={(e) => updateFormData({ first_scene_setting: e.target.value })}
          placeholder="예) 자기전, 캐릭터가 식사에서 선택을 한 상황"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 h-32 resize-none"
          maxLength={800}
        />
        <div className="text-right text-xs text-gray-500 mt-1">
          {formData.first_scene_setting.length}/800
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-3">채팅 첫 마디 (선택)</h3>
        <textarea
          value={formData.chat_ending}
          onChange={(e) => updateFormData({ chat_ending: e.target.value })}
          placeholder="예) 안으로 내 특 받으면 3초 안에 답장해줬"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 h-32 resize-none"
          maxLength={800}
        />
        <div className="text-right text-xs text-gray-500 mt-1">
          {formData.chat_ending.length}/800
        </div>
      </div>

      {/* 공개 설정 */}
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-3">게시 범위 설정</h3>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="privacy"
              checked={!formData.is_private}
              onChange={() => updateFormData({ is_private: false })}
              className="w-4 h-4 text-pink-500 border-gray-300 focus:ring-pink-500"
            />
            <span className="ml-2 text-sm text-gray-700">공개</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="privacy"
              checked={formData.is_private}
              onChange={() => updateFormData({ is_private: true })}
              className="w-4 h-4 text-pink-500 border-gray-300 focus:ring-pink-500"
            />
            <span className="ml-2 text-sm text-gray-700">비공개</span>
          </label>
        </div>

        {formData.is_private && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">채팅방 코드 설정</label>
            <p className="text-xs text-gray-500 mb-2">
              코드를 설정하면 이 코드를 입력한 사람만 캐릭터와 대화가 가능합니다.
            </p>
            <input
              type="text"
              value={formData.chat_room_code}
              onChange={(e) => updateFormData({ chat_room_code: e.target.value })}
              placeholder="숫자 4자리"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
              maxLength={10}
            />
          </div>
        )}
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      default: return renderStep1();
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.name.trim() !== '';
      case 2: return formData.category !== '';
      case 3: return true; // 선택사항들이므로 항상 진행 가능
      case 4: return true; // 해시태그는 선택사항
      case 5: return true; // 모든 필드가 선택사항
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-800"
          >
            ←
          </button>
          <h1 className="text-lg font-semibold text-gray-800">캐릭터 만들기</h1>
          <span className="text-pink-500 font-medium">임시저장</span>
        </div>
      </div>

      {/* 진행바 */}
      <div className="bg-white px-4 py-2">
        <div className="flex justify-center space-x-2">
          {[1, 2, 3, 4, 5].map((step) => (
            <div
              key={step}
              className={`w-2 h-2 rounded-full ${
                step <= currentStep ? 'bg-pink-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* 컨텐츠 */}
      <div className="flex-1 overflow-y-auto p-4">
        {renderCurrentStep()}
      </div>

      {/* 하단 버튼 */}
      <div className="bg-white border-t p-4">
        <button
          onClick={() => {
            if (currentStep === 5) {
              handleSubmit();
            } else {
              setCurrentStep(prev => prev + 1);
            }
          }}
          disabled={!canProceed() || isLoading}
          className={`w-full py-3 rounded-lg font-medium transition-colors ${
            canProceed() && !isLoading
              ? 'bg-pink-500 text-white hover:bg-pink-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isLoading ? '생성 중...' : currentStep === 5 ? '완료' : '다음'}
        </button>
      </div>
    </div>
  );
} 