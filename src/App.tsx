/**
 * SlimFit v2.0 - 应用入口
 * 
 * 页面路由架构：
 * - /auth          → 登录/注册（未认证时）
 * - /onboarding    → 初始信息设置（认证后首次）
 * - /              → 主应用（5 Tab 页面）
 * 
 * 使用 react-router-dom v6 进行路由管理
 * 
 * @since 2026-04-21 v2.0 全面升级
 */

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { StoreProvider, useStore } from './store';
import { BottomNav } from './components/ui/BottomNav';
import { Dashboard } from './components/pages/Dashboard';
import { DietPage } from './components/pages/DietPage';
import { BodyPage } from './components/pages/BodyPage';
import { PlanPage } from './components/pages/PlanPage';
import { ProfilePage } from './components/pages/ProfilePage';
import { LoginPage } from './components/pages/LoginPage';
import { RegisterPage } from './components/pages/RegisterPage';
import { OnboardingPage } from './components/pages/OnboardingPage';
import { AIAssistant } from './components/ui/AIAssistant';

/* ==================== 页面切换动画配置 ==================== */

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

const pageTransition = {
  duration: 0.25,
  ease: [0.16, 1, 0.3, 1] as const,
};

/* ==================== 认证守卫组件 ==================== */

type AuthView = 'login' | 'register';

/**
 * 认证路由 - 控制登录/注册/初始信息页面的显示
 */
function AuthGate() {
  const { state } = useStore();
  const [authView, setAuthView] = useState<AuthView>('login');

  // 已登录 → 检查是否需要初始信息设置
  if (state.isLoggedIn && state.currentUser?.isProfileComplete) {
    console.log('[AuthGate] 渲染 AppContent (profile已完善)');
    return <AppContent />;
  }

  // 已登录但未完善信息 → 初始信息编辑页
  if (state.isLoggedIn && !state.currentUser?.isProfileComplete) {
    console.log('[AuthGate] 渲染 OnboardingPage (profile未完善)');
    return <OnboardingPage />;
  }

  // 未登录 → 登录/注册页
  console.log('[AuthGate] 渲染登录/注册页');
  return (
    <>
      <AnimatePresence mode="wait">
        {authView === 'login' ? (
          <motion.div
            key="login"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <LoginPage onSwitchToRegister={() => setAuthView('register')} />
          </motion.div>
        ) : (
          <motion.div
            key="register"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <RegisterPage onSwitchToLogin={() => setAuthView('login')} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ==================== 主应用内容 ==================== */

/**
 * 主应用内容 - 5 个 Tab 页面 + 底部导航栏
 */
function AppContent() {
  const { state } = useStore();
  const { activeTab } = state;
  /** Tab → 页面组件映射 */
  const pages: Record<typeof activeTab, JSX.Element> = {
    dashboard: <Dashboard />,
    diet: <DietPage />,
    body: <BodyPage />,
    plan: <PlanPage />,
    profile: <ProfilePage />,
  };

  return (
    <div className="max-w-lg mx-auto relative min-h-[100dvh]">
      {/* 页面内容区域 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={pageTransition}
        >
          {pages[activeTab]}
        </motion.div>
      </AnimatePresence>

      {/* 底部固定导航栏 */}
      <BottomNav />

    </div>
  );
}

/* ==================== 根组件 ==================== */

/**
 * SlimFit 应用根组件
 * - 包裹 StoreProvider 提供全局状态
 * - 处理认证状态检查
 * - 桌面端响应式适配
 */
export default function App() {
  return (
    <StoreProvider>
      {/* 桌面端外层容器 - 居中显示手机端宽度 */}
      <div className="min-h-[100dvh] bg-gradient-to-br from-gray-100 to-gray-200/50">
        <AuthGate />
        {/* AI 助手 — fixed + calc 定位，始终在手机图框内，不受页面切换影响 */}
        <AIAssistant />
      </div>
    </StoreProvider>
  );
}
