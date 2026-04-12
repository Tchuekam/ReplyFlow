import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import * as dotenv from "dotenv";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import { generateSalesResponse } from "./src/lib/ai-core.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "ReplyFlow AI Backend is running" });
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const { client_id, message, history, config } = req.body;
      
      const supabase = createClient(
        process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "", 
        process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || ""
      );
      
      // Fetch user's Knowledge Base
      const { data: kbData, error: kbError } = await supabase
        .from("knowledge_base")
        .select("*")
        .eq("client_id", client_id || "ayo-media-001");
      
      // Fetch user's Services
      const { data: servicesData, error: servicesError } = await supabase
        .from("services")
        .select("*")
        .eq("client_id", client_id || "ayo-media-001");
      
      if (kbError) console.error("Supabase KB Error:", kbError);
      if (servicesError) console.error("Supabase Services Error:", servicesError);

      // Execute Gemini logic
      const response = await generateSalesResponse(
        message, 
        history, 
        servicesData || [], 
        kbData || [], 
        config
      );
      
      res.json(response);
    } catch (error) {
      console.error("/api/chat error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        host: '0.0.0.0',
        port: 3000
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
