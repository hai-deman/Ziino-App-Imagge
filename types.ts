export type BrandId = 'oniiz' | 'v2joy';

export interface BrandPack {
  id: BrandId;
  name: string;
  palette: {
    primary: string;
    secondary: string;
    navy: string;
    white: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  taglines: string[];
}

export interface HookTemplate {
  id: string;
  name: string;
  beats: string[];
}

export interface ContentScore {
    score: number; // Score out of 100
    feedback: string;
    suggestions: string[];
}

export interface ScriptScene {
    scene: number;
    line: string;
    duration_s: number;
    visual_cue: string;
    sfx: string;
    camera_angle: string;
    character_emotion: string;
    action: string;
    // For social post sets
    caption?: string;
    hashtags?: string[];
    // For film supporting characters
    supporting_character_description?: string;
}

export interface GeneratedCaption {
    caption: string;
    hashtags: string[];
}

export interface GeneratedItem {
    id:string;
    type: 'video' | 'social' | 'film' | 'sticker' | 'comic';
    script: ScriptScene[]; // For social/sticker/comic, each scene is a post/sticker/panel
    storyboardImages: (string | null)[]; // Can be null during generation
    storyboardAudio: (string | null)[]; // For recorded audio voiceovers
    contentScore?: ContentScore;
    brandId: BrandId; // Added for organization
    channelId: string; // Added for organization
    // Video-specific
    caption?: GeneratedCaption;
    srt?: string;
    variants?: { ratio: string; url: string }[];
}


export interface HookConfig {
    style: string;
    tone: string;
    length: number;
}

export interface ExportConfig {
    ratios: {
        '9:16': boolean;
        '4:5': boolean;
        '1:1': boolean;
    };
    generateVariants: boolean;
}

// Kept for compatibility with MascotUploader, though not central to the new flow.
export interface MascotFile {
  name: string;
  type: string;
  base64: string;
}

export interface CoreAssets {
  mainIdol: MascotFile | null;
  secondaryIdol: MascotFile | null;
  product: MascotFile | null;
  outfit: MascotFile | null;
}

// FIX: Added missing StoryboardPanelData type to fix errors in unused components.
export interface StoryboardPanelData {
  scene: number;
  description: string;
  image: string;
  videoUrl?: string;
}

export type ImageApplicationType = 'Cảnh Storyboard' | 'Showcase sản phẩm' | 'Meme / Ảnh chế' | 'Banner / Cover Photo' | 'Sticker' | 'Khung truyện tranh';

export type AspectRatio = '9:16' | '1:1' | '16:9' | '4:5' | '4:3' | '3:4';

export interface ImageConfig {
    applicationType: ImageApplicationType;
    aspectRatio: AspectRatio;
    style?: string;
}

// New types for Brand Asset Management
export type ChannelType = 'tiktok' | 'fanpage' | 'instagram' | 'youtube';

export interface Channel {
    id: string;
    name: string;
    type: ChannelType;
    brandId: BrandId;
}

export interface CreationContext {
    brandId: BrandId;
    channel: Channel;
}
