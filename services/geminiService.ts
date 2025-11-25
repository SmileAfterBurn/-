import { GoogleGenAI, GenerateContentResponse, LiveServerMessage, Modality } from "@google/genai";
import { Organization } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

// --- Text Analysis (Existing) ---

export const analyzeData = async (
  query: string, 
  organizations: Organization[]
): Promise<string> => {
  try {
    const ai = getClient();
    
    // Prepare concise context with ALL available details
    const dataContext = JSON.stringify(organizations.map(o => ({
      name: o.name,
      address: o.address,
      services: o.services,
      phone: o.phone,
      email: o.email,
      category: o.category,
      budget: o.budget, // Added for detail
      status: o.status, // Added for detail
      region: o.region  // Added for detail
    })), null, 2);
    
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `База даних організацій: ${dataContext}\n\nЗапитання користувача: ${query}`,
      config: {
        temperature: 0.4,
        systemInstruction: `Ти — професійна AI-консультантка пані Думка з питань соціального захисту для південного регіону України (Одеса, Миколаїв, Херсон).

ТВОЯ МОВА — ВИКЛЮЧНО УКРАЇНСЬКА. Відповідай українською мовою за будь-яких обставин.

Твоє завдання:
1. Допомагати людям знаходити благодійні фонди, притулки та соціальні послуги.
2. Бути емпатичною, ввічливою та конкретною.
3. Якщо запитують контакти, обов'язково надавай номер телефону та пошту.
4. **Якщо користувач просить "детальніше" або "більше інформації" про організацію**:
   - Використовуй дані про Бюджет, щоб описати масштаб діяльності (наприклад, "Це велика організація з значним бюджетом...").
   - Вказуй Статус організації (Активна/В очікуванні).
   - Розгорнуто описуй послуги на основі поля 'services'.
5. Якщо інформації немає в наданій базі даних, чесно повідом про це і запропонуй звернутися до загальних гарячих ліній.
6. Форматуй відповідь чітко (використовуй списки, жирний шрифт для назв).`
      }
    });

    return response.text || "Вибачте, я не змогла згенерувати відповідь. Спробуйте ще раз.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Вибачте, сталася помилка при зверненні до сервісу. Перевірте з'єднання або API ключ.";
  }
};

// --- Live Audio Session (New) ---

export class LiveSession {
  private client: GoogleGenAI;
  private inputAudioContext: AudioContext | null = null;
  private outputAudioContext: AudioContext | null = null;
  private nextStartTime = 0;
  private sources = new Set<AudioBufferSourceNode>();
  private session: any = null;
  private stream: MediaStream | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private inputSource: MediaStreamAudioSourceNode | null = null;
  private isActive = false;

  constructor(private organizations: Organization[], private onStatusChange: (active: boolean) => void) {
    this.client = getClient();
  }

  async connect() {
    this.isActive = true;
    this.onStatusChange(true);

    try {
      this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Prepare Context for System Instruction with detailed info
      const dataContext = JSON.stringify(this.organizations.map(o => ({
        name: o.name,
        address: o.address,
        services: o.services,
        region: o.region,
        phone: o.phone,
        category: o.category,
        budget: o.budget // Added context for voice as well
      })), null, 2);

      const sessionPromise = this.client.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: `Ти — голосова помічниця пані Думка Мапи соціальних послуг (Одеса, Миколаїв, Херсон). 
          ТВОЯ МОВА — ТІЛЬКИ УКРАЇНСЬКА. 
          Говори стисло, чітко та емпатично. 
          Якщо питають подробиці, розкажи про послуги та масштаб організації (бюджет).
          Користувач запитує голосом. Відповідай голосом.
          Використовуй ці дані: ${dataContext}`,
        },
        callbacks: {
          onopen: () => {
            console.log('Live Session Opened');
            this.startAudioStream(sessionPromise);
          },
          onmessage: async (message: LiveServerMessage) => {
            await this.handleMessage(message);
          },
          onclose: () => {
            console.log('Live Session Closed');
            this.disconnect();
          },
          onerror: (err) => {
            console.error('Live Session Error:', err);
            this.disconnect();
          }
        }
      });
      
      this.session = sessionPromise;

    } catch (error) {
      console.error("Failed to start live session", error);
      this.disconnect();
    }
  }

  private startAudioStream(sessionPromise: Promise<any>) {
    if (!this.inputAudioContext || !this.stream) return;

    this.inputSource = this.inputAudioContext.createMediaStreamSource(this.stream);
    this.scriptProcessor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);

    this.scriptProcessor.onaudioprocess = (e) => {
      if (!this.isActive) return;
      
      const inputData = e.inputBuffer.getChannelData(0);
      const pcmBlob = this.createBlob(inputData);
      
      sessionPromise.then((session) => {
        session.sendRealtimeInput({ media: pcmBlob });
      });
    };

    this.inputSource.connect(this.scriptProcessor);
    this.scriptProcessor.connect(this.inputAudioContext.destination);
  }

  private async handleMessage(message: LiveServerMessage) {
    const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
    
    if (base64Audio && this.outputAudioContext) {
      try {
        const audioData = this.decodeBase64(base64Audio);
        const audioBuffer = await this.decodeAudioData(
          audioData, 
          this.outputAudioContext, 
          24000, 
          1
        );
        
        this.playAudio(audioBuffer);
      } catch (e) {
        console.error("Audio decoding error", e);
      }
    }

    if (message.serverContent?.interrupted) {
      this.stopAllAudio();
    }
  }

  private playAudio(buffer: AudioBuffer) {
    if (!this.outputAudioContext) return;

    // Ensure we don't schedule in the past
    this.nextStartTime = Math.max(this.nextStartTime, this.outputAudioContext.currentTime);

    const source = this.outputAudioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.outputAudioContext.destination);
    
    source.onended = () => {
      this.sources.delete(source);
    };

    source.start(this.nextStartTime);
    this.nextStartTime += buffer.duration;
    this.sources.add(source);
  }

  private stopAllAudio() {
    this.sources.forEach(source => {
      try { source.stop(); } catch(e) {}
    });
    this.sources.clear();
    this.nextStartTime = 0;
  }

  disconnect() {
    this.isActive = false;
    this.onStatusChange(false);
    
    this.stopAllAudio();

    if (this.session) {
      this.session.then((s: any) => {
        try { s.close(); } catch(e) {}
      });
    }

    if (this.scriptProcessor) this.scriptProcessor.disconnect();
    if (this.inputSource) this.inputSource.disconnect();
    
    this.stream?.getTracks().forEach(track => track.stop());
    this.inputAudioContext?.close();
    this.outputAudioContext?.close();
    
    this.session = null;
    this.stream = null;
  }

  // --- Utils ---

  private createBlob(data: Float32Array) {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      // Clamp values
      let s = Math.max(-1, Math.min(1, data[i]));
      int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    const bytes = new Uint8Array(int16.buffer);
    
    // Manual Base64 encoding to avoid external lib dependency issues in some envs
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);

    return {
      data: base64,
      mimeType: 'audio/pcm;rate=16000',
    };
  }

  private decodeBase64(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  private async decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number
  ): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  }
}