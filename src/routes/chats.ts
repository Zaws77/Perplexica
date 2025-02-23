import express from 'express';
import logger from '../utils/logger';
import db from '../db/index';
import { eq } from 'drizzle-orm';
import { chats, messages } from '../db/schema';
import { randomUUID } from 'crypto';

const router = express.Router();

router.get('/', async (_, res) => {
  try {
    let chatList = await db.query.chats.findMany();
    chatList = chatList.reverse();
    return res.status(200).json({ chats: chatList });
  } catch (err) {
    logger.error(`Erro ao obter chats: ${err.message}`);
    return res.status(500).json({ message: 'Ocorreu um erro ao buscar os chats.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const chatExists = await db.query.chats.findFirst({
      where: eq(chats.id, req.params.id),
    });

    if (!chatExists) {
      return res.status(404).json({ message: 'Chat não encontrado' });
    }

    const chatMessages = await db.query.messages.findMany({
      where: eq(messages.chatId, req.params.id),
    });

    return res.status(200).json({ chat: chatExists, messages: chatMessages });
  } catch (err) {
    logger.error(`Erro ao obter o chat: ${err.message}`);
    return res.status(500).json({ message: 'Ocorreu um erro ao buscar o chat.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'O campo title é obrigatório.' });
    }

    const newChat = await db.insert(chats).values({
      id: randomUUID(),
      title,
      createdAt: new Date().toISOString(),
      focusMode: 'default',
      files: [], // CORRIGIDO: agora passa um array vazio corretamente
    }).returning();

    return res.status(201).json({ chat: newChat });
  } catch (err) {
    logger.error(`Erro ao criar um novo chat: ${err.message}`);
    return res.status(500).json({ message: 'Ocorreu um erro ao criar o chat.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const chatExists = await db.query.chats.findFirst({
      where: eq(chats.id, req.params.id),
    });

    if (!chatExists) {
      return res.status(404).json({ message: 'Chat não encontrado' });
    }

    await db.delete(chats).where(eq(chats.id, req.params.id)).execute();
    await db.delete(messages).where(eq(messages.chatId, req.params.id)).execute();

    return res.status(200).json({ message: 'Chat excluído com sucesso' });
  } catch (err) {
    logger.error(`Erro ao excluir chat: ${err.message}`);
    return res.status(500).json({ message: 'Ocorreu um erro ao excluir o chat.' });
  }
});

export default router;
