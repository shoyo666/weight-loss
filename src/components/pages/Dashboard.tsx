/**
 * SlimFit v3.0 - 首页仪表盘
 *
 * 全新升级：
 * - 精致问候语 + 日期 + 通知按钮
 * - 大圆角卡路里进度环（精致 SVG 双环）
 * - 减重进度条 + 数据统计网格
 * - 打卡热力日历（35天）+ 连续打卡显示
 * - 今日饮食摘要
 * - 体重趋势迷你图
 *
 * @since 2026-04-22 v3.0
 */

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store';
import { ProgressRing, EmptyState } from '../ui/Card';
import { format, subDays, isSameDay } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import {
  Flame, Droplets, TrendingDown, CheckCircle2,
  Bell, ChevronRight, Zap, Award,
  X,
} from 'lucide-react';
import clsx from 'clsx';

/* ==================== 打卡 Modal 组件 ==================== */
interface CheckInModalProps {
  onClose: () => void;
  onConfirm: () => void;
}
function CheckInModal({ onClose, onConfirm }: CheckInModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-end justify-center"
      onClick={onClose}
    >
      {/* 遮罩 */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      {/* 弹窗 */}
      <motion.div
        initial={{ y: 120, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 120, opacity: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md bg-white rounded-t-4xl shadow-2xl px-6 pb-10 pt-7"
        onClick={e => e.stopPropagation()}
      >
        {/* 顶部装饰条 */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 bg-gray-200 rounded-full" />
        {/* 关闭 */}
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
          <X size={16} className="text-gray-400" />
        </button>
        {/* 图标 */}
        <div className="w-16 h-16 rounded-3xl bg-peach-50 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={32} className="text-peach-500" />
        </div>
        <h2 className="text-[20px] font-bold text-gray-800 text-center mb-1">每日打卡</h2>
        <p className="text-[13px] text-gray-400 text-center mb-8">坚持记录，养成健康好习惯 ✨</p>
        {/* 打卡信息 */}
        <div className="bg-peach-50 rounded-2xl px-4 py-3 mb-8">
          <p className="text-[13px] text-gray-500">今日日期</p>
          <p className="text-[15px] font-bold text-peach-600 mt-0.5">{format(new Date(), 'yyyy年M月d日 EEEE', { locale: zhCN })}</p>
        </div>
        {/* 确认打卡按钮 */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => { onConfirm(); onClose(); }}
          className="w-full py-4 bg-peach-400 text-white font-bold text-[15px] rounded-2xl shadow-lg shadow-peach-200 active:shadow-sm transition-shadow"
        >
          确认打卡 ✓
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

/* ==================== 动画配置 ==================== */

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.42, ease: [0.16, 1, 0.3, 1] as const } },
};

/* ==================== 主组件 ==================== */

export function Dashboard() {
  const { state, dispatch } = useStore();
  const { profile, dietHistory, weightHistory, checkIns } = state;
  const today = format(new Date(), 'yyyy-MM-dd');
  const [showNotifBadge] = useState(true);
  // 打卡弹窗
  const [showCheckIn, setShowCheckIn] = useState(false);

  /* ---------- 空状态保护 ---------- */
  if (!profile) {
    return (
      <div className="min-h-[100dvh] gradient-bg flex items-center justify-center">
        <EmptyState
          icon="📋"
          title="欢迎使用 SlimFit"
          subtitle="请先完成个人资料设置"
        />
      </div>
    );
  }

  /* ---------- 数据计算 ---------- */
  const todayDiet      = dietHistory.find(d => d.date === today);
  const caloriesIn     = todayDiet?.totalCalories ?? 0;
  const calorieGoal    = profile.dailyCalorieGoal || 2000;
  const calorieLeft    = Math.max(0, calorieGoal - caloriesIn);
  const caloriePct    = Math.min(100, Math.round((caloriesIn / calorieGoal) * 100));
  const waterMl        = todayDiet?.waterIntake ?? 0;
  const waterPct       = Math.min(100, Math.round((waterMl / 2000) * 100));
  const startWeight    = weightHistory[0]?.weight ?? profile.currentWeight ?? 70;
  const lostWeight     = Math.max(0, startWeight - (profile.currentWeight ?? startWeight));
  const toGoWeight     = Math.max(0, (profile.currentWeight ?? startWeight) - profile.goalWeight);

  /* ---------- 打卡相关 ---------- */
  const todayChecked = !!checkIns.find(c => c.date === today && c.completed);
  const streakDays = (() => {
    let count = 0;
    let d = new Date();
    while (true) {
      const ds = format(d, 'yyyy-MM-dd');
      if (checkIns.find(c => c.date === ds && c.completed)) { count++; d = subDays(d, 1); }
      else break;
    }
    return count;
  })();

  /* ---------- 热力图 35 天 ---------- */
  const heatmap = Array.from({ length: 35 }, (_, i) => {
    const d = subDays(new Date(), 34 - i);
    const ds = format(d, 'yyyy-MM-dd');
    const rec = checkIns.find(c => c.date === ds);
    return { d, ds, ok: rec?.completed ?? false, isToday: isSameDay(d, new Date()) };
  });

  /* ---------- 问候语 ---------- */
  const greeting = () => {
    const h = new Date().getHours();
    if (h < 6)  return '夜深了 🌙';
    if (h < 11) return '早上好 ☀️';
    if (h < 14) return '中午好 🌤️';
    if (h < 18) return '下午好 🌿';
    return '晚上好 🌙';
  };

  /* ---------- 迷你柱状图 ---------- */
  const last8 = weightHistory.slice(-8);
  const wMax = Math.max(...last8.map(w => w.weight));
  const wMin = Math.min(...last8.map(w => w.weight));
  const wRange = wMax - wMin || 1;

  return (
    <div className="min-h-[100dvh] gradient-bg pb-28">

      {/* ======= 顶部 Header ======= */}
      <div className="sticky top-0 z-40 safe-top">
        <div
          className="px-5 py-4 flex items-center justify-between"
          style={{
            background: 'rgba(255,255,255,0.82)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderBottom: '1px solid rgba(255,255,255,0.65)',
            boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
          }}
        >
          <div>
            <p className="text-[11px] text-gray-400 font-semibold tracking-wide uppercase">
              {format(new Date(), 'M月d日 · EEEE', { locale: zhCN })}
            </p>
            <h1 className="text-[19px] font-bold text-gray-800 tracking-tight mt-0.5">
              {greeting()}，{profile.name}
            </h1>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-soft relative"
          >
            <Bell size={18} className="text-gray-500" strokeWidth={1.8} />
            {showNotifBadge && profile.reminderEnabled && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-peach-400" />
            )}
          </motion.button>
        </div>
      </div>

      {/* ======= 主内容区 ======= */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="px-4 pt-5 space-y-4"
      >

        {/* ---- 卡路里主卡片 ---- */}
        <motion.div variants={itemVariants}>
          <div className="glass-card rounded-4xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="section-title">今日卡路里</h2>
                <p className="section-subtitle mt-0.5">目标 {calorieGoal} kcal</p>
              </div>
              <div className="w-9 h-9 rounded-2xl bg-peach-100 flex items-center justify-center">
                <Flame size={17} className="text-peach-500" strokeWidth={2} />
              </div>
            </div>

            <div className="flex items-center gap-5">
              {/* 进度环 */}
              <ProgressRing
                progress={caloriePct}
                size={108}
                strokeWidth={10}
                color="#ff9a7c"
                bgColor="rgba(255,154,124,0.12)"
              >
                <div className="text-center">
                  <div className="text-[22px] font-bold text-gray-800 tracking-tight leading-none">{caloriesIn}</div>
                  <div className="text-[10px] text-gray-400 font-medium mt-0.5">kcal 已摄入</div>
                </div>
              </ProgressRing>

              {/* 三条进度条 */}
              <div className="flex-1 space-y-3 min-w-0">
                {/* 已摄入 */}
                <div>
                  <div className="flex justify-between text-[12px] mb-1.5">
                    <span className="text-gray-500 font-medium">已摄入</span>
                    <span className="font-bold text-peach-500">{caloriesIn} kcal</span>
                  </div>
                  <div className="progress-bar">
                    <motion.div
                      className="progress-fill gradient-peach"
                      initial={{ width: 0 }}
                      animate={{ width: `${caloriePct}%` }}
                      transition={{ delay: 0.3, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                </div>
                {/* 剩余 */}
                <div>
                  <div className="flex justify-between text-[12px] mb-1.5">
                    <span className="text-gray-500 font-medium">剩余</span>
                    <span className="font-bold text-lavender-500">{calorieLeft} kcal</span>
                  </div>
                  <div className="progress-bar">
                    <motion.div
                      className="progress-fill gradient-lavender"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(0, 100 - caloriePct)}%` }}
                      transition={{ delay: 0.4, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                </div>
                {/* 饮水 */}
                <div>
                  <div className="flex justify-between text-[12px] mb-1.5">
                    <span className="text-gray-500 font-medium flex items-center gap-1">
                      <Droplets size={11} className="text-sky-400" />水分
                    </span>
                    <span className="font-bold text-sky-500">{waterMl} ml</span>
                  </div>
                  <div className="progress-bar">
                    <motion.div
                      className="progress-fill gradient-sky"
                      initial={{ width: 0 }}
                      animate={{ width: `${waterPct}%` }}
                      transition={{ delay: 0.5, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 宏量素快览 */}
            {todayDiet && todayDiet.meals.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-4 pt-4 border-t border-gray-50 grid grid-cols-3 gap-2"
              >
                {[
                  { label: '蛋白质', value: todayDiet.meals.reduce((s, m) => s + m.protein, 0).toFixed(0), unit: 'g', color: 'text-peach-500' },
                  { label: '碳水',   value: todayDiet.meals.reduce((s, m) => s + m.carbs,   0).toFixed(0), unit: 'g', color: 'text-lavender-500' },
                  { label: '脂肪',   value: todayDiet.meals.reduce((s, m) => s + m.fat,     0).toFixed(0), unit: 'g', color: 'text-mint-600' },
                ].map(item => (
                  <div key={item.label} className="text-center rounded-2xl py-2 bg-gray-50/70">
                    <div className={clsx('text-sm font-bold', item.color)}>{item.value}<span className="text-xs font-medium text-gray-400">{item.unit}</span></div>
                    <div className="text-[11px] text-gray-400 mt-0.5">{item.label}</div>
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* ---- 统计卡片行 ---- */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
          {/* 已减重 */}
          <div className="bg-mint-100 rounded-3xl p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <TrendingDown size={14} className="text-mint-500" strokeWidth={2} />
              <span className="text-[11px] font-semibold text-gray-500">已减重</span>
            </div>
            <div className="flex items-end gap-1">
              <span className="text-2xl font-bold text-mint-600 tracking-tight">{lostWeight.toFixed(1)}</span>
              <span className="text-xs text-gray-400 mb-0.5">kg</span>
            </div>
            <p className="text-[11px] text-mint-500 font-semibold mt-1">继续保持 💪</p>
          </div>
          {/* 距目标 */}
          <div className="bg-lavender-100 rounded-3xl p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Zap size={14} className="text-lavender-500" strokeWidth={2} />
              <span className="text-[11px] font-semibold text-gray-500">距目标</span>
            </div>
            <div className="flex items-end gap-1">
              <span className="text-2xl font-bold text-lavender-600 tracking-tight">{toGoWeight.toFixed(1)}</span>
              <span className="text-xs text-gray-400 mb-0.5">kg</span>
            </div>
            <p className="text-[11px] text-lavender-500 font-semibold mt-1">目标 {profile.goalWeight} kg</p>
          </div>
        </motion.div>

        {/* ---- 打卡热力日历 ---- */}
        <motion.div variants={itemVariants}>
          <div className="glass-card rounded-4xl p-5">
            {/* 标题行 */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="section-title">打卡日历</h2>
                <p className="section-subtitle mt-0.5">
                  连续{' '}
                  <span className="text-peach-500 font-bold">{streakDays}</span>
                  {' '}天坚持 {streakDays >= 7 ? '🔥' : ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {todayChecked ? (
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-mint-600 bg-mint-100 px-3 py-1.5 rounded-full">
                    <CheckCircle2 size={13} strokeWidth={2.5} />
                    今日已打卡
                  </span>
                ) : (
                  <motion.button
                    whileTap={{ scale: 0.93 }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowCheckIn(true);
                    }}
                    className="btn-primary text-xs py-2 px-4"
                  >
                    <CheckCircle2 size={13} strokeWidth={2.5} />
                    打卡
                  </motion.button>
                )}
              </div>
            </div>

            {/* 7×5 热力图 */}
            <div className="grid grid-cols-7 gap-1.5">
              {['一','二','三','四','五','六','日'].map(d => (
                <div key={d} className="text-center text-[10px] text-gray-400 font-semibold pb-1">{d}</div>
              ))}
              {heatmap.map(({ d, ok, isToday }, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.007, duration: 0.22 }}
                  className={clsx(
                    'cal-cell',
                    ok && isToday  ? 'cal-cell-filled ring-2 ring-peach-300 ring-offset-1' :
                    ok             ? 'cal-cell-past' :
                    isToday        ? 'cal-cell-today' :
                                     'cal-cell-empty'
                  )}
                >
                  {format(d, 'd')}
                </motion.div>
              ))}
            </div>

            {/* 连续打卡勋章 */}
            {streakDays >= 3 && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex items-center gap-2.5 bg-peach-50 rounded-2xl px-4 py-2.5"
              >
                <Award size={16} className="text-peach-500 flex-shrink-0" />
                <p className="text-[12px] font-semibold text-peach-600">
                  连续打卡 {streakDays} 天！{streakDays >= 30 ? '月度达人🏆' : streakDays >= 14 ? '两周挑战达人🥈' : streakDays >= 7 ? '周挑战达人🥇' : '继续坚持🌿'}
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* ---- 今日饮食摘要 ---- */}
        <motion.div variants={itemVariants}>
          <div className="glass-card rounded-4xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="section-title">今日饮食</h2>
              <button
                onClick={() => dispatch({ type: 'SET_TAB', tab: 'diet' })}
                className="flex items-center gap-1 text-[12px] text-peach-500 font-semibold"
              >
                查看详情 <ChevronRight size={12} strokeWidth={2.5} />
              </button>
            </div>
            {todayDiet?.meals && todayDiet.meals.length > 0 ? (
              <div className="space-y-1">
                {todayDiet.meals.slice(0, 4).map(food => (
                  <div
                    key={food.id}
                    className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-2xl bg-peach-50 flex items-center justify-center text-base">
                        {food.mealType === 'breakfast' ? '🌅' :
                         food.mealType === 'lunch'     ? '☀️' :
                         food.mealType === 'dinner'    ? '🌙' : '🍎'}
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-gray-700">{food.name}</p>
                        <p className="text-[11px] text-gray-400">{food.amount}g · 蛋白 {food.protein}g</p>
                      </div>
                    </div>
                    <span className="text-[13px] font-bold text-peach-500">{food.calories}</span>
                  </div>
                ))}
                {todayDiet.meals.length > 4 && (
                  <p className="text-[11px] text-center text-gray-400 pt-1">
                    还有 {todayDiet.meals.length - 4} 条记录
                  </p>
                )}
              </div>
            ) : (
              <div className="py-6 text-center">
                <p className="text-sm text-gray-400 font-medium">今天还没有记录饮食</p>
                <p className="text-xs text-gray-300 mt-1">切换到「饮食」Tab 记录</p>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
        <div className="glass-card rounded-4xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="section-title">体重趋势</h2>
              <button
                onClick={() => dispatch({ type: 'SET_TAB', tab: 'body' })}
                className="flex items-center gap-1 text-[12px] text-lavender-500 font-semibold"
              >
                <TrendingDown size={12} strokeWidth={2.5} />
                详情 <ChevronRight size={12} strokeWidth={2.5} />
              </button>
            </div>
            <div className="flex items-center gap-5">
              <div className="flex-1">
                <div className="text-[32px] font-bold text-gray-800 tracking-tight leading-none">
                  {profile.currentWeight}
                  <span className="text-base text-gray-400 font-medium ml-1.5">kg</span>
                </div>
                <div className="text-[12px] text-mint-600 font-semibold mt-1.5">
                  ↓ 已减 {lostWeight.toFixed(1)} kg · 还差 {toGoWeight.toFixed(1)} kg
                </div>
              </div>
              {/* 迷你柱状图 */}
              <div className="flex items-end gap-1.5 h-14">
                {last8.map((w, i, arr) => {
                  const h = Math.round(((w.weight - wMin) / wRange) * 36) + 6;
                  return (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: h }}
                      transition={{ delay: i * 0.04, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className={clsx(
                        'w-3.5 rounded-t-xl',
                        i === arr.length - 1 ? 'bg-peach-400' : 'bg-lavender-200'
                      )}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>

      </motion.div>

      {/* 打卡弹窗 */}
      <AnimatePresence>
        {showCheckIn && (
          <CheckInModal
            onClose={() => setShowCheckIn(false)}
            onConfirm={() => dispatch({ type: 'CHECKIN', date: today })}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
