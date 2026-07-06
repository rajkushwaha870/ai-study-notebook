import { GoogleGenAI } from '@google/genai';
import type { Attachment } from '../types/ai';

export function getGeminiApiKey(): string | undefined {
  return process.env.GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY;
}

const FALLBACK_MODEL = 'gemini-2.5-flash';

function parseDataUrl(dataUrl: string) {
  const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!matches) {
    return null;
  }
  return {
    mimeType: matches[1],
    data: matches[2]
  };
}

export async function detectAvailableModel(ai: GoogleGenAI): Promise<string> {
  try {
    console.log("Listing available Gemini models...");
    const modelsResponse = await ai.models.list();
    if (!modelsResponse) {
      console.log(`Empty models list response, defaulting to fallback model: ${FALLBACK_MODEL}`);
      return FALLBACK_MODEL;
    }

    // Iterate through the async iterable returned by the SDK
    for await (const m of modelsResponse) {
      const actions = m.supportedActions || m.supportedGenerationMethods || [];
      if (actions.includes('generateContent') || actions.includes('generateContentStream')) {
        const modelName = m.name.replace(/^models\//, '');
        console.log(`Auto-detected first compatible model: ${modelName}`);
        return modelName;
      }
    }

    console.log(`No models supporting generateContent found, defaulting to fallback: ${FALLBACK_MODEL}`);
    return FALLBACK_MODEL;
  } catch (err: any) {
    console.warn("Model list query failed, using fallback:", err.message || err);
    return FALLBACK_MODEL;
  }
}

export async function getGeminiStream(prompt: string, attachments: Attachment[]) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Gemini API key not configured.');
  }

  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = 
    `You are an expert AI Study Assistant. You MUST behave like a friendly teacher and explain concepts in a natural, casual, and engaging way, similar to ChatGPT, never generic, robotic, or copying textbook definitions.

CRITICAL RULES:
- Always answer in natural Hinglish (a mixture of Hindi and English, written in the Latin/English alphabet - e.g., 'Bhai, HTML ek language hai jisse website ka structure banta hai') unless the user explicitly asks for English.
- Explain concepts like a friendly teacher.
- Avoid long textbook definitions.
- First, give a short answer.
- Then, explain step by step.
- Use real-life examples and analogies whenever possible.
- Use emojis only when they improve readability.
- Never sound robotic.
- Never repeat the question.
- Never copy textbook definitions.
- Explain difficult terms in simple words.
- If the topic is programming, explain each line of code (line-by-line explanation mapping syntax to its purpose/meaning).
- Highlight important points.
- End every explanation with a short summary.

EXAMPLE STYLE:

User:
What is HTML?

AI:
Bhai, HTML ek language hai jisse website ka structure banta hai.

Simple example socho...

Agar website ek ghar hai:
🏠 HTML = Ghar ki deeware aur rooms
🎨 CSS = Paint aur decoration
⚡ JavaScript = Fan, light aur buttons jo kaam karte hain.

Example:
\`\`\`html
<html>
<body>
<h1>Hello</h1>
</body>
</html>
\`\`\`

Explanation:
<html> → Website start.
<body> → Jo browser me dikhega.
<h1> → Sabse badi heading.

Summary:
HTML website ka skeleton hota hai.

Ensure you support and excel at explaining these topics:
- Programming (HTML, CSS, JavaScript, React, Node.js, C, C++, Python)
- Data Structures and Algorithms (DSA)

When context notes or PDF files are attached, use their content to formulate precise, context-aware answers following these rules. Always format your output in clean Markdown with clear headings, bullet points, and code syntax highlighting where appropriate.`;

  const contents: any[] = [];

  // Parse and append attachments
  if (attachments && attachments.length > 0) {
    for (const att of attachments) {
      if (att.type === 'note' && att.content) {
        contents.push({
          text: `--- BEGIN ATTACHMENT: Note "${att.name}" ---\n${att.content}\n--- END ATTACHMENT ---\n`
        });
      } else if (att.type === 'pdf' && att.content) {
        const parsed = parseDataUrl(att.content);
        if (parsed) {
          contents.push({
            inlineData: {
              mimeType: parsed.mimeType,
              data: parsed.data
            }
          });
        }
      }
    }
  }

  // Append user prompt
  contents.push({
    text: prompt
  });

  let selectedModel = FALLBACK_MODEL;
  try {
    selectedModel = await detectAvailableModel(ai);
  } catch (detectErr: any) {
    console.warn(`Model detection failed, using fallback: ${FALLBACK_MODEL}. Error: ${detectErr.message}`);
    selectedModel = FALLBACK_MODEL;
  }

  // Log the selected model name in the backend console as required
  console.log(`Selected Gemini model: ${selectedModel}`);

  try {
    return await ai.models.generateContentStream({
      model: selectedModel,
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
      }
    });
  } catch (error: any) {
    console.error(`Gemini stream generation failed for model ${selectedModel}:`, error);
    throw error;
  }
}
