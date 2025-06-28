import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [character, setCharacter] = useState<Character | null>(null);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [affection, setAffection] = useState<AffectionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 초기 데이터 로딩
  useEffect(() => {
    const loadInitialData = async () => {
      if (!id) return;

      try {
        // 캐릭터 정보 로딩
        const characterData = await characterAPI.getCharacter(id);
        setCharacter(characterData);

        // 기본 persona 로딩
        const defaultPersona = await personaAPI.getDefaultPersona();
        setSelectedPersona(defaultPersona);

        // 모든 persona 로딩
        const allPersonas = await personaAPI.getAllPersonas();
        setPersonas(allPersonas);

        // 호감도 정보 로딩
        if (defaultPersona) {
          const affectionData = await characterAPI.getAffection(id, defaultPersona.id);
          setAffection(affectionData);
        }
      } catch (error) {
        console.error('Failed to load initial data:', error);
      }
    };

    loadInitialData();
  }, [id]);

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
    if (score >= 80) return 'text-pink-500';
    if (score >= 60) return 'text-green-500';
    if (score >= 40) return 'text-blue-500';
    if (score >= 20) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getAffectionBgColor = (score: number) => {
    if (score >= 80) return 'bg-pink-500';
    if (score >= 60) return 'bg-green-500';
    if (score >= 40) return 'bg-blue-500';
    if (score >= 20) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (!character || !selectedPersona) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header - 캐릭터 정보 및 호감도 */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
              {character.name[0]}
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-800">{character.name}</h1>
              <p className="text-sm text-gray-500">{character.description}</p>
            </div>
          </div>

          {/* 호감도 표시 */}
          {affection && (
            <div className="text-right">
              <div className={`text-lg font-bold ${getAffectionColor(affection.affectionScore)}`}>
                {affection.affectionLevel}
              </div>
              <div className="text-sm text-gray-500">
                {affection.affectionScore}/100 • {affection.totalMessages}회 대화
              </div>
              <div className="w-24 h-2 bg-gray-200 rounded-full mt-1">
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
          <span className="text-sm text-gray-600">페르소나:</span>
          <select 
            value={selectedPersona?.id || ''} 
            onChange={(e) => {
              const persona = personas.find(p => p.id === Number(e.target.value));
              if (persona) setSelectedPersona(persona);
            }}
            className="text-sm border rounded px-2 py-1 bg-white"
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
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
              message.role === 'user' 
                ? 'bg-blue-500 text-white' 
                : 'bg-white border shadow-sm'
            }`}>
              <p className="text-sm">{message.content}</p>
              
              {/* 호감도 변화 표시 */}
              {message.affection && message.affection.change !== 0 && (
                <div className="mt-2 text-xs">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    message.affection.change > 0 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
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
            <div className="bg-white border shadow-sm rounded-lg px-4 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="bg-white border-t p-4">
        <div className="flex space-x-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`${selectedPersona.name}으로서 ${character.name}에게 메시지를 보내세요...`}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            전송
          </button>
        </div>
      </div>
    </div>
  );
} 