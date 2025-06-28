import express, { Request, Response } from 'express';
import { pool } from '../db';

const router = express.Router();

// GET /api/personas - 사용자의 모든 persona 조회 (성능 최적화 버전)
router.get('/', async (req, res) => {
  try {
    // 임시로 user_id = 1 사용 (나중에 JWT에서 추출)
    const userId = 1;
    
    // 배포 환경 성능 최적화: 쿼리 파라미터 처리
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50); // 최대 50개
    const offset = (page - 1) * limit;
    
    // 성능 최적화: 필요한 필드만 SELECT
    const [rows] = await pool.execute(
      `SELECT id, name, description, avatar_url, is_default, age, occupation, 
       gender, basic_info, habits, created_at 
       FROM personas 
       WHERE user_id = ? 
       ORDER BY is_default DESC, created_at DESC 
       LIMIT ? OFFSET ?`,
      [userId, limit + 1, offset] // LIMIT+1로 hasMore 판단
    );
    
    const personas = (rows as any[]).slice(0, limit);
    const hasMore = (rows as any[]).length > limit;
    
    console.log(`📊 Fetched ${personas.length} personas for user ${userId} (page ${page})`);
    
    res.json({
      personas,
      pagination: {
        page,
        limit,
        hasMore,
        total: personas.length
      }
    });
  } catch (error) {
    console.error('Fetch personas error:', error);
    res.status(500).json({ error: 'Failed to fetch personas' });
  }
});

// POST /api/personas - 새 persona 생성 (성능 최적화 버전)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { 
      name, 
      description, 
      avatar_url, 
      is_default,
      age,
      occupation,
      gender,
      basic_info,
      habits
    } = req.body;
    const userId = 1; // 임시로 user_id = 1 사용
    
    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }

    // 입력 데이터 로깅 (디버깅용)
    console.log('🔧 Creating persona with data:', {
      userId,
      name,
      age,
      occupation,
      gender,
      basic_info,
      habits
    });

    // 기본 persona로 설정하는 경우, 다른 persona들의 is_default를 false로 변경
    if (is_default) {
      await pool.execute(
        'UPDATE personas SET is_default = FALSE WHERE user_id = ?',
        [userId]
      );
    }
    
    const [result] = await pool.execute(
      `INSERT INTO personas (
        user_id, name, description, avatar_url, is_default, 
        age, occupation, gender, basic_info, habits
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        name,
        description || '',
        avatar_url || '',
        is_default || false,
        age || null,
        occupation || '',
        gender || 'unspecified',
        basic_info || '',
        habits || ''
      ]
    );
    
    const insertId = (result as any).insertId;
    // 배포 환경 성능을 위해 새로 조회하지 않고 직접 응답 생성
    const newPersona = {
      id: insertId,
      user_id: userId,
      name,
      description: description || '',
      avatar_url: avatar_url || '',
      is_default: is_default || false,
      age: age || null,
      occupation: occupation || '',
      gender: gender || 'unspecified',
      basic_info: basic_info || '',
      habits: habits || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log(`✅ Persona created: ${name} for user ${userId} (ID: ${insertId})`);
    res.json(newPersona);
  } catch (error) {
    console.error('Create persona error:', error);
    res.status(500).json({ error: 'Failed to create persona' });
  }
});

// GET /api/personas/default - 기본 persona 조회 (없으면 생성)
router.get('/default', async (req, res) => {
  try {
    const userId = 1; // 임시로 user_id = 1 사용
    
    // 기본 persona가 있는지 확인
    let [rows] = await pool.execute(
      'SELECT * FROM personas WHERE user_id = ? AND is_default = TRUE LIMIT 1',
      [userId]
    );
    
    if ((rows as any[]).length === 0) {
      // 기본 persona가 없으면 생성
      const [result] = await pool.execute(
        'INSERT INTO personas (user_id, name, description, is_default) VALUES (?, ?, ?, TRUE)',
        [userId, 'Me', '나의 기본 페르소나']
      );
      
      const insertId = (result as any).insertId;
      [rows] = await pool.execute('SELECT * FROM personas WHERE id = ?', [insertId]);
      
      console.log(`✅ Default persona created for user ${userId}`);
    }
    
    res.json((rows as any)[0]);
  } catch (error) {
    console.error('Get default persona error:', error);
    res.status(500).json({ error: 'Failed to get default persona' });
  }
});

export default router; 