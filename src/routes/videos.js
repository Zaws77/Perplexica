"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const providers_1 = require("../lib/providers");
const messages_1 = require("@langchain/core/messages");
const logger_1 = __importDefault(require("../utils/logger"));
const videoSearchAgent_1 = __importDefault(require("../chains/videoSearchAgent"));
const openai_1 = require("@langchain/openai");
const config_1 = require("../config");
const router = express_1.default.Router();

router.post('/', async (req, res) => {
    try {
        let body = req.body;
        const chatHistory = body.chatHistory.map((msg) => {
            if (msg.role === 'user') {
                return new messages_1.HumanMessage(msg.content);
            }
            else if (msg.role === 'assistant') {
                return new messages_1.AIMessage(msg.content);
            }
        });
        const chatModelProviders = await (0, providers_1.getAvailableChatModelProviders)();
        const chatModelProvider = body.chatModel?.provider || Object.keys(chatModelProviders)[0];
        const chatModel = body.chatModel?.model ||
            Object.keys(chatModelProviders[chatModelProvider])[0];
        let llm;
        if (body.chatModel?.provider === 'custom_openai') {
            llm = new openai_1.ChatOpenAI({
                modelName: (0, config_1.getCustomOpenaiModelName)(),
                openAIApiKey: (0, config_1.getCustomOpenaiApiKey)(),
                temperature: 0.7,
                configuration: {
                    baseURL: (0, config_1.getCustomOpenaiApiUrl)(),
                },
            });
        }
        else if (chatModelProviders[chatModelProvider] &&
            chatModelProviders[chatModelProvider][chatModel]) {
            llm = chatModelProviders[chatModelProvider][chatModel]
                .model;
        }
        if (!llm) {
            return res.status(400).json({ message: 'Invalid model selected' });
        }
        const videos = await (0, videoSearchAgent_1.default)({ chat_history: chatHistory, query: body.query }, llm);
        res.status(200).json({ videos });
    }
    catch (err) {
        res.status(500).json({ message: 'An error has occurred.' });
        logger_1.default.error(`Error in video search: ${err.message}`);
    }
});

// ✅ Adicionando suporte ao método GET
router.get("/", (req, res) => {
    res.status(200).json({ message: "Rota de vídeos funcionando!" });
});

exports.default = router;
