import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { personaAPI } from '../lib/api';

interface PersonaFormData {
  name: string;
  age?: number;
  occupation: string;
  gender: 'male' | 'female' | 'unspecified';
  basic_info: string;
  habits: string;
  avatar_url?: string;
}

const PersonaCreation: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<PersonaFormData>({
    name: '',
    age: undefined,
    occupation: '',
    gender: 'unspecified',
    basic_info: '',
    habits: '',
    avatar_url: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  
  // 채팅을 위해 페르소나 생성이 필요한지 확인
  const pendingChatId = localStorage.getItem('pendingChatId');
  const isRequiredForChat = Boolean(pendingChatId);

  const handleInputChange = (field: keyof PersonaFormData, value: string | number | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert('이름을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const createData = {
        name: formData.name,
        age: formData.age || null,
        occupation: formData.occupation,
        gender: formData.gender,
        basic_info: formData.basic_info,
        habits: formData.habits,
        avatar_url: formData.avatar_url || '',
        description: `${formData.basic_info} ${formData.habits}`.trim()
      };

      console.log('🔧 Creating persona:', createData);
      const newPersona = await personaAPI.createPersona(createData);
      console.log('✅ Persona created successfully:', newPersona);
      
      alert('페르소나가 성공적으로 생성되었습니다!');
      
      // 대기 중인 채팅방 ID가 있는지 확인
      if (pendingChatId) {
        // 저장된 채팅방 ID 제거
        localStorage.removeItem('pendingChatId');
        // 해당 채팅방으로 이동
        navigate(`/chat/${pendingChatId}`);
      } else {
        // 일반적인 경우는 MY 탭으로 이동
        navigate('/tabs/my');
      }
    } catch (error) {
      console.error('❌ Persona creation failed:', error);
      alert('페르소나 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <span className="text-xl">←</span>
        </button>
        <h1 className="text-lg font-semibold">페르소나 생성</h1>
        <button
          onClick={handleSubmit}
          disabled={!formData.name.trim() || isLoading}
          className="text-pink-500 font-semibold disabled:text-gray-400"
        >
          {isLoading ? '완료중...' : '완료'}
        </button>
      </div>

      {/* 채팅을 위한 페르소나 생성 안내 */}
      {isRequiredForChat && (
        <div className="bg-mingle-rose text-silky-white p-4 mx-4 mt-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-lg">💬</span>
            <div>
              <p className="font-medium">채팅을 시작하려면 페르소나가 필요해요!</p>
              <p className="text-sm opacity-90 mt-1">
                AI 캐릭터와 대화할 때 사용할 나만의 페르소나를 만들어주세요.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 space-y-6">
        {/* 프로필 이미지 */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-pink-200 to-orange-200 rounded-full flex items-center justify-center">
              <div className="w-12 h-12 bg-white rounded-full"></div>
            </div>
            <button className="absolute bottom-0 right-0 bg-gray-400 rounded-full p-1">
              <span className="text-white text-xs">✏️</span>
            </button>
          </div>
        </div>

        {/* 성별 선택 */}
        <div>
          <h3 className="text-lg font-semibold mb-3">성별</h3>
          <div className="flex space-x-4">
            {[
              { value: 'male', label: '남성' },
              { value: 'female', label: '여성' },
              { value: 'unspecified', label: '밝히지 않음' }
            ].map((option) => (
              <label key={option.value} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="gender"
                  value={option.value}
                  checked={formData.gender === option.value}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="w-5 h-5 text-pink-500"
                />
                <span className="text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 이름 (필수) */}
        <div>
          <label className="block text-lg font-semibold mb-2">
            이름 <span className="text-pink-500">(필수)</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="이름을 입력해주세요"
            maxLength={15}
            className="w-full p-4 border border-gray-300 rounded-lg text-lg"
          />
          <div className="text-right text-gray-400 text-sm mt-1">
            {formData.name.length}/15
          </div>
        </div>

        {/* 나이 */}
        <div>
          <label className="block text-lg font-semibold mb-2">나이</label>
          <input
            type="number"
            value={formData.age || ''}
            onChange={(e) => handleInputChange('age', e.target.value ? parseInt(e.target.value) : undefined)}
            placeholder="나이를 입력해주세요"
            min="1"
            max="150"
            className="w-full p-4 border border-gray-300 rounded-lg text-lg"
          />
        </div>

        {/* 직업 */}
        <div>
          <label className="block text-lg font-semibold mb-2">직업</label>
          <input
            type="text"
            value={formData.occupation}
            onChange={(e) => handleInputChange('occupation', e.target.value)}
            placeholder="직업을 입력해주세요"
            maxLength={15}
            className="w-full p-4 border border-gray-300 rounded-lg text-lg"
          />
          <div className="text-right text-gray-400 text-sm mt-1">
            {formData.occupation.length}/15
          </div>
        </div>

        {/* 기본 정보 */}
        <div>
          <label className="block text-lg font-semibold mb-2">기본 정보</label>
          <textarea
            value={formData.basic_info}
            onChange={(e) => handleInputChange('basic_info', e.target.value)}
            placeholder="외모, 성격 등 기본 정보를 알려주세요"
            maxLength={500}
            rows={4}
            className="w-full p-4 border border-gray-300 rounded-lg text-lg resize-none"
          />
          <div className="text-right text-gray-400 text-sm mt-1">
            {formData.basic_info.length}/500
          </div>
        </div>

        {/* 습관적인 말과 행동 */}
        <div>
          <label className="block text-lg font-semibold mb-2">습관적인 말과 행동</label>
          <textarea
            value={formData.habits}
            onChange={(e) => handleInputChange('habits', e.target.value)}
            placeholder="예시를 입력해주세요"
            maxLength={500}
            rows={4}
            className="w-full p-4 border border-gray-300 rounded-lg text-lg resize-none"
          />
          <div className="text-right text-gray-400 text-sm mt-1">
            {formData.habits.length}/500
          </div>
        </div>

        {/* 하단 여백 */}
        <div className="h-20"></div>
      </div>
    </div>
  );
};

export default PersonaCreation; 