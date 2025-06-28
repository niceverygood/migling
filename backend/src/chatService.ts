import { openai } from './openai';
import { pool } from './db';
import { analyzeAffectionChange, updateAffectionScore, getOrCreateRelationship } from './affectionService';

export async function chatWithCharacter(
  characterId: number, 
  personaId: number, 
  userMsg: string
) {
  try {
    // 캐릭터 정보 가져오기
    const [characterRows] = await pool.execute(
      'SELECT * FROM characters WHERE id = ? AND is_active = 1', 
      [characterId]
    );
    const character = (characterRows as any)[0];
    
    if (!character) {
      throw new Error('Character not found');
    }

    // persona 정보 가져오기
    const [personaRows] = await pool.execute(
      'SELECT * FROM personas WHERE id = ?', 
      [personaId]
    );
    const persona = (personaRows as any)[0];
    
    if (!persona) {
      throw new Error('Persona not found');
    }

    // 이전 10개 메시지 가져오기 (해당 persona-character 간의 대화만)
    const [historyRows] = await pool.execute(`
      SELECT message, is_user_message, created_at 
      FROM chats 
      WHERE persona_id = ? AND character_id = ? 
      ORDER BY created_at DESC 
      LIMIT 10
    `, [personaId, characterId]);
    
    const history = (historyRows as any[]).reverse(); // 오래된 메시지부터
    
    // 현재 관계 정보 가져오기 (호감도 포함)
    const relationship = await getOrCreateRelationship(personaId, characterId);
    
    // 호감도에 따른 캐릭터 행동 조정
    const affectionContext = getAffectionContext(relationship.affection_score);
    
    // 메시지 구성
    const messages = [
      { 
        role: 'system' as const, 
        content: `You are ${character.name}, ${character.personality}. ${character.description}
        
Current relationship context: You are talking to "${persona.name}" (${persona.description || 'a user'}). 
Your current affection level toward them is ${relationship.affection_score}/100 (${affectionContext}).
${getPersonalityAdjustment(relationship.affection_score)}

Please respond naturally according to your personality and current relationship level.` 
      },
      ...history.map(msg => ({
        role: msg.is_user_message ? 'user' as const : 'assistant' as const,
        content: msg.message
      })),
      { role: 'user' as const, content: userMsg }
    ];
    
    console.log(`🤖 Chatting: ${persona.name} (${personaId}) ↔ ${character.name} (${characterId})`);
    console.log(`💕 Current affection: ${relationship.affection_score}/100 (${affectionContext})`);
    console.log(`📚 History: ${history.length} messages`);
    
    // OpenAI API 호출
    const resp = await openai.chat.completions.create({ 
      model: 'gpt-3.5-turbo', 
      messages,
      max_tokens: 200,
      temperature: 0.8
    });
    
    const reply = resp.choices[0].message?.content ?? '죄송해요, 답변을 생성할 수 없어요.';

    // 호감도 변화량 분석
    const affectionAnalysis = await analyzeAffectionChange(
      userMsg, 
      reply, 
      character.personality,
      history
    );

    // 사용자 메시지 저장
    await pool.execute(`
      INSERT INTO chats (persona_id, character_id, message, is_user_message, affection_change) 
      VALUES (?, ?, ?, 1, 0)
    `, [personaId, characterId, userMsg]);
    
    // AI 응답 저장 (호감도 변화량 포함)
    await pool.execute(`
      INSERT INTO chats (persona_id, character_id, message, is_user_message, affection_change) 
      VALUES (?, ?, ?, 0, ?)
    `, [personaId, characterId, reply, affectionAnalysis.affectionChange]);

    // 호감도 업데이트
    const affectionUpdate = await updateAffectionScore(
      personaId, 
      characterId, 
      affectionAnalysis.affectionChange
    );
    
    console.log(`✅ Chat completed with affection analysis:`);
    console.log(`   Change: ${affectionAnalysis.affectionChange} (${affectionAnalysis.reason})`);
    console.log(`   Score: ${affectionUpdate.previousScore} → ${affectionUpdate.newScore}`);
    
    return {
      reply,
      affection: {
        change: affectionAnalysis.affectionChange,
        reason: affectionAnalysis.reason,
        previousScore: affectionUpdate.previousScore,
        newScore: affectionUpdate.newScore,
        level: getAffectionContext(affectionUpdate.newScore)
      }
    };
  } catch (error) {
    console.error('❌ Chat error:', error);
    throw error;
  }
}

/**
 * 호감도에 따른 맥락 설명
 */
function getAffectionContext(score: number): string {
  if (score >= 90) return '💖 최고의 친구';
  if (score >= 80) return '💕 매우 친함';
  if (score >= 70) return '😊 친함';
  if (score >= 60) return '🙂 호감';
  if (score >= 50) return '😐 보통';
  if (score >= 40) return '😒 약간 서먹';
  if (score >= 30) return '😕 서먹함';
  if (score >= 20) return '😤 불편함';
  if (score >= 10) return '😠 매우 불편함';
  return '💔 최악';
}

/**
 * 호감도에 따른 캐릭터 성격 조정
 */
function getPersonalityAdjustment(score: number): string {
  if (score >= 80) {
    return 'You feel very close to this person and respond warmly, openly, and with genuine care.';
  } else if (score >= 60) {
    return 'You have positive feelings toward this person and respond in a friendly, helpful manner.';
  } else if (score >= 40) {
    return 'You feel neutral toward this person and respond politely but without special warmth.';
  } else if (score >= 20) {
    return 'You feel somewhat uncomfortable with this person and respond more formally or distantly.';
  } else {
    return 'You feel very uncomfortable with this person and respond coldly or dismissively.';
  }
} 