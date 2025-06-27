import { openai } from './openai';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function chatWithCharacter(characterId: number, userMsg: string) {
  const character = await prisma.character.findUnique({ where: { id: characterId } });
  if (!character) throw 'character not found';

  // 이전 10개 메시지 가져오기
  const history = await prisma.message.findMany({
    where: { characterId }, 
    orderBy: { id: 'asc' }, 
    take: 10
  });
  
  const messages = [
    { role: 'system', content: `You are ${character.name}. ${character.description}` },
    ...history.map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: userMsg }
  ];
  
  const resp = await openai.chat.completions.create({ 
    model: 'gpt-3.5-turbo', 
    messages 
  });
  
  const reply = resp.choices[0].message?.content ?? '...';

  // 저장
  await prisma.$transaction([
    prisma.message.create({ data: { characterId, role: 'user', content: userMsg } }),
    prisma.message.create({ data: { characterId, role: 'assistant', content: reply } })
  ]);
  
  return reply;
} 