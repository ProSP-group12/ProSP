// backend/server.js
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fetch = require('node-fetch');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fieldSize: 50 * 1024 * 1024 },
});

console.log('[STARTUP] GOOGLE_API_KEY available:', !!process.env.GOOGLE_API_KEY);
console.log('[STARTUP] PORT:', process.env.PORT || '3000');

// ===== DICTIONARY =====
const DICTIONARY = {
  cat: { finnish: 'kissa', chinese: '猫' },
  dog: { finnish: 'koira', chinese: '狗' },
  person: { finnish: 'henkilö', chinese: '人' },

  keyboard: { finnish: 'näppäimistö', chinese: '键盘' },
  mouse: { finnish: 'hiiri', chinese: '鼠标' },

  bottle: { finnish: 'pullo', chinese: '瓶子' },
  'water bottle': { finnish: 'vesipullo', chinese: '水瓶' },

  phone: { finnish: 'puhelin', chinese: '手机' },
  laptop: { finnish: 'kannettava tietokone', chinese: '笔记本电脑' },
  computer: { finnish: 'tietokone', chinese: '电脑' },

  cup: { finnish: 'kuppi', chinese: '杯子' },
  mug: { finnish: 'muki', chinese: '马克杯' },

  book: { finnish: 'kirja', chinese: '书' },

  headphones: { finnish: 'kuulokkeet', chinese: '耳机' },
  headset: { finnish: 'kuulokemikrofoni', chinese: '耳麦' },
  earbuds: { finnish: 'nappikuulokkeet', chinese: '耳塞' },

  'video game controller': { finnish: 'peliohjain', chinese: '游戏手柄' },
  controller: { finnish: 'ohjain', chinese: '控制器' },

  glasses: { finnish: 'silmälasit', chinese: '眼镜' },
  sunglasses: { finnish: 'aurinkolasit', chinese: '太阳镜' },
};

const ALIASES = {
  // phone
  'mobile phone': 'phone',
  'cell phone': 'phone',
  smartphone: 'phone',
  telephone: 'phone',

  // laptop/computer
  'laptop computer': 'laptop',
  'notebook computer': 'laptop',
  notebook: 'laptop',
  'personal computer': 'computer',
  'desktop computer': 'computer',

  'input device': 'mouse',
  'pointing device': 'mouse',
  'computer peripheral': 'mouse',
  'peripheral': 'mouse',


  // cup/mug
  drinkware: 'cup',
  tableware: 'cup',
  kitchenware: 'cup',
  'coffee cup': 'cup',

  // headphones
  earphones: 'headphones',
  'in-ear headphone': 'earbuds',
  'in-ear headphones': 'earbuds',
  'wireless headphones': 'headphones',
  'bluetooth headphones': 'headphones',

  // controller
  'game controller': 'video game controller',

  // glasses
  eyewear: 'glasses',
};

// 泛词（尽量别当 top1）
const GENERIC = new Set([
  'electronic device',
  'device',
  'technology',
  'product',
  'hardware',
  'electronics',
  'gadget',
  'communication device',
  'equipment',
  'audio',
  // 厨房/餐具类泛词
  'tableware',
  'kitchenware',
  'dishware',
  'serveware',
  'drinkware',
]);

const normalizeKey = (rawLabel) => {
  const raw = (rawLabel || '').toLowerCase().trim();
  const key = ALIASES[raw] || raw;
  return { raw, key };
};

const getMockResult = () => {
  const sample = ['headphones', 'cup', 'keyboard'];
  return sample.map((label) => ({
    label,
    finnish: DICTIONARY[label]?.finnish || '',
    chinese: DICTIONARY[label]?.chinese || '',
    confidence: Math.random() * 0.3 + 0.7,
  }));
};

app.use(cors());

