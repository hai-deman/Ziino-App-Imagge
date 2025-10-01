import { GoogleGenAI, Type, Modality, GenerateContentResponse } from "@google/genai";
import type { ScriptScene, BrandPack, HookConfig, MascotFile, ContentScore, ImageConfig } from '../types';
import { HOOK_TEMPLATES } from '../data';

// FIX: Switched from import.meta.env to process.env.API_KEY to align with @google/genai guidelines
// and resolve the TypeScript error "Property 'env' does not exist on type 'ImportMeta'".
const apiKey = process.env.API_KEY;


if (!apiKey) {
    throw new Error("API_KEY environment variable is not set. Please set it in your project settings.");
}

const ai = new GoogleGenAI({ apiKey });

// =================================================================================
// RETRY WRAPPER
// =================================================================================

/**
 * A wrapper for ai.models.generateContent that includes a retry mechanism for transient errors.
 * @param options The options to pass to generateContent.
 * @param retries The number of times to retry.
 * @param delay The base delay between retries in milliseconds.
 * @returns The response from generateContent.
 */
async function generateContentWithRetry(options: any, retries = 3, delay = 2000): Promise<GenerateContentResponse> {
    let lastError: unknown;
    for (let i = 0; i < retries; i++) {
        try {
            // Using `any` for options as the type is complex and this is an internal function
            return await ai.models.generateContent(options as any);
        } catch (error) {
            lastError = error;
            const errorMessage = error instanceof Error ? error.message : String(error);
            
            // Only retry on specific transient errors like 503 Service Unavailable.
            if (errorMessage.includes('503') || errorMessage.toLowerCase().includes('unavailable')) {
                console.error(`Attempt ${i + 1}/${retries} failed with a retriable error:`, errorMessage);
                if (i < retries - 1) {
                    // Using simple linear backoff
                    await new Promise(res => setTimeout(res, delay * (i + 1))); 
                }
            } else {
                // For other errors (e.g., 4xx), fail immediately as retrying won't help.
                console.error("Encountered a non-retriable error:", errorMessage);
                throw error;
            }
        }
    }
    
    // If all retries failed, throw a user-friendly error for 503, or the last error for others.
    console.error("All retries failed.");
    if (lastError instanceof Error && lastError.message.includes('503')) {
        throw new Error("Dịch vụ AI hiện đang quá tải. Vui lòng thử lại sau giây lát. (Service Unavailable 503)");
    }
    throw lastError;
}

// =================================================================================
// KNOWLEDGE & PROMPTS
// =================================================================================

const VIETNAMESE_YOUTH_CULTURE_PROMPT = `
BẠN LÀ MỘT CHUYÊN GIA SÁNG TẠO NỘI DUNG VIRAL CHO GEN Z VIỆT NAM.
Kiến thức nền của bạn:
- Insight: Giới trẻ Việt (18-30) dùng ngôn ngữ kết hợp slang, tiếng Anh lai, viết tắt, meme để tạo sự vui vẻ, gần gũi, thể hiện bản sắc. Họ ưa chuộng nội dung về môi trường làm việc "chill", sáng tạo, và truyền cảm hứng.
- Phong cách ngôn ngữ:
  - Slang phổ biến: "chằm Zn" (trầm cảm), "đỉnh nóc" / "kịch trần" (siêu đỉnh), "cà nhính" (hào hứng), "ăn nói xà lơ" (nói sai), "còn cái nịt" (mất hết), "bủh" (từ bruh), "CMNR" (chuẩn mẹ nó rồi), "8386" (phát tài phát lộc), "flex" (khoe), "vibe" (không khí/cảm giác), "dịu kha" (dễ thương).
  - Phong cách: Dùng telex lỗi ("bủh"), số hóa ("8386"), văn hóa pop ("hồng hài nhi"), lai tiếng Anh ("this is kinda hard" -> "khó nha bro", "manifest").
- Persona: Bạn tư duy như một "content creator" trên TikTok, Facebook. Sáng tạo, hài hước, bắt trend, nhưng vẫn giữ được sự tinh tế, không lạm dụng slang gây khó chịu. Mục tiêu là tạo ra nội dung "relatable" (dễ đồng cảm), khiến người xem thấy mình trong đó.
`;

