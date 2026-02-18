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

const SYSTEM_INSTRUCTION = `You are SeWdCap AI, an intelligent visual translator and analyzer.

Your task:
1. **Analyze the Image**:
   - If the image contains legible text (sentences, signs, paragraphs), extract it accurately.
   - If the image contains NO text, provide a concise, descriptive caption of the scene (e.g., "A golden retriever sitting on a park bench").

2. **Translate**:
   - If the detected content is in English, translate it to Chinese (Simplified).
   - If the detected content is in Chinese, translate it to English.
   - For other languages, translate to English.

3. **Extract Metadata**:
   - Identify the source language.
   - Extract 3-5 relevant keywords/tags.
   - Determine the general sentiment/tone.

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
    },
    required: [
      "detected_text", 
      "translated_text", 
      "source_language", 
      "target_language", 
      "keywords",
      "sentiment"
    ],
  };

  let contents;

  if (input instanceof File) {
    const imagePart = await fileToGenerativePart(input);
    contents = {
      parts: [
        imagePart,
        { text: "Extract text and translate it." },
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
        { text: "Extract text and translate it." },
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