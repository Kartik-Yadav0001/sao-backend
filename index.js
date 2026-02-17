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
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: input }]
            }
          ]
        })
      }
    );

    const data = await response.json();

    const answer =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "No answer";

    res.json({ message: answer });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
