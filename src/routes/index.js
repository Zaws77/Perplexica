"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const images_1 = __importDefault(require("./images"));
const videos_1 = __importDefault(require("./videos"));
const config_1 = __importDefault(require("./config"));
const models_1 = __importDefault(require("./models"));
const suggestions_1 = __importDefault(require("./suggestions"));
const chats_1 = __importDefault(require("./chats"));
const search_1 = __importDefault(require("./search"));
const discover_1 = __importDefault(require("./discover"));
const uploads_1 = __importDefault(require("./uploads"));
const router = express_1.default.Router();
router.use("/images", images_1.default);
router.use("/videos", videos_1.default);
router.use("/config", config_1.default);
router.use("/models", models_1.default);
router.use("/suggestions", suggestions_1.default);
router.use("/chats", chats_1.default);
router.use("/search", search_1.default);
router.use("/discover", discover_1.default);
router.use("/uploads", uploads_1.default);
// Log para debug
console.log("📌 Rotas registradas no index.ts:", router.stack.map((r) => (r.route ? r.route.path : r.regexp)).filter(Boolean));
exports.default = router;
