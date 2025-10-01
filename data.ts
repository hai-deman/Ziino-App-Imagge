import type { BrandPack, HookTemplate, ImageApplicationType, AspectRatio, ChannelType } from './types';

export const KNOWLEDGE_BASE = {
  // ... KNOWLEDGE_BASE content remains unchanged
  "schema_version": "1.0",
  "generated_at": "2025-09-26T08:19:07.319914Z",
  "source": "ZIINO GRANDLINE / Knowledge OS seed",
  "entities": {
    "character": {
      "id": "ziino",
      "name": "Ziino",
      "type": "mascot",
      "hashtags": [
        "#HayChăm",
        "#ZiinoConfession",
        "#NamTínhMới",
        "#TắmXongYêuLuôn",
        "#SạchLàChiêu",
        "#OniizXZiino"
      ]
    },
    "brands": [
      {
        "id": "oniiz",
        "name": "Oniiz",
        "taglines": [
          "Người bạn hoàn hảo của phái mạnh",
          "Sạch để bật khí chất"
        ],
        "visual": {
          "palette": {
            "primary": "#0063B1",
            "secondary": "#00B5D5",
            "navy": "#00263A",
            "white": "#FFFFFF"
          },
          "fonts": {
            "heading": "Montserrat",
            "body": "Inter"
          }
        },
        "cta_library": [
            "Đã tắm Oniiz chưa? Vào đây để thơm.",
            "Thích thì yêu, còn sạch thì… yêu lâu.",
            "Trăm tips tán gái không bằng tắm sạch mỗi ngày."
        ]
      },
      {
        "id": "v2joy",
        "name": "V2Joy",
        "taglines": [
          "Fun all the way"
        ],
        "visual": {
          "palette": {
            "primary": "#6C3EF5",
            "secondary": "#FF67D2",
            "white": "#FFFFFF",
            "navy": "#2B1C4B"
          },
          "fonts": {
            "heading": "Montserrat",
            "body": "Inter"
          }
        },
        "cta_library": [
            "Yêu cho đã, fun all the way.",
            "Trò vui nào cũng cần chuẩn bị.",
            "Sạc cảm xúc trước khi yêu."
        ]
      }
    ]
  },
  "safety_guardrails": {
    "sexual_hint": "PG-13, tránh mô tả chi tiết; tập trung vào sạch, tôn trọng, vui.",
    "no_real_person": "Không dùng tên/ảnh nhận diện người thật trừ khi đã được phép.",
    "no_medical_claims": "Tránh tuyên bố tác dụng y khoa/điều trị.",
    "brand_respect": "Không công kích thương hiệu khác.",
    "age_gate": "Nội dung V2Joy hướng người dùng ≥18."
  }
};

export const BRAND_PACKS: Record<string, BrandPack> = {
    oniiz: {
        id: 'oniiz',
        name: 'Oniiz',
        palette: KNOWLEDGE_BASE.entities.brands[0].visual.palette,
        fonts: KNOWLEDGE_BASE.entities.brands[0].visual.fonts,
        taglines: KNOWLEDGE_BASE.entities.brands[0].taglines,
    },
    v2joy: {
        id: 'v2joy',
        name: 'V2Joy',
        palette: KNOWLEDGE_BASE.entities.brands[1].visual.palette,
        fonts: KNOWLEDGE_BASE.entities.brands[1].visual.fonts,
        taglines: KNOWLEDGE_BASE.entities.brands[1].taglines,
    }
};

export const CHANNEL_TYPES: { id: ChannelType; name: string; icon: string }[] = [
    { id: 'tiktok', name: 'TikTok', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-2.43.03-4.83-.95-6.43-2.8-1.59-1.87-2.32-4.2-2.32-6.53 0-1.14.19-2.27.48-3.38.35-1.29 1.06-2.51 2.05-3.51 1.03-1.04 2.34-1.79 3.79-2.22.47-.13.95-.24 1.43-.33.02-2.52.01-5.04.01-7.56h4.03Z"/></svg>' },
    { id: 'fanpage', name: 'Fanpage', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"/></svg>' },
    { id: 'instagram', name: 'Instagram', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/></svg>' },
    { id: 'youtube', name: 'YouTube', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M21.582 7.025a2.76 2.76 0 0 0-1.943-1.94C18.238 4.5 12 4.5 12 4.5s-6.238 0-7.639.585a2.76 2.76 0 0 0-1.943 1.94C2 8.422 2 12 2 12s0 3.578.582 4.975a2.76 2.76 0 0 0 1.943 1.94C6.238 19.5 12 19.5 12 19.5s6.238 0 7.639-.585a2.76 2.76 0 0 0 1.943-1.94C22 15.578 22 12 22 12s0-3.578-.418-4.975zM9.75 15.5V8.5l6 3.5-6 3.5z"/></svg>' }
];


export const HOOK_TEMPLATES: HookTemplate[] = [
    { id: 'pov', name: 'POV / Tự Thú', beats: [] },
    { id: 'pattern_interrupt', name: 'Lật Bài Bất Ngờ', beats: [] },
    { id: 'before_after', name: 'Biến Hình Before/After', beats: [] },
    { id: 'curiosity', name: 'Tò Mò Khó Cưỡng', beats: [] },
    { id: 'fact_cine', name: 'Fact-Cinematic', beats: [] },
    { id: 'challenge', name: 'Thử Thách / Checklist', beats: [] },
];

export const TONES: string[] = [
    'Hài hước (Meme)',
    'Sâu lắng (Chằm Zn)',
    'Truyền cảm hứng (Flexing)',
    'Kịch tính (Plot Twist)',
    'Gần gũi (Relatable)',
];

export const COMIC_STYLES: string[] = [
    'Giáo dục',
    'Hài hước',
    'Đời thường (Slice-of-life)',
    'Phiêu lưu',
    'Lãng mạn'
];

export const COMIC_IMAGE_STYLES: string[] = [
    'Manga (đen trắng)',
    'Webtoon (Hàn Quốc)',
    'Chibi (dễ thương)',
    'American Comic (Cổ điển)',
    'Digital Art (Hiện đại)',
    'Màu nước (Watercolor)',
];

export const LENGTHS: number[] = [8, 10, 15, 25, 40];

export const FILM_LENGTHS: { value: number; label: string }[] = [
    { value: 60, label: '1 phút' },
    { value: 90, label: '1 phút 30 giây' },
    { value: 180, label: '3 phút' },
];

export const HUMANIZATION_STYLES: string[] = [
    'Thân mật đời thường',
    'Hội thoại đời sống',
    'Kể chuyện như bạn thân',
    'Góc nhìn cá nhân sâu sắc',
    'Biểu cảm cảm xúc mạnh',
    'Văn phong "vỡ cấu trúc"'
];

export const IMAGE_APPLICATION_TYPES: ImageApplicationType[] = [
    'Cảnh Storyboard',
    'Showcase sản phẩm',
    'Meme / Ảnh chế',
    'Banner / Cover Photo',
    'Sticker',
    'Khung truyện tranh'
];

export const ASPECT_RATIOS: AspectRatio[] = [
    '9:16', // Vertical (Stories, Reels)
    '1:1',  // Square (Instagram Post)
    '16:9', // Horizontal (YouTube, Banner)
    '4:5',  // Portrait (Instagram Post)
    '4:3',  // Classic Photo
    '3:4'   // Portrait
];
