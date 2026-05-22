/**
 * SlimFit v2.0 - 全局状态管理
 * 
 * 基于 React useReducer + Context 实现
 * 支持 localStorage 持久化 + 用户认证
 * 
 * 数据隔离方案：
 * - 用户账户存储在 slimfit_v2_users
 * - 每个用户的数据独立存储为 slimfit_v2_data_{userId}
 * - 新用户首次登录时，数据为空数组（不预填充假数据）
 * 
 * @since 2026-04-21 v2.0 全面升级
 * @updated 2026-04-22 用户数据隔离
 */

import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import {
  AppState, UserAccount, UserProfile, WeightRecord, FoodItem,
  DietRecord, MealPhoto, WorkoutPlan, WeeklySchedule, WeeklySlotPlan,
  CheckInRecord, TimeSlot, WeekDay,
} from '../types';

/* ==================== 常量 ==================== */

/** localStorage 用户列表存储键名 */
const USERS_KEY = 'slimfit_v2_users';
/** 数据存储键名前缀（每个用户独立） */
const DATA_KEY_PREFIX = 'slimfit_v2_data_';

/* ==================== 数据加载（按用户） ==================== */

/** 空数据模板 - 新用户初始状态 */
const createEmptyUserData = () => ({
  profile: null as UserProfile | null,
  weightHistory: [] as WeightRecord[],
  dietHistory: [] as DietRecord[],
  mealPhotos: [] as MealPhoto[],
  workoutPlans: [] as WorkoutPlan[],
  weeklySchedule: null as WeeklySchedule | null,
  checkIns: [] as CheckInRecord[],
});

type UserData = ReturnType<typeof createEmptyUserData>;

/** 从 localStorage 加载用户列表 */
const loadUsers = (): UserAccount[] => {
  try {
    const saved = localStorage.getItem(USERS_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* 忽略解析错误 */ }
  return [];
};

/** 保存用户列表到 localStorage */
const saveUsers = (users: UserAccount[]) => {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('[Store] 保存用户列表失败（localStorage 可能已满）:', e);
  }
};

/** 加载指定用户的数据（按 userId） */
const loadUserData = (userId: string): UserData => {
  try {
    const saved = localStorage.getItem(DATA_KEY_PREFIX + userId);
    if (saved) return JSON.parse(saved);
  } catch { /* 忽略解析错误 */ }
  return createEmptyUserData();
};

/** 保存指定用户的数据（按 userId） */
const saveUserData = (userId: string, data: UserData) => {
  try {
    localStorage.setItem(DATA_KEY_PREFIX + userId, JSON.stringify(data));
  } catch (e) {
    console.error('[Store] 保存用户数据失败（localStorage 可能已满，请清理历史记录）:', e);
  }
};

/* ==================== 初始状态 ==================== */

/** 应用初始状态（未登录） */
const createInitialState = (): Omit<AppState, keyof UserData> & { userData: UserData } => ({
  isLoggedIn: false,
  currentUser: null,
  users: loadUsers(),
  // 用户数据单独管理
  userData: createEmptyUserData(),
  activeTab: 'dashboard',
});

/* ==================== Action 类型定义 ==================== */

