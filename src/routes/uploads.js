"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const logger_1 = __importDefault(require("../utils/logger"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const fs_1 = __importDefault(require("fs"));
const providers_1 = require("../lib/providers");
const pdf_1 = require("@langchain/community/document_loaders/fs/pdf");
const docx_1 = require("@langchain/community/document_loaders/fs/docx");
const textsplitters_1 = require("@langchain/textsplitters");
const document_1 = require("langchain/document");

const router = express_1.default.Router();
const splitter = new textsplitters_1.RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 100,
});

const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path_1.default.join(process.cwd(), './uploads'));
    },
    filename: (req, file, cb) => {
        const splitedFileName = file.originalname.split('.');
        const fileExtension = splitedFileName[splitedFileName.length - 1];

        if (!['pdf', 'docx', 'txt'].includes(fileExtension)) {
            return cb(new Error('File type is not supported'), '');
        }

        cb(null, `${crypto_1.default.randomBytes(16).toString('hex')}.${fileExtension}`);
    },
});

const upload = (0, multer_1.default)({ storage });

router.post('/', upload.fields([
    { name: 'files' },
    { name: 'embedding_model', maxCount: 1 },
    { name: 'embedding_model_provider', maxCount: 1 },
]), async (req, res) => {
    try {
        const { embedding_model, embedding_model_provider } = req.body;

        if (!embedding_model || !embedding_model_provider) {
            return res.status(400).json({ message: 'Missing embedding model or provider' });
        }

        const embeddingModels = await (0, providers_1.getAvailableEmbeddingModelProviders)();
        const provider = embedding_model_provider ?? Object.keys(embeddingModels)[0];
        const embeddingModel = embedding_model ?? Object.keys(embeddingModels[provider])[0];

        let embeddingsModel;
        if (embeddingModels[provider] && embeddingModels[provider][embeddingModel]) {
            embeddingsModel = embeddingModels[provider][embeddingModel].model;
        }

        if (!embeddingsModel) {
            return res.status(400).json({ message: 'Invalid LLM model selected' });
        }

        const files = req.files['files'];
        if (!files || files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        await Promise.all(files.map(async (file) => {
            let docs = [];
            if (file.mimetype === 'application/pdf') {
                const loader = new pdf_1.PDFLoader(file.path);
                docs = await loader.load();
            } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                const loader = new docx_1.DocxLoader(file.path);
                docs = await loader.load();
            } else if (file.mimetype === 'text/plain') {
                const text = fs_1.default.readFileSync(file.path, 'utf-8');
                docs = [new document_1.Document({ pageContent: text, metadata: { title: file.originalname } })];
            }

            const splitted = await splitter.splitDocuments(docs);
            const json = JSON.stringify({
                title: file.originalname,
                contents: splitted.map((doc) => doc.pageContent),
            });

            const pathToSave = file.path.replace(/\.\w+$/, '-extracted.json');
            fs_1.default.writeFileSync(pathToSave, json);

            const embeddings = await embeddingsModel.embedDocuments(splitted.map((doc) => doc.pageContent));
            const embeddingsJSON = JSON.stringify({
                title: file.originalname,
                embeddings: embeddings,
            });

            const pathToSaveEmbeddings = file.path.replace(/\.\w+$/, '-embeddings.json');
            fs_1.default.writeFileSync(pathToSaveEmbeddings, embeddingsJSON);
        }));

        res.status(200).json({
            files: files.map((file) => ({
                fileName: file.originalname,
                fileExtension: file.filename.split('.').pop(),
                fileId: file.filename.replace(/\.\w+$/, ''),
            })),
        });
    } catch (err) {
        logger_1.default.error(`Error in uploading file results: ${err.message}`);
        res.status(500).json({ message: 'An error has occurred.' });
    }
});

// ✅ Adicionando suporte ao método GET
router.get("/", (req, res) => {
    res.status(200).json({ message: "Rota de uploads funcionando!" });
});

exports.default = router;
