# SlimFit — 个人减脂管理系统

移动端优先的个人减脂管理 Web 应用。AI 拍照识别食物热量、AI 减脂助手、自定义训练、体重追踪。

## 技术架构

```
用户浏览器 ──→ Vercel (前端静态站点)
                  │
                  └──→ Render (后端 API 代理) ──→ 通义千问 API
```

- **前端**：React 18 + TypeScript + Vite + Tailwind CSS（部署在 Vercel）
- **后端**：Express（部署在 Render），代理通义千问 API 调用
- **API Key**：仅存在后端 `.env`，前端完全不接触

## 本地开发

```bash
# 1. 安装依赖
npm install
cd server && npm install && cd ..

# 2. 配置后端 Key
cp server/.env.example server/.env
# 编辑 server/.env，填入 QWEN_API_KEY

# 3. 启动后端（端口 3001）
cd server && npm run dev &

# 4. 启动前端（端口 5173）
npm run dev
```

## 部署上线

### 后端 → Render

1. 注册 [Render](https://render.com)
2. New Web Service → 连接 GitHub 仓库
3. 设置：
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
   - **Environment Variable**: `QWEN_API_KEY=sk-xxx`
4. 部署后会得到 URL，如 `https://slimfit-api.onrender.com`

### 前端 → Vercel

1. 注册 [Vercel](https://vercel.com)
2. Import GitHub 仓库
3. 设置：
   - **Framework**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Environment Variable**: `VITE_API_BASE=https://slimfit-api.onrender.com`
4. 部署后得到公开链接如 `https://slimfit.vercel.app`

## License

MIT