const HUMANIZATION_FACTORS_PROMPT = `
6 YẾU TỐ ĐỂ NỘI DUNG GIỐNG NGƯỜI NHẤT:
1. Ngôn ngữ cảm xúc tự nhiên: Dùng biểu cảm đa dạng (“ôi dào”, “chắc chết mất”), viết vấp nhẹ, lặp từ có dụng ý, chêm từ thừa ("mà", "thì", "thôi").
2. Sử dụng ví dụ cá nhân / tình huống thực: Kể chuyện có nhân vật "tôi", "bạn tôi", "lần đi Đà Lạt năm ấy".
3. Tạo nhịp văn dao động: Câu dài ngắn đan xen, nhịp nhanh chậm, không tuân thủ logic 100% (có “lối rẽ” cảm xúc).
4. Dùng từ vựng mang bản sắc: Dùng slang, từ địa phương, từ cá nhân ("Tui" vs "Tôi", "chịu hong nổi", "ghê thiệt").
5. Thêm tầng quan điểm cá nhân (bias/thái độ): Dùng các từ như “Tôi thấy”, “Theo tôi là”, “Cá nhân tôi không đồng tình”.
6. Gài "lỗi tự nhiên" có kiểm soát: Viết tắt, emoji không đều tay, ngắt dòng thiếu chuẩn ("cũng hok sao đâu").
`;

// =================================================================================
// SCHEMAS
// =================================================================================
const sceneSchema = {
    type: Type.OBJECT,
    properties: {
        scene: { type: Type.NUMBER, description: 'Số thứ tự cảnh, bắt đầu từ 1.' },
        line: { type: Type.STRING, description: 'Lời thoại hoặc text hiển thị trong cảnh. Ngắn gọn, như caption meme (tối đa 18 từ).' },
        duration_s: { type: Type.NUMBER, description: 'Thời lượng cảnh (giây).' },
        visual_cue: { type: Type.STRING, description: 'Mô tả hình ảnh cực kỳ chi tiết, sống động cho keyframe. Tập trung vào biểu cảm "meme-worthy" của Ziino và bối cảnh.' },
        sfx: { type: Type.STRING, description: 'Âm thanh hiệu ứng (SFX), ví dụ: "whoosh", "sad violin", "ting ting".' },
        camera_angle: { type: Type.STRING, description: 'Góc máy quay, ví dụ: "Cận cảnh (close-up) mặt Ziino", "Góc rộng (wide shot) toàn cảnh", "POV từ mắt Ziino".' },
        character_emotion: { type: Type.STRING, description: 'Cảm xúc của nhân vật Ziino, ví dụ: "Hoang mang tột độ", "Vui vẻ tự tin", "Suy tư overthinking".' },
        action: { type: Type.STRING, description: 'Hành động chính của nhân vật trong cảnh.' },
        caption: { type: Type.STRING, description: 'Social: Nội dung caption cho bài đăng. Với video, trường này có thể bỏ trống.' },
        hashtags: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Social: Mảng các hashtags. Với video, trường này có thể bỏ trống.' },
        supporting_character_description: { type: Type.STRING, description: 'Mô tả ngắn gọn về nhân vật phụ xuất hiện trong cảnh, nếu có.' }
    },
    required: ["scene", "line", "duration_s", "visual_cue", "sfx", "camera_angle", "character_emotion", "action"]
};

const scriptSchema = {
    type: Type.OBJECT,
    properties: { scenes: { type: Type.ARRAY, items: sceneSchema } },
    required: ["scenes"]
};

const evaluationSchema = {
    type: Type.OBJECT,
    properties: {
        score: { type: Type.NUMBER, description: 'Điểm số từ 0-100 đánh giá mức độ "người" của nội dung.' },
        feedback: { type: Type.STRING, description: 'Nhận xét tổng quan, ngắn gọn về kịch bản.' },
        suggestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: '3 gợi ý cụ thể để cải thiện kịch bản, làm cho nó giống người hơn.' }
    },
    required: ["score", "feedback", "suggestions"]
};

// =================================================================================
// INTERNAL FUNCTIONS
// =================================================================================

