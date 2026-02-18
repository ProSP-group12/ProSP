// backend/server.js
// Simple Express server that accepts an image file (or base64) and returns
// object labels using Google Cloud Vision (label detection).

const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fetch = require('node-fetch');
const dotenv = require('dotenv');

// load .env into process.env
dotenv.config();

const app = express();
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fieldSize: 50 * 1024 * 1024 } // 允许 50MB 的字段大小
});

// small dictionary for translations
const DICTIONARY = {
  cat: { finnish: 'kissa', chinese: '猫' },
  dog: { finnish: 'koira', chinese: '狗' },
  person: { finnish: 'henkilö', chinese: '人' },
  keyboard: { finnish: 'näppäimistö', chinese: '键盘' },
  mouse: { finnish: 'hiiri', chinese: '鼠标' },
  bottle: { finnish: 'pullo', chinese: '瓶子' },
  phone: { finnish: 'puhelin', chinese: '手机' },
  laptop: { finnish: 'kannettava', chinese: '笔记本' },
  cup: { finnish: 'kuppi', chinese: '杯子' },
  book: { finnish: 'kirja', chinese: '书' },
};

const getMockResult = () => {
  // return three fixed objects for testing
  const sample = ['dog', 'animal', 'pet'];
  return sample.map(label => ({
    label,
    finnish: DICTIONARY[label]?.finnish || '',
    chinese: DICTIONARY[label]?.chinese || '',
    confidence: Math.random() * 0.5 + 0.5, // 0.5~1.0
  }));
};

// cross‑origin so the phone can call
app.use(cors());

// handle size limit if needed (default memory limit 1MB per field)
app.post('/recognize', upload.single('image'), async (req, res) => {
  console.log('[POST /recognize] Request received');
  try {
    let base64Data;

    if (req.file && req.file.buffer) {
      console.log('[recognze] Got file from multer, size:', req.file.size);
      base64Data = req.file.buffer.toString('base64');
    } else if (req.body && req.body.base64) {
      console.log('[recognize] Got base64 from form field');
      base64Data = req.body.base64;
    }

    if (!base64Data) {
      console.log('[recognize] No base64 data, returning empty');
      return res.status(400).json({ objects: [] });
    }

    console.log('[recognize] base64 length:', base64Data.length);

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      console.log('[recognize] MOCK MODE: GOOGLE_API_KEY not configured, returning fake objects');
      const objects = getMockResult();
      console.log('[recognize] Returning objects:', objects);
      return res.json({ objects });
    }

    let objects = [];

    // call Google Cloud Vision label detection
    const visionUrl = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;
    const payload = {
      requests: [
        {
          image: { content: base64Data },
          features: [{ type: 'LABEL_DETECTION', maxResults: 5 }],
        },
      ],
    };

    const resp = await fetch(visionUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      console.warn('Vision API error status', resp.status);
    } else {
      const json = await resp.json();
      const labels = json.responses?.[0]?.labelAnnotations || [];
      objects = labels.slice(0, 5).map(l => {
        const name = (l.description || '').toLowerCase();
        const conf = typeof l.score === 'number' ? l.score : 0;
        return {
          label: name,
          finnish: DICTIONARY[name]?.finnish || '',
          chinese: DICTIONARY[name]?.chinese || '',
          confidence: conf,
        };
      });
    }

    if (!objects || objects.length === 0) {
      objects = getMockResult();
    }

    return res.json({ objects });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ objects: [] });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Backend server listening on port ${port}`);
});
