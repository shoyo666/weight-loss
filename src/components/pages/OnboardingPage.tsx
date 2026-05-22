/**
 * SlimFit v3.0 - 初始信息编辑页面（Onboarding）
 *
 * 新用户注册后首次登录时展示，引导填写初始信息。
 * 支持：性别、身高、当前体重、目标体重、理想体型参数、活动水平
 *
 * 升级内容：
 * - 更精致的步骤卡片设计
 * - 新增理想体型（腰围目标）选择
 * - 新增活动水平选择
 * - 美化的进度指示器
 * - 流畅的步骤切换动画
 *
 * @since 2026-04-22 v3.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store';
import { UserProfile } from '../../types';
import { ArrowRight, ArrowLeft, Check, Ruler, Weight, Target, Sparkles, Zap, Heart } from 'lucide-react';
import clsx from 'clsx';

/* ==================== 工具函数 ==================== */

const calcBMI = (weight: number, height: number) =>
  +(weight / Math.pow(height / 100, 2)).toFixed(1);

const calcIdealWeight = (height: number, gender: 'male' | 'female' | 'other') => {
  // Lorentz 公式估算
  const base = gender === 'male' ? 50 + 0.75 * (height - 150) : 45.5 + 0.67 * (height - 150);
  return Math.round(base);
};

/* ==================== 活动水平选项 ==================== */

const activityOptions = [
  { value: 'sedentary'  as const, label: '久坐不动', desc: '办公室工作，几乎不运动', emoji: '💻', multiplier: '×1.2' },
  { value: 'light'      as const, label: '轻度活动', desc: '每周运动 1-3 次', emoji: '🚶', multiplier: '×1.375' },
  { value: 'moderate'   as const, label: '中度活动', desc: '每周运动 3-5 次', emoji: '🚴', multiplier: '×1.55' },
  { value: 'active'     as const, label: '积极运动', desc: '每周运动 6-7 次', emoji: '🏊', multiplier: '×1.725' },
  { value: 'very_active'as const, label: '高强度运动', desc: '每日高强度训练', emoji: '🏋️', multiplier: '×1.9' },
];

/* ==================== 步骤动画 ==================== */

const stepVariants = {
  enter:  (dir: number) => ({ opacity: 0, x: dir > 0 ?  40 : -40 }),
  center: { opacity: 1, x: 0 },
  exit:   (dir: number) => ({ opacity: 0, x: dir > 0 ? -40 :  40 }),
};

const stepTransition = { duration: 0.32, ease: [0.16, 1, 0.3, 1] as const };

/* ==================== 组件 ==================== */