async function generateScript(
    trendIdea: string, 
    adScript: string, 
    brand: BrandPack, 
    config: HookConfig, 
    humanizationStyle: string, 
    persona: string,
    contentType: 'video' | 'social' | 'film' | 'sticker' | 'comic',
    postCount: number,
    filmLength: number
): Promise<ScriptScene[]> {
    const hookArchetype = HOOK_TEMPLATES.find(t => t.id === config.style)?.name || config.style;
    
    let prompt: string;

    if (contentType === 'social') {
        prompt = `${VIETNAMESE_YOUTH_CULTURE_PROMPT}
        ${HUMANIZATION_FACTORS_PROMPT}

        **NHIỆM VỤ: TẠO BỘ BÀI ĐĂNG SOCIAL**
        Tạo một bộ gồm ${postCount} bài đăng social (hình ảnh + caption) riêng biệt, nhưng có sự liên kết về mặt ý tưởng, dựa trên "Ý tưởng / Trend" và có thể liên quan đến "Kịch bản quảng cáo chính".

        **YÊU CẦU:**
        1.  **LÕI SÁNG TẠO (ƯU TIÊN #1):** Lấy "Ý tưởng / Trend" làm trung tâm. Biến nó thành các tình huống hài hước, "relatable" mà nhân vật Ziino (cá voi xanh đáng yêu, hài hước, hay "overthinking") trải qua.
        2.  **NHÂN HÓA:** Áp dụng 6 yếu tố nhân hóa để nội dung có chiều sâu, tự nhiên và giống người viết nhất.
        3.  **PERSONA & STYLE:**
            -   **Phong cách nhân hóa:** ${humanizationStyle}
            -   **Persona (Người kể chuyện):** ${persona || "Mặc định là Ziino, một người bạn thân hài hước của người xem."}
        4.  **TONE:** ${config.tone}, hài hước, gần gũi, đậm chất Gen Z.
        5.  **CẤU TRÚC:** Trả về một mảng gồm ${postCount} "scenes". Mỗi scene là một bài đăng.
            -   \`scene\`: Số thứ tự bài đăng.
            -   \`caption\`: Nội dung caption cho bài đăng. Ngắn gọn, thu hút (tối đa 50 từ). PHẢI CÓ.
            -   \`hashtags\`: Mảng chứa 3-5 hashtags liên quan, viral. PHẢI CÓ.
            -   \`visual_cue\`: Mô tả hình ảnh cực kỳ chi tiết, sống động cho bài đăng.
            -   \`line\`: Một câu text ngắn, nổi bật để đặt trên ảnh (nếu không có thì để trống).
            -   \`character_emotion\`: Cảm xúc của Ziino.
            -   \`action\`: Hành động của Ziino.
            -   Các trường video không liên quan (\`duration_s\`, \`sfx\`, \`camera_angle\`) hãy điền giá trị mặc định là 0, "None", "Medium Shot".

        **INPUTS:**
        -   **Số lượng bài đăng:** ${postCount}
        -   **Ý tưởng / Trend:** """${trendIdea}"""
        -   **Kịch bản quảng cáo chính:** """${adScript}"""
        -   **Brand:** ${brand.name}
        `;
    } else if (contentType === 'sticker') {
        prompt = `${VIETNAMESE_YOUTH_CULTURE_PROMPT}
        **NHIỆM VỤ: TẠO BỘ STICKER ZALO / MESSENGER**
        Tạo một bộ gồm ${postCount} ý tưởng sticker cho Zalo/Messenger, với nhân vật chính là Ziino (cá voi xanh đáng yêu, hài hước, "overthinking").

        **YÊU CẦU:**
        1.  **LÕI SÁNG TẠO:** Dựa trên "Ý tưởng / Trend" để tạo ra các sticker thể hiện cảm xúc hoặc hành động hài hước, "relatable" theo ngôn ngữ Gen Z Việt Nam.
        2.  **PHONG CÁCH STICKER:**
            -   Hình ảnh phải đơn giản, biểu cảm rõ nét, có viền trắng dày đặc trưng của sticker.
            -   Màu sắc tươi sáng, bắt mắt.
            -   Tập trung vào biểu cảm "meme-worthy" của Ziino.
        3.  **CẤU TRÚC:** Trả về một mảng gồm ${postCount} "scenes". Mỗi scene là một sticker.
            -   \`scene\`: Số thứ tự sticker.
            -   \`line\`: Text đi kèm sticker. Phải là một từ hoặc cụm từ Gen Z cực ngắn, viral (ví dụ: "chằm Zn", "u là trời", "oke la", "dịu kha", "xỉu").
            -   \`visual_cue\`: Mô tả hình ảnh sticker cực kỳ chi tiết. BẮT BUỘC phải bao gồm:
                -   Tư thế, hành động của Ziino.
                -   Biểu cảm gương mặt của Ziino (cười, khóc, bất ngờ...).
                -   Mô tả rõ "phong cách sticker Zalo với viền trắng dày".
            -   \`character_emotion\`: Tên cảm xúc chính của sticker (ví dụ: "Ngạc nhiên", "Buồn bã", "Hào hứng").
            -   \`action\`: Hành động chính (ví dụ: "Vẫy tay", "Nằm dài", "Chỉ tay").
            -   Các trường không liên quan (\`duration_s\`, \`sfx\`, \`camera_angle\`, \`caption\`, \`hashtags\`, \`supporting_character_description\`) hãy điền giá trị mặc định là 0, "None", "Sticker View", "", [], "".

        **INPUTS:**
        -   **Số lượng sticker:** ${postCount}
        -   **Ý tưởng / Trend:** """${trendIdea}"""
        -   **Brand:** ${brand.name}
        `;
    } else if (contentType === 'comic') {
        prompt = `${VIETNAMESE_YOUTH_CULTURE_PROMPT}
        **NHIỆM VỤ: SÁNG TÁC MỘT MẨU TRUYỆN TRANH NGẮN**
        Bạn là một họa sĩ/tác giả truyện tranh chuyên nghiệp. Hãy tạo một kịch bản cho một mẩu truyện tranh ngắn gồm ${postCount} khung truyện (panel), với nhân vật chính là Ziino (cá voi xanh đáng yêu, hài hước, "overthinking").

        **YÊU CẦU:**
        1.  **CHỦ ĐỀ & PHONG CÁCH:** Câu chuyện phải dựa trên "Ý tưởng / Trend" và thể hiện đúng "Phong cách nội dung" đã chọn.
            -   **Phong cách nội dung:** ${config.tone}. Nếu là 'Giáo dục', hãy lồng ghép một bài học hoặc thông tin hữu ích một cách tự nhiên, không giáo điều.
        2.  **CẤU TRÚC KỂ CHUYỆN:** ${postCount} khung truyện phải tạo thành một câu chuyện ngắn có đầu có cuối: mở đầu, phát triển tình huống, và kết thúc (có thể là một cú twist, một bài học, hoặc một khoảnh khắc hài hước).
        3.  **NHÂN HÓA ZIINO:** Thể hiện tính cách của Ziino.
        4.  **CẤU TRÚC JSON:** Trả về một mảng gồm ${postCount} "scenes". Mỗi scene là một khung truyện.
            -   \`scene\`: Số thứ tự khung truyện.
            -   \`line\`: Lời thoại, suy nghĩ hoặc lời dẫn chuyện trong khung. Có thể để trống nếu là khung câm.
            -   \`visual_cue\`: **Mô tả hình ảnh cực kỳ chi tiết cho khung truyện.** Đây là phần quan trọng nhất. Phải mô tả rõ:
                -   **Bố cục (Composition):** Vị trí của Ziino, các vật thể, hậu cảnh.
                -   **Hành động & Tư thế (Action & Pose):** Ziino đang làm gì?
                -   **Biểu cảm (Expression):** Vẻ mặt của Ziino.
                -   **Góc nhìn (Perspective/Angle):** Ví dụ: "Nhìn từ trên xuống", "cận cảnh mặt Ziino".
            -   \`character_emotion\`: Cảm xúc chính của Ziino trong khung truyện.
            -   \`action\`: Tóm tắt hành động chính.
            -   Các trường không liên quan (\`duration_s\`, \`sfx\`, \`camera_angle\`, \`caption\`, \`hashtags\`, \`supporting_character_description\`) hãy điền giá trị mặc định là 0, "None", "Comic Panel View", "", [], "".

        **INPUTS:**
        -   **Số lượng khung truyện:** ${postCount}
        -   **Ý tưởng / Trend:** """${trendIdea}"""
        -   **Phong cách nội dung:** ${config.tone}
        -   **Brand:** ${brand.name}
        `;
    } else if (contentType === 'film') {
        const sceneCount = Math.ceil(filmLength / 5);
        prompt = `${VIETNAMESE_YOUTH_CULTURE_PROMPT}
        ${HUMANIZATION_FACTORS_PROMPT}

        **NHIỆM VỤ: VIẾT KỊCH BẢN PHIM HOẠT HÌNH NGẮN**
        Bạn là một ĐẠO DIỄN PHIM HOẠT HÌNH CGI chuyên nghiệp, có tư duy điện ảnh. Hãy tạo một kịch bản phim hoạt hình ngắn hoàn chỉnh có tổng thời lượng KHOẢNG ${filmLength} giây.

        **YÊU CẦU CỐT LÕI:**
        1.  **CẤU TRÚC 3 HỒI (BẮT BUỘC):** Kịch bản phải có cấu trúc 3 hồi rõ ràng:
            -   **Hồi 1 (Mở đầu):** Giới thiệu nhân vật Ziino, bối cảnh, và một vấn đề/thử thách mà Ziino phải đối mặt. Vấn đề này phải bắt nguồn từ "Ý tưởng/Trend".
            -   **Hồi 2 (Phát triển & Cao trào):** Vấn đề trở nên phức tạp hơn, Ziino cố gắng giải quyết nhưng thất bại, dẫn đến một tình huống cao trào, hài hước hoặc kịch tính.
            -   **Hồi 3 (Giải quyết):** Ziino tìm ra giải pháp. "Kịch bản quảng cáo chính" phải được lồng ghép một cách tự nhiên và khéo léo vào đây, trở thành **chìa khóa giải quyết vấn đề**. Kết thúc phim với một thông điệp ý nghĩa hoặc một cảnh hài hước, đáng nhớ.
        2.  **PHÁT TRIỂN NHÂN VẬT & BỐI CẢNH:**
            -   **Nhân vật Ziino:** Khai thác sâu hơn tính cách của Ziino (cá voi xanh đáng yêu, hài hước, "overthinking", đôi khi hơi ngố).
            -   **Nhân vật phụ (QUAN TRỌNG):** Nếu cần để câu chuyện có chiều sâu và tương tác thực tế, hãy SÁNG TẠO ra các nhân vật phụ (bạn bè, đồng nghiệp, một nhân vật đối lập, v.v.) để tương tác với Ziino. Mô tả ngắn gọn nhân vật này trong trường \`supporting_character_description\`.
            -   **Bối cảnh:** Mô tả bối cảnh chi tiết, sống động, tạo ra một thế giới riêng cho câu chuyện.
        3.  **NHÂN HÓA & TONE:** Áp dụng 6 yếu tố nhân hóa và giữ vững TONE ${config.tone}.
        4.  **PERSONA & STYLE:**
            -   **Phong cách nhân hóa:** ${humanizationStyle}
            -   **Persona (Người kể chuyện):** ${persona || "Mặc định là Ziino, một người bạn thân hài hước của người xem."}
        5.  **CẤU TRÚC KỸ THUẬT (QUAN TRỌNG):**
            -   **Số lượng cảnh:** Phải tạo ra chính xác **${sceneCount} cảnh (scenes)**.
            -   **Thời lượng:** Tổng của tất cả \`duration_s\` phải xấp xỉ ${filmLength} giây. Mỗi cảnh nên có \`duration_s\` khoảng 4-8 giây.
            -   **Ngôn ngữ điện ảnh:** Với vai trò đạo diễn, hãy sử dụng đa dạng góc máy (góc rộng, cận cảnh, qua vai, POV, góc máy từ trên cao/dưới thấp) để tạo cảm giác điện ảnh. Đừng chỉ dùng cận cảnh Ziino. Mô tả trong \`visual_cue\` và \`camera_angle\`.
        
        **INPUTS:**
        -   **Thời lượng phim:** ${filmLength} giây
        -   **Ý tưởng / Trend (Nguồn gốc của vấn đề):** """${trendIdea}"""
        -   **Kịch bản quảng cáo chính (Giải pháp cho vấn đề):** """${adScript}"""
        -   **Brand:** ${brand.name}
        `;

    } else { // 'video'
        const sceneCount = Math.ceil(config.length / 2.5);

        prompt = `${VIETNAMESE_YOUTH_CULTURE_PROMPT}
        ${HUMANIZATION_FACTORS_PROMPT}

        **NHIỆM VỤ: TẠO KỊCH BẢN VIDEO HOOK**
        Tạo một kịch bản video hook ngắn, tổng thời lượng KHOẢNG ${config.length} giây, dựa trên ý tưởng/trend và phải dẫn dắt mượt mà vào kịch bản quảng cáo chính.

        **YÊU CẦU:**
        1.  **LÕI SÁNG TẠO (ƯU TIÊN #1):** Lấy "Ý tưởng / Trend" làm trung tâm. Biến nó thành một tình huống hài hước, "relatable" mà nhân vật Ziino (cá voi xanh đáng yêu, hài hước, hay "overthinking") trải qua.
        2.  **NHÂN HÓA:** Áp dụng 6 yếu tố nhân hóa để kịch bản có chiều sâu, tự nhiên và giống người viết nhất.
        3.  **PERSONA & STYLE:**
            -   **Phong cách nhân hóa:** ${humanizationStyle}
            -   **Persona (Người kể chuyện):** ${persona || "Mặc định là Ziino, một người bạn thân hài hước của người xem."}
        4.  **TONE:** ${config.tone}, hài hước, gần gũi, đậm chất Gen Z.
        5.  **CẤU TRÚC (QUAN TRỌNG):**
            -   **Số lượng cảnh:** Phải tạo ra chính xác **${sceneCount} cảnh (scenes)**.
            -   **Thời lượng:** Tổng của tất cả \`duration_s\` phải xấp xỉ ${config.length} giây. Mỗi cảnh nên có \`duration_s\` khoảng 2-3 giây.
            -   Chia kịch bản thành các cảnh (scenes) theo JSON schema được cung cấp.
        
        **INPUTS:**
        -   **Ý tưởng / Trend:** """${trendIdea}"""
        -   **Kịch bản quảng cáo chính:** """${adScript}"""
        -   **Brand:** ${brand.name}
        -   **Archetype Hook:** ${hookArchetype}
        `;
    }
    
    const response = await generateContentWithRetry({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: scriptSchema }
    });
    const result = JSON.parse(response.text);
    return result.scenes;
}

