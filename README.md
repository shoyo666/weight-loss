# SlimFit — 个人减脂管理系统

一个移动端优先的个人减脂管理 Web 应用，支持 AI 拍照识别食物热量、AI 减脂助手聊天、自定义训练计划、体重追踪等功能。

## 功能

- 📸 **AI 拍照识别食物** — 基于通义千问 Qwen VL Plus，拍照自动分析食物热量
- 🤖 **AI 减脂助手** — 浮动 emoji 宠物，支持对话交互，回答减脂相关问题
- 📊 **饮食记录** — 早餐/午餐/晚餐/加餐分类记录，饮水追踪
- 🏋️ **训练计划** — AI 生成训练方案 + 自定义训练项目 + 分组勾画
- ⚖️ **体重追踪** — 体重趋势图，BMI 计算
- ✅ **每日打卡** — 热力图，连续打卡统计

## 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 配置 API Key（首次必做）
cp .env.example .env
# 编辑 .env，填入你的通义千问 API Key
# 免费申请：https://dashscope.console.aliyun.com/apiKey

# 3. 启动开发服务器
npm run dev
```

## 配置 API Key

本项目使用通义千问 API 提供 AI 功能：

1. 访问 [阿里云 DashScope 控制台](https://dashscope.console.aliyun.com/apiKey) 免费申请 API Key
2. 复制 `.env.example` 为 `.env`
3. 将 `VITE_QWEN_API_KEY=sk-your-api-key-here` 替换为你的真实 Key

> ⚠️ `.env` 文件已在 `.gitignore` 中，不会被上传到公开仓库。

## 技术栈

- React 18 + TypeScript
- Vite 5
- Tailwind CSS 3
- Framer Motion
- localStorage 本地持久化

## License

MIT
