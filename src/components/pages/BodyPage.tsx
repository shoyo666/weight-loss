import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store';
import { WeightRecord } from '../../types';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { format } from 'date-fns';
import { Plus, TrendingDown, Target, Ruler, Weight, X, Check } from 'lucide-react';
import { ProgressRing } from '../ui/Card';
import clsx from 'clsx';

export function BodyPage() {
  const { state, dispatch } = useStore();
  const { profile, weightHistory } = state;

  if (!profile) return null;

  const [showWeightModal, setShowWeightModal] = useState(false);
  const [newWeight, setNewWeight] = useState(profile.currentWeight.toString());
  const [showEditGoal, setShowEditGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(profile.goalWeight.toString());

  const bmi = +(profile.currentWeight / Math.pow(profile.height / 100, 2)).toFixed(1);
  const bmiStatus = bmi < 18.5 ? { label: '偏瘦', color: 'text-sky-500' }
    : bmi < 24 ? { label: '正常', color: 'text-mint-500' }
    : bmi < 28 ? { label: '偏重', color: 'text-butter-400' }
    : { label: '肥胖', color: 'text-peach-500' };

  const progressToGoal = Math.max(0, Math.min(100, Math.round(
    ((weightHistory[0]?.weight ?? profile.currentWeight) - profile.currentWeight) /
    ((weightHistory[0]?.weight ?? profile.currentWeight) - profile.goalWeight) * 100
  )));

  const chartData = weightHistory.slice(-20).map(w => ({
    date: format(new Date(w.date), 'M/d'),
    weight: w.weight,
  }));

  const addWeight = () => {
    const w = parseFloat(newWeight);
    if (isNaN(w) || w < 20 || w > 300) return;
    const record: WeightRecord = {
      date: format(new Date(), 'yyyy-MM-dd'),
      weight: w,
    };
    dispatch({ type: 'ADD_WEIGHT', record });
    setShowWeightModal(false);
  };

  const saveGoal = () => {
    const g = parseFloat(goalInput);
    if (isNaN(g) || g < 20 || g > 300) return;
    dispatch({ type: 'UPDATE_PROFILE', profile: { goalWeight: g } });
    setShowEditGoal(false);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
      return (
        <div className="glass-card rounded-2xl px-3 py-2 text-sm font-semibold">
          <span className="text-peach-500">{payload[0].value} kg</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-[100dvh] gradient-bg pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 safe-top glass-card border-b border-white/40 px-5 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">身体数据</h1>
          <p className="text-sm text-gray-400">追踪你的健康变化</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowWeightModal(true)}
          className="flex items-center gap-2 btn-primary text-sm py-2 px-4"
        >
          <Plus size={16} />
          记录体重
        </motion.button>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Main stats */}
        <div className="grid grid-cols-3 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-peach-100 rounded-3xl p-4 text-center"
          >
            <Weight size={20} className="text-peach-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-peach-500">{profile.currentWeight}</div>
            <div className="text-xs text-gray-500 mt-0.5">当前体重 kg</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-lavender-100 rounded-3xl p-4 text-center"
          >
            <Target size={20} className="text-lavender-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-lavender-500">{profile.goalWeight}</div>
            <div className="text-xs text-gray-500 mt-0.5">目标体重 kg</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-mint-100 rounded-3xl p-4 text-center"
          >
            <Ruler size={20} className="text-mint-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-mint-500">{profile.height}</div>
            <div className="text-xs text-gray-500 mt-0.5">身高 cm</div>
          </motion.div>
        </div>

        {/* BMI card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-3xl p-5"
        >
          <h2 className="text-lg font-bold text-gray-800 mb-4">BMI 指数</h2>
          <div className="flex items-center gap-6">
            <ProgressRing
              progress={Math.min(100, (bmi / 35) * 100)}
              size={100}
              strokeWidth={9}
              color={bmi < 24 ? '#86efac' : bmi < 28 ? '#fef08a' : '#ff8566'}
            >
              <div className="text-center">
                <div className="text-xl font-bold text-gray-800">{bmi}</div>
                <div className={clsx('text-xs font-semibold', bmiStatus.color)}>{bmiStatus.label}</div>
              </div>
            </ProgressRing>
            <div className="flex-1 space-y-2">
              {[
                { label: '偏瘦', range: '< 18.5', active: bmi < 18.5, color: 'bg-sky-400' },
                { label: '正常', range: '18.5 - 24', active: bmi >= 18.5 && bmi < 24, color: 'bg-mint-400' },
                { label: '偏重', range: '24 - 28', active: bmi >= 24 && bmi < 28, color: 'bg-butter-300' },
                { label: '肥胖', range: '≥ 28', active: bmi >= 28, color: 'bg-peach-400' },
              ].map(item => (
                <div key={item.label} className={clsx(
                  'flex items-center justify-between p-2 rounded-2xl transition-all',
                  item.active ? 'bg-gray-100' : ''
                )}>
                  <div className="flex items-center gap-2">
                    <div className={clsx('w-2 h-2 rounded-full', item.color)} />
                    <span className={clsx('text-sm font-medium', item.active ? 'text-gray-800' : 'text-gray-400')}>
                      {item.label}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">{item.range}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Goal progress */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card rounded-3xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">减重进度</h2>
            <button
              onClick={() => setShowEditGoal(true)}
              className="text-sm text-lavender-500 font-semibold"
            >
              修改目标
            </button>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-center">
              <div className="text-sm text-gray-400">起始</div>
              <div className="text-xl font-bold text-gray-600">{weightHistory[0]?.weight ?? profile.currentWeight} kg</div>
            </div>
            <div className="flex-1">
              <div className="flex justify-between text-xs text-gray-400 mb-2">
                <span className="text-peach-500 font-semibold">
                  已减 {((weightHistory[0]?.weight ?? profile.currentWeight) - profile.currentWeight).toFixed(1)} kg
                </span>
                <span>{progressToGoal}%</span>
              </div>
              <div className="progress-bar h-3">
                <motion.div
                  className="progress-fill h-3"
                  style={{ background: 'linear-gradient(90deg, #c4b5fd, #86efac)' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progressToGoal}%` }}
                  transition={{ delay: 0.5, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>还需减 {(profile.currentWeight - profile.goalWeight).toFixed(1)} kg</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-400">目标</div>
              <div className="text-xl font-bold text-lavender-500">{profile.goalWeight} kg</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-mint-50 rounded-2xl">
            <TrendingDown size={16} className="text-mint-500" />
            <p className="text-sm text-mint-700">
              按当前减重速度，预计 <span className="font-bold">
                {Math.ceil((profile.currentWeight - profile.goalWeight) / 0.5)} 周
              </span> 后达到目标！
            </p>
          </div>
        </motion.div>

        {/* Weight chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-3xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">体重折线图</h2>
            <span className="text-xs text-gray-400">最近30天</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                interval={3}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                domain={['dataMin - 1', 'dataMax + 1']}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                y={profile.goalWeight}
                stroke="#c4b5fd"
                strokeDasharray="5 5"
                strokeWidth={1.5}
                label={{ value: `目标 ${profile.goalWeight}`, position: 'right', fontSize: 10, fill: '#a78bfa' }}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#ff8566"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: '#ff8566', strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* History list */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass-card rounded-3xl p-5"
        >
          <h2 className="text-lg font-bold text-gray-800 mb-3">记录历史</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {[...weightHistory].reverse().map((record, i) => {
              const prev = weightHistory[weightHistory.length - 2 - i];
              const diff = prev ? record.weight - prev.weight : 0;
              return (
                <div key={record.date} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-500">{format(new Date(record.date), 'M月d日')}</span>
                  <div className="flex items-center gap-3">
                    {diff !== 0 && (
                      <span className={clsx(
                        'text-xs font-semibold px-2 py-0.5 rounded-full',
                        diff < 0 ? 'text-mint-600 bg-mint-100' : 'text-peach-500 bg-peach-100'
                      )}>
                        {diff > 0 ? '+' : ''}{diff.toFixed(1)}
                      </span>
                    )}
                    <span className="text-sm font-bold text-gray-700">{record.weight} kg</span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Add weight modal */}
      <AnimatePresence>
        {showWeightModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm flex items-end justify-center px-4 pb-6"
            onClick={() => setShowWeightModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 35 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-lg glass-card rounded-4xl p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-gray-800">记录今日体重</h3>
                <button onClick={() => setShowWeightModal(false)}>
                  <X size={20} className="text-gray-400" />
                </button>
              </div>
              <div className="text-center mb-6">
                <input
                  type="number"
                  step="0.1"
                  value={newWeight}
                  onChange={e => setNewWeight(e.target.value)}
                  className="text-5xl font-bold text-gray-800 bg-transparent border-0 outline-none text-center w-40"
                />
                <div className="text-gray-400 text-lg mt-1">kg</div>
              </div>
              <div className="flex gap-3">
                <div className="flex-1 grid grid-cols-3 gap-2">
                  {[-1, -0.5, -0.1, +0.1, +0.5, +1].map(delta => (
                    <button
                      key={delta}
                      onClick={() => setNewWeight(v => (parseFloat(v) + delta).toFixed(1))}
                      className="py-2 rounded-2xl bg-gray-100 text-sm font-semibold text-gray-600 active:scale-95 transition-transform"
                    >
                      {delta > 0 ? '+' : ''}{delta}
                    </button>
                  ))}
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={addWeight}
                className="btn-primary w-full mt-4 justify-center"
              >
                <Check size={16} />
                保存记录
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit goal modal */}
      <AnimatePresence>
        {showEditGoal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm flex items-end justify-center px-4 pb-6"
            onClick={() => setShowEditGoal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 35 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-lg glass-card rounded-4xl p-6"
            >
              <h3 className="text-lg font-bold text-gray-800 mb-4">修改目标体重</h3>
              <input
                type="number"
                step="0.5"
                value={goalInput}
                onChange={e => setGoalInput(e.target.value)}
                className="input-field text-2xl font-bold text-center mb-4"
                placeholder="目标体重 (kg)"
              />
              <motion.button whileTap={{ scale: 0.97 }} onClick={saveGoal} className="btn-primary w-full justify-center">
                <Check size={16} /> 保存
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
