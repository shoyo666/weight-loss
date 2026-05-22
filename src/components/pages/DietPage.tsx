/**
 * SlimFit v3.0 - 饮食记录页面
 *
 * 功能升级：
 * - 单条饮食记录删除（左滑显示删除按钮 / 长按确认）
 * - 饮水记录可视化管理（可逐步减少）
 * - AI 拍照识别卡路里（通义千问 VL）
 * - 宏量素今日汇总进度条
 *
 * @since 2026-04-22 v3.0
 */

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store';
import { FoodItem } from '../../types';
import { format } from 'date-fns';
import {
  Camera, Plus, Search, Sparkles,
  Droplets, X, Check, Clock, Flame, Trash2,
  Minus, Loader2, AlertTriangle,
} from 'lucide-react';
import clsx from 'clsx';
import {
  recognizeFoodFromImage,
  compressImageForThumb,
  type RecognizedFood,
} from '../../services/foodRecognition';
import { foodDatabase } from '../../data/foodDatabase';

/* ==================== 常量 ==================== */

const mealLabels = {
  breakfast: { label: '早餐', emoji: '🌅', color: 'bg-amber-100 text-amber-600',   gradient: 'gradient-butter' },
  lunch:     { label: '午餐', emoji: '☀️', color: 'bg-peach-100 text-peach-600',   gradient: 'gradient-peach' },
  dinner:    { label: '晚餐', emoji: '🌙', color: 'bg-lavender-100 text-lavender-600', gradient: 'gradient-lavender' },
  snack:     { label: '加餐', emoji: '🍎', color: 'bg-mint-100 text-mint-600',     gradient: 'gradient-mint' },
};


/* ==================== 水杯记录组件 ==================== */

interface WaterCupProps {
  ml: number;
  onDelete: () => void;
  index: number;
}

