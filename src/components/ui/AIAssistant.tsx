/**
 * SlimFit — Emoji AI 减脂助手
 *
 * 动态交互灵感来源于 mojocarrot-on-desk 桌面宠物项目（MIT License）。
 * 复用了以下动画逻辑：
 * - 状态驱动的 idle/thinking/react/sleep 动画序列
 * - 点击弹跳 + 悬浮光晕 + 拖拽回弹交互
 * - 休眠/唤醒定时器 + 表情平滑过渡
 *
 * 适配 SlimFit 减脂项目：
 * - 黄脸 emoji 形象系统（4 种可选）
 * - 减脂建议对话（AI 回复后自动切换推荐/警告表情）
 * - 用户偏好 localStorage 持久化
 *
 * @since 2026-05-21
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store';
import {
  X, Send, ChevronDown, Sparkles,
} from 'lucide-react';
import clsx from 'clsx';
import { AI_API_KEY } from '../../services/foodRecognition';

/* ==================== 类型定义 ==================== */

type MoodState = 'idle' | 'thinking' | 'recommend' | 'warn' | 'sleep';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  mood?: MoodState;
}

/** 可选的黄脸 emoji 形象 */
const EMOJI_OPTIONS = [
  { emoji: '😀', label: '经典笑脸', id: 'grin' },
  { emoji: '🥳', label: '派对达人', id: 'party' },
  { emoji: '🤓', label: '学霸模式', id: 'nerd' },
  { emoji: '😎', label: '酷炫太阳', id: 'cool' },
] as const;

/** 默认 emoji */
const DEFAULT_EMOJI = '😀';

/* ==================== 常量 ==================== */

/** 30 秒无操作进入休眠 */
const SLEEP_TIMEOUT_MS = 30_000;
/** localStorage 键名 */
const EMOJI_KEY = 'slimfit_ai_emoji';
const CHAT_KEY = 'slimfit_ai_chat';

/* ==================== 持久化工具 ==================== */

function loadEmoji(): string {
  try {
    const saved = localStorage.getItem(EMOJI_KEY);
    if (saved && EMOJI_OPTIONS.find(e => e.emoji === saved)) return saved;
  } catch { /* ignore */ }
  return DEFAULT_EMOJI;
}

function saveEmoji(emoji: string) {
  localStorage.setItem(EMOJI_KEY, emoji);
}

function loadChatHistory(): ChatMessage[] {
  try {
    const saved = localStorage.getItem(CHAT_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return [];
}

function saveChatHistory(messages: ChatMessage[]) {
  // 只保留最近 30 条
  const trimmed = messages.slice(-30);
  localStorage.setItem(CHAT_KEY, JSON.stringify(trimmed));
}

/* ==================== 弹簧/缓动配置 ==================== */

const springGentle = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 25,
};

const springBouncy = {
  type: 'spring' as const,
  stiffness: 500,
  damping: 15,
};

const springSnappy = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 30,
};

/* ==================== 子组件：Emoji 选择器 ==================== */

