export interface BrandProfile {
  brandName: string;
  industry: string;
  colors: string[];
  toneOfVoice: string;
  targetAudience: string;
  tagline: string;
  description: string;
}

export enum AssetType {
  SOCIAL_POST = 'Social Media Post',
  SOCIAL_IMAGE = 'Social Image',
  SOCIAL_VIDEO = 'Social Video',
  AD_COPY = 'Ad Campaign',
  EMAIL_NEWSLETTER = 'Newsletter Email',
  BLOG_IDEA = 'Blog Article Structure',
  LANDING_HERO = 'Landing Page Hero'
}

export type Language = 'Italiano' | 'English' | 'Español' | 'Français' | 'Deutsch';

export interface GeneratedAsset {
  id: string;
  type: AssetType;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  language: Language;
  createdAt: Date;
}

export interface GenerationRequest {
  brand: BrandProfile;
  type: AssetType;
  topic?: string;
  platform?: string;
  language: Language;
}

export interface GeneratedContentResult {
  text: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
}
