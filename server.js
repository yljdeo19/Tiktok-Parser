// server.js
import express from "express";
import next from "next";
import cors from "cors";
import dotenv from "dotenv";
import { routerAPI } from "./backend/api.js";

dotenv.config();

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await app.prepare();

    const server = express();
    server.use(cors());
    server.use(express.json());


    server.use("/api", routerAPI);

    server.all("*", (req, res) => {
      return handle(req, res);
    });

    server.listen(PORT, (err) => {
      if (err) throw err;
      console.log(`🚀 Server ready on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Error starting server:", err);
    process.exit(1);
  }
}

start();
