/**
 * SlimFit v3.0 - AI 健身计划页面（周课程表升级版）
 *
 * 全新功能：
 * - 双模式：单次训练计划 / 周课程表
 * - 周课程表：精确选择周一~周日 + 4个时间段
 * - AI 为每个时段生成专属训练内容
 * - 可视化周课程卡片（3×N 网格）
 * - 单个时段完成打卡
 * - 历史训练折叠展示
 *
 * @since 2026-04-22 v3.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store';
import { generateWorkoutPlan, generateWeeklySchedule } from '../../data/mockData';
import { WorkoutPlan, WeeklySlotPlan, WEEKDAY_LABELS, TIME_SLOT_CONFIG, TimeSlot, WeekDay } from '../../types';
import { format } from 'date-fns';
import {
  Sparkles, Dumbbell, Home, Building2,
  Clock, Flame, Check, ChevronDown, ChevronUp,
  CalendarDays, LayoutGrid, Zap, Trophy,
  Play, Lock, Plus, Edit3, Trash2, X, PenLine,
} from 'lucide-react';
import clsx from 'clsx';

/* ==================== 常量配置 ==================== */

const modeOptions = [
  { value: 'gym',  label: '健身房', icon: Dumbbell,  color: 'peach',    desc: '完整器械' },
  { value: 'home', label: '家庭',   icon: Home,      color: 'mint',     desc: '无器械'   },
  { value: 'dorm', label: '宿舍',   icon: Building2, color: 'lavender', desc: '小空间'   },
] as const;

const goalOptions = [
  { value: 'fat_loss',    label: '减脂燃脂', emoji: '🔥' },
  { value: 'muscle_gain', label: '增肌塑形', emoji: '💪' },
  { value: 'maintain',    label: '维持体型', emoji: '⚖️' },
  { value: 'cardio',      label: '有氧耐力', emoji: '🏃' },
] as const;

const difficultyConfig = {
  easy:   { label: '轻松', className: 'text-mint-600 bg-mint-100'       },
  medium: { label: '中等', className: 'text-amber-600 bg-amber-100'      },
  hard:   { label: '困难', className: 'text-peach-500 bg-peach-100'      },
};

/** 时间段颜色配置 */
const timeSlotColors: Record<TimeSlot, {
  bg: string; text: string; border: string; light: string; dot: string
}> = {
  morning_early: { bg: 'bg-amber-100',    text: 'text-amber-600',    border: 'border-amber-300',    light: 'bg-amber-50',    dot: 'bg-amber-400'    },
  morning:       { bg: 'bg-peach-100',    text: 'text-peach-600',    border: 'border-peach-300',    light: 'bg-peach-50',    dot: 'bg-peach-400'    },
  afternoon:     { bg: 'bg-sky-100',      text: 'text-sky-600',      border: 'border-sky-300',      light: 'bg-sky-50',      dot: 'bg-sky-400'      },
  evening:       { bg: 'bg-lavender-100', text: 'text-lavender-600', border: 'border-lavender-300', light: 'bg-lavender-50', dot: 'bg-lavender-400' },
};

/* ==================== 自定义训练项目（手动添加） ==================== */

interface CustomExercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  completed: boolean;
}

const CUSTOM_EX_KEY = 'slimfit_custom_exercises';

