import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("SAO Groq 3-Model Backend Running 🚀");
});

app.get("/message", async (req, res) => {
  try {
    const input = req.query.input;

    if (!input) {
      return res.status(400).json({ error: "No input provided" });
    }

    async function askGroq(modelName, systemPrompt) {
      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
          },
          body: JSON.stringify({
            model: modelName,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: input }
            ],
            temperature: 0,
            max_tokens: 5
          })
        }
      );

      const data = await response.json();

      let answer =
        data?.choices?.[0]?.message?.content?.trim() || "";

      const match = answer.match(/[A-D]/i);
      return match ? match[0].toUpperCase() : "";
    }

    const systemPrompt = `
You are an expert competitive exam solver.
Think carefully and analyze all options.
Return ONLY one uppercase letter: A, B, C, or D.
Do NOT explain.
`;

    // 3 different models
    const answer1 = await askGroq("llama-3.3-70b-versatile", systemPrompt);
    const answer2 = await askGroq("mixtral-8x7b-32768", systemPrompt);
    const answer3 = await askGroq("llama-3.3-70b-versatile", 
      systemPrompt + "\nDouble-check your reasoning before answering.");

    console.log("MODEL1:", answer1);
    console.log("MODEL2:", answer2);
    console.log("MODEL3:", answer3);

    const votes = [answer1, answer2, answer3].filter(a => a);

    const frequency = {};
    votes.forEach(v => {
      frequency[v] = (frequency[v] || 0) + 1;
    });

    let finalAnswer = "No answer";
    let maxVotes = 0;

    for (const option in frequency) {
      if (frequency[option] > maxVotes) {
        maxVotes = frequency[option];
        finalAnswer = option;
      }
    }

    // If tie or disagreement fallback
    if (maxVotes === 1) {
      finalAnswer = answer1 || answer2 || answer3 || "No answer";
    }

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