import express from "express";
import cors from "cors";
import http from "http";
import { startWebSocketServer } from "./websocket";
import { getPort } from "./config";
import logger from "./utils/logger";
import routes from "./routes"; // 🔧 Importação correta das rotas

const port = getPort();
const app = express();
const server = http.createServer(app);

const corsOptions = {
  origin: "*",
};

app.use(cors(corsOptions));
app.use(express.json());

// ✅ Registrando corretamente as rotas no caminho /api
app.use("/api", routes);

// Teste rápido para garantir que o backend responde
app.get("/api", (_, res) => {
  res.status(200).json({ status: "ok" });
});

// Exibir todas as rotas carregadas no Express
console.log(
  "📌 Rotas Express após registro:",
  app._router.stack.map((r) => (r.route ? r.route.path : r.regexp)).filter(Boolean)
);

server.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});

startWebSocketServer(server);

// Captura erros não tratados para evitar crashes
process.on("uncaughtException", (err, origin) => {
  logger.error(`Uncaught Exception at ${origin}: ${err}`);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
});