function loadCustomExercises(): CustomExercise[] {
  try {
    const saved = localStorage.getItem(CUSTOM_EX_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
}

function saveCustomExercises(items: CustomExercise[]) {
  try { localStorage.setItem(CUSTOM_EX_KEY, JSON.stringify(items)); } catch { /* ignore */ }
}

function CustomTrainingModule() {
  const [items, setItems] = useState<CustomExercise[]>(loadCustomExercises);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', sets: 3, reps: '12' });

  const persist = (newItems: CustomExercise[]) => {
    setItems(newItems);
    saveCustomExercises(newItems);
  };

  /* ---- 添加 ---- */
  const handleAdd = () => {
    if (!form.name.trim()) return;
    const item: CustomExercise = {
      id: `ce-${Date.now()}`,
      name: form.name.trim(),
      sets: form.sets,
      reps: form.reps,
      completed: false,
    };
    persist([...items, item]);
    setForm({ name: '', sets: 3, reps: '12' });
    setShowAdd(false);
  };

  /* ---- 编辑 ---- */
  const startEdit = (ex: CustomExercise) => {
    setEditId(ex.id);
    setForm({ name: ex.name, sets: ex.sets, reps: ex.reps });
  };
  const saveEdit = () => {
    if (!form.name.trim() || !editId) return;
    persist(items.map(i => i.id === editId ? { ...i, name: form.name.trim(), sets: form.sets, reps: form.reps } : i));
    setEditId(null);
    setForm({ name: '', sets: 3, reps: '12' });
  };
  const cancelEdit = () => {
    setEditId(null);
    setForm({ name: '', sets: 3, reps: '12' });
  };

  /* ---- 删除 ---- */
  const handleDelete = (id: string) => persist(items.filter(i => i.id !== id));

  /* ---- 完成切换 ---- */
  const toggleComplete = (id: string) => {
    persist(items.map(i => i.id === id ? { ...i, completed: !i.completed } : i));
  };

  const completedCount = items.filter(i => i.completed).length;

  return (
    <div className="glass-card rounded-3xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <PenLine size={16} className="text-lavender-400" />
          <h2 className="font-bold text-gray-800">自定义训练</h2>
          {items.length > 0 && (
            <span className="text-xs text-gray-400">{completedCount}/{items.length} 完成</span>
          )}
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowAdd(prev => !prev)}
          className={clsx(
            'w-8 h-8 rounded-xl flex items-center justify-center transition-colors',
            showAdd ? 'bg-gray-200' : 'bg-lavender-100 hover:bg-lavender-200'
          )}
        >
          <Plus size={14} className={showAdd ? 'text-gray-500' : 'text-lavender-600'} />
        </motion.button>
      </div>

      {/* 添加/编辑表单 */}
      <AnimatePresence>
        {(showAdd || editId) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mb-4 p-4 bg-lavender-50/50 rounded-2xl space-y-3">
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="动作名称，如：俯卧撑"
                className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:border-lavender-300 focus:ring-2 focus:ring-lavender-100"
                autoFocus
                onKeyDown={e => { if (e.key === 'Enter') editId ? saveEdit() : handleAdd(); }}
              />
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-[10px] text-gray-400 font-semibold mb-1 block">组数</label>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(n => (
                      <button
                        key={n}
                        onClick={() => setForm(f => ({ ...f, sets: n }))}
                        className={clsx(
                          'flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors',
                          form.sets === n ? 'bg-lavender-200 text-lavender-700' : 'bg-white text-gray-400 hover:bg-gray-100'
                        )}
                      >{n}</button>
                    ))}
                  </div>
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-gray-400 font-semibold mb-1 block">每组次数/时长</label>
                  <input
                    type="text"
                    value={form.reps}
                    onChange={e => setForm(f => ({ ...f, reps: e.target.value }))}
                    placeholder="如: 12 或 30s"
                    className="w-full px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs text-gray-700 placeholder-gray-300 focus:outline-none focus:border-lavender-300"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={editId ? saveEdit : handleAdd}
                  disabled={!form.name.trim()}
                  className={clsx(
                    'flex-1 py-2 rounded-xl text-sm font-semibold transition-all',
                    form.name.trim()
                      ? 'bg-lavender-400 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-300'
                  )}
                >
                  {editId ? '保存修改' : '添加'}
                </motion.button>
                {editId && (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={cancelEdit}
                    className="px-4 py-2 rounded-xl bg-gray-100 text-gray-500 text-sm font-semibold"
                  >
                    取消
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 项目列表 */}
      {items.length === 0 && !showAdd ? (
        <p className="text-xs text-gray-400 text-center py-4">点击 + 手动添加训练项目</p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {items.map(ex => (
            <div
              key={ex.id}
              className={clsx(
                'flex items-center gap-2.5 p-3 rounded-2xl transition-all',
                ex.completed ? 'bg-mint-50/70' : 'bg-gray-50'
              )}
            >
              {/* 完成勾选 */}
              <motion.button
                whileTap={{ scale: 0.8 }}
                onClick={() => toggleComplete(ex.id)}
                className={clsx(
                  'w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-all',
                  ex.completed ? 'bg-mint-400' : 'bg-white border-2 border-gray-200'
                )}
              >
                {ex.completed && <Check size={12} className="text-white" strokeWidth={3} />}
              </motion.button>
              {/* 信息 */}
              <div className="flex-1 min-w-0">
                <p className={clsx('text-sm font-semibold truncate', ex.completed && 'line-through text-gray-400')}>
                  {ex.name}
                </p>
                <p className="text-xs text-gray-400">{ex.sets} 组 × {ex.reps}</p>
              </div>
              {/* 操作 */}
              <div className="flex gap-1">
                <button
                  onClick={() => startEdit(ex)}
                  className="w-7 h-7 rounded-lg bg-white hover:bg-gray-100 flex items-center justify-center transition-colors"
                >
                  <Edit3 size={11} className="text-gray-400" />
                </button>
                <button
                  onClick={() => handleDelete(ex.id)}
                  className="w-7 h-7 rounded-lg bg-white hover:bg-red-50 flex items-center justify-center transition-colors"
                >
                  <Trash2 size={11} className="text-gray-400 hover:text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 完成进度条 */}
      {items.length > 0 && (
        <div className="mt-3">
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-mint-400"
              animate={{ width: `${items.length ? Math.round(completedCount / items.length * 100) : 0}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ==================== 子组件：练习行（支持分组勾画） ==================== */

function ExerciseRow({
  ex, completedSets, totalSets, onToggleSet, expanded, onExpand,
}: {
  ex: any;
  completedSets: number;
  totalSets: number;
  onToggleSet: (setIndex: number) => void;
  expanded: boolean;
  onExpand: () => void;
}) {
  const dc = difficultyConfig[ex.difficulty as keyof typeof difficultyConfig];
  const isAllDone = completedSets >= totalSets;

  return (
    <div>
      <button
        onClick={onExpand}
        className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-gray-50/60 transition-colors"
      >
        {/* 主完成状态按钮 */}
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={e => { e.stopPropagation(); onToggleSet(0); }}
          className={clsx(
            'w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 transition-all',
            isAllDone ? 'gradient-mint' : 'bg-gray-100'
          )}
        >
          {isAllDone ? <Check size={13} className="text-white" strokeWidth={2.5} /> : (
            <span className="text-[10px] font-bold text-gray-400">{completedSets}/{totalSets}</span>
          )}
        </motion.button>
        <div className="flex-1 min-w-0">
          <p className={clsx('text-sm font-semibold', isAllDone ? 'text-gray-400 line-through' : 'text-gray-700')}>
            {ex.name}
          </p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {ex.sets && ex.sets > 1 && <span className="text-xs text-gray-400">{ex.sets}组 × {ex.reps}</span>}
            {ex.duration && !ex.sets && <span className="text-xs text-gray-400">{ex.duration}</span>}
            {ex.rest && ex.rest !== '0' && <span className="text-xs text-gray-400">休息 {ex.rest}</span>}
            <span className={clsx('text-[10px] px-1.5 py-0.5 rounded-full font-semibold', dc.className)}>
              {dc.label}
            </span>
            <span className="text-[10px] text-gray-400">{ex.muscleGroup}</span>
          </div>
          {/* 分组完成圆点指示器 */}
          {totalSets > 1 && (
            <div className="flex items-center gap-1.5 mt-1.5">
              {Array.from({ length: totalSets }).map((_, i) => (
                <motion.button
                  key={i}
                  whileTap={{ scale: 0.8 }}
                  onClick={e => { e.stopPropagation(); onToggleSet(i); }}
                  className={clsx(
                    'w-5 h-5 rounded-full flex items-center justify-center transition-all text-[9px] font-bold',
                    i < completedSets
                      ? 'bg-mint-100 text-mint-600 border border-mint-300'
                      : 'bg-gray-100 text-gray-400 border border-gray-200'
                  )}
                >
                  {i < completedSets ? <Check size={9} strokeWidth={3} /> : i + 1}
                </motion.button>
              ))}
            </div>
          )}
        </div>
        {expanded ? <ChevronUp size={13} className="text-gray-300 flex-shrink-0" /> : <ChevronDown size={13} className="text-gray-300 flex-shrink-0" />}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 pl-14">
              <div className="text-sm text-gray-600 bg-gray-50 rounded-2xl p-3 leading-relaxed whitespace-pre-line">
                {ex.description}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ==================== 子组件：单次计划展示 ==================== */

function SinglePlanView({
  plan,
  onComplete,
}: {
  plan: WorkoutPlan;
  onComplete: () => void;
}) {
  const [expandedEx, setExpandedEx] = useState<string | null>(null);
  // 每个动作的已完成组数: { 动作名: 已完成组数 }
  const [completedSets, setCompletedSets] = useState<Record<string, number>>({});

  const toggleSet = (exName: string, setIndex: number) => {
    setCompletedSets(prev => {
      const ex = allExs.find(e => e.name === exName);
      const total = ex?.sets || 1;
      const current = prev[exName] || 0;
      // 如果点击的是已完成的组号，取消勾选该组及之后的所有组
      if (setIndex < current) {
        return { ...prev, [exName]: setIndex };
      }
      // 否则标记到该组为止全部完成（支持一次勾多组）
      const next = Math.min(setIndex + 1, total);
      return { ...prev, [exName]: next };
    });
  };

  const allExs = [...plan.warmup, ...plan.exercises, ...plan.cooldown];
  const totalSets = allExs.reduce((sum, ex) => sum + (ex.sets || 1), 0);
  const doneSets = allExs.reduce((sum, ex) => sum + (completedSets[ex.name] || 0), 0);
  const isAllDone = totalSets > 0 && doneSets >= totalSets;
  const pct = totalSets ? Math.round(doneSets / totalSets * 100) : 0;

  const sections = [
    { title: '热身',    emoji: '🔆', list: plan.warmup    },
    { title: '正式训练', emoji: '💥', list: plan.exercises  },
    { title: '拉伸放松', emoji: '🧘', list: plan.cooldown   },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      {/* 计划头部 */}
      <div className="glass-card rounded-3xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-gray-800">
              {modeOptions.find(m => m.value === plan.mode)?.label} · {goalOptions.find(g => g.value === plan.goal)?.label}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">{plan.date}</p>
          </div>
          {plan.completed ? (
            <span className="text-xs font-bold text-mint-600 bg-mint-100 px-3 py-1.5 rounded-full flex items-center gap-1">
              <Trophy size={11} /> 已完成
            </span>
          ) : (
            <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full">进行中</span>
          )}
        </div>
        <div className="flex gap-4 mb-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Clock size={12} className="text-peach-400" />
            <span>{plan.freeTimeMinutes} 分钟</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Flame size={12} className="text-peach-400" />
            <span>~{plan.estimatedCalories} kcal</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Dumbbell size={12} className="text-peach-400" />
            <span>{plan.exercises.length} 个动作</span>
          </div>
        </div>
        {/* 完成进度条 */}
        <div>
          <div className="flex justify-between text-xs text-gray-400 mb-1.5">
            <span>完成进度</span>
            <span className="font-semibold text-mint-600">{doneSets} / {totalSets} 组</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full gradient-mint"
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>
      </div>

      {/* 各段练习 */}
      {sections.map(sec => sec.list.length > 0 && (
        <div key={sec.title} className="glass-card rounded-3xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-50 flex items-center gap-2">
            <span className="text-base">{sec.emoji}</span>
            <h3 className="font-bold text-gray-800 text-sm">{sec.title}</h3>
            <span className="text-xs text-gray-400">({sec.list.length})</span>
          </div>
          <div className="divide-y divide-gray-50/80">
            {sec.list.map(ex => (
              <ExerciseRow
                key={ex.name}
                ex={ex}
                completedSets={completedSets[ex.name] || 0}
                totalSets={ex.sets || 1}
                onToggleSet={(setIdx) => toggleSet(ex.name, setIdx)}
                expanded={expandedEx === ex.name}
                onExpand={() => setExpandedEx(expandedEx === ex.name ? null : ex.name)}
              />
            ))}
          </div>
        </div>
      ))}

      {/* 完成按钮 */}
      {!plan.completed && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onComplete}
          disabled={!isAllDone}
          className={clsx(
            'w-full py-4 rounded-3xl font-bold text-base flex items-center justify-center gap-2 transition-all',
            isAllDone ? 'gradient-mint text-white shadow-soft' : 'bg-gray-100 text-gray-400'
          )}
        >
          <Trophy size={17} />
          {isAllDone ? '完成今日训练 🎉' : `还差 ${totalSets - doneSets} 组`}
        </motion.button>
      )}
    </motion.div>
  );
}

/* ==================== 子组件：周课程卡片 ==================== */

function WeeklyScheduleView() {
  const { state, dispatch } = useStore();
  const schedule = state.weeklySchedule;
  const [expandedSlot, setExpandedSlot] = useState<string | null>(null);
  const [expandedEx, setExpandedEx] = useState<string | null>(null);
  // 每个时段每个动作的完成组数: { `${day}-${timeSlot}-${exName}`: 完成数 }
  const [slotCompletedSets, setSlotCompletedSets] = useState<Record<string, number>>({});

  if (!schedule) return null;

  // 按天分组
  const byDay: Record<number, WeeklySlotPlan[]> = {};
  schedule.slots.forEach(slot => {
    if (!byDay[slot.day]) byDay[slot.day] = [];
    byDay[slot.day].push(slot);
  });

  const completedCount = schedule.slots.filter(s => s.completed).length;
  const totalCount = schedule.slots.length;
  const pct = totalCount ? Math.round(completedCount / totalCount * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* 课程表概览卡片 */}
      <div className="glass-card rounded-3xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="section-title">本周课程表</h2>
            <p className="section-subtitle mt-0.5">
              共 {totalCount} 节课 · 完成 {completedCount} 节
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-lavender-600 bg-lavender-100 px-3 py-1.5 rounded-full">
              {modeOptions.find(m => m.value === schedule.mode)?.label}
            </span>
            <span className="text-xs font-bold text-peach-600 bg-peach-100 px-3 py-1.5 rounded-full">
              {goalOptions.find(g => g.value === schedule.goal)?.emoji}
              {goalOptions.find(g => g.value === schedule.goal)?.label}
            </span>
          </div>
        </div>
        {/* 总进度 */}
        <div className="mb-1 flex justify-between text-xs text-gray-400">
          <span>周进度</span>
          <span className="font-semibold text-lavender-600">{pct}%</span>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full gradient-lavender"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>

      {/* 按天展示课程 */}
      {([0,1,2,3,4,5,6] as WeekDay[]).map(day => {
        const daySlots = byDay[day] ?? [];
        if (daySlots.length === 0) return null;
        return (
          <div key={day} className="glass-card rounded-3xl overflow-hidden">
            {/* 天标题 */}
            <div className="px-5 py-3.5 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-lavender-100 flex items-center justify-center">
                  <span className="text-sm font-bold text-lavender-600">{WEEKDAY_LABELS[day][1]}</span>
                </div>
                <span className="font-bold text-gray-800 text-sm">{WEEKDAY_LABELS[day]}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {daySlots.map(s => (
                  <div
                    key={s.timeSlot}
                    className={clsx('w-2 h-2 rounded-full', timeSlotColors[s.timeSlot].dot)}
                  />
                ))}
              </div>
            </div>

            {/* 时段卡片列表 */}
            {daySlots.map(slot => {
              const slotKey = `${day}-${slot.timeSlot}`;
              const isExpanded = expandedSlot === slotKey;
              const tc = timeSlotColors[slot.timeSlot];
              const sc = TIME_SLOT_CONFIG[slot.timeSlot];
              const allExs = [...slot.warmup, ...slot.exercises, ...slot.cooldown];

              return (
                <div key={slot.timeSlot} className="border-b border-gray-50/80 last:border-0">
                  {/* 时段行 */}
                  <button
                    onClick={() => setExpandedSlot(isExpanded ? null : slotKey)}
                    className="w-full px-5 py-3.5 flex items-center gap-3 text-left hover:bg-gray-50/40 transition-colors"
                  >
                    {/* 时段色块 */}
                    <div className={clsx('w-10 h-10 rounded-2xl flex flex-col items-center justify-center flex-shrink-0', tc.bg)}>
                      <span className={clsx('text-[10px] font-bold', tc.text)}>{sc.label}</span>
                      <span className="text-[9px] text-gray-400 leading-none">{sc.range.split(' ')[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-700">
                        {sc.label} · {sc.range}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Dumbbell size={10} className="text-gray-400" />
                          {slot.exercises.length} 个动作
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Flame size={10} className="text-peach-400" />
                          ~{slot.estimatedCalories} kcal
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {slot.completed ? (
                        <span className="text-[11px] font-bold text-mint-600 bg-mint-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                          <Check size={10} strokeWidth={3} /> 完成
                        </span>
                      ) : (
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={e => {
                            e.stopPropagation();
                            dispatch({ type: 'COMPLETE_WEEKLY_SLOT', day, timeSlot: slot.timeSlot });
                          }}
                          className="text-[11px] font-bold text-peach-500 bg-peach-50 border border-peach-200 px-2.5 py-1 rounded-full flex items-center gap-1 hover:bg-peach-100 transition-colors"
                        >
                          <Play size={9} className="ml-0.5" /> 开始
                        </motion.button>
                      )}
                      {isExpanded
                        ? <ChevronUp size={13} className="text-gray-300" />
                        : <ChevronDown size={13} className="text-gray-300" />}
                    </div>
                  </button>

                  {/* 展开：训练详情 */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className={clsx('mx-4 mb-3 rounded-2xl overflow-hidden', tc.light)}>
                          {allExs.map(ex => {
                            const setKey = `${slotKey}-${ex.name}`;
                            const done = slotCompletedSets[setKey] || 0;
                            const total = ex.sets || 1;
                            return (
                              <ExerciseRow
                                key={ex.name}
                                ex={ex}
                                completedSets={done}
                                totalSets={total}
                                onToggleSet={(setIdx) => {
                                  setSlotCompletedSets(prev => {
                                    const current = prev[setKey] || 0;
                                    if (setIdx < current) {
                                      return { ...prev, [setKey]: setIdx };
                                    }
                                    return { ...prev, [setKey]: Math.min(setIdx + 1, total) };
                                  });
                                }}
                                expanded={expandedEx === `${slotKey}-${ex.name}`}
                                onExpand={() => setExpandedEx(
                                  expandedEx === `${slotKey}-${ex.name}` ? null : `${slotKey}-${ex.name}`
                                )}
                              />
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        );
      })}
    </motion.div>
  );
}

/* ==================== 主组件 ==================== */

type PlanMode = 'single' | 'weekly';

export function PlanPage() {
  const { state, dispatch } = useStore();
  const [planMode, setPlanMode] = useState<PlanMode>('single');

  // ---- 单次计划状态 ----
  const [mode, setMode] = useState<WorkoutPlan['mode']>('home');
  const [freeTime, setFreeTime] = useState(45);
  const [goal, setGoal] = useState<WorkoutPlan['goal']>('fat_loss');
  const [generating, setGenerating] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<WorkoutPlan | null>(null);

  // ---- 周课程表状态 ----
  const [weeklyMode, setWeeklyMode] = useState<WorkoutPlan['mode']>('home');
  const [weeklyGoal, setWeeklyGoal] = useState<WorkoutPlan['goal']>('fat_loss');
  const [selectedDays, setSelectedDays] = useState<Set<WeekDay>>(new Set([0, 2, 4])); // 默认周一三五
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<Set<TimeSlot>>(new Set(['evening']));
  const [generatingWeekly, setGeneratingWeekly] = useState(false);

  const today = format(new Date(), 'yyyy-MM-dd');

  /* ---------- 单次计划生成 ---------- */
  const handleGenerateSingle = async () => {
    setGenerating(true);
    await new Promise(r => setTimeout(r, 1500));
    const plan = generateWorkoutPlan(mode, freeTime, goal);
    setCurrentPlan(plan);
    dispatch({ type: 'ADD_WORKOUT', plan });
    setGenerating(false);
  };

  const handleCompleteSingle = () => {
    if (!currentPlan) return;
    dispatch({ type: 'COMPLETE_WORKOUT', id: currentPlan.id });
    setCurrentPlan(prev => prev ? { ...prev, completed: true } : null);
  };

  /* ---------- 周课程表生成 ---------- */
  const handleGenerateWeekly = async () => {
    if (selectedDays.size === 0 || selectedTimeSlots.size === 0) return;
    setGeneratingWeekly(true);
    await new Promise(r => setTimeout(r, 2200));
    const schedule = generateWeeklySchedule(
      weeklyMode,
      weeklyGoal,
      Array.from(selectedDays).sort() as WeekDay[],
      Array.from(selectedTimeSlots) as TimeSlot[],
    );
    dispatch({ type: 'SET_WEEKLY_SCHEDULE', schedule });
    setGeneratingWeekly(false);
  };

  const toggleDay = (day: WeekDay) => {
    setSelectedDays(prev => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day); else next.add(day);
      return next;
    });
  };

  const toggleTimeSlot = (ts: TimeSlot) => {
    setSelectedTimeSlots(prev => {
      const next = new Set(prev);
      if (next.has(ts)) next.delete(ts); else next.add(ts);
      return next;
    });
  };

  /* ==================== 渲染 ==================== */

  return (
    <div className="min-h-[100dvh] gradient-bg pb-28">

      {/* ======= Header ======= */}
      <div
        className="sticky top-0 z-40 safe-top px-5 py-4"
        style={{
          background: 'rgba(255,255,255,0.82)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(255,255,255,0.65)',
          boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-[19px] font-bold text-gray-800 tracking-tight">AI 健身计划</h1>
            <p className="text-[12px] text-gray-400 font-medium mt-0.5">智能生成专属训练方案</p>
          </div>
          <div className="w-9 h-9 rounded-2xl gradient-peach flex items-center justify-center"
               style={{ boxShadow: '0 4px 14px rgba(255,96,64,0.3)' }}>
            <Sparkles size={17} className="text-white" />
          </div>
        </div>

        {/* 模式切换 Tab */}
        <div className="flex gap-2 bg-gray-100 p-1 rounded-2xl">
          <button
            onClick={() => setPlanMode('single')}
            className={clsx(
              'flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5',
              planMode === 'single' ? 'bg-white shadow-sm text-peach-600' : 'text-gray-400'
            )}
          >
            <Zap size={12} /> 单次计划
          </button>
          <button
            onClick={() => setPlanMode('weekly')}
            className={clsx(
              'flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5',
              planMode === 'weekly' ? 'bg-white shadow-sm text-lavender-600' : 'text-gray-400'
            )}
          >
            <CalendarDays size={12} /> 周课程表
          </button>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">

        {/* ======= 单次计划模式 ======= */}
        <AnimatePresence mode="wait">
          {planMode === 'single' && (
            <motion.div
              key="single"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              {/* ====== 自定义训练项目 ====== */}
              <CustomTrainingModule />

              {/* 生成器面板 */}
              <div className="glass-card rounded-3xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles size={16} className="text-peach-400" />
                  <h2 className="font-bold text-gray-800">生成今日计划</h2>
                </div>

                {/* 训练场地 */}
                <div className="mb-4">
                  <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">训练场地</p>
                  <div className="grid grid-cols-3 gap-2">
                    {modeOptions.map(opt => {
                      const Icon = opt.icon;
                      const isActive = mode === opt.value;
                      return (
                        <motion.button
                          key={opt.value}
                          whileTap={{ scale: 0.93 }}
                          onClick={() => setMode(opt.value)}
                          className={clsx(
                            'flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all',
                            isActive
                              ? opt.color === 'peach'    ? 'border-peach-300 bg-peach-50'
                                : opt.color === 'mint'   ? 'border-mint-300 bg-mint-50'
                                : 'border-lavender-300 bg-lavender-50'
                              : 'border-transparent bg-gray-50 hover:bg-gray-100'
                          )}
                        >
                          <Icon size={19} className={clsx(
                            isActive
                              ? opt.color === 'peach'    ? 'text-peach-500'
                                : opt.color === 'mint'   ? 'text-mint-500'
                                : 'text-lavender-500'
                              : 'text-gray-400'
                          )} />
                          <span className={clsx('text-xs font-bold', isActive ? 'text-gray-700' : 'text-gray-400')}>
                            {opt.label}
                          </span>
                          <span className="text-[10px] text-gray-400">{opt.desc}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* 空闲时间滑块 */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">空闲时间</p>
                    <div className="flex items-center gap-1 text-peach-500 font-bold text-sm">
                      <Clock size={13} />
                      <span>{freeTime} 分钟</span>
                    </div>
                  </div>
                  <input
                    type="range" min={15} max={90} step={5} value={freeTime}
                    onChange={e => setFreeTime(+e.target.value)}
                    className="w-full h-1.5"
                    style={{ accentColor: '#ff9a7c' }}
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                    <span>15 min</span><span>90 min</span>
                  </div>
                </div>

                {/* 训练目标 */}
                <div className="mb-5">
                  <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">训练目标</p>
                  <div className="grid grid-cols-2 gap-2">
                    {goalOptions.map(opt => (
                      <motion.button
                        key={opt.value}
                        whileTap={{ scale: 0.93 }}
                        onClick={() => setGoal(opt.value)}
                        className={clsx(
                          'flex items-center gap-2 p-3 rounded-2xl border-2 transition-all text-left',
                          goal === opt.value ? 'border-peach-300 bg-peach-50' : 'border-transparent bg-gray-50'
                        )}
                      >
                        <span className="text-xl">{opt.emoji}</span>
                        <span className={clsx('text-xs font-bold', goal === opt.value ? 'text-peach-600' : 'text-gray-500')}>
                          {opt.label}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleGenerateSingle}
                  disabled={generating}
                  className={clsx('btn-primary w-full justify-center', generating && 'opacity-80')}
                >
                  {generating ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white"
                      />
                      AI 正在生成计划...
                    </>
                  ) : (
                    <>
                      <Sparkles size={15} />
                      生成今日训练计划
                    </>
                  )}
                </motion.button>
              </div>

              {/* 生成的计划 */}
              <AnimatePresence>
                {currentPlan && (
                  <SinglePlanView plan={currentPlan} onComplete={handleCompleteSingle} />
                )}
              </AnimatePresence>

              {/* 历史训练 */}
              {state.workoutPlans.filter(p => p !== currentPlan).length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-gray-700 mb-2.5 flex items-center gap-2">
                    <LayoutGrid size={14} className="text-gray-400" />
                    历史训练
                  </h3>
                  <div className="space-y-2">
                    {state.workoutPlans.filter(p => p !== currentPlan).slice(0, 5).map(plan => (
                      <motion.div
                        key={plan.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="glass-card rounded-3xl p-4 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-semibold text-gray-700 text-sm">
                            {modeOptions.find(m => m.value === plan.mode)?.label} · {goalOptions.find(g => g.value === plan.goal)?.label}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">{plan.date} · {plan.freeTimeMinutes}min · ~{plan.estimatedCalories}kcal</p>
                        </div>
                        <span className={clsx(
                          'text-xs font-bold px-3 py-1 rounded-full',
                          plan.completed ? 'text-mint-600 bg-mint-100' : 'text-gray-400 bg-gray-100'
                        )}>
                          {plan.completed ? '✓ 完成' : '未完成'}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ======= 周课程表模式 ======= */}
          {planMode === 'weekly' && (
            <motion.div
              key="weekly"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              {/* 周课程配置面板 */}
              <div className="glass-card rounded-3xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <CalendarDays size={16} className="text-lavender-500" />
                  <h2 className="font-bold text-gray-800">生成周课程表</h2>
                </div>

                {/* 训练场地 */}
                <div className="mb-4">
                  <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">训练场地</p>
                  <div className="grid grid-cols-3 gap-2">
                    {modeOptions.map(opt => {
                      const Icon = opt.icon;
                      const isActive = weeklyMode === opt.value;
                      return (
                        <motion.button
                          key={opt.value}
                          whileTap={{ scale: 0.93 }}
                          onClick={() => setWeeklyMode(opt.value)}
                          className={clsx(
                            'flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all',
                            isActive
                              ? opt.color === 'peach'    ? 'border-peach-300 bg-peach-50'
                                : opt.color === 'mint'   ? 'border-mint-300 bg-mint-50'
                                : 'border-lavender-300 bg-lavender-50'
                              : 'border-transparent bg-gray-50'
                          )}
                        >
                          <Icon size={19} className={clsx(
                            isActive
                              ? opt.color === 'peach'    ? 'text-peach-500'
                                : opt.color === 'mint'   ? 'text-mint-500'
                                : 'text-lavender-500'
                              : 'text-gray-400'
                          )} />
                          <span className={clsx('text-xs font-bold', isActive ? 'text-gray-700' : 'text-gray-400')}>
                            {opt.label}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* 训练目标 */}
                <div className="mb-4">
                  <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">训练目标</p>
                  <div className="grid grid-cols-2 gap-2">
                    {goalOptions.map(opt => (
                      <motion.button
                        key={opt.value}
                        whileTap={{ scale: 0.93 }}
                        onClick={() => setWeeklyGoal(opt.value)}
                        className={clsx(
                          'flex items-center gap-2 p-2.5 rounded-2xl border-2 transition-all',
                          weeklyGoal === opt.value ? 'border-lavender-300 bg-lavender-50' : 'border-transparent bg-gray-50'
                        )}
                      >
                        <span className="text-lg">{opt.emoji}</span>
                        <span className={clsx('text-xs font-bold', weeklyGoal === opt.value ? 'text-lavender-600' : 'text-gray-500')}>
                          {opt.label}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* 选择训练日 */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">训练日</p>
                    <span className="text-xs text-lavender-500 font-semibold">
                      已选 {selectedDays.size} 天
                    </span>
                  </div>
                  <div className="grid grid-cols-7 gap-1.5">
                    {([0,1,2,3,4,5,6] as WeekDay[]).map(day => {
                      const isSelected = selectedDays.has(day);
                      const label = WEEKDAY_LABELS[day].replace('周', '');
                      return (
                        <motion.button
                          key={day}
                          whileTap={{ scale: 0.88 }}
                          onClick={() => toggleDay(day)}
                          className={clsx(
                            'py-2.5 rounded-2xl text-xs font-bold transition-all',
                            isSelected ? 'gradient-lavender text-white shadow-soft' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          )}
                        >
                          {label}
                        </motion.button>
                      );
                    })}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => setSelectedDays(new Set([0, 2, 4]))}
                      className="text-[11px] text-lavender-500 font-semibold bg-lavender-50 px-2.5 py-1 rounded-lg"
                    >
                      一三五
                    </button>
                    <button
                      onClick={() => setSelectedDays(new Set([1, 3, 5]))}
                      className="text-[11px] text-lavender-500 font-semibold bg-lavender-50 px-2.5 py-1 rounded-lg"
                    >
                      二四六
                    </button>
                    <button
                      onClick={() => setSelectedDays(new Set([0,1,2,3,4,5,6]))}
                      className="text-[11px] text-lavender-500 font-semibold bg-lavender-50 px-2.5 py-1 rounded-lg"
                    >
                      每天
                    </button>
                    <button
                      onClick={() => setSelectedDays(new Set([5, 6]))}
                      className="text-[11px] text-lavender-500 font-semibold bg-lavender-50 px-2.5 py-1 rounded-lg"
                    >
                      周末
                    </button>
                  </div>
                </div>

                {/* 选择时间段 */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">每天时段</p>
                    <span className="text-xs text-lavender-500 font-semibold">
                      已选 {selectedTimeSlots.size} 个时段
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.entries(TIME_SLOT_CONFIG) as [TimeSlot, typeof TIME_SLOT_CONFIG[TimeSlot]][]).map(([key, cfg]) => {
                      const isSelected = selectedTimeSlots.has(key);
                      const tc = timeSlotColors[key];
                      return (
                        <motion.button
                          key={key}
                          whileTap={{ scale: 0.93 }}
                          onClick={() => toggleTimeSlot(key)}
                          className={clsx(
                            'flex items-center gap-2.5 p-3 rounded-2xl border-2 transition-all',
                            isSelected ? `${tc.border} ${tc.light}` : 'border-transparent bg-gray-50'
                          )}
                        >
                          <div className={clsx('w-2 h-2 rounded-full flex-shrink-0', tc.dot)} />
                          <div className="text-left min-w-0">
                            <p className={clsx('text-xs font-bold', isSelected ? tc.text : 'text-gray-500')}>
                              {cfg.label}
                            </p>
                            <p className="text-[10px] text-gray-400">{cfg.range}</p>
                          </div>
                          {isSelected && (
                            <Check size={13} className={clsx('ml-auto flex-shrink-0', tc.text)} strokeWidth={2.5} />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* 预览课时数 */}
                {selectedDays.size > 0 && selectedTimeSlots.size > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mb-4 p-3 bg-lavender-50 rounded-2xl flex items-center gap-2"
                  >
                    <Sparkles size={13} className="text-lavender-500 flex-shrink-0" />
                    <p className="text-xs font-semibold text-lavender-700">
                      将生成 <span className="text-base font-black">{selectedDays.size * selectedTimeSlots.size}</span> 节专属训练课，
                      每节约 30-45 分钟
                    </p>
                  </motion.div>
                )}

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleGenerateWeekly}
                  disabled={generatingWeekly || selectedDays.size === 0 || selectedTimeSlots.size === 0}
                  className={clsx(
                    'w-full py-3.5 rounded-3xl font-bold text-sm flex items-center justify-center gap-2 transition-all',
                    selectedDays.size > 0 && selectedTimeSlots.size > 0
                      ? 'text-white'
                      : 'bg-gray-100 text-gray-400',
                    generatingWeekly && 'opacity-80'
                  )}
                  style={selectedDays.size > 0 && selectedTimeSlots.size > 0 ? {
                    background: 'linear-gradient(135deg, #e9d5ff, #a78bfa)',
                    boxShadow: '0 4px 20px rgba(167,139,250,0.32)',
                  } : {}}
                >
                  {generatingWeekly ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white"
                      />
                      AI 正在制定周课程表...
                    </>
                  ) : selectedDays.size === 0 || selectedTimeSlots.size === 0 ? (
                    <>
                      <Lock size={14} />
                      请先选择训练日和时段
                    </>
                  ) : (
                    <>
                      <CalendarDays size={15} />
                      生成专属周课程表
                    </>
                  )}
                </motion.button>
              </div>

              {/* 已生成的周课程表 */}
              <AnimatePresence>
                {state.weeklySchedule && (
                  <WeeklyScheduleView />
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