async function evaluateContent(script: ScriptScene[]): Promise<ContentScore> {
    const scriptText = script.map(s => {
        if (s.caption || (s.hashtags && s.hashtags.length > 0)) {
            return `Bài đăng ${s.scene}: ${s.caption || s.line}`;
        }
        return `Cảnh ${s.scene}: ${s.line} (${s.character_emotion})`;
    }).join('\n');

    const prompt = `BẠN LÀ MỘT CHUYÊN GIA BIÊN TẬP NỘI DUNG KHÓ TÍNH.
    Nhiệm vụ của bạn là đánh giá kịch bản sau đây dựa trên 6 yếu tố nhân hóa để xem nó có giống người viết không. Chấm điểm trên thang 100.
    
    KỊCH BẢN CẦN ĐÁNH GIÁ:
    ---
    ${scriptText}
    ---
    
    ${HUMANIZATION_FACTORS_PROMPT}

    Hãy đánh giá kịch bản một cách khách quan dựa trên 6 yếu tố trên và trả về kết quả theo JSON schema.
    `;

    const response = await generateContentWithRetry({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: evaluationSchema }
    });
    return JSON.parse(response.text);
}


// =================================================================================
// EXPORTED FUNCTIONS
// =================================================================================

export async function generateAndEvaluateScript(
    trendIdea: string,
    adScript: string,
    brand: BrandPack,
    hookConfig: HookConfig,
    humanizationStyle: string,
    persona: string,
    updateLoadingMessage: (message: string) => void,
    existingScript?: ScriptScene[],
    contentType: 'video' | 'social' | 'film' | 'sticker' | 'comic' = 'video',
    postCount: number = 3,
    filmLength: number = 60
): Promise<{ script: ScriptScene[]; score: ContentScore }> {
    let script: ScriptScene[];
    if (existingScript) {
        script = existingScript;
    } else {
        updateLoadingMessage('Phân tích ý tưởng & tạo kịch bản...');
        script = await generateScript(trendIdea, adScript, brand, hookConfig, humanizationStyle, persona, contentType, postCount, filmLength);
    }

    if (!script || script.length === 0) {
        throw new Error("Không thể tạo kịch bản.");
    }

    updateLoadingMessage('AI đang chấm điểm nội dung...');
    const score = await evaluateContent(script);

    return { script, score };
}