app.post('/recognize', upload.single('image'), async (req, res) => {
  console.log('[POST /recognize] Request received');

  try {
    let base64Data;

    if (req.file && req.file.buffer) {
      console.log('[recognize] Got file from multer, size:', req.file.size);
      base64Data = req.file.buffer.toString('base64');
    } else if (req.body && req.body.base64) {
      console.log('[recognize] Got base64 from form field');
      base64Data = req.body.base64;
    }

    if (!base64Data) {
      return res.status(400).json({ objects: [] });
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      console.log('[recognize] MOCK MODE: GOOGLE_API_KEY not configured');
      return res.json({ objects: getMockResult() });
    }

    const visionUrl = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;

    // ✅ 一劳永逸：同时要 OBJECT_LOCALIZATION + LABEL_DETECTION
    const payload = {
      requests: [
        {
          image: { content: base64Data },
          features: [
            { type: 'OBJECT_LOCALIZATION', maxResults: 5 },
            { type: 'LABEL_DETECTION', maxResults: 10 },
          ],
        },
      ],
    };

    const resp = await fetch(visionUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      const errorText = await resp.text();
      console.warn('[Vision API] Error:', resp.status, errorText);
      return res.json({ objects: getMockResult() });
    }

    const json = await resp.json();
    const r0 = json.responses?.[0] || {};

    const localized = Array.isArray(r0.localizedObjectAnnotations)
      ? r0.localizedObjectAnnotations
      : [];
    const labels = Array.isArray(r0.labelAnnotations) ? r0.labelAnnotations : [];

    // 1) 先处理 OBJECT_LOCALIZATION（更像物体名）
    const objCandidates = localized.map((o) => {
      const { raw, key } = normalizeKey(o.name);
      const conf = typeof o.score === 'number' ? o.score : 0;

      const isGeneric = GENERIC.has(raw) || GENERIC.has(key);
      const hasTranslation = !!DICTIONARY[key] && !isGeneric; // ✅ 泛词不加翻译优势

      return {
        label: raw,
        finnish: DICTIONARY[key]?.finnish || '',
        chinese: DICTIONARY[key]?.chinese || '',
        confidence: conf,
        _source: 'object',
        _hasTranslation: hasTranslation,
        _isGeneric: isGeneric,
      };
    });

    // 2) 再处理 LABEL_DETECTION（兜底）
    const labelCandidates = labels.map((l) => {
      const { raw, key } = normalizeKey(l.description);
      const conf = typeof l.score === 'number' ? l.score : 0;

      const isGeneric = GENERIC.has(raw) || GENERIC.has(key);
      const hasTranslation = !!DICTIONARY[key] && !isGeneric;

      return {
        label: key,
        finnish: DICTIONARY[key]?.finnish || '',
        chinese: DICTIONARY[key]?.chinese || '',
        confidence: conf,
        _source: 'label',
        _hasTranslation: hasTranslation,
        _isGeneric: isGeneric,
      };
    });

    // 3) 合并 + 去重（按 label 文本去重）
    const merged = [];
    const seen = new Set();

    for (const c of [...objCandidates, ...labelCandidates]) {
      const k = c.label;
      if (!k) continue;
      if (seen.has(k)) continue;
      seen.add(k);
      merged.push(c);
    }

    // 4) rerank：物体优先 > 可翻译优先 > 非泛词优先 > 置信度
    merged.sort((a, b) => {
      if (a._source !== b._source) return a._source === 'object' ? -1 : 1;
      if (a._hasTranslation !== b._hasTranslation) return a._hasTranslation ? -1 : 1;
      if (a._isGeneric !== b._isGeneric) return a._isGeneric ? 1 : -1;
      return b.confidence - a.confidence;
    });

    const objects = merged
      .slice(0, 5)
      .map(({ _source, _hasTranslation, _isGeneric, ...rest }) => rest);

    if (!objects || objects.length === 0) {
      return res.json({ objects: getMockResult() });
    }

    return res.json({ objects });
  } catch (err) {
    console.error('[recognize] Error:', err.message);
    return res.status(500).json({ objects: [] });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Backend server listening on port ${port}`);
});
