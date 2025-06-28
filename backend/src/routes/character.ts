import express, { Request, Response } from 'express';
import { pool } from '../db';
import { chatWithCharacter } from '../chatService';
import { getOrCreateRelationship, getAffectionLevel } from '../affectionService';

const router = express.Router();

// GET /api/characters - 성능 최적화된 버전
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      gender, 
      user_id, 
      is_private,
      page = '1',
      limit = '20',
      fields = 'basic' // 'basic', 'full', 'minimal'
    } = req.query;
    
    // 페이지네이션 파라미터
    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string))); // 최대 50개로 제한
    const offset = (pageNum - 1) * limitNum;
    
    // 필드 선택 (배포 환경에서 네트워크 사용량 최소화)
    let selectFields = '';
    switch (fields) {
      case 'minimal':
        selectFields = 'id, name, avatar_url, category, gender, is_private';
        break;
      case 'basic':
        selectFields = 'id, name, description, avatar_url, category, gender, age, occupation, one_liner, is_private, created_at';
        break;
      case 'full':
        selectFields = '*';
        break;
      default:
        selectFields = 'id, name, description, avatar_url, category, gender, age, occupation, one_liner, is_private, created_at';
    }
    
    let whereConditions = ['is_active = 1'];
    let params: any[] = [];
    
    // 필터 조건들 (인덱스 활용)
    if (category && category !== 'all') {
      whereConditions.push('category = ?');
      params.push(category);
    }
    
    if (gender && gender !== 'all') {
      whereConditions.push('gender = ?');
      params.push(gender);
    }
    
    if (user_id) {
      whereConditions.push('user_id = ?');
      params.push(user_id);
    }
    
    if (is_private !== undefined) {
      whereConditions.push('is_private = ?');
      params.push(is_private === 'true');
    }
    
    const whereClause = whereConditions.join(' AND ');
    
    // 성능 최적화: COUNT와 데이터를 분리해서 조회하지 않고 LIMIT+1로 hasMore 판단
    const query = `
      SELECT ${selectFields} 
      FROM characters 
      WHERE ${whereClause} 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `;
    
    params.push(parseInt(String(limitNum + 1)), parseInt(String(offset))); // 명시적 정수 변환
    
    const [rows] = await pool.execute(query, params);
    const characters = rows as any[];
    
    // 다음 페이지 존재 여부 확인
    const hasMore = characters.length > limitNum;
    if (hasMore) {
      characters.pop(); // 마지막 항목 제거
    }
    
    // hashtags 파싱 (필요한 경우에만)
    const processedCharacters = characters.map(char => {
      if (char.hashtags && typeof char.hashtags === 'string') {
        try {
          char.hashtags = JSON.parse(char.hashtags);
        } catch (error) {
          char.hashtags = [];
        }
      }
      return char;
    });
    
    // 성능 모니터링용 응답 헤더
    res.set({
      'X-Total-Count': characters.length.toString(),
      'X-Page': pageNum.toString(),
      'X-Limit': limitNum.toString(),
      'X-Has-More': hasMore.toString()
    });
    
    res.json({
      characters: processedCharacters,
      pagination: {
        page: pageNum,
        limit: limitNum,
        hasMore,
        totalInPage: characters.length
      }
    });
  } catch (error) {
    console.error('Fetch characters error:', error);
    res.status(500).json({ error: 'Failed to fetch characters' });
  }
});

