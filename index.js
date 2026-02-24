import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("SAO OpenRouter Backend Running 🚀");
});

app.get("/message", async (req, res) => {
  try {
    const input = req.query.input;

    if (!input) {
      return res.status(400).json({ error: "No input provided" });
    }

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": "https://sao-backend-ync4.onrender.com",
          "X-Title": "SAO MCQ Solver"
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3.1-8b-instruct:free",
          messages: [
            {
              role: "system",
              content:
                "You are an MCQ solver. Always return ONLY the correct option letter (A, B, C, or D). Never explain."
            },
            {
              role: "user",
              content: input
            }
          ],
          temperature: 0.2,
          max_tokens: 10
        })
      }
    );

    const data = await response.json();

    console.log("OPENROUTER RESPONSE:", JSON.stringify(data, null, 2));

    let answer =
      data?.choices?.[0]?.message?.content?.trim() || "";

    if (!answer) {
      return res.json({ message: "No answer" });
    }

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
