import { GoogleGenAI, Type } from "@google/genai";
import { SentenceCapResponse } from "../types";

// Helper to convert File to Base64
const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const SYSTEM_INSTRUCTION = `You are SeWdCap AI, an intelligent visual translator and language learning assistant.

Your task:
1. **Analyze the Image**:
   - If the image contains legible text, extract it accurately.
   - If the image contains NO text, provide a concise, descriptive caption of the scene.

2. **Translate**:
   - Translate the detected content between English and Chinese (Simplified), or to English if the source is neither.

3. **Generate Word Cards (Stickers)**:
   - Identify 2-4 key vocabulary words or idioms from the content.
   - For each word, provide:
     - Part of speech.
     - Phonetic transcription (IPA for English, Pinyin for Chinese).
     - A simple definition.
     - A native example sentence using that word.
     - The translation of that example sentence.

4. **Extract Metadata**:
   - Source/Target language.
   - 3-5 keywords.
   - Sentiment.

Output must be valid JSON only.`;

export const analyzeContent = async (
  input: string | File
): Promise<SentenceCapResponse> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const model = "gemini-3-flash-preview";

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      detected_text: { type: Type.STRING },
      translated_text: { type: Type.STRING },
      source_language: { type: Type.STRING },
      target_language: { type: Type.STRING },
      keywords: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      },
      sentiment: { type: Type.STRING },
      vocabulary_cards: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            word: { type: Type.STRING },
            part_of_speech: { type: Type.STRING },
            phonetic: { type: Type.STRING },
            definition: { type: Type.STRING },
            example_original: { type: Type.STRING },
            example_translated: { type: Type.STRING },
          },
          required: ["word", "part_of_speech", "phonetic", "definition", "example_original", "example_translated"]
        }
      }
    },
    required: [
      "detected_text", 
      "translated_text", 
      "source_language", 
      "target_language", 
      "keywords",
      "sentiment",
      "vocabulary_cards"
    ],
  };

  let contents;

  if (input instanceof File) {
    const imagePart = await fileToGenerativePart(input);
    contents = {
      parts: [
        imagePart,
        { text: "Extract text, translate, and create vocabulary cards." },
      ],
    };
  } else if (typeof input === 'string' && input.startsWith('data:image')) {
    const base64Data = input.split(',')[1];
    const mimeType = input.substring(input.indexOf(':') + 1, input.indexOf(';'));
    contents = {
      parts: [
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType
          }
        },
        { text: "Extract text, translate, and create vocabulary cards." },
      ],
    };
  } else {
    throw new Error("Invalid input type. Only images are supported.");
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response text received from Gemini.");
    }

    return JSON.parse(text) as SentenceCapResponse;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};