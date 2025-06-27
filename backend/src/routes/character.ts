import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/characters
router.get('/', async (req, res) => {
  try {
    const list = await prisma.character.findMany();
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch characters' });
  }
});

// POST /api/characters
router.post('/', async (req, res) => {
  try {
    const { name, description, mbti, nsfw } = req.body;
    if (!name) return res.status(400).json({ error: 'name required' });
    const char = await prisma.character.create({ 
      data: { name, description, mbti, nsfw }
    });
    res.json(char);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create character' });
  }
});

// PUT /api/characters/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const char = await prisma.character.update({ 
      where: { id: parseInt(id) }, 
      data: req.body 
    });
    res.json(char);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update character' });
  }
});

// DELETE /api/characters/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.character.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ deleted: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete character' });
  }
});

export default router; 