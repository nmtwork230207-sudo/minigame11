import { GoogleGenAI, Type } from '@google/genai';

export async function generateOptions(question: string, answer: string): Promise<string[]> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Tạo 9 đáp án SAI (nhưng nghe có vẻ hợp lý, gây nhiễu hoặc hài hước) bằng tiếng Việt cho câu hỏi trắc nghiệm sau.
Câu hỏi: "${question}"
Đáp án đúng: "${answer}"
Yêu cầu:
- Chỉ trả về mảng JSON chứa đúng 9 chuỗi (string).
- Không giải thích gì thêm.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    
    // The response.text is already a JSON string because of responseMimeType
    let wrongAnswers: string[] = [];
    try {
      wrongAnswers = JSON.parse(response.text || '[]');
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON", parseError);
      wrongAnswers = [];
    }
    
    // Ensure we have exactly 9 wrong answers
    while (wrongAnswers.length < 9) {
      wrongAnswers.push(`Đáp án sai ${wrongAnswers.length + 1}`);
    }
    
    const allOptions = [answer, ...wrongAnswers.slice(0, 9)];
    return allOptions.sort(() => Math.random() - 0.5);
  } catch (e) {
    console.error("Failed to generate options from AI", e);
    // Fallback if AI fails
    const fallback = [answer];
    for (let i = 1; i <= 9; i++) {
      fallback.push(`Đáp án sai ${i}`);
    }
    return fallback.sort(() => Math.random() - 0.5);
  }
}
