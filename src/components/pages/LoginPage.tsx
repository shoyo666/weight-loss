/**
 * SlimFit v3.0 - 登录页面
 *
 * 全新视觉升级：
 * - 精致浮动背景泡泡
 * - 毛玻璃大卡片 · 软圆角输入框
 * - 精细表单验证 + 友好错误提示
 * - 流畅入场动画
 *
 * @since 2026-04-22 v3.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store';
import { Eye, EyeOff, ArrowRight, Leaf, Sparkles, AlertCircle } from 'lucide-react';
import { LoadingSpinner } from '../ui/Card';
import clsx from 'clsx';

interface LoginPageProps {
  onSwitchToRegister: () => void;
}

/** 简单密码哈希（与 store 一致） */
const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return 'h_' + Math.abs(hash).toString(36);
};

/* 浮动泡泡配置 */
const bubbles = [
  { size: 96,  top: '8%',  left: '6%',  color: 'rgba(255,176,154,0.35)',   delay: 0,   duration: 7 },
  { size: 64,  top: '20%', right: '10%',color: 'rgba(196,181,253,0.3)',    delay: 1.2, duration: 5 },
  { size: 48,  top: '55%', left: '4%',  color: 'rgba(187,247,212,0.3)',    delay: 0.8, duration: 6 },
  { size: 80,  top: '70%', right: '8%', color: 'rgba(186,230,253,0.3)',    delay: 2,   duration: 8 },
  { size: 40,  top: '40%', right: '5%', color: 'rgba(254,240,138,0.35)',   delay: 0.5, duration: 5.5 },
  { size: 56,  top: '88%', left: '18%', color: 'rgba(255,176,154,0.22)',   delay: 1.5, duration: 7 },
];

export function LoginPage({ onSwitchToRegister }: LoginPageProps) {
  const { state, dispatch } = useStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [shakeError, setShakeError] = useState(false);

  /** 表单验证 */
  const validate = () => {
    if (!username.trim()) { setError('请输入用户名'); return false; }
    if (!password.trim()) { setError('请输入密码'); return false; }
    return true;
  };

  /** 触发摇晃动画 */
  const triggerShake = () => {
    setShakeError(true);
    setTimeout(() => setShakeError(false), 500);
  };

  /** 处理登录 */
  const handleLogin = async () => {
    console.log('[LoginPage] handleLogin 被调用');
    if (!validate()) { triggerShake(); return; }

    setIsLoading(true);
    setError('');

    // 模拟网络请求
    await new Promise(r => setTimeout(r, 700));

    const user = state.users.find(u => u.username === username.trim());
    console.log('[LoginPage] 查找用户:', username.trim(), '找到:', user);
    if (!user) {
      setError('用户不存在，请先注册');
      setIsLoading(false);
      triggerShake();
      return;
    }

    // 验证密码
    const hashedPassword = simpleHash(password);
    if (user.password !== hashedPassword) {
      setError('密码错误，请重新输入');
      setIsLoading(false);
      triggerShake();
      return;
    }

    console.log('[LoginPage] 准备 dispatch LOGIN');
    dispatch({ type: 'LOGIN', username: username.trim(), password });
    setIsLoading(false);
  };

  return (
    <div className="min-h-[100dvh] relative overflow-hidden flex items-center justify-center px-5"
      style={{ background: 'linear-gradient(160deg, #fff7f5 0%, #fef8ff 40%, #f0f9ff 100%)' }}
    >
      {/* ====== 浮动背景泡泡 ====== */}
      {bubbles.map((b, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: b.size, height: b.size,
            top: b.top,
            left: 'left' in b ? (b as any).left : undefined,
            right: 'right' in b ? (b as any).right : undefined,
            background: b.color,
            filter: 'blur(16px)',
          }}
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: b.duration, repeat: Infinity, ease: 'easeInOut', delay: b.delay }}
        />
      ))}

      {/* ====== 主卡片 ====== */}
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Logo 区 */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.5 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ rotate: [0, -3, 3, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="w-18 h-18 rounded-4xl gradient-peach mx-auto mb-4 flex items-center justify-center shadow-glow-peach"
            style={{ width: 68, height: 68 }}
          >
            <Leaf size={30} className="text-white" strokeWidth={1.8} />
          </motion.div>
          <h1 className="text-[28px] font-bold text-gray-800 tracking-tight">SlimFit</h1>
          <p className="text-gray-400 mt-1.5 text-[13px] font-medium">专属减脂健康管理助手</p>
        </motion.div>

        {/* 表单卡片 */}
        <motion.div
          animate={shakeError ? {
            x: [-6, 6, -4, 4, -2, 2, 0],
          } : { x: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-card-xl rounded-4xl p-6"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-0.5">欢迎回来</h2>
          <p className="text-[13px] text-gray-400 mb-6 font-medium">继续你的健康之旅</p>

          <div className="space-y-4">
            {/* 用户名 */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-2 block tracking-wide">
                用户名
              </label>
              <input
                type="text"
                value={username}
                onChange={e => { setUsername(e.target.value); setError(''); }}
                placeholder="输入你的用户名"
                className="input-field"
                autoComplete="username"
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
            </div>

            {/* 密码 */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-2 block tracking-wide">
                密码
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="输入你的密码"
                  className="input-field pr-12"
                  autoComplete="current-password"
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={17} strokeWidth={1.8} /> : <Eye size={17} strokeWidth={1.8} />}
                </button>
              </div>
            </div>

            {/* 错误提示 */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 text-sm text-peach-600 bg-peach-50 px-4 py-3 rounded-2xl font-medium"
                >
                  <AlertCircle size={14} className="flex-shrink-0" strokeWidth={2} />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* 登录按钮 */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleLogin}
              disabled={isLoading}
              className="btn-primary w-full justify-center mt-1"
            >
              {isLoading ? (
                <LoadingSpinner size={18} color="white" />
              ) : (
                <>
                  登录
                  <ArrowRight size={15} strokeWidth={2.2} />
                </>
              )}
            </motion.button>
          </div>

          {/* 分隔 */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: 'rgba(0,0,0,0.05)' }} />
            <span className="text-[11px] text-gray-300 font-medium">还没有账号？</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(0,0,0,0.05)' }} />
          </div>

          {/* 注册引导 */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onSwitchToRegister}
            className="btn-secondary w-full justify-center"
          >
            <Sparkles size={15} strokeWidth={2} className="text-lavender-500" />
            <span className="text-gray-600">创建新账户</span>
          </motion.button>
        </motion.div>

        {/* 底部说明 */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-[11px] text-gray-300 mt-5"
        >
          所有数据安全存储在你的本地设备
        </motion.p>
      </motion.div>
    </div>
  );
}
