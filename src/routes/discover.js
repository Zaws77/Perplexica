"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const searxng_1 = require("../lib/searxng");
const logger_1 = __importDefault(require("../utils/logger"));
const router = express_1.default.Router();

// Adicionando um endpoint de teste para a rota
router.get("/", (req, res) => {
    res.status(200).json({ message: "Rota de descoberta funcionando!" });
});

router.get('/', async (req, res) => {
    try {
        const data = (await Promise.all([
            (0, searxng_1.searchSearxng)('site:businessinsider.com AI', {
                engines: ['bing news'],
                pageno: 1,
            }),
            (0, searxng_1.searchSearxng)('site:www.exchangewire.com AI', {
                engines: ['bing news'],
                pageno: 1,
            }),
            (0, searxng_1.searchSearxng)('site:yahoo.com AI', {
                engines: ['bing news'],
                pageno: 1,
            }),
            (0, searxng_1.searchSearxng)('site:businessinsider.com tech', {
                engines: ['bing news'],
                pageno: 1,
            }),
            (0, searxng_1.searchSearxng)('site:www.exchangewire.com tech', {
                engines: ['bing news'],
                pageno: 1,
            }),
            (0, searxng_1.searchSearxng)('site:yahoo.com tech', {
                engines: ['bing news'],
                pageno: 1,
            }),
        ]))
            .map((result) => result.results)
            .flat()
            .sort(() => Math.random() - 0.5);
        return res.json({ blogs: data });
    }
    catch (err) {
        logger_1.default.error(`Error in discover route: ${err.message}`);
        return res.status(500).json({ message: 'An error has occurred' });
    }
});
exports.default = router;