export function OnboardingPage() {
  const { state, dispatch } = useStore();

  /* -- 表单状态 -- */
  const [step, setStep]               = useState(0);
  const [direction, setDirection]     = useState(1);
  const [gender, setGender]           = useState<'male' | 'female' | 'other'>('female');
  const [height, setHeight]           = useState(163);
  const [currentWeight, setCurrentWeight] = useState(58);
  const [goalWeight, setGoalWeight]   = useState(52);
  const [activityLevel, setActivity]  = useState<UserProfile['activityLevel']>('light');
  const [idealWaist, setIdealWaist]   = useState(65);  // 理想腰围 cm

  /* -- 计算值 -- */
  const bmi = calcBMI(currentWeight, height);
  const idealW = calcIdealWeight(height, gender);
  const toLose = (currentWeight - goalWeight).toFixed(1);
  // 基础代谢 BMR
  const bmr = gender === 'male'
    ? Math.round(10 * currentWeight + 6.25 * height - 5 * 23 + 5)
    : Math.round(10 * currentWeight + 6.25 * height - 5 * 23 - 161);
  const tdeeMultipliers: Record<string, number> = {
    sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9
  };
  const dailyGoal = Math.round(bmr * (tdeeMultipliers[activityLevel] || 1.375) - 300);

  /* -- 步骤导航 -- */
  const totalSteps = 5;
  const goNext = () => { setDirection(1);  setStep(s => Math.min(s + 1, totalSteps - 1)); };
  const goPrev = () => { setDirection(-1); setStep(s => Math.max(s - 1, 0)); };

  /* -- 保存信息 -- */
  const handleComplete = () => {
    const profile: UserProfile = {
      name:           state.currentUser?.nickname || '新用户',
      avatar:         '',
      age:            23,
      gender,
      height,
      currentWeight,
      goalWeight,
      activityLevel,
      dailyCalorieGoal: dailyGoal,
      reminderEnabled: true,
      reminderTime:   '08:00',
    };
    dispatch({ type: 'COMPLETE_PROFILE', profile });
  };

  /* ======= 步骤内容 ======= */

  const stepContent = [

    /* Step 0 - 性别 */
    <div key="gender" className="space-y-6">
      <div className="text-center">
        <div className="w-14 h-14 rounded-4xl bg-peach-100 mx-auto mb-3 flex items-center justify-center">
          <Heart size={24} className="text-peach-500" strokeWidth={1.8} />
        </div>
        <h2 className="text-xl font-bold text-gray-800 tracking-tight">选择你的性别</h2>
        <p className="text-sm text-gray-400 mt-1.5">用于更精准地计算热量需求</p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {([
          { v: 'female' as const, label: '女性', icon: '♀' },
          { v: 'male'   as const, label: '男性', icon: '♂' },
          { v: 'other'  as const, label: '其他',  icon: '✨' },
        ]).map(opt => (
          <motion.button
            key={opt.v}
            whileTap={{ scale: 0.92 }}
            onClick={() => setGender(opt.v)}
            className={clsx(
              'flex flex-col items-center gap-2 p-5 rounded-3xl border-2 transition-all duration-200',
              gender === opt.v
                ? 'border-peach-300 bg-peach-50 shadow-soft'
                : 'border-transparent bg-white/60'
            )}
          >
            <span className="text-3xl">{opt.icon}</span>
            <span className={clsx('text-sm font-bold', gender === opt.v ? 'text-peach-600' : 'text-gray-400')}>
              {opt.label}
            </span>
            <AnimatePresence>
              {gender === opt.v && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="w-5 h-5 rounded-full gradient-peach flex items-center justify-center"
                >
                  <Check size={11} className="text-white" strokeWidth={3} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        ))}
      </div>
    </div>,

    /* Step 1 - 身高 */
    <div key="height" className="space-y-6">
      <div className="text-center">
        <div className="w-14 h-14 rounded-4xl bg-mint-100 mx-auto mb-3 flex items-center justify-center">
          <Ruler size={24} className="text-mint-500" strokeWidth={1.8} />
        </div>
        <h2 className="text-xl font-bold text-gray-800 tracking-tight">你的身高</h2>
        <p className="text-sm text-gray-400 mt-1.5">滑动调整或直接输入</p>
      </div>
      <div className="text-center">
        <div className="flex items-end justify-center gap-2">
          <span className="text-5xl font-bold text-gray-800 tracking-tight">{height}</span>
          <span className="text-xl text-gray-400 font-medium mb-1">cm</span>
        </div>
        <p className="text-xs text-mint-500 font-medium mt-1">
          理想体重参考：{idealW} kg
        </p>
      </div>
      <input
        type="range" min={140} max={200} step={1}
        value={height}
        onChange={e => setHeight(+e.target.value)}
        className="w-full range-mint cursor-pointer"
        style={{ accentColor: '#4ade80' }}
      />
      <div className="flex justify-between text-xs text-gray-400 font-medium">
        <span>140 cm</span><span>200 cm</span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {[155, 160, 163, 165, 168, 170, 175, 180].map(h => (
          <button
            key={h}
            onClick={() => setHeight(h)}
            className={clsx(
              'py-2.5 rounded-2xl text-sm font-bold transition-all',
              height === h ? 'gradient-mint text-white shadow-soft' : 'bg-mint-50 text-mint-600'
            )}
          >
            {h}
          </button>
        ))}
      </div>
    </div>,

    /* Step 2 - 当前体重 */
    <div key="weight" className="space-y-5">
      <div className="text-center">
        <div className="w-14 h-14 rounded-4xl bg-lavender-100 mx-auto mb-3 flex items-center justify-center">
          <Weight size={24} className="text-lavender-500" strokeWidth={1.8} />
        </div>
        <h2 className="text-xl font-bold text-gray-800 tracking-tight">当前体重</h2>
        <p className="text-sm text-gray-400 mt-1.5">
          BMI <span className="font-bold text-lavender-500">{bmi}</span>
          {' · '}
          {bmi < 18.5 ? '偏瘦' : bmi < 24 ? '正常' : bmi < 28 ? '偏重' : '肥胖'}
        </p>
      </div>
      <div className="text-center">
        <div className="inline-flex items-end gap-2">
          <input
            type="number" step="0.5" min={20} max={300}
            value={currentWeight}
            onChange={e => setCurrentWeight(parseFloat(e.target.value) || 40)}
            className="text-5xl font-bold text-gray-800 bg-transparent border-0 outline-none text-center w-36"
          />
          <span className="text-xl text-gray-400 font-medium mb-1">kg</span>
        </div>
      </div>
      <div className="flex gap-2 flex-wrap justify-center">
        {[45, 50, 55, 60, 65, 70, 75, 80, 90, 100].map(w => (
          <button
            key={w}
            onClick={() => setCurrentWeight(w)}
            className={clsx(
              'px-3 py-2 rounded-2xl text-sm font-bold transition-all',
              currentWeight === w ? 'gradient-lavender text-white shadow-soft' : 'bg-lavender-50 text-lavender-500'
            )}
          >
            {w}
          </button>
        ))}
      </div>
    </div>,

    /* Step 3 - 目标体重 + 理想腰围 */
    <div key="goal" className="space-y-5">
      <div className="text-center">
        <div className="w-14 h-14 rounded-4xl bg-peach-100 mx-auto mb-3 flex items-center justify-center">
          <Target size={24} className="text-peach-500" strokeWidth={1.8} />
        </div>
        <h2 className="text-xl font-bold text-gray-800 tracking-tight">目标体重</h2>
        <p className="text-sm text-gray-400 mt-1.5">
          还差 <span className="font-bold text-peach-500">{toLose} kg</span>
        </p>
      </div>
      <div className="text-center">
        <div className="inline-flex items-end gap-2">
          <input
            type="number" step="0.5" min={35} max={currentWeight - 0.5}
            value={goalWeight}
            onChange={e => setGoalWeight(parseFloat(e.target.value) || 40)}
            className="text-5xl font-bold text-gray-800 bg-transparent border-0 outline-none text-center w-36"
          />
          <span className="text-xl text-gray-400 font-medium mb-1">kg</span>
        </div>
      </div>
      <input
        type="range" min={35} max={currentWeight - 0.5} step={0.5}
        value={goalWeight}
        onChange={e => setGoalWeight(+e.target.value)}
        className="w-full cursor-pointer"
        style={{ accentColor: '#ff9a7c' }}
      />
      {/* 理想腰围 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-gray-600">理想腰围目标</label>
          <span className="text-sm font-bold text-sky-500">{idealWaist} cm</span>
        </div>
        <input
          type="range" min={55} max={100} step={1}
          value={idealWaist}
          onChange={e => setIdealWaist(+e.target.value)}
          className="w-full cursor-pointer range-sky"
          style={{ accentColor: '#38bdf8' }}
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>55 cm</span><span>100 cm</span>
        </div>
      </div>
      {/* 预估卡片 */}
      <div className="rounded-3xl p-4" style={{ background: 'linear-gradient(135deg, #fff7f5, #f5f3ff)' }}>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            { label: '需减重',  value: `${toLose} kg`,     color: 'text-peach-500' },
            { label: '当前 BMI', value: `${bmi}`,           color: 'text-lavender-500' },
            { label: '预计周期', value: `~${Math.ceil(parseFloat(toLose) / 0.5)} 周`, color: 'text-mint-600' },
            { label: '腰围目标', value: `${idealWaist} cm`, color: 'text-sky-500' },
          ].map(item => (
            <div key={item.label} className="flex justify-between">
              <span className="text-gray-400">{item.label}</span>
              <span className={clsx('font-bold', item.color)}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>,

    /* Step 4 - 活动水平 */
    <div key="activity" className="space-y-5">
      <div className="text-center">
        <div className="w-14 h-14 rounded-4xl bg-sky-100 mx-auto mb-3 flex items-center justify-center">
          <Zap size={24} className="text-sky-500" strokeWidth={1.8} />
        </div>
        <h2 className="text-xl font-bold text-gray-800 tracking-tight">日常活动水平</h2>
        <p className="text-sm text-gray-400 mt-1.5">用于计算每日消耗热量</p>
      </div>
      <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-hide">
        {activityOptions.map(opt => (
          <motion.button
            key={opt.value}
            whileTap={{ scale: 0.97 }}
            onClick={() => setActivity(opt.value)}
            className={clsx(
              'w-full flex items-center gap-3 p-3.5 rounded-3xl border-2 text-left transition-all',
              activityLevel === opt.value
                ? 'border-sky-300 bg-sky-50 shadow-soft'
                : 'border-transparent bg-white/70'
            )}
          >
            <span className="text-2xl flex-shrink-0">{opt.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className={clsx('font-bold text-sm', activityLevel === opt.value ? 'text-sky-600' : 'text-gray-600')}>
                {opt.label}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
            </div>
            <span className="text-xs font-bold text-gray-400 flex-shrink-0">{opt.multiplier}</span>
            <AnimatePresence>
              {activityLevel === opt.value && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="w-5 h-5 rounded-full bg-sky-500 flex items-center justify-center flex-shrink-0"
                >
                  <Check size={11} className="text-white" strokeWidth={3} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        ))}
      </div>
      {/* 建议热量 */}
      <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
        <Sparkles size={18} className="text-sky-400 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-gray-700">AI 建议每日热量目标</p>
          <p className="text-xl font-bold text-sky-500">{dailyGoal} <span className="text-sm font-medium text-gray-400">kcal</span></p>
        </div>
      </div>
    </div>,
  ];

  return (
    <div
      className="min-h-[100dvh] flex items-center justify-center px-5 relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #fff7f5 0%, #fef8ff 40%, #f0fdf6 100%)' }}
    >
      {/* 背景装饰 */}
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-14 left-5 w-24 h-24 rounded-full pointer-events-none"
        style={{ background: 'rgba(255,176,154,0.28)', filter: 'blur(16px)' }}
      />
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute bottom-24 right-6 w-28 h-28 rounded-full pointer-events-none"
        style={{ background: 'rgba(196,181,253,0.25)', filter: 'blur(18px)' }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm relative z-10"
      >
        {/* 步骤进度指示器 */}
        <div className="flex items-center gap-2 mb-7">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <motion.div
              key={i}
              animate={{
                width: i === step ? 32 : 10,
                background: i < step ? '#ff9a7c' : i === step ? '#ff7a59' : '#e5e7eb',
              }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="h-2 rounded-full"
              style={{ minWidth: 10 }}
            />
          ))}
          <span className="text-xs text-gray-400 font-semibold ml-1">{step + 1}/{totalSteps}</span>
        </div>

        {/* 内容卡片 */}
        <div className="glass-card-xl rounded-4xl overflow-hidden" style={{ minHeight: 420 }}>
          <div className="p-6">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={stepTransition}
              >
                {stepContent[step]}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* 导航按钮 */}
          <div className="px-6 pb-6 flex gap-3">
            {step > 0 && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={goPrev}
                className="btn-secondary flex-shrink-0 px-4 py-3.5"
              >
                <ArrowLeft size={16} strokeWidth={2} />
              </motion.button>
            )}
            {step < totalSteps - 1 ? (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={goNext}
                className="btn-primary flex-1 justify-center"
              >
                下一步
                <ArrowRight size={15} strokeWidth={2.2} />
              </motion.button>
            ) : (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleComplete}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-3xl font-semibold text-white"
                style={{
                  background: 'linear-gradient(135deg, #86efac, #22c55e)',
                  boxShadow: '0 4px 20px rgba(34, 197, 94, 0.28)',
                }}
              >
                <Sparkles size={15} strokeWidth={2} />
                开始我的旅程
                <ArrowRight size={15} strokeWidth={2.2} />
              </motion.button>
            )}
          </div>
        </div>

        {/* 跳过 */}
        {step === 0 && (
          <button
            onClick={handleComplete}
            className="w-full text-center text-sm text-gray-300 mt-4 hover:text-gray-500 transition-colors"
          >
            跳过，稍后再填 →
          </button>
        )}
      </motion.div>
    </div>
  );
}