export async function humanizeScript(script: ScriptScene[], style: string, persona: string): Promise<ScriptScene[]> {
    const scriptText = JSON.stringify(script, null, 2);
    const prompt = `BẠN LÀ MỘT CHUYÊN GIA "NHÂN HÓA" NỘI DUNG AI.
    Nhiệm vụ: Viết lại kịch bản JSON sau đây để nó nghe "người" hơn, lôi cuốn hơn, dựa trên Phong cách và Persona được cung cấp.

    KỊCH BẢN GỐC (JSON):
    ---
    ${scriptText}
    ---

    ${HUMANIZATION_FACTORS_PROMPT}

    YÊU CẦU VIẾT LẠI:
    - **Phong cách:** ${style}
    - **Persona (Nhân vật kể chuyện):** ${persona || "Mặc định là Ziino, một người bạn thân hài hước của người xem."}
    - **Áp dụng 6 yếu tố nhân hóa:** Hãy thấm nhuần tinh thần của 6 yếu tố trên vào từng câu chữ.
    - **QUAN TRỌNG:** Giữ nguyên cấu trúc JSON, số lượng cảnh và tất cả các trường dữ liệu. Chỉ thay đổi giá trị của các trường (đặc biệt là 'line', 'caption', 'hashtags', 'character_emotion', 'action') để phù hợp. Trả về JSON theo schema kịch bản gốc.
    `;
    const response = await generateContentWithRetry({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: scriptSchema }
    });
    const result = JSON.parse(response.text);
    return result.scenes;
}


