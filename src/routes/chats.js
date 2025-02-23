"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const logger_1 = __importDefault(require("../utils/logger"));
const index_1 = __importDefault(require("../db/index"));
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../db/schema");
const router = express_1.default.Router();
router.get('/', async (_, res) => {
    try {
        let chats = await index_1.default.query.chats.findMany();
        chats = chats.reverse();
        return res.status(200).json({ chats: chats });
    }
    catch (err) {
        res.status(500).json({ message: 'An error has occurred.' });
        logger_1.default.error(`Error in getting chats: ${err.message}`);
    }
});
router.get('/:id', async (req, res) => {
    try {
        const chatExists = await index_1.default.query.chats.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.chats.id, req.params.id),
        });
        if (!chatExists) {
            return res.status(404).json({ message: 'Chat not found' });
        }
        const chatMessages = await index_1.default.query.messages.findMany({
            where: (0, drizzle_orm_1.eq)(schema_1.messages.chatId, req.params.id),
        });
        return res.status(200).json({ chat: chatExists, messages: chatMessages });
    }
    catch (err) {
        res.status(500).json({ message: 'An error has occurred.' });
        logger_1.default.error(`Error in getting chat: ${err.message}`);
    }
});
router.delete(`/:id`, async (req, res) => {
    try {
        const chatExists = await index_1.default.query.chats.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.chats.id, req.params.id),
        });
        if (!chatExists) {
            return res.status(404).json({ message: 'Chat not found' });
        }
        await index_1.default.delete(schema_1.chats).where((0, drizzle_orm_1.eq)(schema_1.chats.id, req.params.id)).execute();
        await index_1.default
            .delete(schema_1.messages)
            .where((0, drizzle_orm_1.eq)(schema_1.messages.chatId, req.params.id))
            .execute();
        return res.status(200).json({ message: 'Chat deleted successfully' });
    }
    catch (err) {
        res.status(500).json({ message: 'An error has occurred.' });
        logger_1.default.error(`Error in deleting chat: ${err.message}`);
    }
});
exports.default = router;
