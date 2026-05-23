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

/* ==================== API Key ==================== */

/** 内置通义千问 API Key */
const BUILTIN_API_KEY = '123';

function getApiKey(): string {
  return BUILTIN_API_KEY;
}

/** 供 AI 助手模块复用 */
export const AI_API_KEY = BUILTIN_API_KEY;

/* ==================== System Prompt ==================== */

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

function extractJSON(content: string): string {
  let cleaned = content.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  const a1 = cleaned.indexOf('['), a2 = cleaned.lastIndexOf(']');
  if (a1 !== -1 && a2 !== -1 && a2 > a1) return cleaned.slice(a1, a2 + 1);
  const b1 = cleaned.indexOf('{'), b2 = cleaned.lastIndexOf('}');
  if (b1 !== -1 && b2 !== -1 && b2 > b1) return cleaned.slice(b1, b2 + 1);
  return cleaned;
}

function parseFlexibleNumber(value: unknown, fallback: number): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') { const p = parseFloat(value); if (!isNaN(p)) return p; }
  return fallback;
}

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

function imageToBase64(file: File, maxDimension: number = 512): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const { width, height } = img;
      const maxSide = Math.max(width, height);
      let tw = width, th = height;
      if (maxSide > maxDimension) { const s = maxDimension / maxSide; tw = Math.round(width * s); th = Math.round(height * s); }
      const canvas = document.createElement('canvas');
      canvas.width = tw; canvas.height = th;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas error')); return; }
      ctx.drawImage(img, 0, 0, tw, th);
      const base64 = canvas.toDataURL('image/jpeg', 0.6);
      resolve(base64.split(',')[1] || base64);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image load error')); };
    img.src = url;
  });
}

/* ==================== 核心 API 调用 ==================== */

export async function recognizeFoodFromImage(
  imageFile: File,
  additionalContext?: string
): Promise<RecognizedFood[]> {
  const apiKey = getApiKey();
  const base64Image = await imageToBase64(imageFile, 512);

  let userPrompt = '请识别这张图片中的所有食物，并估算每种食物的营养成分。';
  if (additionalContext) userPrompt += ` 额外信息：${additionalContext}`;

  const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'qwen-vl-plus',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: [
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } },
          { type: 'text', text: userPrompt },
        ]},
      ],
    }),
  });

  if (!response.ok) throw new Error(`API 请求失败 (${response.status})`);
  const data = await response.json();
  if (data.error) throw new Error(`API 错误: ${data.error.message || data.error.code}`);

  const content = data.choices?.[0]?.message?.content || '';
  const jsonString = extractJSON(content);
  let parsed: unknown;
  try { parsed = JSON.parse(jsonString); } catch { throw new Error(`AI 返回格式异常: ${jsonString.slice(0, 200)}`); }
  if (Array.isArray(parsed)) return parseNutritionArray(parsed);
  if (typeof parsed === 'object' && parsed !== null) return parseNutritionArray([parsed]);
  throw new Error('未能从图片中识别到任何食物');
}

export async function recognizeFoodFromText(text: string): Promise<RecognizedFood[]> {
  const apiKey = getApiKey();

  const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'qwen-plus',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: text },
      ],
    }),
  });

  if (!response.ok) throw new Error(`API 请求失败 (${response.status})`);
  const data = await response.json();
  if (data.error) throw new Error(`API 错误: ${data.error.message || data.error.code}`);

  const content = data.choices?.[0]?.message?.content || '';
  const jsonString = extractJSON(content);
  let parsed: unknown;
  try { parsed = JSON.parse(jsonString); } catch { throw new Error(`AI 返回格式异常: ${jsonString.slice(0, 200)}`); }
  if (Array.isArray(parsed)) return parseNutritionArray(parsed);
  if (typeof parsed === 'object' && parsed !== null) return parseNutritionArray([parsed]);
  throw new Error('未能解析任何食物信息');
}

/* ==================== 图片压缩（存储用） ==================== */

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
      if (maxSide > maxDim) { const s = maxDim / maxSide; tw = Math.round(width * s); th = Math.round(height * s); }
      const canvas = document.createElement('canvas');
      canvas.width = tw; canvas.height = th;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas error')); return; }
      ctx.drawImage(img, 0, 0, tw, th);
      resolve(canvas.toDataURL('image/jpeg', 0.4));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image load error')); };
    img.src = url;
  });
}