function EmojiPicker({
  current, onSelect, open, onToggle,
}: {
  current: string;
  onSelect: (emoji: string) => void;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="w-6 h-6 rounded-full bg-white/60 flex items-center justify-center hover:bg-white/90 transition-colors"
        title="切换形象"
      >
        <ChevronDown size={10} className="text-gray-400" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full right-0 mb-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 flex gap-1 z-50"
          >
            {EMOJI_OPTIONS.map(opt => (
              <motion.button
                key={opt.id}
                whileHover={{ scale: 1.25 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => { onSelect(opt.emoji); onToggle(); }}
                className={clsx(
                  'w-10 h-10 rounded-xl flex items-center justify-center text-2xl transition-all',
                  current === opt.emoji
                    ? 'bg-lavender-100 ring-2 ring-lavender-300'
                    : 'hover:bg-gray-50'
                )}
                title={opt.label}
              >
                {opt.emoji}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ==================== 子组件：ZZZ 休眠气泡 ==================== */

function SleepBubbles() {
  return (
    <div className="absolute -top-8 -right-2 pointer-events-none">
      {['Z', 'z', 'z'].map((letter, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 0, x: 0 }}
          animate={{ opacity: [1, 1, 0.5, 0], y: -15 - i * 12, x: 5 + i * 8 }}
          transition={{
            duration: 2 + i * 0.6,
            repeat: Infinity,
            repeatDelay: i * 0.8,
            ease: 'easeOut',
          }}
          className="absolute text-sm font-bold text-lavender-400"
          style={{
            bottom: 0,
            left: i * 10,
          }}
        >
          {letter}
        </motion.span>
      ))}
    </div>
  );
}

/* ==================== 主组件 ==================== */

export function AIAssistant() {
  const { state } = useStore();
  const { profile } = state;
  const emojiRef = useRef<HTMLDivElement>(null);
  const [bounds, setBounds] = useState({ top: 0, left: 0, right: 0, bottom: 0 });

  // 测量手机图框位置，用于拖拽约束
  useEffect(() => {
    const measure = () => {
      const frame = document.querySelector('.max-w-lg');
      if (frame) {
        const r = frame.getBoundingClientRect();
        setBounds({
          top: r.top,
          left: r.left,
          right: window.innerWidth - r.right,
          bottom: window.innerHeight - r.bottom,
        });
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  /* ---------- 状态 ---------- */
  const [mood, setMood] = useState<MoodState>('idle');
  const [emoji, setEmoji] = useState(loadEmoji);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(loadChatHistory);
  const [input, setInput] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showGlow, setShowGlow] = useState(false);
  const [isAwakening, setIsAwakening] = useState(false);

  /* ---------- Refs ---------- */
  const sleepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isSleeping = mood === 'sleep';

  /* ==================== 休眠定时器 ==================== */

  const resetSleepTimer = useCallback(() => {
    if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
    if (mood === 'sleep') {
      // 正在苏醒
      setIsAwakening(true);
      setTimeout(() => {
        setMood('idle');
        setIsAwakening(false);
      }, 600);
    }
    sleepTimerRef.current = setTimeout(() => {
      if (!chatOpen) setMood('sleep');
    }, SLEEP_TIMEOUT_MS);
  }, [mood, chatOpen]);

  useEffect(() => {
    resetSleepTimer();
    return () => {
      if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
    };
  }, [resetSleepTimer]);

  /* ==================== 交互：全局鼠标移动唤醒 ==================== */

  useEffect(() => {
    const handleActivity = () => resetSleepTimer();
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('touchstart', handleActivity);
    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
    };
  }, [resetSleepTimer]);

  /* ==================== Chat 滚动 ==================== */

  useEffect(() => {
    if (chatOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, chatOpen]);

  /* ==================== Emoji 切换持久化 ==================== */

  const handleEmojiChange = (newEmoji: string) => {
    setEmoji(newEmoji);
    saveEmoji(newEmoji);
    resetSleepTimer();
  };

  /* ==================== 点击交互 ==================== */

  const handleEmojiClick = () => {
    resetSleepTimer();
    if (isSleeping) return; // 休眠中由 wrapper 处理唤醒
    setChatOpen(prev => !prev);
    if (!chatOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  };

  const handleSleepClick = () => {
    // 唤醒动画
    setIsAwakening(true);
    resetSleepTimer();
    setTimeout(() => {
      setIsAwakening(false);
      setChatOpen(true);
      setTimeout(() => inputRef.current?.focus(), 400);
    }, 600);
  };

  /* ==================== 发送消息（通义千问 API） ==================== */

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    resetSleepTimer();

    const userMsg: ChatMessage = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setMood('thinking');

    try {
      const dailyGoal = profile?.dailyCalorieGoal ?? 2000;
      const reply = await callAI(text, newMessages, dailyGoal);
      const aiMood: MoodState = reply.includes('不建议') || reply.includes('少吃') || reply.includes('高热量') ? 'warn' : 'recommend';
      const aiReply: ChatMessage = { role: 'assistant', content: reply, mood: aiMood };
      const finalMessages = [...newMessages, aiReply];
      setMessages(finalMessages);
      saveChatHistory(finalMessages);
      setMood(aiMood);
    } catch {
      const fallback: ChatMessage = { role: 'assistant', content: '抱歉，AI 服务暂时不可用，请稍后重试。😅', mood: 'warn' };
      const finalMessages = [...newMessages, fallback];
      setMessages(finalMessages);
      saveChatHistory(finalMessages);
      setMood('warn');
    }
    // 3 秒后恢复待机
    setTimeout(() => setMood('idle'), 3000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /* ==================== 休眠唤醒处理 ==================== */

  const handleContainerClick = () => {
    if (isSleeping) {
      handleSleepClick();
    } else {
      handleEmojiClick();
    }
  };

  /* ==================== 渲染 ==================== */

  return (
    <>
      {/* ====== 聊天弹窗 ====== */}
      <AnimatePresence>
        {chatOpen && !isSleeping && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed right-[max(1rem,calc(50vw-240px))] bottom-[140px] w-[340px] max-w-[90vw] z-40"
          >
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
              {/* 聊天头 */}
              <div className="px-4 py-3 bg-gradient-to-r from-lavender-50 to-peach-50 border-b border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <motion.span
                    animate={mood === 'thinking' ? { rotate: [0, -5, 5, -3, 3, 0] } : {}}
                    transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse' }}
                    className="text-xl"
                  >
                    {getMoodEmoji(mood, emoji)}
                  </motion.span>
                  <div>
                    <h3 className="text-sm font-bold text-gray-800">AI 减脂助手</h3>
                    <p className="text-[10px] text-gray-400">
                      {mood === 'thinking' ? '思考中...' : mood === 'recommend' ? '推荐建议' : mood === 'warn' ? '友情提醒' : '随时问我'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setChatOpen(false)}
                  className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <X size={12} className="text-gray-400" />
                </button>
              </div>

              {/* 消息列表 */}
              <div className="h-72 overflow-y-auto px-4 py-3 space-y-3">
                {messages.length === 0 && (
                  <div className="text-center py-8">
                    <span className="text-4xl block mb-2">{emoji}</span>
                    <p className="text-sm text-gray-400">你好！我是你的 AI 减脂助手</p>
                    <p className="text-xs text-gray-300 mt-1">可以问我：</p>
                    <div className="flex flex-wrap gap-1.5 mt-2 justify-center">
                      {['早餐吃什么？', '这个热量高吗？', '推荐低卡食谱', '今天还能吃多少？'].map(q => (
                        <button
                          key={q}
                          onClick={() => { setInput(q); setTimeout(() => handleSend(), 50); }}
                          className="text-[11px] px-2.5 py-1.5 rounded-full bg-lavender-50 text-lavender-600 hover:bg-lavender-100 transition-colors"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={clsx(
                      'flex gap-2 text-sm',
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {msg.role === 'assistant' && (
                      <span className="text-lg flex-shrink-0 mt-0.5">
                        {msg.mood === 'recommend' ? '😋' : msg.mood === 'warn' ? '🙅' : '🤖'}
                      </span>
                    )}
                    <div
                      className={clsx(
                        'max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed',
                        msg.role === 'user'
                          ? 'bg-peach-100 text-peach-700 rounded-br-lg'
                          : 'bg-gray-100 text-gray-700 rounded-bl-lg'
                      )}
                    >
                      {msg.content}
                    </div>
                    {msg.role === 'user' && (
                      <span className="text-lg flex-shrink-0 mt-0.5">{emoji}</span>
                    )}
                  </div>
                ))}
                {mood === 'thinking' && (
                  <div className="flex gap-2 items-center">
                    <span className="text-lg">🤔</span>
                    <div className="flex gap-1 px-3 py-2">
                      {[0, 1, 2].map(i => (
                        <motion.div
                          key={i}
                          animate={{ opacity: [0.3, 1, 0.3][i] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                          className="w-2 h-2 rounded-full bg-gray-300"
                        />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* 输入框 */}
              <div className="px-4 py-3 border-t border-gray-50 flex gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="输入减脂相关问题..."
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-gray-50 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-lavender-200 transition-all"
                />
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className={clsx(
                    'w-10 h-10 rounded-2xl flex items-center justify-center transition-all',
                    input.trim()
                      ? 'gradient-peach text-white shadow-soft'
                      : 'bg-gray-100 text-gray-300'
                  )}
                >
                  <Send size={15} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ====== Emoji 宠物角色（fixed 定位，始终稳定可见） ====== */}
      <motion.div
        ref={emojiRef}
        drag
        dragMomentum
        dragElastic={0.1}
        dragConstraints={bounds}
        onDragStart={() => { setIsDragging(true); resetSleepTimer(); }}
        onDragEnd={() => setIsDragging(false)}
        onHoverStart={() => { setShowGlow(true); resetSleepTimer(); }}
        onHoverEnd={() => setShowGlow(false)}
        onClick={handleContainerClick}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.85 }}
        initial={{ y: 40, opacity: 0, scale: 0.5 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, type: 'spring', stiffness: 300, damping: 20 }}
        className={clsx(
          'fixed right-[max(1rem,calc(50vw-240px))] bottom-28 z-50 cursor-pointer select-none',
          isDragging && 'cursor-grabbing'
        )}
        style={{ touchAction: 'none' }}
      >
        {/* 光晕 */}
        <AnimatePresence>
          {showGlow && !isSleeping && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(167,139,250,0.25) 0%, rgba(255,183,197,0.15) 50%, transparent 70%)',
                filter: 'blur(8px)',
                transform: 'scale(2.2)',
              }}
            />
          )}
        </AnimatePresence>

        {/* Emoji 主体 */}
        <motion.div
          className="relative w-[72px] h-[72px] rounded-full flex items-center justify-center"
          style={{
            background: isSleeping
              ? 'linear-gradient(135deg, rgba(200,210,240,0.5), rgba(220,215,245,0.4))'
              : 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,248,243,0.9))',
            boxShadow: showGlow && !isSleeping
              ? '0 0 30px rgba(167,139,250,0.3), 0 8px 32px rgba(255,183,197,0.2), 0 2px 8px rgba(0,0,0,0.06)'
              : '0 4px 20px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
            border: isSleeping ? '1.5px solid rgba(200,210,240,0.5)' : '1.5px solid rgba(255,255,255,0.9)',
          }}
        >
          {/* "AI" 徽标 */}
          {!isSleeping && (
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-lavender-400 flex items-center justify-center shadow-sm z-10">
              <Sparkles size={9} className="text-white" strokeWidth={3} />
            </div>
          )}

          {/* Idle 呼吸动画 */}
          {mood === 'idle' && !isDragging && (
            <motion.span
              animate={{ scale: [1, 1.04, 1, 0.97, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', times: [0, 0.3, 0.6, 0.8, 1] }}
              className="text-[42px] leading-none"
            >
              {emoji}
            </motion.span>
          )}

          {/* Thinking 思考动画 */}
          {mood === 'thinking' && !isDragging && (
            <motion.span
              animate={{ rotate: [-3, 0, 3, 0, -3] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              className="text-[42px] leading-none"
            >
              🤔
            </motion.span>
          )}

          {/* 微笑推荐 */}
          {mood === 'recommend' && !isDragging && (
            <motion.span
              initial={{ scale: 1.2 }}
              animate={{ scale: [1.2, 1.05, 1.1, 1.05] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-[42px] leading-none"
            >
              😋
            </motion.span>
          )}

          {/* 警告 */}
          {mood === 'warn' && !isDragging && (
            <motion.span
              animate={{ rotate: [-5, 5, -3, 3, 0] }}
              transition={{ duration: 0.8, repeat: 2, repeatDelay: 2 }}
              className="text-[42px] leading-none"
            >
              🙅
            </motion.span>
          )}

          {/* 休眠 */}
          {mood === 'sleep' && (
            <motion.span
              animate={{ scale: [0.97, 1, 0.97] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="text-[42px] leading-none"
              style={{ filter: 'grayscale(0.3) opacity(0.8)' }}
            >
              😪
            </motion.span>
          )}

          {/* 苏醒动画 */}
          {isAwakening && (
            <motion.span
              initial={{ scale: 0.8, rotate: -5 }}
              animate={{ scale: 1.15, rotate: 0 }}
              transition={{ duration: 0.5, type: 'spring', stiffness: 400, damping: 15 }}
              className="text-[42px] leading-none"
            >
              {emoji}
            </motion.span>
          )}

          {/* 拖拽中 */}
          {isDragging && (
            <motion.span
              animate={{ scale: 1.15 }}
              className="text-[42px] leading-none"
            >
              😲
            </motion.span>
          )}

          {/* 休眠 ZZZ */}
          {isSleeping && <SleepBubbles />}
        </motion.div>

        {/* Emoji 切换按钮 */}
        {!isSleeping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: showGlow ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className="absolute -top-1 -right-1 z-10"
          >
            <EmojiPicker
              current={emoji}
              onSelect={handleEmojiChange}
              open={pickerOpen}
              onToggle={() => { setPickerOpen(prev => !prev); resetSleepTimer(); }}
            />
          </motion.div>
        )}
      </motion.div>
    </>
  );
}

/* ==================== 工具函数 ==================== */

/** 根据 mood 返回展示 emoji */
function getMoodEmoji(mood: MoodState, fallback: string): string {
  switch (mood) {
    case 'thinking': return '🤔';
    case 'recommend': return '😋';
    case 'warn': return '🙅';
    case 'sleep': return '😪';
    default: return fallback;
  }
}

/* ==================== AI API 调用 ==================== */

const AI_SYSTEM_PROMPT = `你是一个专业的减脂饮食助手，名字叫 SlimFit AI。你的用户正在减脂。

你的回答风格：
- 友好、鼓励、简洁（控制在 200 字以内）
- 提供具体的食物建议和热量参考
- 如果用户问的是高热量/不健康食物，温和提醒并给出替代方案
- 适当使用 emoji 让回复更生动
- 不要使用 markdown 格式，用纯文本回复`;

async function callAI(
  userQuery: string,
  history: ChatMessage[],
  dailyGoal: number
): Promise<string> {
  // 只取最近 6 条作为上下文
  const recentHistory = history.slice(-6).map(m => ({
    role: m.role,
    content: m.content,
  }));

  const messages = [
    { role: 'system', content: AI_SYSTEM_PROMPT },
    { role: 'system', content: `用户每日热量目标为 ${dailyGoal} kcal。请在回答中参考此数值。` },
    ...recentHistory,
    { role: 'user', content: userQuery },
  ];

  const response = await fetch(
    'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen-plus',
        messages,
        max_tokens: 400,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '抱歉，我暂时无法回答，请换个问题试试。😊';
}
