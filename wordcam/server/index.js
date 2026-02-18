const express = require("express");
const cors = require("cors");
const https = require("https");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

function httpsPost(url, body) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const data = JSON.stringify(body);
    const req = https.request(
      {
        hostname: u.hostname,
        path: u.pathname + u.search,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(data),
        },
      },
      (res) => {
        let chunks = "";
        res.on("data", (c) => (chunks += c));
        res.on("end", () => {
          if (res.statusCode >= 400) {
            reject(new Error(`Gemini error: ${res.statusCode} ${chunks}`));
          } else {
            try {
              resolve(JSON.parse(chunks));
            } catch (e) {
              reject(e);
            }
          }
        });
      }
    );
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

async function callGemini(imageBase64) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY not set");

  const prompt = `You are an image-quality and vocabulary assistant. Evaluate whether the photo is a good usable photo for an educational vocabulary app. Consider blur, framing, lighting, and whether the object is clearly visible. If the photo is good, extract ONLY the main object in the photo as a single vocabulary word. Reply ONLY with: {"good": true, "vocab": [{"word": "apple"}]}. If the photo is not good, reply with: {"good": false, "vocab": []}. Reply ONLY with a single JSON object in this format.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-latest:generateContent?key=${key}`;
  const body = {
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: "image/jpeg",
              data: imageBase64,
            },
          },
        ],
      },
    ],
  };

  const json = await httpsPost(url, body);
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("No response from Gemini");

  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Gemini response did not include JSON");

  const parsed = JSON.parse(match[0]);
  // Ensure vocab is always an array, and only one vocab item is returned
  let vocab = Array.isArray(parsed.vocab) ? parsed.vocab : [];
  if (vocab.length > 1) vocab = [vocab[0]];
  if (vocab[0]) {
    const word = vocab[0].word;
    // Removed Chinese language support
    if (/^[\u4e00-\u9fa5]+$/.test(word)) {
      vocab[0] = { word };
    } else if (/^[A-Za-z]+$/.test(word)) {
      // If word is all English letters, return only the English word
      vocab[0] = { word };
    } else {
      // If mixed or unknown, just return as is
    }
  }
  return {
    good: !!parsed.good,
    vocab,
  };
}

app.post("/detect-good", async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "Missing imageBase64" });
    }

    const result = await callGemini(imageBase64);
    res.json({
      good: !!result.good,
      vocab: Array.isArray(result.vocab) ? result.vocab : [],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(4000, "0.0.0.0", () => {
  console.log("✅ Server running on http://0.0.0.0:4000");
});
