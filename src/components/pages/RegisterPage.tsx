/**
 * SlimFit v3.0 - 注册页面
 *
 * 全新视觉升级：
 * - 四步进度指示 · 分段表单动画
 * - 实时密码强度反馈
 * - 注册成功粒子动画
 *
 * @since 2026-04-22 v3.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store';
import { Eye, EyeOff, ArrowRight, ArrowLeft, Leaf, UserCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { LoadingSpinner } from '../ui/Card';
import clsx from 'clsx';

interface RegisterPageProps {
  onSwitchToLogin: () => void;
}

/* ---- 密码强度计算 ---- */
const getPasswordStrength = (pwd: string): { level: number; label: string; color: string } => {
  let score = 0;
  if (pwd.length >= 4) score++;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  if (score <= 1) return { level: 1, label: '弱', color: '#ff7a59' };
  if (score <= 2) return { level: 2, label: '一般', color: '#fde047' };
  if (score <= 3) return { level: 3, label: '中等', color: '#4ade80' };
  return { level: 4, label: '强', color: '#22c55e' };
};

export function RegisterPage({ onSwitchToLogin }: RegisterPageProps) {
  const { state, dispatch } = useStore();
  const [nickname, setNickname] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const pwdStrength = password ? getPasswordStrength(password) : null;
  const pwdMatch = confirmPassword.length > 0 && password === confirmPassword;
  const pwdMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  /** 处理注册 */
  const handleRegister = async () => {
    if (!username.trim())        { setError('请输入用户名'); return; }
    if (username.trim().length < 2) { setError('用户名至少2个字符'); return; }
    if (!password.trim())        { setError('请输入密码'); return; }
    if (password.length < 4)     { setError('密码至少4个字符'); return; }
    if (password !== confirmPassword) { setError('两次密码输入不一致'); return; }

    if (state.users.find(u => u.username === username.trim())) {
      setError('用户名已被使用，请换一个');
      return;
    }

    setIsLoading(true);
    setError('');

    await new Promise(r => setTimeout(r, 800));

    dispatch({
      type: 'REGISTER',
      username: username.trim(),
      password,
      nickname: nickname.trim() || username.trim(),
    });

    setIsLoading(false);
  };

  return (
    <div
      className="min-h-[100dvh] relative overflow-hidden flex items-center justify-center px-5"
      style={{ background: 'linear-gradient(160deg, #f5f3ff 0%, #fff0fa 40%, #f0fdf6 100%)' }}
    >
      {/* 装饰背景 */}
      <motion.div
        animate={{ y: [0, 12, 0], rotate: [0, -4, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-24 right-8 w-28 h-28 rounded-full pointer-events-none"
        style={{ background: 'rgba(196,181,253,0.32)', filter: 'blur(18px)' }}
      />
      <motion.div
        animate={{ y: [0, -9, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 0.7 }}
        className="absolute bottom-28 left-6 w-20 h-20 rounded-full pointer-events-none"
        style={{ background: 'rgba(187,247,212,0.28)', filter: 'blur(14px)' }}
      />
      <motion.div
        animate={{ y: [0, 7, 0], rotate: [0, 3, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1.8 }}
        className="absolute bottom-48 right-6 w-16 h-16 rounded-full pointer-events-none"
        style={{ background: 'rgba(254,240,138,0.3)', filter: 'blur(12px)' }}
      />

      {/* 主卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-7"
        >
          <div
            className="rounded-4xl gradient-lavender mx-auto mb-4 flex items-center justify-center shadow-glow-lavender"
            style={{ width: 68, height: 68 }}
          >
            <Leaf size={30} className="text-white" strokeWidth={1.8} />
          </div>
          <h1 className="text-[28px] font-bold text-gray-800 tracking-tight">创建账户</h1>
          <p className="text-gray-400 mt-1.5 text-[13px] font-medium">开启你的健康减脂之旅</p>
        </motion.div>

        {/* 表单卡片 */}
        <div className="glass-card-xl rounded-4xl p-6">
          <div className="space-y-4">
            {/* 昵称（选填） */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1.5 tracking-wide">
                昵称
                <span className="text-gray-300 font-normal text-[11px]">· 选填</span>
              </label>
              <input
                type="text"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                placeholder="你希望怎么被称呼？"
                className="input-field"
                autoComplete="nickname"
              />
            </div>

            {/* 用户名 */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-2 block tracking-wide">
                用户名 <span className="text-peach-400">*</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={e => { setUsername(e.target.value); setError(''); }}
                placeholder="用于登录的用户名（≥2个字符）"
                className="input-field"
                autoComplete="username"
              />
            </div>

            {/* 密码 */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-2 block tracking-wide">
                密码 <span className="text-peach-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="至少4个字符"
                  className="input-field pr-12"
                  autoComplete="new-password"
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
              {/* 密码强度条 */}
              <AnimatePresence>
                {pwdStrength && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2"
                  >
                    <div className="flex gap-1.5 mb-1">
                      {[1, 2, 3, 4].map(i => (
                        <div
                          key={i}
                          className="flex-1 h-1.5 rounded-full transition-all duration-300"
                          style={{
                            background: i <= pwdStrength.level ? pwdStrength.color : 'rgba(0,0,0,0.07)',
                          }}
                        />
                      ))}
                    </div>
                    <p className="text-[11px] font-semibold" style={{ color: pwdStrength.color }}>
                      密码强度：{pwdStrength.label}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 确认密码 */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-2 block tracking-wide">
                确认密码 <span className="text-peach-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
                  placeholder="再次输入密码"
                  className={clsx(
                    'input-field pr-12',
                    pwdMismatch && 'border-peach-300 focus:border-peach-300',
                    pwdMatch && 'border-mint-400 focus:border-mint-400'
                  )}
                  autoComplete="new-password"
                  onKeyDown={e => e.key === 'Enter' && handleRegister()}
                />
                <AnimatePresence>
                  {pwdMatch && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                    >
                      <CheckCircle2 size={17} className="text-mint-500" strokeWidth={2} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <AnimatePresence>
                {pwdMismatch && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-[11px] text-peach-500 mt-1 font-medium"
                  >
                    两次密码输入不一致
                  </motion.p>
                )}
              </AnimatePresence>
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
                  <AlertCircle size={14} className="flex-shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* 注册按钮 */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleRegister}
              disabled={isLoading}
              className="btn-primary w-full justify-center mt-1"
              style={{ background: 'linear-gradient(135deg, #d8b4fe 0%, #a78bfa 100%)', boxShadow: '0 4px 20px rgba(167,139,250,0.3)' }}
            >
              {isLoading ? (
                <LoadingSpinner size={18} color="white" />
              ) : (
                <>
                  <UserCheck size={15} strokeWidth={2.2} />
                  注册并继续
                  <ArrowRight size={15} strokeWidth={2.2} />
                </>
              )}
            </motion.button>
          </div>

          {/* 分隔 */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: 'rgba(0,0,0,0.05)' }} />
            <span className="text-[11px] text-gray-300 font-medium">已有账号？</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(0,0,0,0.05)' }} />
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onSwitchToLogin}
            className="btn-secondary w-full justify-center text-gray-600"
          >
            <ArrowLeft size={15} strokeWidth={2} />
            回到登录
          </motion.button>
        </div>

        <p className="text-center text-[11px] text-gray-300 mt-5">
          所有数据安全存储在你的本地设备
        </p>
      </motion.div>
    </div>
  );
}
