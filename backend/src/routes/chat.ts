import { Router } from 'express';
import { chatWithCharacter } from '../chatService';
import { pool } from '../db';

const router = Router();

router.post('/', async (req, res) => {
  const { characterId, message, personaId } = req.body;
  try {
    let finalPersonaId = personaId;
    
    // personaId가 없으면 기본 persona 사용 (임시로 user_id = 1)
    if (!finalPersonaId) {
      const [personaRows] = await pool.execute(
        'SELECT id FROM personas WHERE user_id = ? AND is_default = TRUE LIMIT 1',
        [1] // 임시로 user_id = 1 사용
      );
      
      if ((personaRows as any[]).length === 0) {
        // 기본 persona가 없으면 에러 반환
        return res.status(400).json({ 
          error: 'No personas found. Please create a persona first.',
          code: 'NO_PERSONA'
        });
      } else {
        finalPersonaId = (personaRows as any[])[0].id;
      }
    }
    
    const result = await chatWithCharacter(Number(characterId), Number(finalPersonaId), message);
    res.json(result);
  } catch (e) {
    console.error('Chat route error:', e);
    res.status(400).json({ error: String(e) });
  }
});

export default router; 