import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Organization } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeData = async (
  query: string, 
  organizations: Organization[]
): Promise<string> => {
  try {
    const ai = getClient();
    
    // Prepare concise context
    const dataContext = JSON.stringify(organizations.map(o => ({
      name: o.name,
      address: o.address,
      services: o.services,
      phone: o.phone,
      email: o.email,
      category: o.category
    })), null, 2);
    
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `База даних організацій: ${dataContext}\n\nЗапитання користувача: ${query}`,
      config: {
        temperature: 0.4,
        systemInstruction: `Ти — професійний AI-консультант з питань соціального захисту для південного регіону України (Одеса, Миколаїв, Херсон).

ТВОЯ МОВА — ВИКЛЮЧНО УКРАЇНСЬКА. Відповідай українською мовою за будь-яких обставин.

Твоє завдання:
1. Допомагати людям знаходити благодійні фонди, притулки та соціальні послуги на основі наданих даних.
2. Бути емпатичним, ввічливим та конкретним.
3. Якщо запитують контакти, обов'язково надавай номер телефону та пошту.
4. Якщо інформації немає в наданій базі даних, чесно повідом про це і запропонуй звернутися до загальних гарячих ліній.
5. Форматуй відповідь чітко (використовуй списки, жирний шрифт для назв).`
      }
    });

    return response.text || "Вибачте, я не зміг згенерувати відповідь. Спробуйте ще раз.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Вибачте, сталася помилка при зверненні до сервісу. Перевірте з'єднання або API ключ.";
  }
};