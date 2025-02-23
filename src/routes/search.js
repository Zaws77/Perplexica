"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const logger_1 = __importDefault(require("../utils/logger"));
const openai_1 = require("@langchain/openai");
const providers_1 = require("../lib/providers");
const messageHandler_1 = require("../websocket/messageHandler");
const messages_1 = require("@langchain/core/messages");
const config_1 = require("../config");

const router = express_1.default.Router();

// ✅ Adicionando suporte ao método GET
router.get("/", (req, res) => {
    res.status(200).json({ message: "Rota de busca funcionando!" });
});

router.post('/', async (req, res) => {
    try {
        const body = req.body;
        if (!body.focusMode || !body.query) {
            return res.status(400).json({ message: 'Missing focus mode or query' });
        }
        body.history = body.history || [];
        body.optimizationMode = body.optimizationMode || 'balanced';
        const history = body.history.map((msg) => {
            if (msg[0] === 'human') {
                return new messages_1.HumanMessage({
                    content: msg[1],
                });
            }
            else {
                return new messages_1.AIMessage({
                    content: msg[1],
                });
            }
        });

        const [chatModelProviders, embeddingModelProviders] = await Promise.all([
            (0, providers_1.getAvailableChatModelProviders)(),
            (0, providers_1.getAvailableEmbeddingModelProviders)(),
        ]);

        const chatModelProvider = body.chatModel?.provider || Object.keys(chatModelProviders)[0];
        const chatModel = body.chatModel?.model ||
            Object.keys(chatModelProviders[chatModelProvider])[0];
        const embeddingModelProvider = body.embeddingModel?.provider || Object.keys(embeddingModelProviders)[0];
        const embeddingModel = body.embeddingModel?.model ||
            Object.keys(embeddingModelProviders[embeddingModelProvider])[0];

        let llm;
        let embeddings;

        if (body.chatModel?.provider === 'custom_openai') {
            llm = new openai_1.ChatOpenAI({
                modelName: body.chatModel?.model || (0, config_1.getCustomOpenaiModelName)(),
                openAIApiKey: body.chatModel?.customOpenAIKey || (0, config_1.getCustomOpenaiApiKey)(),
                temperature: 0.7,
                configuration: {
                    baseURL: body.chatModel?.customOpenAIBaseURL || (0, config_1.getCustomOpenaiApiUrl)(),
                },
            });
        }
        else if (chatModelProviders[chatModelProvider] &&
            chatModelProviders[chatModelProvider][chatModel]) {
            llm = chatModelProviders[chatModelProvider][chatModel].model;
        }

        if (embeddingModelProviders[embeddingModelProvider] &&
            embeddingModelProviders[embeddingModelProvider][embeddingModel]) {
            embeddings = embeddingModelProviders[embeddingModelProvider][embeddingModel].model;
        }

        if (!llm || !embeddings) {
            return res.status(400).json({ message: 'Invalid model selected' });
        }

        const searchHandler = messageHandler_1.searchHandlers[body.focusMode];
        if (!searchHandler) {
            return res.status(400).json({ message: 'Invalid focus mode' });
        }

        const emitter = await searchHandler.searchAndAnswer(body.query, history, llm, embeddings, body.optimizationMode, []);
        let message = '';
        let sources = [];

        emitter.on('data', (data) => {
            const parsedData = JSON.parse(data);
            if (parsedData.type === 'response') {
                message += parsedData.data;
            }
            else if (parsedData.type === 'sources') {
                sources = parsedData.data;
            }
        });

        emitter.on('end', () => {
            res.status(200).json({ message, sources });
        });

        emitter.on('error', (data) => {
            const parsedData = JSON.parse(data);
            res.status(500).json({ message: parsedData.data });
        });

    } catch (err) {
        logger_1.default.error(`Error in getting search results: ${err.message}`);
        res.status(500).json({ message: 'An error has occurred.' });
    }
});

exports.default = router;
