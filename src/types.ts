export interface Hook {
  text: string;
  style: "Question" | "Shock" | "Story" | "Stat" | "Controversial";
  whyItWorks: string;
}

export interface ScriptSection {
  timestamp: string;
  text: string;
  visualNote: string;
}

export interface CTA {
  text: string;
  placement: string;
}

export interface StoryboardScene {
  sceneNumber: number;
  duration: string;
  visualDescription: string;
  onScreenText: string;
  audioNote: string;
}

export interface Metadata {
  estimatedDuration: string;
  wordCount: number;
  readingPace: string;
}

export interface GenerateResponse {
  hooks: Hook[];
  script: { sections: ScriptSection[] };
  ctas: CTA[];
  storyboard: StoryboardScene[];
  metadata: Metadata;
}

export type Platform = "tiktok" | "youtube-shorts" | "youtube-long" | "instagram-reels";
export type Tone = "Educational" | "Entertaining" | "Motivational" | "Controversial" | "Story-driven";

export const PLATFORMS: { id: Platform; label: string; duration: string }[] = [
  { id: "tiktok", label: "TikTok", duration: "15-60s" },
  { id: "youtube-shorts", label: "YouTube Shorts", duration: "60s" },
  { id: "youtube-long", label: "YouTube Long", duration: "5-15min" },
  { id: "instagram-reels", label: "Instagram Reels", duration: "30-90s" },
];

export const TONES: Tone[] = [
  "Educational",
  "Entertaining",
  "Motivational",
  "Controversial",
  "Story-driven",
];
