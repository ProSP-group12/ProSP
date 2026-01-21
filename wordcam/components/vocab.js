const OBJECTS = [
  { label: 'bottle', zh: '瓶子', words: ['bottle', 'cap', 'label', 'container'] },
  { label: 'book', zh: '书', words: ['book', 'page', 'cover', 'title'] },
  { label: 'laptop', zh: '笔记本电脑', words: ['laptop', 'keyboard', 'screen', 'charger'] },
  { label: 'chair', zh: '椅子', words: ['chair', 'seat', 'backrest', 'leg'] },
  { label: 'apple', zh: '苹果', words: ['apple', 'fruit', 'stem', 'peel'] },
  { label: 'cup', zh: '杯子', words: ['cup', 'handle', 'sip', 'mug'] }
];

const WORD_ZH = {
  bottle: '瓶子',
  cap: '瓶盖',
  label: '标签',
  container: '容器',
  book: '书',
  page: '页',
  cover: '封面',
  title: '标题',
  laptop: '笔记本电脑',
  keyboard: '键盘',
  screen: '屏幕',
  charger: '充电器',
  chair: '椅子',
  seat: '座位',
  backrest: '靠背',
  leg: '椅腿',
  apple: '苹果',
  fruit: '水果',
  stem: '果梗',
  peel: '果皮',
  cup: '杯子',
  handle: '把手',
  sip: '小口啜饮',
  mug: '马克杯'
};

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function simulateDetection() {
  const obj = pickRandom(OBJECTS);
  return {
    label: obj.label,
    zh: obj.zh
  };
}

export function generateVocabularyForObject(label, imageUri) {
  const obj = OBJECTS.find((o) => o.label === label) ?? pickRandom(OBJECTS);
  const now = Date.now();
  return obj.words.map((w, idx) => ({
    id: `${now}-${label}-${idx}-${w}`,
    word: w,
    zh: WORD_ZH[w] ?? '',
    source: obj.label,
    createdAt: now,
    // Optional image to show as a sticker/thumbnail
    image: imageUri || null
  }));
}