type Action =
  // 认证相关
  | { type: 'REGISTER'; username: string; password: string; nickname: string }
  | { type: 'LOGIN'; username: string; password: string }
  | { type: 'LOGOUT' }
  | { type: 'COMPLETE_PROFILE'; profile: UserProfile }
  | { type: 'LOAD_USER_DATA'; userId: string }
  
  // 导航
  | { type: 'SET_TAB'; tab: AppState['activeTab'] }
  
  // 个人资料
  | { type: 'UPDATE_PROFILE'; profile: Partial<UserProfile> }
  
  // 体重记录
  | { type: 'ADD_WEIGHT'; record: WeightRecord }
  | { type: 'DELETE_WEIGHT'; date: string }
  
  // 饮食记录
  | { type: 'ADD_FOOD'; food: FoodItem }
  | { type: 'DELETE_FOOD'; foodId: string }
  | { type: 'UPDATE_WATER'; date: string; amount: number }
  | { type: 'DELETE_WATER_LOG'; date: string; amount: number }
  
  // 训练计划
  | { type: 'ADD_WORKOUT'; plan: WorkoutPlan }
  | { type: 'COMPLETE_WORKOUT'; id: string }
  
  // 周课程表（v2.0）
  | { type: 'SET_WEEKLY_SCHEDULE'; schedule: WeeklySchedule }
  | { type: 'COMPLETE_WEEKLY_SLOT'; day: WeekDay; timeSlot: TimeSlot }
  
  // 打卡
  | { type: 'CHECKIN'; date: string }
  
  // 餐次照片
  | { type: 'ADD_MEAL_PHOTO'; photo: MealPhoto }
  | { type: 'DELETE_MEAL_PHOTO'; photoId: string }

  // 数据重置
  | { type: 'CLEAR_ALL_DATA' };

/* ==================== 辅助函数 ==================== */

/** 简单密码哈希（演示用，非安全） */
const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return 'h_' + Math.abs(hash).toString(36);
};

/** 从状态中提取用户相关数据（用于存储） */
const extractUserData = (state: AppState): UserData => ({
  profile: state.profile ?? null,
  weightHistory: state.weightHistory ?? [],
  dietHistory: state.dietHistory ?? [],
  mealPhotos: state.mealPhotos ?? [],
  workoutPlans: state.workoutPlans ?? [],
  weeklySchedule: state.weeklySchedule ?? null,
  checkIns: state.checkIns ?? [],
});

