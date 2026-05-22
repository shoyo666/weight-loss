/**
 * SlimFit — AI 食物热量识别服务
 *
 * 前端通过后端代理调用通义千问 API。
 * API Key 只存在于服务器端 .env 文件，前端代码中不会出现。
 *
 * @since 2026-05-21
 */

/* ==================== 类型定义 ==================== */

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

/* ==================== API Base URL ==================== */

/** 后端 API 基础地址（开发时由 Vite proxy 转发，生产时指向 Render 服务） */
const API_BASE = import.meta.env.VITE_API_BASE || '';

async function apiPost(path: string, body: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(err.error || `请求失败 (${res.status})`);
  }
  return res.json();
}

/* ==================== JSON 解析 ==================== */

function parseFlexibleNumber(value: unknown, fallback: number): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const p = parseFloat(value);
    if (!isNaN(p)) return p;
  }
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
      if (maxSide > maxDimension) {
        const s = maxDimension / maxSide;
        tw = Math.round(width * s);
        th = Math.round(height * s);
      }
      const canvas = document.createElement('canvas');
      canvas.width = tw;
      canvas.height = th;
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

/* ==================== 核心 API ==================== */

/**
 * 通过后端代理识别图片中的食物
 */
export async function recognizeFoodFromImage(
  imageFile: File,
  additionalContext?: string
): Promise<RecognizedFood[]> {
  const imageBase64 = await imageToBase64(imageFile, 512);
  const data = await apiPost('/api/analyze-food', {
    imageBase64,
    context: additionalContext || undefined,
  });

  const parsed = JSON.parse(data.result);
  if (Array.isArray(parsed)) return parseNutritionArray(parsed);
  if (typeof parsed === 'object' && parsed !== null) return parseNutritionArray([parsed]);
  throw new Error('未能识别到食物');
}

/**
 * 通过后端代理解析文字描述中的食物
 */
export async function recognizeFoodFromText(text: string): Promise<RecognizedFood[]> {
  // 文本分析使用 chat 接口
  const data = await apiPost('/api/chat', {
    messages: [
      { role: 'system', content: '营养分析师。解析食物返回JSON数组。格式：[{"food_name":"食物名","grams":100,"calories":200,"protein":10,"carbohydrates":20,"fat":5}]。只返回JSON。' },
      { role: 'user', content: text },
    ],
  });

  const jsonStr = data.reply.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  const parsed = JSON.parse(jsonStr);
  if (Array.isArray(parsed)) return parseNutritionArray(parsed);
  if (typeof parsed === 'object' && parsed !== null) return parseNutritionArray([parsed]);
  throw new Error('未能解析食物信息');
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
