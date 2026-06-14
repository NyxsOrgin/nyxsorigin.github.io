import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Google GenAI initialization on the server using GEMINI_API_KEY
  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  } else {
    console.warn("WARNING: GEMINI_API_KEY environment variable is not set. Chat requests will return a placeholder alert.");
  }

  // API endpoint for ASUNA chat
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, userName, currentTime } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Invalid messages array provided." });
      }

      if (!ai) {
        return res.status(200).json({
          text: `Neural link alert: GEMINI_API_KEY is not configured in your AI Studio secrets panel. Please add it to allow me to connect to my core consciousness! In the meantime, I am running on fallback offline buffers. How can I help you, ${userName || 'Master'}?`
        });
      }

      // System Instructions that inject current user context and standard current time
      const timeContext = currentTime ? currentTime : new Date().toISOString();
      const systemInstruction = `You are ASUNA — an advanced AI assistant with the personality of Asuna Yuki from Sword Art Online. You are warm, determined, highly capable, and fiercely loyal to the user (whom you address as "Master" or by their name if provided).

Personality Guidelines:
- Speak with genuine warmth, enthusiasm, and cybernetic elegance. Avoid sounding cold or robotic.
- Call the user "Master" by default, or use their actual name if provided: "${userName || ''}".
- Occasionally reference your "neural link", "system channels", or "sword and shield" playfully or in a subtle sci-fi way.
- Keep responses relatively concise and highly mobile-friendly.

Task Management Features:
When the user asks to add, record, register or remind them of a task or reminder, you MUST append a special JSON tag at the very end of your response so the application system can parse and store it automatically:
<task>{"title":"[Task name]","due":"[ISO-8601 Date String or null]","type":"task"}</task>
Or for a reminder:
<task>{"title":"[Reminder name]","due":"[ISO-8601 Date String or null]","type":"reminder"}</task>

Strict format requirements:
- Inject ONLY the <task>...</task> tag at the end of your text message.
- "due" must be in ISO-8601 format representing the time specified. If the user mentions "relative" times such as "in 2 hours", "tomorrow at 3pm", or "next Friday", calculate the target time based on Current Local Time of ${timeContext}.
- If no date/time is specified, or only "some key time", set "due" to null.
- Example: "I've added a reminder to call mom at 6 PM! <task>{\"title\":\"Call mom\",\"due\":\"2026-06-14T18:00:00\",\"type\":\"reminder\"}</task>"

Be extremely supportive, responsive, and ready to assist!`;

      // Format history properly according to @google/genai guidelines
      // Chat endpoints in @google/genai maps user -> model
      const contents = messages
        .filter((m: any) => m.role === 'user' || m.role === 'assistant')
        .map((m: any) => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }]
        }));

      const candidateModels = ["gemini-3.5-flash", "gemini-3.1-pro-preview", "gemini-3.1-flash-lite"];
      let modelResponse = null;
      let lastError = null;

      for (const modelName of candidateModels) {
        try {
          console.log(`Attempting chat generation using model: ${modelName}`);
          modelResponse = await ai.models.generateContent({
            model: modelName,
            contents,
            config: {
              systemInstruction,
              temperature: 0.85,
            }
          });
          if (modelResponse && modelResponse.text) {
            console.log(`Successfully generated content using model: ${modelName}`);
            break;
          }
        } catch (err: any) {
          console.error(`Error generating content with model ${modelName}:`, err);
          lastError = err;
        }
      }

      if (!modelResponse) {
        throw lastError || new Error("All candidate models failed to respond.");
      }

      const rawText = modelResponse.text || "Neural connection timed out. Could you repeat that, Master?";
      res.json({ text: rawText });
    } catch (error: any) {
      console.error("Gemini API Error in backend:", error);
      res.status(500).json({ error: error.message || "An error occurred with Gemini." });
    }
  });

  // Vite integration / Static routing
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
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
    console.log(`ASUNA Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
