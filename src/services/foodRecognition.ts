/**
 * SlimFit — AI 食物热量识别服务
 *
 * 基于阿里云通义千问 Qwen VL Plus 多模态视觉模型实现。
 * 识别逻辑移植自 CalorieCop (MIT License) 的开源实现，
 * 核心改进：图片缩放 → base64 → Qwen VL API → JSON 提取 → 结构化营养数据。
 *
 * @since 2026-05-21
 */

/* ==================== 类型定义 ==================== */

/** AI 识别返回的单个食物营养信息 */
export interface RecognizedFood {
  foodName: string;
  grams: number;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  confidence: 'high' | 'medium' | 'low';
  notes?: string;
}

/* ==================== API Key（后台统一配置，前端无感知） ==================== */

/** 通义千问 API Key — 从环境变量读取，不暴露在公开仓库中 */
const BUILTIN_API_KEY = import.meta.env.VITE_QWEN_API_KEY || '';

function getApiKey(): string {
  if (!BUILTIN_API_KEY) {
    console.warn('[SlimFit] VITE_QWEN_API_KEY 未设置，AI 识别功能不可用。请在 .env 文件中配置。');
  }
  return BUILTIN_API_KEY;
}

/** API Key 供 AI 助手等模块复用 */
export const AI_API_KEY = BUILTIN_API_KEY;

/**
 * 压缩图片为缩略图 data URL（用于 localStorage 存储）
 * 最大 300px，JPEG 40% 质量，输出通常 < 30KB
 */
export function compressImageForThumb(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const maxDim = 300;
      const { width, height } = img;
      const maxSide = Math.max(width, height);
      let tw = width, th = height;
      if (maxSide > maxDim) {
        const s = maxDim / maxSide;
        tw = Math.round(width * s);
        th = Math.round(height * s);
      }
      const canvas = document.createElement('canvas');
      canvas.width = tw;
      canvas.height = th;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas error')); return; }
      ctx.drawImage(img, 0, 0, tw, th);
      resolve(canvas.toDataURL('image/jpeg', 0.4));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image load error')); };
    img.src = url;
  });
}

/* ==================== System Prompt ==================== */

/**
 * 食物解析系统提示词
 * 移植自 CalorieCop 的 FoodParsingPrompt
 * 指示 AI 返回严格的 JSON 数组格式
 */
const SYSTEM_PROMPT = `营养分析师。解析食物返回JSON数组。

规则：无克重则估算份量。数值保留1位小数。

返回格式（必须是数组）：
[{"food_name":"食物名","grams":100,"calories":200,"protein":10,"carbohydrates":20,"fat":5}]

多食物示例：
[{"food_name":"米饭","grams":150,"calories":195,"protein":4,"carbohydrates":43,"fat":0.5},{"food_name":"鸡蛋","grams":50,"calories":72,"protein":6,"carbohydrates":1,"fat":5}]

营养估算参考（每100g）：
- 米饭: 130kcal, 蛋白质2.6g, 碳水28.7g, 脂肪0.3g
- 鸡蛋: 144kcal, 蛋白质13.3g, 碳水2.8g, 脂肪8.8g
- 鸡胸肉: 165kcal, 蛋白质31g, 碳水0g, 脂肪3.6g
- 西兰花: 34kcal, 蛋白质2.8g, 碳水7g, 脂肪0.4g
- 番茄: 18kcal, 蛋白质0.9g, 碳水4g, 脂肪0.2g
- 牛肉: 250kcal, 蛋白质26g, 碳水0g, 脂肪15g
- 三文鱼: 208kcal, 蛋白质20g, 碳水0g, 脂肪13g
- 豆腐: 76kcal, 蛋白质8g, 碳水1.9g, 脂肪4.8g
- 牛奶: 61kcal, 蛋白质3.2g, 碳水4.8g, 脂肪3.3g
- 面包: 265kcal, 蛋白质9g, 碳水49g, 脂肪3.2g

只返回JSON，无其他文字。`;

/* ==================== JSON 提取 & 解析 ==================== */

/**
 * 从 AI 响应中提取 JSON 片段
 * 处理 markdown 代码块包裹、YAML-like 格式等情况
 */
function extractJSON(content: string): string {
  let cleaned = content
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();

  // 尝试提取 JSON 数组
  const arrayStart = cleaned.indexOf('[');
  const arrayEnd = cleaned.lastIndexOf(']');
  if (arrayStart !== -1 && arrayEnd !== -1 && arrayEnd > arrayStart) {
    return cleaned.slice(arrayStart, arrayEnd + 1);
  }

  // 尝试提取 JSON 对象
  const objStart = cleaned.indexOf('{');
  const objEnd = cleaned.lastIndexOf('}');
  if (objStart !== -1 && objEnd !== -1 && objEnd > objStart) {
    return cleaned.slice(objStart, objEnd + 1);
  }

  return cleaned;
}

