/**
 * SlimFit v3.0 - 底部导航栏
 *
 * 精致毛玻璃底部导航 · 流畅弹簧动画
 * 悬浮指示点 · 渐变激活状态 · 安全区适配
 *
 * @since 2026-04-22 v3.0 视觉全面升级
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store';
import { Home, Utensils, Activity, Dumbbell, User } from 'lucide-react';
import clsx from 'clsx';

/* ==================== 导航项配置 ==================== */

type TabKey = 'dashboard' | 'diet' | 'body' | 'plan' | 'profile';

const tabs: Array<{
  key: TabKey;
  icon: React.ComponentType<any>;
  label: string;
  activeColor: string;
  activeBg: string;
  dotColor: string;
}> = [
  {
    key: 'dashboard',
    icon: Home,
    label: '首页',
    activeColor: 'text-peach-500',
    activeBg: 'bg-peach-100',
    dotColor: 'bg-peach-400',
  },
  {
    key: 'diet',
    icon: Utensils,
    label: '饮食',
    activeColor: 'text-mint-600',
    activeBg: 'bg-mint-100',
    dotColor: 'bg-mint-400',
  },
  {
    key: 'body',
    icon: Activity,
    label: '身体',
    activeColor: 'text-lavender-600',
    activeBg: 'bg-lavender-100',
    dotColor: 'bg-lavender-400',
  },
  {
    key: 'plan',
    icon: Dumbbell,
    label: '计划',
    activeColor: 'text-sky-600',
    activeBg: 'bg-sky-100',
    dotColor: 'bg-sky-400',
  },
  {
    key: 'profile',
    icon: User,
    label: '我的',
    activeColor: 'text-rose-500',
    activeBg: 'bg-rose-100',
    dotColor: 'bg-rose-400',
  },
];

/* ==================== 组件 ==================== */

export function BottomNav() {
  const { state, dispatch } = useStore();
  const { activeTab } = state;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {/* 外层居中约束，与主内容区对齐 */}
      <div className="max-w-lg mx-auto px-3 pb-2 pt-1">
        {/* 导航容器 */}
        <div
          className="glass-card-xl rounded-3xl px-1 py-2"
          style={{
            background: 'rgba(255, 255, 255, 0.88)',
            backdropFilter: 'blur(28px) saturate(1.4)',
            WebkitBackdropFilter: 'blur(28px) saturate(1.4)',
            border: '1px solid rgba(255, 255, 255, 0.72)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.9)',
          }}
        >
          <div className="flex items-center justify-around">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              const Icon = tab.icon;

              return (
                <motion.button
                  key={tab.key}
                  onClick={() => dispatch({ type: 'SET_TAB', tab: tab.key })}
                  className={clsx(
                    'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl relative transition-colors duration-200',
                    'min-w-[52px]'
                  )}
                  whileTap={{ scale: 0.88 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                >
                  {/* 激活背景 pill */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        layoutId="nav-active-bg"
                        className={clsx('absolute inset-0 rounded-2xl', tab.activeBg)}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                  </AnimatePresence>

                  {/* 图标 */}
                  <div className="relative z-10">
                    <motion.div
                      animate={isActive ? { y: -1 } : { y: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    >
                      <Icon
                        size={20}
                        strokeWidth={isActive ? 2.2 : 1.7}
                        className={clsx(
                          'transition-colors duration-200',
                          isActive ? tab.activeColor : 'text-gray-400'
                        )}
                      />
                    </motion.div>
                  </div>

                  {/* 标签文字 */}
                  <span
                    className={clsx(
                      'relative z-10 text-[10.5px] font-semibold tracking-tight transition-colors duration-200',
                      isActive ? tab.activeColor : 'text-gray-400'
                    )}
                  >
                    {tab.label}
                  </span>

                  {/* 激活指示点 */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        className={clsx('absolute -top-1 w-1.5 h-1.5 rounded-full', tab.dotColor)}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        transition={{ type: 'spring', stiffness: 600, damping: 25 }}
                      />
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