// POST /api/characters
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      personality,
      avatar_url,
      age,
      occupation,
      one_liner,
      category,
      gender,
      background_info,
      habits,
      hashtags,
      first_scene_setting,
      chat_ending,
      is_private,
      chat_room_code
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }

    // 현재는 임시로 user_id = 1 사용 (나중에 JWT에서 추출)
    const userId = 1;

    // 비공개 캐릭터인 경우 채팅방 코드 생성
    let roomCode = null;
    if (is_private) {
      roomCode = chat_room_code || Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    console.log('🔧 Creating character with data:', {
      userId,
      name,
      age,
      occupation,
      one_liner,
      category,
      gender,
      background_info,
      habits,
      hashtags,
      first_scene_setting,
      chat_ending,
      is_private,
      roomCode
    });

    const [result] = await pool.execute(
      `INSERT INTO characters (
        user_id, name, description, personality, avatar_url,
        age, occupation, one_liner, category, gender,
        background_info, habits, hashtags, first_scene_setting,
        chat_ending, is_private, chat_room_code
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,                                    // user_id
        name,                                      // name
        description || '',                         // description
        personality || '',                         // personality
        avatar_url || '',                         // avatar_url
        age || null,                              // age
        occupation || '',                         // occupation
        one_liner || '',                          // one_liner
        category || 'other',                      // category
        gender || 'unspecified',                  // gender
        background_info || '',                    // background_info
        habits || '',                             // habits
        '[]', // hashtags (빈 배열 JSON 저장)
        first_scene_setting || '',               // first_scene_setting
        chat_ending || '',                        // chat_ending
        is_private || false,                      // is_private
        roomCode                                  // chat_room_code
      ]
    );
    
    const insertId = (result as any).insertId;
    
    // 캐릭터 정보를 재조회하지 말고 생성 결과만 반환
    console.log(`✅ Character created: ${name} by user ${userId} (ID: ${insertId})`);
    res.json({ 
      id: insertId, 
      name,
      age,
      occupation,
      one_liner,
      category,
      gender,
      background_info,
      habits,
      first_scene_setting,
      chat_ending,
      is_private,
      chat_room_code: roomCode,
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Create character error:', error);
    res.status(500).json({ error: 'Failed to create character' });
  }
});

// PUT /api/characters/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, personality, avatar_url, is_active } = req.body;
    
    await pool.execute(
      'UPDATE characters SET name = ?, description = ?, personality = ?, avatar_url = ?, is_active = ? WHERE id = ?',
      [name, description, personality, avatar_url, is_active, parseInt(id)]
    );
    
    const [rows] = await pool.execute('SELECT * FROM characters WHERE id = ?', [parseInt(id)]);
    res.json((rows as any)[0]);
  } catch (error) {
    console.error('Update character error:', error);
    res.status(500).json({ error: 'Failed to update character' });
  }
});

// DELETE /api/characters/:id
router.delete('/:id', async (req, res) => {
  try {
    await pool.execute('DELETE FROM characters WHERE id = ?', [parseInt(req.params.id)]);
    res.json({ deleted: true });
  } catch (error) {
    console.error('Delete character error:', error);
    res.status(500).json({ error: 'Failed to delete character' });
  }
});

// POST /api/characters/:id/chat
router.post('/:id/chat', async (req, res) => {
  try {
    const { id } = req.params;
    const { message, personaId } = req.body;
    
    console.log(`📨 Chat request: character ${id}, persona ${personaId}, message: "${message}"`);
    
    if (!message) {
      return res.status(400).json({ error: 'message is required' });
    }
    
    if (!personaId) {
      return res.status(400).json({ error: 'personaId is required' });
    }
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'valid character id is required' });
    }
    
    const result = await chatWithCharacter(parseInt(id), parseInt(personaId), message);
    console.log(`✅ Chat success: character ${id} ↔ persona ${personaId}`);
    res.json(result);
  } catch (error) {
    console.error('❌ Chat error:', error);
    console.error('❌ Error details:', {
      characterId: req.params.id,
      personaId: req.body.personaId,
      message: req.body.message,
      errorMessage: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    res.status(500).json({ 
      error: 'Failed to chat with character',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// GET /api/characters/:id/affection/:personaId - 특정 persona와 character 간 호감도 조회
router.get('/:id/affection/:personaId', async (req, res) => {
  try {
    const characterId = parseInt(req.params.id);
    const personaId = parseInt(req.params.personaId);
    
    if (isNaN(characterId) || isNaN(personaId)) {
      return res.status(400).json({ error: 'Valid character and persona IDs required' });
    }
    
    const relationship = await getOrCreateRelationship(personaId, characterId);
    
    res.json({
      characterId,
      personaId,
      affectionScore: relationship.affection_score,
      affectionLevel: getAffectionLevel(relationship.affection_score),
      totalMessages: relationship.total_messages,
      lastInteraction: relationship.last_interaction,
      createdAt: relationship.created_at
    });
  } catch (error) {
    console.error('Get affection error:', error);
    res.status(500).json({ error: 'Failed to get affection data' });
  }
});

// GET /api/characters/:id/history/:personaId - 특정 persona와 character 간 대화 기록 조회
router.get('/:id/history/:personaId', async (req, res) => {
  try {
    const characterId = parseInt(req.params.id);
    const personaId = parseInt(req.params.personaId);
    const limit = parseInt(req.query.limit as string) || 50;
    
    if (isNaN(characterId) || isNaN(personaId)) {
      return res.status(400).json({ error: 'Valid character and persona IDs required' });
    }
    
    const [rows] = await pool.execute(
      `SELECT id, message, is_user_message, affection_change, created_at
       FROM chats 
       WHERE persona_id = ? AND character_id = ? 
       ORDER BY created_at DESC 
       LIMIT ?`,
      [personaId, characterId, limit]
    );
    
    res.json({
      characterId,
      personaId,
      messages: (rows as any[]).reverse(), // 오래된 것부터 최신 순
      totalCount: (rows as any[]).length
    });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ error: 'Failed to get chat history' });
  }
});

export default router; 