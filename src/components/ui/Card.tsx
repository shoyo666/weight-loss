/**
 * SlimFit v3.0 - 通用卡片组件库
 *
 * 包含：
 * - StatCard       统计数值卡片
 * - ProgressRing   SVG 进度环
 * - GlassCard      通用毛玻璃卡片
 * - InfoRow        信息行
 * - EmptyState     空状态
 * - LoadingSpinner 加载动画
 *
 * @since 2026-04-22 v3.0
 */

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
import clsx from 'clsx';

/* ==================== StatCard ==================== */

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  color?: 'peach' | 'mint' | 'lavender' | 'sky' | 'butter';
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: ReactNode;
}

const colorMap = {
  peach:    { bg: 'bg-peach-100',    text: 'text-peach-500',    icon: 'text-peach-400'    },
  mint:     { bg: 'bg-mint-100',     text: 'text-mint-600',     icon: 'text-mint-500'     },
  lavender: { bg: 'bg-lavender-100', text: 'text-lavender-600', icon: 'text-lavender-500' },
  sky:      { bg: 'bg-sky-100',      text: 'text-sky-600',      icon: 'text-sky-500'      },
  butter:   { bg: 'bg-butter-100',   text: 'text-butter-500',   icon: 'text-butter-400'   },
};

export function StatCard({
  label, value, unit, color = 'peach', trend, trendValue, icon
}: StatCardProps) {
  const c = colorMap[color];
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={clsx('rounded-3xl p-4', c.bg)}
    >
      {/* 标题行 */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-500">{label}</span>
        {icon && <div className={clsx('opacity-80', c.icon)}>{icon}</div>}
      </div>

      {/* 数值 */}
      <div className="flex items-end gap-1">
        <span className={clsx('text-2xl font-bold tracking-tight', c.text)}>
          {value}
        </span>
        {unit && <span className="text-xs text-gray-400 font-medium mb-0.5">{unit}</span>}
      </div>

      {/* 趋势 */}
      {trend && trendValue && (
        <div className={clsx('flex items-center gap-1 mt-1.5 text-[11px] font-semibold', c.icon)}>
          {trend === 'down' ? <TrendingDown size={11} /> :
           trend === 'up'   ? <TrendingUp   size={11} /> :
                              <Minus        size={11} />}
          {trendValue}
        </div>
      )}
    </motion.div>
  );
}

/* ==================== ProgressRing ==================== */

interface ProgressRingProps {
  progress: number;         // 0-100
  size?: number;            // 直径 px
  strokeWidth?: number;     // 描边宽度 px
  color?: string;           // 描边颜色
  bgColor?: string;         // 底色
  children?: ReactNode;     // 中心内容
  animated?: boolean;
}

export function ProgressRing({
  progress,
  size = 100,
  strokeWidth = 8,
  color = '#ff9a7c',
  bgColor = 'rgba(0,0,0,0.05)',
  children,
  animated = true,
}: ProgressRingProps) {
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      {/* SVG 进度环 */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: 'rotate(-90deg)' }}
        aria-hidden="true"
      >
        {/* 背景圆 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={bgColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* 进度弧 */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={animated ? { strokeDashoffset: circumference } : false}
          animate={{ strokeDashoffset: offset }}
          transition={animated ? { duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 } : undefined}
        />
      </svg>

      {/* 中心内容 */}
      {children && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ top: 0, left: 0, right: 0, bottom: 0 }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

/* ==================== GlassCard ==================== */

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  padded?: boolean;
  onClick?: () => void;
}

export function GlassCard({ children, className, padded = true, onClick }: GlassCardProps) {
  return (
    <motion.div
      onClick={onClick}
      className={clsx(
        'glass-card rounded-3xl',
        padded && 'p-5',
        onClick && 'cursor-pointer press-scale',
        className
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ==================== InfoRow ==================== */

interface InfoRowProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  className?: string;
  last?: boolean;
  onClick?: () => void;
}

export function InfoRow({ label, value, icon, className, last, onClick }: InfoRowProps) {
  return (
    <div
      className={clsx(
        'flex items-center justify-between py-3.5 px-5',
        !last && 'border-b border-gray-50/80',
        onClick && 'cursor-pointer active:bg-gray-50/60 transition-colors',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-2.5">
        {icon && <span className="text-gray-400">{icon}</span>}
        <span className="text-sm text-gray-500 font-medium">{label}</span>
      </div>
      <div className="text-sm font-semibold text-gray-700">{value}</div>
    </div>
  );
}

/* ==================== EmptyState ==================== */

interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function EmptyState({ icon = '🌿', title, subtitle, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-10 px-6 text-center"
    >
      <div className="text-5xl mb-4 select-none" aria-hidden="true">{icon}</div>
      <h3 className="font-bold text-gray-600 text-base">{title}</h3>
      {subtitle && <p className="text-sm text-gray-400 mt-1.5 max-w-[200px]">{subtitle}</p>}
      {action && <div className="mt-4">{action}</div>}
    </motion.div>
  );
}

/* ==================== LoadingSpinner ==================== */

interface LoadingSpinnerProps {
  size?: number;
  color?: string;
  className?: string;
}

export function LoadingSpinner({ size = 24, color = '#ff9a7c', className }: LoadingSpinnerProps) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
      className={clsx('flex-shrink-0', className)}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: `3px solid ${color}30`,
        borderTopColor: color,
      }}
    />
  );
}

/* ==================== SectionHeader ==================== */

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

export function SectionHeader({ title, subtitle, action, className }: SectionHeaderProps) {
  return (
    <div className={clsx('flex items-center justify-between', className)}>
      <div>
        <h2 className="section-title">{title}</h2>
        {subtitle && <p className="section-subtitle mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/* ==================== Toggle Switch ==================== */

interface ToggleSwitchProps {
  value: boolean;
  onChange: (v: boolean) => void;
  color?: 'peach' | 'mint' | 'sky';
}

const toggleColorMap = {
  peach: 'bg-peach-400',
  mint:  'bg-mint-500',
  sky:   'bg-sky-400',
};

export function ToggleSwitch({ value, onChange, color = 'peach' }: ToggleSwitchProps) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={clsx(
        'w-12 h-6 rounded-full relative transition-colors duration-300 flex-shrink-0',
        value ? toggleColorMap[color] : 'bg-gray-200'
      )}
      aria-checked={value}
      role="switch"
    >
      <motion.div
        animate={{ x: value ? 24 : 2 }}
        transition={{ type: 'spring', stiffness: 600, damping: 35 }}
        className="w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm"
      />
    </button>
  );
}
