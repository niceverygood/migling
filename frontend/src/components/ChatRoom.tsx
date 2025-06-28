import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { characterAPI, personaAPI } from '../lib/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  affection?: {
    change: number;
    newScore: number;
    level: string;
  };
}

interface Persona {
  id: number;
  name: string;
  description: string;
  is_default: boolean;
}

interface Character {
  id: number;
  name: string;
  description: string;
  personality: string;
}

interface AffectionData {
  affectionScore: number;
  affectionLevel: string;
  totalMessages: number;
  lastInteraction: string;
}

export default function ChatRoom() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [character, setCharacter] = useState<Character | null>(null);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [affection, setAffection] = useState<AffectionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingPersonas, setIsCheckingPersonas] = useState(true);

  // 초기 데이터 로딩
  useEffect(() => {
    const loadInitialData = async () => {
      if (!id) return;

      try {
        setIsCheckingPersonas(true);

        // 캐릭터 정보 로딩
        const characterData = await characterAPI.getCharacter(id);
        setCharacter(characterData);

        // 먼저 모든 페르소나를 가져와서 체크
        const personasResponse = await personaAPI.getAllPersonas();
        const allPersonas = Array.isArray(personasResponse) ? personasResponse : personasResponse.personas || [];
        
        // 페르소나가 없으면 페르소나 생성 페이지로 이동
        if (!allPersonas || allPersonas.length === 0) {
          console.log('📝 No personas found, redirecting to persona creation');
          // 현재 채팅방 ID를 저장하여 페르소나 생성 후 돌아올 수 있도록 함
          localStorage.setItem('pendingChatId', id);
          navigate('/persona/create');
          return;
        }

        setPersonas(allPersonas);

        // 기본 페르소나 찾기 - For You에서 선택한 페르소나 우선 사용
        let defaultPersona = null;
        const selectedPersonaId = localStorage.getItem('selectedPersonaId');
        
        if (selectedPersonaId) {
          defaultPersona = allPersonas.find((p: Persona) => p.id === parseInt(selectedPersonaId));
          // 사용 후 localStorage에서 제거
          localStorage.removeItem('selectedPersonaId');
        }
        
        if (!defaultPersona) {
          defaultPersona = allPersonas.find((p: Persona) => p.is_default);
        }
        
        if (!defaultPersona && allPersonas.length > 0) {
          defaultPersona = allPersonas[0]; // 기본 페르소나가 없으면 첫 번째 페르소나 사용
        }

        if (defaultPersona) {
          setSelectedPersona(defaultPersona);
          
          // 호감도 정보 로딩
          const affectionData = await characterAPI.getAffection(id, defaultPersona.id);
          setAffection(affectionData);
        }
      } catch (error) {
        console.error('Failed to load initial data:', error);
      } finally {
        setIsCheckingPersonas(false);
      }
    };

    loadInitialData();
  }, [id, navigate]);

  // Persona 변경 시 호감도 정보 업데이트
  useEffect(() => {
    const updateAffection = async () => {
      if (!id || !selectedPersona) return;

      try {
        const affectionData = await characterAPI.getAffection(id, selectedPersona.id);
        setAffection(affectionData);
      } catch (error) {
        console.error('Failed to load affection:', error);
      }
    };

    updateAffection();
  }, [id, selectedPersona]);

  const sendMessage = async () => {
    if (!input.trim() || !selectedPersona || !id) return;

    setIsLoading(true);
    try {
      // 사용자 메시지 추가
      const userMessage: Message = { role: 'user', content: input };
      setMessages(prev => [...prev, userMessage]);

      // API 호출
      const response = await characterAPI.chatWithCharacter(id, input, selectedPersona.id);
      
      // AI 응답 추가
      const aiMessage: Message = {
        role: 'assistant',
        content: response.reply,
        affection: response.affection
      };
      setMessages(prev => [...prev, aiMessage]);

      // 호감도 정보 업데이트
      if (response.affection) {
        setAffection(prev => prev ? {
          ...prev,
          affectionScore: response.affection.newScore,
          affectionLevel: response.affection.level,
          totalMessages: prev.totalMessages + 1
        } : null);
      }

      setInput('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getAffectionColor = (score: number) => {
    if (score >= 80) return 'text-mingle-rose';
    if (score >= 60) return 'text-mint-mix';
    if (score >= 40) return 'text-twilight-blue';
    if (score >= 20) return 'text-peach-mingle';
    return 'text-gray-500';
  };

  const getAffectionBgColor = (score: number) => {
    if (score >= 80) return 'bg-mingle-rose';
    if (score >= 60) return 'bg-mint-mix';
    if (score >= 40) return 'bg-twilight-blue';
    if (score >= 20) return 'bg-peach-mingle';
    return 'bg-gray-500';
  };

  if (!character || (!selectedPersona && !isCheckingPersonas)) {
    return (
      <div className="min-h-screen bg-silky-white mobile-container">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mingle-rose mx-auto mb-4"></div>
            <p className="text-night-ink">
              {isCheckingPersonas ? '페르소나를 확인하는 중...' : '로딩 중...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-silky-white mobile-container">
      {/* Header - 캐릭터 정보 및 호감도 */}
      <div className="bg-white shadow-sm border-b p-4 safe-top">
        {/* 뒤로 가기 및 캐릭터 정보 */}
        <div className="flex items-center space-x-3 mb-3">
          <button 
            onClick={() => navigate(-1)}
            className="touch-target p-1 hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors"
          >
            <span className="text-lg">←</span>
          </button>
          <h1 className="text-lg font-semibold text-gray-800">채팅</h1>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="w-12 h-12 bg-gradient-to-br from-mingle-rose to-twilight-blue rounded-full flex items-center justify-center text-silky-white font-bold text-lg">
              {character.name[0]}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-semibold text-gray-800 truncate">{character.name}</h1>
              <p className="text-sm text-gray-500 truncate">{character.description}</p>
            </div>
          </div>

          {/* 호감도 표시 */}
          {affection && (
            <div className="text-right flex-shrink-0 ml-2">
              <div className={`text-sm font-bold ${getAffectionColor(affection.affectionScore)}`}>
                {affection.affectionLevel}
              </div>
              <div className="text-xs text-gray-500">
                {affection.affectionScore}/100
              </div>
              <div className="w-16 h-1.5 bg-gray-200 rounded-full mt-1">
                <div 
                  className={`h-full rounded-full ${getAffectionBgColor(affection.affectionScore)}`}
                  style={{ width: `${affection.affectionScore}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Persona 선택 */}
        <div className="mt-3 flex items-center space-x-2">
          <span className="text-sm text-gray-600 flex-shrink-0">페르소나:</span>
          <select 
            value={selectedPersona?.id || ''} 
            onChange={(e) => {
              const persona = personas.find(p => p.id === Number(e.target.value));
              if (persona) setSelectedPersona(persona);
            }}
            className="text-sm border rounded-lg px-3 py-1.5 bg-white flex-1 min-w-0 touch-target"
          >
            {personas.map(persona => (
              <option key={persona.id} value={persona.id}>
                {persona.name} {persona.is_default ? '(기본)' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 hide-scrollbar">
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[280px] px-4 py-3 rounded-2xl ${
              message.role === 'user' 
                ? 'chat-bubble-user' 
                : 'chat-bubble-character'
            }`}>
              <p className="text-sm">{message.content}</p>
              
              {/* 호감도 변화 표시 */}
              {message.affection && message.affection.change !== 0 && (
                <div className="mt-2 text-xs">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    message.affection.change > 0 
                      ? 'bg-mint-mix text-night-ink' 
                      : 'bg-gray-100 text-night-ink'
                  }`}>
                    {message.affection.change > 0 ? '💕' : '💔'} 
                    {message.affection.change > 0 ? '+' : ''}{message.affection.change}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="chat-bubble-character">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-mingle-rose rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-mingle-rose rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-mingle-rose rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="bg-white border-t p-4 safe-bottom">
        <div className="flex space-x-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`${selectedPersona?.name || '나'}으로서 ${character.name}에게 메시지...`}
            className="input-field flex-1"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="btn-primary px-6 py-3 touch-target disabled:opacity-50 disabled:cursor-not-allowed"
          >
            전송
          </button>
        </div>
      </div>
    </div>
  );
} 