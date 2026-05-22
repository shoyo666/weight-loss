/**
 * SlimFit — 后端 API 代理服务器
 *
 * 将通义千问 API Key 安全地保存在服务器端，
 * 前端通过本服务器的接口间接调用 AI 功能。
 *
 * 部署：Render / Railway / 任意 Node.js 托管
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const QWEN_API_KEY = process.env.QWEN_API_KEY || '';
const QWEN_ENDPOINT = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// 健康检查
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, keyConfigured: !!QWEN_API_KEY });
});

/**
 * POST /api/analyze-food
 * 接收图片 base64 + 可选上下文，返回食物营养分析
 */
app.post('/api/analyze-food', async (req, res) => {
  try {
    const { imageBase64, context } = req.body || {};

    if (!QWEN_API_KEY) {
      return res.status(500).json({ error: 'API Key 未配置' });
    }
    if (!imageBase64) {
      return res.status(400).json({ error: '缺少图片数据' });
    }

    const userPrompt = context
      ? `请识别这张图片中的所有食物，并估算每种食物的营养成分。额外信息：${context}`
      : '请识别这张图片中的所有食物，并估算每种食物的营养成分。';

    const response = await fetch(QWEN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${QWEN_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen-vl-plus',
        messages: [
          { role: 'system', content: FOOD_SYSTEM_PROMPT },
          {
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
              { type: 'text', text: userPrompt },
            ],
          },
        ],
      }),
    });

    const data = await response.json();
    if (data.error) {
      return res.status(500).json({ error: data.error.message || 'AI 服务错误' });
    }

    const content = data.choices?.[0]?.message?.content || '';
    const json = extractJSON(content);

    res.json({ result: json });
  } catch (e) {
    console.error('/api/analyze-food error:', e);
    res.status(500).json({ error: '分析请求失败' });
  }
});

/**
 * POST /api/chat
 * 接收对话消息 + 上下文，返回 AI 减脂建议
 */
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body || {};

    if (!QWEN_API_KEY) {
      return res.status(500).json({ error: 'API Key 未配置' });
    }
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: '缺少消息数据' });
    }

    const response = await fetch(QWEN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${QWEN_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen-plus',
        messages,
        max_tokens: 400,
      }),
    });

    const data = await response.json();
    if (data.error) {
      return res.status(500).json({ error: data.error.message || 'AI 服务错误' });
    }

    const reply = data.choices?.[0]?.message?.content || '抱歉，我暂时无法回答。';
    res.json({ reply });
  } catch (e) {
    console.error('/api/chat error:', e);
    res.status(500).json({ error: '对话请求失败' });
  }
});

/* ==================== 工具函数 ==================== */

const FOOD_SYSTEM_PROMPT = `营养分析师。解析食物返回JSON数组。

规则：无克重则估算份量。数值保留1位小数。

返回格式（必须是数组）：
[{"food_name":"食物名","grams":100,"calories":200,"protein":10,"carbohydrates":20,"fat":5}]

多食物示例：
[{"food_name":"米饭","grams":150,"calories":195,"protein":4,"carbohydrates":43,"fat":0.5},{"food_name":"鸡蛋","grams":50,"calories":72,"protein":6,"carbohydrates":1,"fat":5}]

只返回JSON，无其他文字。`;

function extractJSON(content) {
  let cleaned = content.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  const a1 = cleaned.indexOf('['), a2 = cleaned.lastIndexOf(']');
  if (a1 !== -1 && a2 !== -1 && a2 > a1) return cleaned.slice(a1, a2 + 1);
  const b1 = cleaned.indexOf('{'), b2 = cleaned.lastIndexOf('}');
  if (b1 !== -1 && b2 !== -1 && b2 > b1) return cleaned.slice(b1, b2 + 1);
  return cleaned;
}

app.listen(PORT, () => {
  console.log(`SlimFit API 代理服务运行在 http://localhost:${PORT}`);
  console.log(`Key 已配置: ${!!QWEN_API_KEY}`);
});