/**
 * 灵活解析 AI 返回的营养数值
 * 处理 AI 可能返回 string / number 的情况
 */
function parseFlexibleNumber(value: unknown, fallback: number): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    if (!isNaN(parsed)) return parsed;
  }
  return fallback;
}

/**
 * 将 AI 返回的原始 JSON 对象数组解析为 RecognizedFood[]
 */
function parseNutritionArray(raw: unknown[]): RecognizedFood[] {
  return raw.map((item: any) => ({
    foodName: String(item.food_name || item.foodName || '未知食物'),
    grams: parseFlexibleNumber(item.grams, 100),
    calories: parseFlexibleNumber(item.calories, 0),
    protein: parseFlexibleNumber(item.protein, 0),
    carbohydrates: parseFlexibleNumber(item.carbohydrates, 0),
    fat: parseFlexibleNumber(item.fat, 0),
    confidence: (['high', 'medium', 'low'].includes(item.confidence) ? item.confidence : 'medium') as RecognizedFood['confidence'],
    notes: item.notes || undefined,
  }));
}

/* ==================== 图片处理 ==================== */

/**
 * 将图片缩放并转换为 base64
 * 最大边不超过 maxDimension px，JPEG 质量 60%
 */
function imageToBase64(file: File, maxDimension: number = 512): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      // 计算缩放比例
      const { width, height } = img;
      const maxSide = Math.max(width, height);
      let targetW = width;
      let targetH = height;

      if (maxSide > maxDimension) {
        const scale = maxDimension / maxSide;
        targetW = Math.round(width * scale);
        targetH = Math.round(height * scale);
      }

      // 绘制到 canvas 并导出
      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('无法创建 Canvas 上下文'));
        return;
      }
      ctx.drawImage(img, 0, 0, targetW, targetH);

      const base64 = canvas.toDataURL('image/jpeg', 0.6);
      // 去掉 data:image/jpeg;base64, 前缀
      const pureBase64 = base64.split(',')[1] || base64;
      resolve(pureBase64);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('图片加载失败'));
    };

    img.src = url;
  });
}

/* ==================== 核心 API 调用 ==================== */

/**
 * 调用 Qwen VL Plus API 识别图片中的食物
 *
 * @param imageFile - 用户上传的食物图片
 * @param additionalContext - 额外描述文本（如 "份量比较大"）
 * @returns 识别出的食物列表及营养信息
 */
export async function recognizeFoodFromImage(
  imageFile: File,
  additionalContext?: string
): Promise<RecognizedFood[]> {
  const apiKey = getApiKey();

  // 1. 图片预处理：缩放 + base64
  const base64Image = await imageToBase64(imageFile, 512);

  // 2. 构造请求
  let userPrompt = '请识别这张图片中的所有食物，并估算每种食物的营养成分。';
  if (additionalContext) {
    userPrompt += ` 额外信息：${additionalContext}`;
  }

  const requestBody = {
    model: 'qwen-vl-plus',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${base64Image}`,
            },
          },
          { type: 'text', text: userPrompt },
        ],
      },
    ],
  };

  // 3. 发送请求
  const endpoint = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API 请求失败 (${response.status}): ${errorText.slice(0, 200)}`);
  }

  // 4. 解析 OpenAI 兼容格式响应
  const data = await response.json();

  if (data.error) {
    throw new Error(`API 错误: ${data.error.message || data.error.code || '未知错误'}`);
  }

  const content: string = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('API 返回为空');
  }

  // 5. 提取 JSON 并解析
  const jsonString = extractJSON(content);

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    throw new Error(`AI 返回格式异常: ${jsonString.slice(0, 200)}`);
  }

  // 6. 转换为结构化数据
  if (Array.isArray(parsed)) {
    return parseNutritionArray(parsed);
  }

  // 单个对象包成数组
  if (typeof parsed === 'object' && parsed !== null) {
    return parseNutritionArray([parsed]);
  }

  throw new Error('未能从图片中识别到任何食物');
}

/**
 * 调用通义千问文本 API 解析文字描述中的食物
 *
 * @param text - 用户输入的食物描述文本
 * @returns 识别出的食物列表及营养信息
 */
export async function recognizeFoodFromText(text: string): Promise<RecognizedFood[]> {
  const apiKey = getApiKey();

  const requestBody = {
    model: 'qwen-plus',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: text },
    ],
  };

  const endpoint = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API 请求失败 (${response.status}): ${errorText.slice(0, 200)}`);
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(`API 错误: ${data.error.message || data.error.code || '未知错误'}`);
  }

  const content: string = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('API 返回为空');
  }

  const jsonString = extractJSON(content);

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    throw new Error(`AI 返回格式异常: ${jsonString.slice(0, 200)}`);
  }

  if (Array.isArray(parsed)) {
    return parseNutritionArray(parsed);
  }

  if (typeof parsed === 'object' && parsed !== null) {
    return parseNutritionArray([parsed]);
  }

  throw new Error('未能解析任何食物信息');
}
