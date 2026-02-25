import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("SAO OpenAI Backend Running 🚀");
});

app.get("/message", async (req, res) => {
  try {
    const input = req.query.input;

    if (!input) {
      return res.status(400).json({ error: "No input provided" });
    }

    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini", 
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
          temperature: 0.1,
          max_tokens: 5
        })
      }
    );

    const data = await response.json();

    console.log("OPENAI RESPONSE:", JSON.stringify(data, null, 2));

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    let answer =
      data?.choices?.[0]?.message?.content?.trim() || "";

    if (!answer) {
      return res.json({ message: "No answer from model" });
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
