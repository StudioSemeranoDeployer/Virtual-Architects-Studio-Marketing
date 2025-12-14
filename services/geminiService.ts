import { GoogleGenAI, Type, Schema } from "@google/genai";
import { BrandProfile, AssetType, Language, GeneratedContentResult } from "../types";

// Initialize Gemini Client
// Note: For Veo (Video), we might need to re-instantiate this with a user-selected key in the component,
// but for standard calls we use the env key.
const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = "gemini-2.5-flash";
const IMAGE_MODEL = "gemini-2.5-flash-image";
const VIDEO_MODEL = "veo-3.1-fast-generate-preview";

/**
 * Converts a File object to a Base64 string suitable for Gemini.
 */
export const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url prefix (e.g. "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Analyzes the logo and URL to create a Brand Profile.
 */
export const analyzeBrandIdentity = async (
  logoBase64: string,
  mimeType: string,
  websiteUrl: string
): Promise<BrandProfile> => {
  const ai = getAiClient();
  const prompt = `
    Analizza questo logo e l'URL del sito fornito: "${websiteUrl}".
    
    Il tuo compito è agire come un esperto di Brand Identity.
    Estrai o deduci le seguenti informazioni:
    1. Nome del Brand (dal logo o url).
    2. Industria di riferimento.
    3. Una palette di 3-5 colori esadecimali dominanti nel logo o adatti al brand.
    4. Il "Tone of Voice" (es. Professionale, Giocoso, Lussuoso).
    5. Il pubblico target principale.
    6. Una tagline accattivante (slogan).
    7. Una breve descrizione del business (max 2 frasi).

    Rispondi rigorosamente in JSON.
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      brandName: { type: Type.STRING },
      industry: { type: Type.STRING },
      colors: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: "Hex color codes"
      },
      toneOfVoice: { type: Type.STRING },
      targetAudience: { type: Type.STRING },
      tagline: { type: Type.STRING },
      description: { type: Type.STRING },
    },
    required: ["brandName", "industry", "colors", "toneOfVoice", "targetAudience", "description"],
  };

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          { inlineData: { mimeType: mimeType, data: logoBase64 } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.4,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as BrandProfile;

  } catch (error) {
    console.error("Error analyzing brand:", error);
    throw error;
  }
};

/**
 * Generates an image using Gemini Flash Image
 */
const generateImage = async (prompt: string): Promise<string> => {
  const ai = getAiClient();
  try {
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        // Nano banana models do not support responseMimeType or responseSchema
        // Default aspect ratio 1:1 is fine for social
      }
    });

    // Extract image from response parts
    if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64 = part.inlineData.data;
                return `data:image/png;base64,${base64}`;
            }
        }
    }
    throw new Error("No image data found in response");
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};

/**
 * Generates a video using Veo
 */
const generateVideo = async (prompt: string): Promise<string> => {
  // IMPORTANT: Re-create AI client to ensure we pick up the latest key if user selected one via the UI
  // The process.env.API_KEY will be updated by the selection dialog internally in the platform context.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    let operation = await ai.models.generateVideos({
      model: VIDEO_MODEL,
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '9:16' // Mobile/Social vertical format
      }
    });

    // Poll for completion
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5s
      operation = await ai.operations.getVideosOperation({operation: operation});
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) throw new Error("Video generation failed or no URI returned");

    // Fetch the actual video bytes using the key
    const response = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);

  } catch (error) {
    console.error("Error generating video:", error);
    throw error;
  }
};

/**
 * Generates specific marketing assets based on the profile.
 */
export const generateMarketingContent = async (
  brand: BrandProfile,
  type: AssetType,
  context: string,
  language: Language
): Promise<GeneratedContentResult> => {
  const ai = getAiClient();

  // Special handling for Media Generation
  if (type === AssetType.SOCIAL_IMAGE) {
    const imagePrompt = `Create a high-quality, professional social media photo for the brand "${brand.brandName}" (${brand.industry}). 
    Context: ${context}. 
    Style: ${brand.toneOfVoice}, clean, modern. 
    Dominant colors: ${brand.colors.join(', ')}. 
    Ensure the image is suitable for Instagram.`;
    
    const imageUrl = await generateImage(imagePrompt);
    return {
        text: `**Prompt Used:** ${context}\n\nGenerated a visual asset for ${brand.brandName} reflecting the ${brand.toneOfVoice} style.`,
        mediaUrl: imageUrl,
        mediaType: 'image'
    };
  }

  if (type === AssetType.SOCIAL_VIDEO) {
    const videoPrompt = `A cinematic, high-quality social media video for brand "${brand.brandName}" (${brand.industry}). 
    Topic: ${context}. 
    Mood: ${brand.toneOfVoice}. 
    Vertical 9:16 format. Professional lighting.`;
    
    const videoUrl = await generateVideo(videoPrompt);
    return {
        text: `**Video Concept:** ${context}\n\nGenerated a 720p vertical video for social media stories/reels.`,
        mediaUrl: videoUrl,
        mediaType: 'video'
    };
  }

  // Text Generation Logic
  let systemInstruction = `
    You are a Senior Copywriter at "Virtual Architects Studio". 
    You are working for the brand "${brand.brandName}".
    
    Brand Details:
    - Industry: ${brand.industry}
    - Tone of Voice: ${brand.toneOfVoice}
    - Target Audience: ${brand.targetAudience}
    - Description: ${brand.description}
    
    Your goal is to create high-quality marketing content in ${language}.
    Use Markdown formatting (bold, bullet points) to make the text readable and engaging.
    Keep it professional yet creative, aligned with the specific Tone of Voice.
  `;

  let userPrompt = "";

  switch (type) {
    case AssetType.SOCIAL_POST:
      userPrompt = `Create a social media post (Instagram/LinkedIn) about: "${context}". Include an engaging caption, 3-5 relevant hashtags, and a brief visual description for the image.`;
      break;
    case AssetType.AD_COPY:
      userPrompt = `Write ad copy for a paid campaign (Meta Ads or Google Ads) focusing on: "${context}". Include Main Headline, Primary Text, and Call to Action.`;
      break;
    case AssetType.EMAIL_NEWSLETTER:
      userPrompt = `Draft an email newsletter about: "${context}". Include a catchy Subject Line and the Body text.`;
      break;
    case AssetType.BLOG_IDEA:
      userPrompt = `Generate a blog post structure (outline) on the topic: "${context}". Include H1 Title, introduction, 3 main paragraphs (H2) with bullet points, and conclusion.`;
      break;
    case AssetType.LANDING_HERO:
      userPrompt = `Write the copy for a Landing Page Hero Section. Goal/Offer: "${context}". Include Headline, Sub-headline, and CTA button text.`;
      break;
    default:
      userPrompt = `Generate marketing content regarding: "${context}".`;
  }

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    return {
        text: response.text || "Error generating content."
    };

  } catch (error) {
    console.error("Error generating content:", error);
    throw error;
  }
};
