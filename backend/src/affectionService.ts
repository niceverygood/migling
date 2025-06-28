import { openai } from './openai';
import { pool } from './db';

interface AffectionAnalysis {
  affectionChange: number; // -10 ~ +10
  reason: string;
}

/**
 * OpenAI API로 대화의 호감도 변화량을 분석
 */
export async function analyzeAffectionChange(
  userMessage: string, 
  aiResponse: string, 
  characterPersonality: string,
  conversationHistory: any[] = []
): Promise<AffectionAnalysis> {
  try {
    const historyContext = conversationHistory.length > 0 
      ? `Previous conversation context:\n${conversationHistory.map(msg => 
          `${msg.is_user_message ? 'User' : 'AI'}: ${msg.message}`
        ).join('\n')}\n\n`
      : '';

    const prompt = `You are an expert in analyzing emotional dynamics in conversations. 
Analyze the following conversation between a user and an AI character.

Character Personality: ${characterPersonality}

${historyContext}Current Exchange:
User: ${userMessage}
AI: ${aiResponse}

Based on this conversation, determine how much the character's affection toward the user should change.

Rules:
- Return a number between -10 to +10
- Positive numbers = increased affection (friendly, sweet, helpful interactions)
- Negative numbers = decreased affection (rude, dismissive, inappropriate interactions)  
- Consider the character's personality when judging appropriateness
- 0 = neutral interaction with no significant impact

Examples:
- Compliments, gratitude, sharing personal stories: +2 to +5
- Kind questions, showing interest in character: +1 to +3
- Normal polite conversation: 0 to +1
- Slightly rude or dismissive: -1 to -3
- Very inappropriate or offensive: -5 to -10

Respond with ONLY a JSON object:
{
  "affectionChange": [number between -10 and 10],
  "reason": "[brief explanation of your reasoning]"
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 150,
      temperature: 0.3 // 낮은 temperature로 일관성 확보
    });

    const content = response.choices[0].message?.content;
    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    // JSON 파싱 시도
    try {
      const parsed = JSON.parse(content);
      const affectionChange = Math.max(-10, Math.min(10, parseInt(parsed.affectionChange)));
      
      return {
        affectionChange: isNaN(affectionChange) ? 0 : affectionChange,
        reason: parsed.reason || 'No reason provided'
      };
    } catch (parseError) {
      console.error('❌ Failed to parse OpenAI response:', content);
      return { affectionChange: 0, reason: 'Failed to analyze conversation' };
    }

  } catch (error) {
    console.error('❌ Affection analysis error:', error);
    return { affectionChange: 0, reason: 'Analysis service unavailable' };
  }
}

/**
 * persona-character 관계를 가져오거나 생성
 */
export async function getOrCreateRelationship(personaId: number, characterId: number) {
  try {
    // 기존 관계 확인
    let [rows] = await pool.execute(
      'SELECT * FROM persona_character_relationships WHERE persona_id = ? AND character_id = ?',
      [personaId, characterId]
    );

    if ((rows as any[]).length === 0) {
      // 관계가 없으면 새로 생성 (기본 호감도 50)
      const [result] = await pool.execute(
        'INSERT INTO persona_character_relationships (persona_id, character_id, affection_score) VALUES (?, ?, 50)',
        [personaId, characterId]
      );

      const insertId = (result as any).insertId;
      [rows] = await pool.execute(
        'SELECT * FROM persona_character_relationships WHERE id = ?',
        [insertId]
      );

      console.log(`✅ New relationship created: persona ${personaId} ↔ character ${characterId} (affection: 50)`);
    }

    return (rows as any[])[0];
  } catch (error) {
    console.error('❌ Get/create relationship error:', error);
    throw error;
  }
}

/**
 * 호감도 점수 업데이트
 */
export async function updateAffectionScore(
  personaId: number, 
  characterId: number, 
  affectionChange: number
) {
  try {
    // 현재 관계 정보 가져오기
    const relationship = await getOrCreateRelationship(personaId, characterId);
    
    // 새로운 호감도 계산 (0-100 범위 제한)
    const newScore = Math.max(0, Math.min(100, relationship.affection_score + affectionChange));
    
    // 업데이트
    await pool.execute(`
      UPDATE persona_character_relationships 
      SET affection_score = ?, 
          total_messages = total_messages + 1,
          last_interaction = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE persona_id = ? AND character_id = ?
    `, [newScore, personaId, characterId]);

    console.log(`💕 Affection updated: persona ${personaId} ↔ character ${characterId}: ${relationship.affection_score} → ${newScore} (${affectionChange > 0 ? '+' : ''}${affectionChange})`);
    
    return {
      previousScore: relationship.affection_score,
      newScore: newScore,
      change: affectionChange
    };
  } catch (error) {
    console.error('❌ Update affection score error:', error);
    throw error;
  }
}

/**
 * 호감도 레벨 텍스트 변환
 */
export function getAffectionLevel(score: number): string {
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