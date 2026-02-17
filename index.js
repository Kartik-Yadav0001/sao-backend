import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("SAO Backend Running 🚀");
});

app.get("/message", async (req, res) => {
  try {
    const input = req.query.input;

    if (!input) {
      return res.status(400).json({ error: "No input provided" });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text:
                    input +
                    "\n\nIMPORTANT: Return ONLY the correct option letter (A, B, C, or D). No explanation."
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 10
          }
        })
      }
    );

    const data = await response.json();

    console.log("==== GEMINI RAW RESPONSE ====");
    console.log(JSON.stringify(data, null, 2));

    let answer = "";

    // Safe extraction (handles multiple structures)
    if (data?.candidates?.length > 0) {
      const parts = data.candidates[0]?.content?.parts;
      if (parts && parts.length > 0) {
        answer = parts.map(p => p.text || "").join(" ").trim();
      }
    }

    if (!answer) {
      return res.json({ message: "ERROR_CHECK_LOGS" });
    }

    // Extract only A/B/C/D
    const match = answer.match(/[A-D]/i);
    const finalAnswer = match ? match[0].toUpperCase() : answer;

    res.json({ message: finalAnswer });

  } catch (error) {
    console.error("SERVER ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
