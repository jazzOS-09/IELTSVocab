
import { GoogleGenAI, Type } from "@google/genai";
import { IELTSTopic, IELTSVocab } from "../types";

// Sử dụng import.meta.env cho Vite (Local) hoặc process.env (Sandbox)
const apiKey = (import.meta as any).env?.VITE_API_KEY || process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const fetchTopicsForBand = async (band: string): Promise<IELTSTopic[]> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Bạn là chuyên gia IELTS. Hãy gợi ý 12 chủ đề từ vựng quan trọng nhất cho người đang ở Band điểm ${band}. 
    Mỗi chủ đề cần có tên tiếng Anh, tên tiếng Việt, và giải thích tại sao nó quan trọng cho band này.
    Trả về định dạng JSON array: [{id, title, vietnameseTitle, description, commonInPart}].`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            vietnameseTitle: { type: Type.STRING },
            description: { type: Type.STRING },
            commonInPart: { type: Type.STRING },
          },
          required: ["id", "title", "vietnameseTitle", "description", "commonInPart"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("Lỗi parse JSON topics:", e);
    return [];
  }
};

export const fetchVocabForTopic = async (band: string, topic: string): Promise<IELTSVocab[]> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Bạn là giám khảo IELTS. Hãy cung cấp 20 từ vựng/cụm từ (collocations/idioms) cho chủ đề "${topic}" phù hợp cho Band ${band}. 
    Mỗi từ vựng phải bao gồm: cụm từ, từ khóa chính, phát âm, nghĩa tiếng Anh, nghĩa tiếng Việt, câu ví dụ thực tế trong bài thi IELTS, và 2-3 từ đồng nghĩa.
    Trả về định dạng JSON array.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            phrase: { type: Type.STRING },
            mainKeyword: { type: Type.STRING },
            pronunciation: { type: Type.STRING },
            meaning: { type: Type.STRING },
            vietnameseMeaning: { type: Type.STRING },
            exampleSentence: { type: Type.STRING },
            synonyms: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
          },
          required: ["phrase", "mainKeyword", "pronunciation", "meaning", "vietnameseMeaning", "exampleSentence", "synonyms"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("Lỗi parse JSON vocab:", e);
    return [];
  }
};

export const playTTS = async (text: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Pronounce: ${text}` }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const binary = atob(base64Audio);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      
      const dataInt16 = new Int16Array(bytes.buffer);
      const buffer = audioCtx.createBuffer(1, dataInt16.length, 24000);
      const channelData = buffer.getChannelData(0);
      for (let i = 0; i < dataInt16.length; i++) {
        channelData[i] = dataInt16[i] / 32768.0;
      }

      const source = audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(audioCtx.destination);
      source.start();
    }
  } catch (e) {
    console.warn("TTS Gemini lỗi, chuyển sang Web Speech API:", e);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  }
};