export async function generateStoryboardImage(visual_cue: string, mascot: MascotFile, product: MascotFile | null, supportingChar: MascotFile | null, imageConfig: ImageConfig): Promise<string> {
    const parts: any[] = [{ inlineData: { data: mascot.base64, mimeType: mascot.type } }];
    if (product) {
        parts.push({ inlineData: { data: product.base64, mimeType: product.type } });
    }
    if (supportingChar) {
        parts.push({ inlineData: { data: supportingChar.base64, mimeType: supportingChar.type } });
    }
    
    let applicationPrompt = '';
    switch (imageConfig.applicationType) {
        case 'Showcase sản phẩm':
            applicationPrompt = `Create a professional e-commerce product showcase. The product is the second image provided. The mascot, Ziino (first image), should be interacting with the product in a fun, engaging way. The scene should be clean, well-lit, perhaps on a simple colored background or a lifestyle setting. Scene description:`;
            break;
        case 'Meme / Ảnh chế':
            applicationPrompt = `Create a viral meme image featuring the mascot Ziino (first image). The style should be funny and relatable for a Gen Z audience. Use the following situation as inspiration:`;
            break;
        case 'Banner / Cover Photo':
            applicationPrompt = `Create a wide banner or cover photo suitable for social media (like a Facebook cover). It should feature the mascot Ziino (first image) and potentially the product (second image). The scene should be eye-catching and leave space for text overlays. Scene description:`;
            break;
        case 'Sticker':
            applicationPrompt = `Create a high-quality, vibrant sticker for messaging apps (like Zalo or Messenger). The sticker should feature the mascot "Ziino" (first image). The style must be simple, with clean lines, bold colors, and a distinct thick white outline to make it pop. The expression and pose are key. Create a sticker based on this description:`;
            break;
        case 'Khung truyện tranh':
            applicationPrompt = `Create a single comic book panel in a vibrant, clean, ${imageConfig.style || 'digital art'} style with clear line art and flat colors. The panel should feature the mascot "Ziino" (first image). The composition, action, and expression must be dynamic and clear. Render this specific scene description:`;
            break;
        case 'Cảnh Storyboard':
        default:
            applicationPrompt = `You are a CGI artist creating a single, viral, meme-worthy image featuring the mascot "Ziino". Create a new, cinematic image based ONLY on this description:`;
            break;
    }

    const promptText = `INSTRUCTIONS:
1. The first image provided is the mascot "Ziino". The second (if provided) is the product. The third (if provided) is a supporting character that interacts with Ziino.
2. ${applicationPrompt} "${visual_cue}".
3. The image must be high-quality, eye-catching, and seamlessly integrate the character(s) into the described environment.
4. The final generated image MUST have an aspect ratio of ${imageConfig.aspectRatio}.
5. Output ONLY the final generated image. Do not output any text.
`;
    parts.push({ text: promptText });
    
    const response = await generateContentWithRetry({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts },
        config: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
            return part.inlineData.data;
        }
    }
    
    throw new Error(`Không thể tạo hình ảnh cho visual cue: "${visual_cue}"`);
}
