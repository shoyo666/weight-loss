import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store';
import {
  User, Bell, Target, Edit3, Check, X,
  LogOut, Shield, Download, Database, ChevronRight,
  Trash2,
} from 'lucide-react';
import clsx from 'clsx';

const activityOptions = [
  { value: 'sedentary', label: '久坐', desc: '几乎不运动' },
  { value: 'light', label: '轻度', desc: '每周1-3次' },
  { value: 'moderate', label: '中度', desc: '每周3-5次' },
  { value: 'active', label: '积极', desc: '每周6-7次' },
  { value: 'very_active', label: '高强度', desc: '高强度训练' },
] as const;

export function ProfilePage() {
  const { state, dispatch } = useStore();
  const { profile } = state;

  if (!profile) return null;

  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const startEdit = (field: string, value: string | number) => {
    setEditingField(field);
    setTempValue(value.toString());
  };

  const saveEdit = (field: string) => {
    const numValue = parseFloat(tempValue);
    const strValue = tempValue;
    switch (field) {
      case 'name':
        dispatch({ type: 'UPDATE_PROFILE', profile: { name: strValue } });
        break;
      case 'age':
        if (!isNaN(numValue)) dispatch({ type: 'UPDATE_PROFILE', profile: { age: Math.round(numValue) } });
        break;
      case 'height':
        if (!isNaN(numValue)) dispatch({ type: 'UPDATE_PROFILE', profile: { height: numValue } });
        break;
      case 'currentWeight':
        if (!isNaN(numValue)) dispatch({ type: 'UPDATE_PROFILE', profile: { currentWeight: numValue } });
        break;
      case 'goalWeight':
        if (!isNaN(numValue)) dispatch({ type: 'UPDATE_PROFILE', profile: { goalWeight: numValue } });
        break;
      case 'dailyCalorieGoal':
        if (!isNaN(numValue)) dispatch({ type: 'UPDATE_PROFILE', profile: { dailyCalorieGoal: Math.round(numValue) } });
        break;
      case 'reminderTime':
        dispatch({ type: 'UPDATE_PROFILE', profile: { reminderTime: strValue } });
        break;
    }
    setEditingField(null);
  };

  // Stats
  const totalCheckIns = state.checkIns.filter(c => c.completed).length;
  const totalWorkouts = state.workoutPlans.filter(p => p.completed).length;
  const totalWeightLost = Math.max(0, (state.weightHistory[0]?.weight ?? profile.currentWeight) - profile.currentWeight);

  const bmi = +(profile.currentWeight / Math.pow(profile.height / 100, 2)).toFixed(1);

  const avatarColors = ['bg-peach-200', 'bg-lavender-200', 'bg-mint-200', 'bg-sky-200', 'bg-butter-200'];
  const avatarColor = avatarColors[profile.name.charCodeAt(0) % avatarColors.length];

  return (
    <div className="min-h-[100dvh] gradient-bg pb-24">
      {/* Header */}
      <div className="safe-top glass-card border-b border-white/40">
        <div className="px-5 pt-6 pb-5">
          {/* Avatar */}
          <div className="flex flex-col items-center mb-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className={clsx(
                'w-20 h-20 rounded-3xl flex items-center justify-center text-3xl font-bold text-white shadow-glass-lg',
                avatarColor
              )}
            >
              {profile.name[0]}
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-3 text-center"
            >
              <h1 className="text-xl font-bold text-gray-800">{profile.name}</h1>
              <p className="text-sm text-gray-400">{profile.age}岁 · BMI {bmi}</p>
            </motion.div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: '打卡天数', value: totalCheckIns, color: 'text-peach-500', bg: 'bg-peach-50' },
              { label: '训练完成', value: totalWorkouts, color: 'text-lavender-500', bg: 'bg-lavender-50' },
              { label: '已减重(kg)', value: totalWeightLost.toFixed(1), color: 'text-mint-500', bg: 'bg-mint-50' },
            ].map(stat => (
              <div key={stat.label} className={clsx('rounded-2xl p-3 text-center', stat.bg)}>
                <div className={clsx('text-2xl font-bold', stat.color)}>{stat.value}</div>
                <div className="text-xs text-gray-400 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Profile info */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-3xl overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
            <User size={16} className="text-peach-400" />
            <h2 className="font-bold text-gray-800">基本信息</h2>
          </div>
          {[
            { field: 'name', label: '昵称', value: profile.name, type: 'text' },
            { field: 'age', label: '年龄', value: profile.age, unit: '岁', type: 'number' },
            { field: 'height', label: '身高', value: profile.height, unit: 'cm', type: 'number' },
            { field: 'currentWeight', label: '当前体重', value: profile.currentWeight, unit: 'kg', type: 'number' },
            { field: 'goalWeight', label: '目标体重', value: profile.goalWeight, unit: 'kg', type: 'number' },
          ].map(item => (
            <div key={item.field} className="px-5 py-3.5 flex items-center justify-between border-b border-gray-50 last:border-0">
              <span className="text-sm text-gray-500">{item.label}</span>
              {editingField === item.field ? (
                <div className="flex items-center gap-2">
                  <input
                    type={item.type}
                    value={tempValue}
                    onChange={e => setTempValue(e.target.value)}
                    className="w-28 text-right bg-gray-100 rounded-xl px-3 py-1.5 text-sm font-semibold outline-none focus:ring-2 ring-peach-300"
                    autoFocus
                    onKeyDown={e => e.key === 'Enter' && saveEdit(item.field)}
                  />
                  <button onClick={() => saveEdit(item.field)} className="w-7 h-7 rounded-lg bg-mint-100 flex items-center justify-center">
                    <Check size={12} className="text-mint-600" />
                  </button>
                  <button onClick={() => setEditingField(null)} className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
                    <X size={12} className="text-gray-400" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => startEdit(item.field, item.value)}
                  className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-peach-500"
                >
                  {item.value}{item.unit || ''}
                  <Edit3 size={12} className="text-gray-300" />
                </button>
              )}
            </div>
          ))}
        </motion.div>

        {/* Goals & calories */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-3xl overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
            <Target size={16} className="text-lavender-500" />
            <h2 className="font-bold text-gray-800">目标设置</h2>
          </div>
          <div className="px-5 py-3.5 flex items-center justify-between border-b border-gray-50">
            <span className="text-sm text-gray-500">每日热量目标</span>
            {editingField === 'dailyCalorieGoal' ? (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={tempValue}
                  onChange={e => setTempValue(e.target.value)}
                  className="w-28 text-right bg-gray-100 rounded-xl px-3 py-1.5 text-sm font-semibold outline-none focus:ring-2 ring-peach-300"
                  autoFocus
                />
                <button onClick={() => saveEdit('dailyCalorieGoal')} className="w-7 h-7 rounded-lg bg-mint-100 flex items-center justify-center">
                  <Check size={12} className="text-mint-600" />
                </button>
                <button onClick={() => setEditingField(null)} className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
                  <X size={12} className="text-gray-400" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => startEdit('dailyCalorieGoal', profile.dailyCalorieGoal)}
                className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-peach-500"
              >
                {profile.dailyCalorieGoal} kcal
                <Edit3 size={12} className="text-gray-300" />
              </button>
            )}
          </div>
          <div className="px-5 py-3.5">
            <p className="text-sm text-gray-500 mb-3">活动等级</p>
            <div className="space-y-2">
              {activityOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => dispatch({ type: 'UPDATE_PROFILE', profile: { activityLevel: opt.value } })}
                  className={clsx(
                    'w-full flex items-center justify-between p-3 rounded-2xl transition-all',
                    profile.activityLevel === opt.value ? 'bg-peach-50 border border-peach-200' : 'bg-gray-50'
                  )}
                >
                  <div className="text-left">
                    <p className={clsx('text-sm font-semibold', profile.activityLevel === opt.value ? 'text-peach-600' : 'text-gray-600')}>
                      {opt.label}
                    </p>
                    <p className="text-xs text-gray-400">{opt.desc}</p>
                  </div>
                  {profile.activityLevel === opt.value && (
                    <Check size={16} className="text-peach-500" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Reminder */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-3xl overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
            <Bell size={16} className="text-sky-400" />
            <h2 className="font-bold text-gray-800">提醒设置</h2>
          </div>
          <div className="px-5 py-3.5 flex items-center justify-between border-b border-gray-50">
            <div>
              <p className="text-sm font-semibold text-gray-700">每日打卡提醒</p>
              <p className="text-xs text-gray-400 mt-0.5">定时提醒记录饮食和打卡</p>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => dispatch({ type: 'UPDATE_PROFILE', profile: { reminderEnabled: !profile.reminderEnabled } })}
              className={clsx(
                'w-12 h-6 rounded-full relative transition-colors duration-300',
                profile.reminderEnabled ? 'bg-peach-400' : 'bg-gray-200'
              )}
            >
              <motion.div
                animate={{ x: profile.reminderEnabled ? 24 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm"
              />
            </motion.button>
          </div>
          {profile.reminderEnabled && (
            <div className="px-5 py-3.5 flex items-center justify-between">
              <span className="text-sm text-gray-500">提醒时间</span>
              {editingField === 'reminderTime' ? (
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={tempValue}
                    onChange={e => setTempValue(e.target.value)}
                    className="bg-gray-100 rounded-xl px-3 py-1.5 text-sm font-semibold outline-none"
                    autoFocus
                  />
                  <button onClick={() => saveEdit('reminderTime')} className="w-7 h-7 rounded-lg bg-mint-100 flex items-center justify-center">
                    <Check size={12} className="text-mint-600" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => startEdit('reminderTime', profile.reminderTime)}
                  className="flex items-center gap-1.5 text-sm font-semibold text-gray-700"
                >
                  {profile.reminderTime}
                  <Edit3 size={12} className="text-gray-300" />
                </button>
              )}
            </div>
          )}
        </motion.div>

        {/* Data management */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-3xl overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
            <Database size={16} className="text-mint-500" />
            <h2 className="font-bold text-gray-800">数据管理</h2>
          </div>
          {[
            { label: '导出数据', desc: '导出所有饮食和体重记录', icon: Download, color: 'text-peach-500', onClick: () => {} },
            { label: '隐私政策', desc: '查看数据使用说明', icon: Shield, color: 'text-sky-500', onClick: () => {} },
          ].map(item => (
            <button
              key={item.label}
              onClick={item.onClick}
              className="w-full px-5 py-3.5 flex items-center justify-between border-b border-gray-50 last:border-0 active:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <item.icon size={17} className={item.color} />
                <div className="text-left">
                  <p className={clsx('text-sm font-semibold', item.color)}>{item.label}</p>
                  <p className="text-xs text-gray-400">{item.desc}</p>
                </div>
              </div>
              <ChevronRight size={14} className="text-gray-300" />
            </button>
          ))}
          {/* 危险操作：清空数据 */}
          <button
            onClick={() => setShowClearConfirm(true)}
            className="w-full px-5 py-3.5 flex items-center justify-between active:bg-red-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Trash2 size={17} className="text-red-400" />
              <div className="text-left">
                <p className="text-sm font-semibold text-red-400">清空所有数据</p>
                <p className="text-xs text-gray-400">不可逆操作，请谨慎</p>
              </div>
            </div>
            <ChevronRight size={14} className="text-gray-300" />
          </button>
        </motion.div>

        {/* 退出登录 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="pb-2"
        >
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full py-4 rounded-3xl font-bold text-base flex items-center justify-center gap-2 transition-all"
            style={{
              background: 'rgba(255,255,255,0.9)',
              border: '1.5px solid rgba(255, 96, 64, 0.18)',
              color: '#ff5c36',
              boxShadow: '0 2px 12px rgba(255,96,64,0.1)',
            }}
          >
            <LogOut size={18} />
            退出登录
          </motion.button>
        </motion.div>

        {/* Version info */}
        <div className="text-center py-4">
          <p className="text-xs text-gray-300">SlimFit v2.0.0 · 数据本地存储</p>
          <p className="text-xs text-gray-300 mt-1">Made with 💚 for your health journey</p>
        </div>
      </div>

      {/* ======= 退出登录确认弹窗 ======= */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm flex items-center justify-center px-6"
            onClick={() => setShowLogoutConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-sm glass-card-xl rounded-4xl p-6 text-center"
            >
              <div className="w-14 h-14 rounded-3xl bg-peach-100 flex items-center justify-center mx-auto mb-4">
                <LogOut size={24} className="text-peach-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-1.5">退出登录</h3>
              <p className="text-sm text-gray-400 mb-6">
                确定要退出当前账户吗？<br />本地数据不会丢失。
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 py-3 rounded-3xl font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  取消
                </button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    dispatch({ type: 'LOGOUT' });
                    setShowLogoutConfirm(false);
                  }}
                  className="flex-1 py-3 rounded-3xl font-bold text-white flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #ffb09a, #ff6040)' }}
                >
                  <LogOut size={15} />
                  确认退出
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======= 清空数据确认弹窗 ======= */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm flex items-center justify-center px-6"
            onClick={() => setShowClearConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-sm glass-card-xl rounded-4xl p-6 text-center"
            >
              <div className="w-14 h-14 rounded-3xl bg-red-100 flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} className="text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-1.5">清空所有数据</h3>
              <p className="text-sm text-gray-400 mb-2">
                此操作将清除所有体重、饮食、训练记录。
              </p>
              <p className="text-xs font-bold text-red-400 bg-red-50 rounded-2xl px-3 py-2 mb-6">
                ⚠️ 不可逆操作，请谨慎！
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 py-3 rounded-3xl font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  取消
                </button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    dispatch({ type: 'CLEAR_ALL_DATA' });
                    setShowClearConfirm(false);
                  }}
                  className="flex-1 py-3 rounded-3xl font-bold text-white bg-red-400 hover:bg-red-500 transition-colors"
                >
                  确认清空
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