function WaterCup({ ml, onDelete, index }: WaterCupProps) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ delay: index * 0.03, type: 'spring', stiffness: 400, damping: 25 }}
      className="relative group"
    >
      <div className="w-10 h-10 rounded-2xl bg-sky-100 flex flex-col items-center justify-center cursor-pointer relative overflow-hidden">
        {/* 水位填充动画 */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 bg-sky-300/40 rounded-b-2xl"
          initial={{ height: 0 }}
          animate={{ height: '65%' }}
          transition={{ delay: index * 0.05 + 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
        <Droplets size={14} className="text-sky-500 relative z-10" />
        <span className="text-[9px] font-bold text-sky-600 relative z-10 leading-none mt-0.5">{ml >= 1000 ? `${(ml/1000).toFixed(1)}L` : `${ml}`}</span>
      </div>
      {/* 删除按钮（hover显示） */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={onDelete}
        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-400 rounded-full
                   flex items-center justify-center opacity-0 group-hover:opacity-100
                   transition-opacity duration-150 z-20 shadow-sm"
      >
        <X size={9} className="text-white" strokeWidth={3} />
      </motion.button>
    </motion.div>
  );
}

/* ==================== 食物行（带滑动删除） ==================== */

interface FoodRowProps {
  food: FoodItem;
  onDelete: () => void;
}

function FoodRow({ food, onDelete }: FoodRowProps) {
  const [showDelete, setShowDelete] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDeleteClick = () => {
    if (confirmDelete) {
      onDelete();
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 2500);
    }
  };

  return (
    <div
      className="relative overflow-hidden"
      onMouseLeave={() => { setShowDelete(false); setConfirmDelete(false); }}
    >
      {/* 主内容行 */}
      <motion.div
        animate={{ x: showDelete ? -64 : 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        className="flex items-center justify-between px-5 py-3 border-b border-gray-50/80 last:border-0"
        onClick={() => setShowDelete(prev => !prev)}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* 餐次图标 */}
          <div className={clsx(
            'w-9 h-9 rounded-2xl flex items-center justify-center text-base flex-shrink-0',
            mealLabels[food.mealType].color
          )}>
            {mealLabels[food.mealType].emoji}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-700 truncate">{food.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {food.amount}g &middot; 蛋白 {food.protein}g &middot; 碳水 {food.carbs}g &middot; 脂肪 {food.fat}g
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-sm font-bold text-peach-500">{food.calories} kcal</span>
          {/* 提示用户可左滑 */}
          {!showDelete && (
            <div className="w-1 h-4 flex flex-col gap-0.5 justify-center opacity-30">
              <div className="w-1 h-1 rounded-full bg-gray-400" />
              <div className="w-1 h-1 rounded-full bg-gray-400" />
              <div className="w-1 h-1 rounded-full bg-gray-400" />
            </div>
          )}
        </div>
      </motion.div>

      {/* 删除按钮（右侧露出） */}
      <AnimatePresence>
        {showDelete && (
          <motion.button
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 64 }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDeleteClick}
            className={clsx(
              'absolute right-0 top-0 bottom-0 flex flex-col items-center justify-center gap-1',
              'transition-colors duration-200',
              confirmDelete ? 'bg-red-500' : 'bg-red-400'
            )}
          >
            <Trash2 size={15} className="text-white" />
            <span className="text-[10px] font-bold text-white">
              {confirmDelete ? '确认' : '删除'}
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ==================== 主组件 ==================== */

export function DietPage() {
  const { state, dispatch } = useStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMeal, setSelectedMeal] = useState<FoodItem['mealType']>('breakfast');
  const [aiResult, setAiResult] = useState<RecognizedFood | null>(null);
  const [aiResults, setAiResults] = useState<RecognizedFood[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null); // 拍照上传的食物图片 data URL
  const [viewImage, setViewImage] = useState<string | null>(null); // 大图查看
  const [mealPhotoView, setMealPhotoView] = useState<FoodItem['mealType'] | null>(null); // 餐次照片查看

  // 手动搜索：从本地食物数据库筛选
  const filteredFoods = searchQuery.trim()
    ? foodDatabase
        .filter(f => f.name.includes(searchQuery))
        .slice(0, 8)
        .map(f => ({
          name: f.name,
          calories: f.nutrition.calories,
          protein: f.nutrition.protein,
          carbs: f.nutrition.carbs,
          fat: f.nutrition.fat,
          amount: 100,
        }))
    : [];

  /** 手动添加搜索结果中的食物 */
  const addFoodManual = (food: { name: string; calories: number; protein: number; carbs: number; fat: number; amount: number }) => {
    const item: FoodItem = {
      id: Date.now().toString(),
      date: today,
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      amount: food.amount,
      mealType: selectedMeal,
      imageUrl: photoPreview || undefined,
      timestamp: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_FOOD', food: item });
    setShowAddModal(false);
    setAiResult(null);
    setAiResults([]);
    setScanError(null);
    setSearchQuery('');
    setPhotoPreview(null);
  };
  const [waterAmount, setWaterAmount] = useState(250);
  // 饮水记录列表（每次添加都记录一条，方便删除）
  const [waterLogs, setWaterLogs] = useState<{ id: string; ml: number }[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayDiet = state.dietHistory.find(d => d.date === today);
  const meals = todayDiet?.meals ?? [];

  const totalCalories = meals.reduce((s, m) => s + m.calories, 0);
  const totalProtein  = meals.reduce((s, m) => s + m.protein, 0);
  const totalCarbs    = meals.reduce((s, m) => s + m.carbs, 0);
  const totalFat      = meals.reduce((s, m) => s + m.fat, 0);

  const waterIntake = todayDiet?.waterIntake ?? 0;
  const waterGoal   = 2000;
  const waterPct    = Math.min(100, Math.round((waterIntake / waterGoal) * 100));

  /* ---------- 事件处理 ---------- */

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanError(null);
    setIsScanning(true);
    setAiResult(null);
    setAiResults([]);
    setPhotoPreview(null);

    try {
      // 并行：AI 识别 + 压缩缩略图（用于存储）
      const [foods, thumb] = await Promise.all([
        recognizeFoodFromImage(file),
        compressImageForThumb(file).catch(() => null), // 缩略图失败不阻断识别
      ]);
      setPhotoPreview(thumb);

      if (foods.length === 0) {
        setScanError('未能从图片中识别到食物，请换一张清晰的照片重试。');
      } else if (foods.length === 1) {
        setAiResult(foods[0]);
      } else {
        setAiResults(foods);
      }
    } catch (err: any) {
      setScanError(err.message || '识别失败，请重试');
    } finally {
      setIsScanning(false);
    }

    // 重置 input 以便重复选择同一文件
    e.target.value = '';
  };

  /** 添加单个 AI 识别结果 */
  const addFoodFromAI = (food: RecognizedFood, photoId?: string) => {
    const item: FoodItem = {
      id: Date.now().toString(),
      date: today,
      name: food.foodName,
      calories: Math.round(food.calories),
      protein: Math.round(food.protein * 10) / 10,
      carbs: Math.round(food.carbohydrates * 10) / 10,
      fat: Math.round(food.fat * 10) / 10,
      amount: Math.round(food.grams),
      mealType: selectedMeal,
      imageUrl: photoPreview || undefined,
      mealPhotoId: photoId,
      timestamp: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_FOOD', food: item });
  };

  /** 创建餐次照片并返回 photoId（如有缩略图） */
  const createMealPhoto = (): string | undefined => {
    if (!photoPreview) return undefined;
    const photoId = `mp-${Date.now()}`;
    const mealPhoto: import('../../types').MealPhoto = {
      id: photoId,
      url: photoPreview,
      date: today,
      mealType: selectedMeal,
      foodIds: [], // 后续关联
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_MEAL_PHOTO', photo: mealPhoto });
    return photoId;
  };

  /** 确认并添加全部识别结果 */
  const confirmAllAIResults = () => {
    const photoId = createMealPhoto();
    aiResults.forEach(food => addFoodFromAI(food, photoId));
    setShowAddModal(false);
    setAiResult(null);
    setAiResults([]);
    setSearchQuery('');
    setPhotoPreview(null);
  };

  /** 确认单个识别结果 */
  const confirmSingleAIResult = () => {
    if (aiResult) {
      const photoId = createMealPhoto();
      addFoodFromAI(aiResult, photoId);
      setShowAddModal(false);
      setAiResult(null);
      setScanError(null);
      setSearchQuery('');
      setPhotoPreview(null);
    }
  };

  const deleteFood = (foodId: string) => {
    dispatch({ type: 'DELETE_FOOD', foodId });
  };

  const addWater = () => {
    const current = todayDiet?.waterIntake ?? 0;
    dispatch({ type: 'UPDATE_WATER', date: today, amount: current + waterAmount });
    // 同时记录到本地水杯列表
    setWaterLogs(prev => [...prev, { id: Date.now().toString(), ml: waterAmount }]);
  };

  const deleteWaterLog = (logId: string, ml: number) => {
    setWaterLogs(prev => prev.filter(l => l.id !== logId));
    dispatch({ type: 'DELETE_WATER_LOG', date: today, amount: ml });
  };

  const mealGroups = (['breakfast', 'lunch', 'dinner', 'snack'] as const).map(type => ({
    type,
    meals: meals.filter(m => m.mealType === type),
    ...mealLabels[type],
  }));

  /* ==================== 渲染 ==================== */

  return (
    <div className="min-h-[100dvh] gradient-bg pb-28">

      {/* ======= Header ======= */}
      <div
        className="sticky top-0 z-40 safe-top px-5 py-4 flex items-center justify-between"
        style={{
          background: 'rgba(255,255,255,0.82)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(255,255,255,0.65)',
          boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
        }}
      >
        <div>
          <h1 className="text-[19px] font-bold text-gray-800 tracking-tight">饮食记录</h1>
          <p className="text-[12px] text-gray-400 mt-0.5 font-medium">
            今日 <span className="text-peach-500 font-bold">{totalCalories}</span> / {state.profile?.dailyCalorieGoal ?? 2000} kcal
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={(e) => { e.preventDefault(); setSelectedMeal('breakfast'); setShowAddModal(true); }}
          className="w-10 h-10 rounded-2xl gradient-peach flex items-center justify-center"
          style={{ boxShadow: '0 4px 14px rgba(255,96,64,0.3)' }}
        >
          <Plus size={20} className="text-white" strokeWidth={2.5} />
        </motion.button>
      </div>

      <div className="px-4 pt-4 space-y-4">

        {/* ======= 今日宏量素汇总 ======= */}
        {meals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-3xl p-4"
          >
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: '热量',  value: totalCalories, unit: 'kcal', color: 'text-peach-500',    bg: 'bg-peach-50'    },
                { label: '蛋白质', value: totalProtein.toFixed(0), unit: 'g', color: 'text-sky-500',     bg: 'bg-sky-50'     },
                { label: '碳水',  value: totalCarbs.toFixed(0),    unit: 'g', color: 'text-lavender-500', bg: 'bg-lavender-50' },
                { label: '脂肪',  value: totalFat.toFixed(0),      unit: 'g', color: 'text-mint-600',     bg: 'bg-mint-50'     },
              ].map(item => (
                <div key={item.label} className={clsx('rounded-2xl p-2.5 text-center', item.bg)}>
                  <div className={clsx('text-sm font-bold', item.color)}>
                    {item.value}
                    <span className="text-[9px] font-medium text-gray-400 ml-0.5">{item.unit}</span>
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5 font-medium">{item.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ======= 饮水记录卡片 ======= */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-card rounded-3xl p-4"
        >
          {/* 标题行 */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-sky-100 flex items-center justify-center">
                <Droplets size={14} className="text-sky-500" />
              </div>
              <span className="font-bold text-gray-800 text-sm">饮水记录</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-sky-500 bg-sky-50 px-2.5 py-1 rounded-full">
                {waterIntake} / {waterGoal} ml
              </span>
              <span className="text-xs text-gray-400 font-medium">{waterPct}%</span>
            </div>
          </div>

          {/* 进度条 */}
          <div className="h-2 bg-sky-100 rounded-full overflow-hidden mb-3">
            <motion.div
              className="h-full rounded-full gradient-sky"
              initial={{ width: 0 }}
              animate={{ width: `${waterPct}%` }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>

          {/* 快速添加按钮 */}
          <div className="flex gap-2 items-center mb-3">
            {[150, 250, 350, 500].map(ml => (
              <button
                key={ml}
                onClick={() => setWaterAmount(ml)}
                className={clsx(
                  'flex-1 py-2 rounded-2xl text-xs font-bold transition-all',
                  waterAmount === ml
                    ? 'gradient-sky text-white shadow-soft'
                    : 'bg-sky-50 text-sky-400 hover:bg-sky-100'
                )}
              >
                {ml}
              </button>
            ))}
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={addWater}
              className="w-10 h-9 rounded-2xl gradient-sky flex items-center justify-center shadow-soft flex-shrink-0"
            >
              <Plus size={16} className="text-white" strokeWidth={2.5} />
            </motion.button>
          </div>

          {/* 水杯可视化（每次添加的记录，可单独删除） */}
          {waterLogs.length > 0 && (
            <div>
              <p className="text-[11px] text-gray-400 font-semibold mb-2 flex items-center gap-1">
                <span>今日水杯记录</span>
                <span className="text-[9px] text-gray-300">（悬浮可删除）</span>
              </p>
              <div className="flex flex-wrap gap-2">
                <AnimatePresence>
                  {waterLogs.map((log, i) => (
                    <WaterCup
                      key={log.id}
                      ml={log.ml}
                      index={i}
                      onDelete={() => deleteWaterLog(log.id, log.ml)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* 总量减少按钮（快捷方式） */}
          {waterIntake > 0 && (
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
              <span className="text-[11px] text-gray-400 font-medium">快速调整总量：</span>
              <div className="flex gap-1.5">
                {[150, 250].map(ml => (
                  <button
                    key={ml}
                    onClick={() => dispatch({ type: 'DELETE_WATER_LOG', date: today, amount: ml })}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-red-50 text-red-400 text-xs font-semibold hover:bg-red-100 transition-colors"
                  >
                    <Minus size={10} />
                    {ml}ml
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* ======= 餐次区块 ======= */}
        {mealGroups.map(({ type, label, emoji, color, meals: mealItems }, groupIdx) => (
          <motion.div
            key={type}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: groupIdx * 0.06 + 0.1 }}
            className="glass-card rounded-3xl overflow-hidden"
          >
            {/* 餐次标题栏 */}
            <div className="px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={clsx('w-8 h-8 rounded-2xl flex items-center justify-center text-base', color)}>
                  {emoji}
                </div>
                <div>
                  <span className="font-bold text-gray-800 text-sm">{label}</span>
                  {mealItems.length > 0 && (
                    <span className="ml-2 text-xs text-gray-400 font-medium">
                      {mealItems.reduce((s, m) => s + m.calories, 0)} kcal
                    </span>
                  )}
                </div>
                {mealItems.length > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={clsx('text-[10px] px-2 py-0.5 rounded-full font-bold', color)}
                  >
                    {mealItems.length} 项
                  </motion.span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                {/* 照片查看按钮 */}
                {(() => {
                  const count = (state.mealPhotos ?? []).filter(
                    p => p.date === today && p.mealType === type
                  ).length;
                  const hasPhotos = count > 0;
                  return (
                    <motion.button
                      whileTap={hasPhotos ? { scale: 0.9 } : undefined}
                      onClick={hasPhotos ? (e) => { e.preventDefault(); setMealPhotoView(type); } : undefined}
                      className={clsx(
                        'w-8 h-8 rounded-xl flex items-center justify-center transition-colors',
                        hasPhotos
                          ? 'bg-sky-100 hover:bg-sky-200 text-sky-500'
                          : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                      )}
                      title={hasPhotos ? `查看${label}照片 (${count}组)` : `${label}暂无照片`}
                    >
                      <Camera size={14} strokeWidth={hasPhotos ? 2 : 1.5} />
                    </motion.button>
                  );
                })()}
                {/* 添加按钮 */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => { e.preventDefault(); setSelectedMeal(type); setShowAddModal(true); }}
                  className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <Plus size={14} className="text-gray-500" />
                </motion.button>
              </div>
            </div>

            {/* 食物列表 */}
            <AnimatePresence>
              {mealItems.length > 0 && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  className="border-t border-gray-50/80"
                >
                  <p className="px-5 pt-2 pb-1 text-[10px] text-gray-300 font-medium">
                    点击行可左滑显示删除
                  </p>
                  {mealItems.map(food => (
                    <FoodRow
                      key={food.id}
                      food={food}
                      onDelete={() => deleteFood(food.id)}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {mealItems.length === 0 && (
              <div className="px-5 pb-4">
                <p className="text-xs text-gray-300 font-medium">暂无记录，点击 + 添加</p>
              </div>
            )}
          </motion.div>
        ))}

      </div>

      {/* ======= 历史记录 ======= */}
      {(() => {
        const pastRecords = state.dietHistory
          .filter(d => d.date !== today && d.meals.length > 0)
          .sort((a, b) => b.date.localeCompare(a.date));

        if (pastRecords.length === 0) return null;

        return (
          <div className="px-4 pt-2 pb-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-5 bg-gradient-to-b from-lavender-400 to-peach-400 rounded-full" />
              <h2 className="section-title">历史记录</h2>
              <span className="text-xs text-gray-400 ml-auto">{pastRecords.length} 天</span>
            </div>
            <div className="space-y-3">
              {pastRecords.map(record => (
                <motion.div
                  key={record.date}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card rounded-3xl overflow-hidden"
                >
                  {/* 日期头 */}
                  <div className="px-5 py-3 bg-gradient-to-r from-lavender-50/80 to-peach-50/50 border-b border-white/60 flex items-center justify-between">
                    <div>
                      <span className="text-sm font-bold text-gray-700">{record.date}</span>
                      <span className="text-xs text-gray-400 ml-2">
                        {record.meals.length} 种食物 · {record.totalCalories} kcal
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400 bg-white/60 px-2 py-0.5 rounded-full">
                      {(() => {
                        const d = new Date(record.date);
                        const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
                        return days[d.getDay()];
                      })()}
                    </span>
                  </div>
                  {/* 食物列表（按照片分组） */}
                  <div className="divide-y divide-gray-50/60">
                    {(() => {
                      // 按 mealPhotoId 分组：有照片的食物按 photoId 分组，无照片的单独展示
                      const grouped: Record<string, FoodItem[]> = {};
                      const unGrouped: FoodItem[] = [];
                      record.meals.forEach(f => {
                        if (f.mealPhotoId && f.imageUrl) {
                          (grouped[f.mealPhotoId] ??= []).push(f);
                        } else {
                          unGrouped.push(f);
                        }
                      });

                      return (
                        <>
                          {/* 有照片的分组 */}
                          {Object.entries(grouped).map(([photoId, foods]) => {
                            const photoUrl = foods[0].imageUrl!;
                            const mealType = foods[0].mealType;
                            return (
                              <div key={photoId} className="px-5 py-3">
                                <div className="flex items-start gap-3">
                                  <div
                                    className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 cursor-pointer bg-gray-100"
                                    onClick={() => setViewImage(photoUrl)}
                                  >
                                    <img src={photoUrl} alt="食物照片" className="w-full h-full object-cover" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <span className={clsx(
                                      'text-[10px] px-1.5 py-0.5 rounded-full font-semibold mb-1 inline-block',
                                      mealLabels[mealType].color
                                    )}>
                                      {mealLabels[mealType].label} · {foods.length} 种食物
                                    </span>
                                    {foods.map(f => (
                                      <div key={f.id} className="flex items-center justify-between mt-1">
                                        <span className="text-sm text-gray-700">{f.name}</span>
                                        <span className="text-xs font-semibold text-peach-500">{f.calories} kcal</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                          {/* 无照片的单独展示 */}
                          {unGrouped.map(food => (
                            <div key={food.id} className="px-5 py-3 flex items-center gap-3">
                              <div className={clsx(
                                'w-12 h-12 rounded-xl flex items-center justify-center text-lg flex-shrink-0',
                                mealLabels[food.mealType].color
                              )}>
                                {mealLabels[food.mealType].emoji}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-semibold text-gray-700 truncate">{food.name}</p>
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-400 flex-shrink-0">
                                    {mealLabels[food.mealType].label}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-400 mt-0.5">
                                  {food.amount}g · 蛋白 {food.protein}g · 碳水 {food.carbs}g · 脂肪 {food.fat}g
                                </p>
                              </div>
                              <span className="text-sm font-bold text-peach-500 flex-shrink-0">{food.calories} kcal</span>
                            </div>
                          ))}
                        </>
                      );
                    })()}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* ======= 添加食物弹窗 ======= */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/35 backdrop-blur-sm flex items-end justify-center px-3 pb-4"
            onClick={() => { setShowAddModal(false); setAiResult(null); setAiResults([]); setScanError(null); setSearchQuery(''); setPhotoPreview(null); }}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 35 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-lg glass-card-xl rounded-4xl p-5 max-h-[85vh] overflow-y-auto scrollbar-thin"
            >
              {/* 弹窗标题 */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">添加食物</h3>
                  <p className="text-xs text-gray-400 font-medium mt-0.5">拍照识别或搜索食物</p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => { setShowAddModal(false); setAiResult(null); setAiResults([]); setScanError(null); setSearchQuery(''); setPhotoPreview(null); }}
                  className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center"
                >
                  <X size={16} className="text-gray-500" />
                </motion.button>
              </div>

              {/* 餐次选择 */}
              <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
                {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map(t => (
                  <motion.button
                    key={t}
                    whileTap={{ scale: 0.93 }}
                    onClick={() => setSelectedMeal(t)}
                    className={clsx(
                      'flex-shrink-0 px-4 py-2 rounded-2xl text-xs font-bold transition-all',
                      selectedMeal === t
                        ? `${mealLabels[t].gradient} text-white shadow-soft`
                        : 'bg-gray-100 text-gray-500'
                    )}
                  >
                    {mealLabels[t].emoji} {mealLabels[t].label}
                  </motion.button>
                ))}
              </div>

              {/* 拍照 / AI识别 区域 */}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                ref={fileRef}
                onChange={handlePhotoUpload}
                className="hidden"
              />

              {isScanning ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-gradient-to-br from-peach-50 to-lavender-50 rounded-3xl p-8 text-center mb-4"
                >
                  <Loader2 size={28} className="text-peach-400 mx-auto mb-3 animate-spin" />
                  <p className="text-sm font-bold text-peach-500 flex items-center justify-center gap-2">
                    <Sparkles size={14} />
                    AI 正在识别食物...
                  </p>
                  <p className="text-xs text-gray-400 mt-1">通常需要 2-5 秒</p>
                </motion.div>
              ) : scanError ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.93 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-br from-red-50 to-orange-50 rounded-3xl p-4 mb-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={14} className="text-red-400" />
                    <span className="text-sm font-bold text-red-500">识别失败</span>
                  </div>
                  <p className="text-xs text-red-400 mb-3">{scanError}</p>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setScanError(null); fileRef.current?.click(); }}
                    className="w-full py-2.5 rounded-2xl bg-white/80 text-red-500 text-sm font-semibold border border-red-100"
                  >
                    重新拍照
                  </motion.button>
                </motion.div>
              ) : aiResult ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.93 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-br from-green-50 to-mint-50 rounded-3xl p-4 mb-4"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-lg gradient-mint flex items-center justify-center">
                      <Sparkles size={12} className="text-white" />
                    </div>
                    <span className="text-sm font-bold text-mint-600">AI 识别结果</span>
                    <span className={clsx(
                      'ml-auto text-[10px] px-1.5 py-0.5 rounded-full font-semibold',
                      aiResult.confidence === 'high' ? 'bg-green-100 text-green-600' :
                      aiResult.confidence === 'low' ? 'bg-orange-100 text-orange-500' :
                      'bg-gray-100 text-gray-500'
                    )}>
                      {aiResult.confidence === 'high' ? '高置信度' : aiResult.confidence === 'low' ? '低置信度' : '中等置信度'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-gray-800 text-base">{aiResult.foodName}</h4>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {aiResult.grams}g · 蛋白 {aiResult.protein}g · 碳水 {aiResult.carbohydrates}g · 脂肪 {aiResult.fat}g
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-peach-500">{Math.round(aiResult.calories)}</div>
                      <div className="text-xs text-gray-400">kcal</div>
                    </div>
                  </div>
                  {aiResult.notes && (
                    <p className="text-[11px] text-gray-400 mb-3 italic">{aiResult.notes}</p>
                  )}
                  <div className="flex gap-2">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => { setAiResult(null); setScanError(null); fileRef.current?.click(); }}
                      className="flex-1 py-2.5 rounded-2xl bg-white/80 text-gray-500 text-sm font-semibold border border-gray-100"
                    >
                      重新识别
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={confirmSingleAIResult}
                      className="flex-1 btn-primary justify-center py-2.5 text-sm"
                    >
                      <Check size={14} />
                      添加到{mealLabels[selectedMeal].label}
                    </motion.button>
                  </div>
                </motion.div>
              ) : aiResults.length > 1 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.93 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-br from-green-50 to-mint-50 rounded-3xl p-4 mb-4"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-lg gradient-mint flex items-center justify-center">
                      <Sparkles size={12} className="text-white" />
                    </div>
                    <span className="text-sm font-bold text-mint-600">AI 识别到 {aiResults.length} 种食物</span>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto mb-3">
                    {aiResults.map((food, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-white/80">
                        <div>
                          <span className="text-sm font-semibold text-gray-700">{food.foodName}</span>
                          <span className="text-xs text-gray-400 ml-2">{food.grams}g</span>
                        </div>
                        <span className="text-sm font-bold text-peach-500">{Math.round(food.calories)} kcal</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => { setAiResults([]); setScanError(null); fileRef.current?.click(); }}
                      className="flex-1 py-2.5 rounded-2xl bg-white/80 text-gray-500 text-sm font-semibold border border-gray-100"
                    >
                      重新识别
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={confirmAllAIResults}
                      className="flex-1 btn-primary justify-center py-2.5 text-sm"
                    >
                      <Check size={14} />
                      全部添加
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { setScanError(null); fileRef.current?.click(); }}
                  className="w-full border-2 border-dashed border-peach-200 rounded-3xl p-5 text-center mb-4 transition-all hover:border-peach-300 hover:bg-peach-50/40"
                >
                  <div className="w-12 h-12 rounded-2xl bg-peach-100 flex items-center justify-center mx-auto mb-2">
                    <Camera size={22} className="text-peach-500" />
                  </div>
                  <p className="text-sm font-bold text-peach-600">AI 拍照识别</p>
                  <p className="text-xs text-gray-400 mt-0.5">Qwen VL 视觉模型自动分析</p>
                </motion.button>
              )}

              {/* 搜索框 */}
              <div className="relative mb-3">
                <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  className="input-field pl-10 py-3"
                  placeholder="搜索食物名称..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>

              {/* 食物搜索结果 */}
              <div className="space-y-1.5 max-h-56 overflow-y-auto scrollbar-thin">
                {filteredFoods.map(food => (
                  <motion.button
                    key={food.name}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => addFoodManual(food)}
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gray-50/80 hover:bg-peach-50 transition-colors text-left group"
                  >
                    <div>
                      <p className="font-semibold text-gray-700 text-sm group-hover:text-peach-600 transition-colors">
                        {food.name}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {food.amount}g · 蛋白 {food.protein}g · 碳水 {food.carbs}g · 脂肪 {food.fat}g
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-peach-500 text-sm">{food.calories}</span>
                      <span className="text-xs text-gray-400">kcal</span>
                      <div className="w-6 h-6 rounded-lg bg-peach-100 group-hover:bg-peach-200 flex items-center justify-center transition-colors">
                        <Plus size={12} className="text-peach-500" />
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======= 餐次照片查看弹窗（一张照片 → 多份食物） ======= */}
      <AnimatePresence>
        {mealPhotoView && (() => {
          const cfg = mealLabels[mealPhotoView];
          // 从全局 mealPhotos 获取今日该餐次的照片
          const todayMealPhotos = (state.mealPhotos ?? []).filter(
            p => p.date === today && p.mealType === mealPhotoView
          );
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[65] bg-black/50 backdrop-blur-sm flex items-end justify-center"
              onClick={() => setMealPhotoView(null)}
            >
              <motion.div
                initial={{ y: 120, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 120, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full max-w-lg bg-white rounded-t-4xl shadow-2xl px-5 pb-10 pt-7 max-h-[75dvh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
              >
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 bg-gray-200 rounded-full" />
                <button
                  onClick={() => setMealPhotoView(null)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
                >
                  <X size={16} className="text-gray-400" />
                </button>

                <div className="flex items-center gap-3 mb-5">
                  <div className={clsx('w-10 h-10 rounded-2xl flex items-center justify-center text-xl', cfg.color)}>
                    {cfg.emoji}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">{cfg.label} 食物照片</h2>
                    <p className="text-xs text-gray-400 mt-0.5">{format(new Date(), 'yyyy年M月d日')} · {todayMealPhotos.length} 组</p>
                  </div>
                </div>

                {todayMealPhotos.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                      <Camera size={28} className="text-gray-300" />
                    </div>
                    <p className="text-sm text-gray-400 font-medium">暂无{cfg.label}照片</p>
                    <p className="text-xs text-gray-300 mt-1">拍照识别食物后照片会自动保存在这里</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {todayMealPhotos.map(photo => {
                      const photoFoods = meals.filter(m => m.mealPhotoId === photo.id);
                      return (
                        <div key={photo.id} className="bg-gray-50 rounded-2xl p-4">
                          {/* 主照片 */}
                          <div
                            className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-gray-200 cursor-pointer mb-3"
                            onClick={() => { setMealPhotoView(null); setViewImage(photo.url); }}
                          >
                            <img
                              src={photo.url}
                              alt="食物照片"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          {/* 关联食物列表 */}
                          <div className="space-y-2">
                            <p className="text-xs text-gray-400 font-medium">
                              识别到 {photoFoods.length} 种食物
                            </p>
                            {photoFoods.map(food => (
                              <div key={food.id} className="flex items-center justify-between bg-white rounded-xl p-2.5">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-gray-700">{food.name}</p>
                                  <p className="text-xs text-gray-400">{food.amount}g · 蛋白{food.protein}g · 碳水{food.carbs}g · 脂肪{food.fat}g</p>
                                </div>
                                <span className="text-sm font-bold text-peach-500 ml-3">{food.calories} kcal</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* ======= 图片大图查看 ======= */}
      <AnimatePresence>
        {viewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setViewImage(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-[90vw] max-h-[80vh] rounded-3xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <img
                src={viewImage}
                alt="食物照片"
                className="max-w-full max-h-[80vh] object-contain"
              />
              <button
                onClick={() => setViewImage(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white"
              >
                <X size={16} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
