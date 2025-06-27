import { Router } from 'express';
import { chatWithCharacter } from '../chatService';

const router = Router();

router.post('/', async (req, res) => {
  const { characterId, message } = req.body;
  try {
    const reply = await chatWithCharacter(Number(characterId), message);
    res.json({ reply });
  } catch (e) {
    res.status(400).json({ error: String(e) });
  }
});

export default router; 