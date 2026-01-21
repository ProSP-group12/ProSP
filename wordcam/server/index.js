const express = require('express');
const app = express();
const port = process.env.PORT || 4000;

app.use(express.json({ limit: '15mb' }));

// Simple helper to call OpenAI Responses API using the provided key.
async function callOpenAI(imageBase64) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY not set');

  // We send the base64 inline in the prompt. For production you should
  // upload the image to a short-lived URL (S3, signed URL) and pass the URL
  // to a multimodal OpenAI model instead.
  const prompt = `You are an image-quality assistant. The client will provide a base64-encoded image (data only, no mime header). Evaluate whether the photo is a good usable photo for an educational vocabulary app. Consider blur, framing, lighting, and whether the object is clearly visible. Reply ONLY with a single JSON object exactly like this: {"good": true} or {"good": false}.
IMAGE_BASE64_START\n${imageBase64}\nIMAGE_BASE64_END`;

  const res = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({ model: 'gpt-4o-mini', input: prompt }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI error: ${res.status} ${text}`);
  }

  const json = await res.json();

  // Try to extract a text response from the Responses API format.
  let text = '';
  try {
    const out = json.output?.[0]?.content?.find((c) => c.type === 'output_text');
    if (out) text = out.text || '';
    else if (typeof json.output?.[0]?.content?.[0]?.text === 'string')
      text = json.output[0].content[0].text;
    else text = JSON.stringify(json.output || json);
  } catch (e) {
    text = JSON.stringify(json);
  }

  // Try to parse JSON object from the model output.
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('OpenAI response did not include JSON');
  const parsed = JSON.parse(match[0]);
  return !!parsed.good;
}

// Endpoint used by the app's `detectGood` function.
app.post('/detect-good', async (req, res) => {
  const { image_base64 } = req.body || {};
  if (!image_base64) return res.status(400).json({ error: 'missing image_base64' });

  try {
    const good = await callOpenAI(image_base64);
    return res.json({ good });
  } catch (err) {
    console.error('detect-good error:', err?.message || err);
    return res.status(500).json({ error: err?.message || 'detection failed' });
  }
});

app.get('/', (_req, res) => res.send('wordcam detect proxy running'));

app.listen(port, () => {
  console.log(`wordcam server listening on port ${port}`);
});