/* ==================== Reducer ==================== */

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    /* ---------- 注册 ---------- */
    case 'REGISTER': {
      const exists = state.users.find(u => u.username === action.username);
      if (exists) return state; // 用户名已存在，不处理

      // 创建新用户账户
      const newUser: UserAccount = {
        id: Date.now().toString(),
        username: action.username,
        password: simpleHash(action.password),
        nickname: action.nickname || action.username,
        avatar: '',
        createdAt: new Date().toISOString(),
        isProfileComplete: false,
      };

      const updatedUsers = [...state.users, newUser];
      saveUsers(updatedUsers);

      // 为新用户创建空数据（不预填充任何假数据）
      const emptyUserData = createEmptyUserData();
      saveUserData(newUser.id, emptyUserData);

      console.log('[Store] 注册成功:', newUser.username, '数据为空');

      return {
        ...state,
        users: updatedUsers,
        isLoggedIn: true,
        currentUser: newUser,
        // 加载空数据
        profile: emptyUserData.profile!,
        weightHistory: emptyUserData.weightHistory,
        dietHistory: emptyUserData.dietHistory,
        mealPhotos: emptyUserData.mealPhotos,
        workoutPlans: emptyUserData.workoutPlans,
        weeklySchedule: emptyUserData.weeklySchedule,
        checkIns: emptyUserData.checkIns,
      };
    }

    /* ---------- 登录 ---------- */
    case 'LOGIN': {
      const user = state.users.find(
        u => u.username === action.username && u.password === simpleHash(action.password)
      );
      if (!user) return state; // 认证失败

      // 加载该用户的独立数据
      const userData = loadUserData(user.id);
      console.log('[Store] 登录成功:', user.username, '已加载用户数据:', {
        hasProfile: !!userData.profile,
        weightCount: userData.weightHistory.length,
        dietCount: userData.dietHistory.length,
        checkInCount: userData.checkIns.length,
      });

      return {
        ...state,
        isLoggedIn: true,
        currentUser: user,
        // 从用户独立存储中加载数据
        profile: userData.profile ?? null,
        weightHistory: userData.weightHistory,
        dietHistory: userData.dietHistory,
        mealPhotos: userData.mealPhotos,
        workoutPlans: userData.workoutPlans,
        weeklySchedule: userData.weeklySchedule,
        checkIns: userData.checkIns,
      };
    }

    /* ---------- 登出 ---------- */
    case 'LOGOUT': {
      // 登出前保存当前用户数据
      if (state.currentUser) {
        saveUserData(state.currentUser.id, extractUserData(state));
        console.log('[Store] 登出，已保存用户数据');
      }
      return {
        ...state,
        isLoggedIn: false,
        currentUser: null,
        profile: null,
        weightHistory: [],
        dietHistory: [],
        mealPhotos: [],
        workoutPlans: [],
        weeklySchedule: null,
        checkIns: [],
      };
    }

    /* ---------- 加载用户数据（切换用户时） ---------- */
    case 'LOAD_USER_DATA': {
      const userData = loadUserData(action.userId);
      return {
        ...state,
        profile: userData.profile ?? null,
        weightHistory: userData.weightHistory,
        dietHistory: userData.dietHistory,
        mealPhotos: userData.mealPhotos,
        workoutPlans: userData.workoutPlans,
        weeklySchedule: userData.weeklySchedule,
        checkIns: userData.checkIns,
      };
    }

    /* ---------- 完善初始信息 ---------- */
    case 'COMPLETE_PROFILE': {
      if (!state.currentUser) return state;

      const updatedUsers = state.users.map(u =>
        u.id === state.currentUser!.id
          ? { ...u, isProfileComplete: true, nickname: action.profile.name || u.nickname }
          : u
      );
      saveUsers(updatedUsers);

      const newUserData = {
        ...extractUserData(state),
        profile: action.profile,
      };
      saveUserData(state.currentUser.id, newUserData);

      return {
        ...state,
        profile: action.profile,
        currentUser: { ...state.currentUser, isProfileComplete: true },
        users: updatedUsers,
      };
    }

    /* ---------- 切换 Tab ---------- */
    case 'SET_TAB':
      return { ...state, activeTab: action.tab };

    /* ---------- 更新个人资料 ---------- */
    case 'UPDATE_PROFILE': {
      if (!state.currentUser) return state;
      const newProfile = { ...(state.profile ?? {}), ...action.profile } as UserProfile;
      const newUserData = { ...extractUserData(state), profile: newProfile };
      saveUserData(state.currentUser.id, newUserData);
      return { ...state, profile: newProfile };
    }

    /* ---------- 添加体重记录 ---------- */
    case 'ADD_WEIGHT': {
      if (!state.currentUser) return state;
      const exists = state.weightHistory.findIndex(w => w.date === action.record.date);
      const updated = exists >= 0
        ? state.weightHistory.map((w, i) => i === exists ? action.record : w)
        : [...state.weightHistory, action.record].sort((a, b) => a.date.localeCompare(b.date));
      const newUserData = { ...extractUserData(state), weightHistory: updated };
      saveUserData(state.currentUser.id, newUserData);
      return {
        ...state,
        weightHistory: updated,
        profile: { ...(state.profile ?? {}), currentWeight: action.record.weight } as UserProfile,
      };
    }

    /* ---------- 删除体重记录 ---------- */
    case 'DELETE_WEIGHT': {
      if (!state.currentUser) return state;
      const updated = state.weightHistory.filter(w => w.date !== action.date);
      const newUserData = { ...extractUserData(state), weightHistory: updated };
      saveUserData(state.currentUser.id, newUserData);
      return { ...state, weightHistory: updated };
    }

    /* ---------- 添加食物 ---------- */
    case 'ADD_FOOD': {
      if (!state.currentUser) return state;
      const today = action.food.date || new Date().toISOString().split('T')[0];
      const existingRecord = state.dietHistory.find(d => d.date === today);
      let updated: DietRecord[];
      if (existingRecord) {
        updated = state.dietHistory.map(d => {
          if (d.date !== today) return d;
          const meals = [...d.meals, action.food];
          return {
            ...d,
            meals,
            totalCalories: meals.reduce((sum, f) => sum + f.calories, 0),
          };
        });
      } else {
        const newRecord: DietRecord = {
          date: today,
          meals: [action.food],
          totalCalories: action.food.calories,
          waterIntake: 0,
        };
        updated = [...state.dietHistory, newRecord];
      }
      const newUserData = { ...extractUserData(state), dietHistory: updated };
      saveUserData(state.currentUser.id, newUserData);
      return { ...state, dietHistory: updated };
    }

    /* ---------- 删除食物记录 ---------- */
    case 'DELETE_FOOD': {
      if (!state.currentUser) return state;
      const updated = state.dietHistory.map(d => {
        const meals = d.meals.filter(f => f.id !== action.foodId);
        return {
          ...d,
          meals,
          totalCalories: meals.reduce((sum, f) => sum + f.calories, 0),
        };
      });
      const newUserData = { ...extractUserData(state), dietHistory: updated };
      saveUserData(state.currentUser.id, newUserData);
      return { ...state, dietHistory: updated };
    }

    /* ---------- 更新饮水量 ---------- */
    case 'UPDATE_WATER': {
      if (!state.currentUser) return state;
      const updated = state.dietHistory.map(d =>
        d.date === action.date ? { ...d, waterIntake: action.amount } : d
      );
      const newUserData = { ...extractUserData(state), dietHistory: updated };
      saveUserData(state.currentUser.id, newUserData);
      return { ...state, dietHistory: updated };
    }

    /* ---------- 删除饮水记录（减少指定量） ---------- */
    case 'DELETE_WATER_LOG': {
      if (!state.currentUser) return state;
      const today = action.date || new Date().toISOString().split('T')[0];
      const currentDiet = state.dietHistory.find(d => d.date === today);
      const currentWater = currentDiet?.waterIntake ?? 0;
      const newWater = Math.max(0, currentWater - action.amount);
      const updated = state.dietHistory.map(d =>
        d.date === today ? { ...d, waterIntake: newWater } : d
      );
      const newUserData = { ...extractUserData(state), dietHistory: updated };
      saveUserData(state.currentUser.id, newUserData);
      return { ...state, dietHistory: updated };
    }

    /* ---------- 添加训练计划 ---------- */
    case 'ADD_WORKOUT': {
      if (!state.currentUser) return state;
      const newUserData = {
        ...extractUserData(state),
        workoutPlans: [action.plan, ...state.workoutPlans],
      };
      saveUserData(state.currentUser.id, newUserData);
      return { ...state, workoutPlans: [action.plan, ...state.workoutPlans] };
    }

    /* ---------- 完成训练计划 ---------- */
    case 'COMPLETE_WORKOUT': {
      if (!state.currentUser) return state;
      const updatedPlans = state.workoutPlans.map(p =>
        p.id === action.id ? { ...p, completed: true } : p
      );
      const newUserData = { ...extractUserData(state), workoutPlans: updatedPlans };
      saveUserData(state.currentUser.id, newUserData);
      return { ...state, workoutPlans: updatedPlans };
    }

    /* ---------- 设置周课程表 ---------- */
    case 'SET_WEEKLY_SCHEDULE': {
      if (!state.currentUser) return state;
      const newUserData = { ...extractUserData(state), weeklySchedule: action.schedule };
      saveUserData(state.currentUser.id, newUserData);
      return { ...state, weeklySchedule: action.schedule };
    }

    /* ---------- 完成周课程表中的单个时段 ---------- */
    case 'COMPLETE_WEEKLY_SLOT': {
      if (!state.currentUser || !state.weeklySchedule) return state;
      const updatedSlots = state.weeklySchedule.slots.map(slot =>
        slot.day === action.day && slot.timeSlot === action.timeSlot
          ? { ...slot, completed: true }
          : slot
      );
      const newSchedule = {
        ...state.weeklySchedule,
        slots: updatedSlots,
        completedSlots: updatedSlots.filter(s => s.completed).length,
      };
      const newUserData = { ...extractUserData(state), weeklySchedule: newSchedule };
      saveUserData(state.currentUser.id, newUserData);
      return { ...state, weeklySchedule: newSchedule };
    }

    /* ---------- 打卡 ---------- */
    case 'CHECKIN': {
      if (!state.currentUser) return state;
      const exists = state.checkIns.find(c => c.date === action.date);
      let updatedCheckIns: CheckInRecord[];
      if (exists) {
        updatedCheckIns = state.checkIns.map(c =>
          c.date === action.date ? { ...c, completed: true } : c
        );
      } else {
        const todayDiet = state.dietHistory.find(d => d.date === action.date);
        const newCheckIn: CheckInRecord = {
          date: action.date,
          completed: true,
          calorieGoalMet: todayDiet
            ? todayDiet.totalCalories <= (state.profile?.dailyCalorieGoal ?? 2000)
            : false,
          workoutCompleted: false,
        };
        updatedCheckIns = [...state.checkIns, newCheckIn];
      }
      const newUserData = { ...extractUserData(state), checkIns: updatedCheckIns };
      saveUserData(state.currentUser.id, newUserData);
      return { ...state, checkIns: updatedCheckIns };
    }

    /* ---------- 添加餐次照片 ---------- */
    case 'ADD_MEAL_PHOTO': {
      if (!state.currentUser) return state;
      const updatedPhotos = [...(state.mealPhotos ?? []), action.photo];
      const newUserData = { ...extractUserData(state), mealPhotos: updatedPhotos };
      saveUserData(state.currentUser.id, newUserData);
      return { ...state, mealPhotos: updatedPhotos };
    }

    /* ---------- 删除餐次照片 ---------- */
    case 'DELETE_MEAL_PHOTO': {
      if (!state.currentUser) return state;
      const updatedPhotos = (state.mealPhotos ?? []).filter(p => p.id !== action.photoId);
      const newUserData = { ...extractUserData(state), mealPhotos: updatedPhotos };
      saveUserData(state.currentUser.id, newUserData);
      return { ...state, mealPhotos: updatedPhotos };
    }

    /* ---------- 清空所有数据 ---------- */
    case 'CLEAR_ALL_DATA': {
      if (state.currentUser) {
        // 只清空当前用户的数据，保留账户
        const emptyUserData = createEmptyUserData();
        saveUserData(state.currentUser.id, emptyUserData);
        return {
          ...state,
          profile: null,
          weightHistory: [],
          dietHistory: [],
          mealPhotos: [],
          workoutPlans: [],
          weeklySchedule: null,
          checkIns: [],
        };
      }
      return state;
    }

    default:
      return state;
  }
}

/* ==================== Context ==================== */

interface StoreContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const StoreContext = createContext<StoreContextValue | null>(null);

/* ==================== Provider ==================== */

/**
 * 全局状态 Provider
 * - 管理用户认证状态
 * - 管理用户独立数据存储
 * - 监听状态变化并自动保存当前用户数据
 */
export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, createInitialState() as unknown as AppState);

  // 监听状态变化，自动保存当前用户数据
  useEffect(() => {
    if (state.currentUser) {
      const userData = extractUserData(state);
      saveUserData(state.currentUser.id, userData);
      console.log('[Store] 数据已保存到:', DATA_KEY_PREFIX + state.currentUser.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.profile, state.weightHistory, state.dietHistory, state.mealPhotos, state.workoutPlans, state.weeklySchedule, state.checkIns, state.currentUser?.id]);

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}

/* ==================== Hook ==================== */

/**
 * 获取全局状态和 dispatch 的 Hook
 * 必须在 StoreProvider 内部使用
 */
export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}