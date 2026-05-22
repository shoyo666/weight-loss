/**
 * SlimFit v2.0 - 个人减脂管理系统
 * 
 * 类型定义文件：包含所有核心数据结构
 * 
 * @since 2026-04-21 v2.0 全面升级
 */

/* ==================== 用户账户系统 ==================== */

/** 用户账户信息（用于登录/注册） */
export interface UserAccount {
  id: string;                    // 唯一用户 ID
  username: string;              // 用户名（登录用）
  password: string;              // 密码（简单哈希存储）
  nickname: string;              // 昵称（展示用）
  avatar: string;                // 头像 URL 或空字符串
  createdAt: string;             // 注册时间 ISO 格式
  isProfileComplete: boolean;    // 是否已完成初始信息设置
}

/* ==================== 用户个人资料 ==================== */

/** 用户完整个人资料 */
export interface UserProfile {
  name: string;                  // 昵称
  avatar: string;                // 头像
  age: number;                   // 年龄
  gender: 'male' | 'female' | 'other';  // 性别
  height: number;                // 身高 cm
  currentWeight: number;         // 当前体重 kg
  goalWeight: number;            // 目标体重 kg
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  dailyCalorieGoal: number;      // 每日热量目标 kcal
  reminderEnabled: boolean;      // 是否开启打卡提醒
  reminderTime: string;          // 提醒时间 HH:mm
}

/* ==================== 饮食相关 ==================== */

/** 食物条目 */
export interface FoodItem {
  id: string;                    // 唯一 ID
  date: string;                  // 日期 yyyy-MM-dd
  name: string;                  // 食物名称
  calories: number;              // 热量 kcal
  protein: number;               // 蛋白质 g
  carbs: number;                 // 碳水化合物 g
  fat: number;                   // 脂肪 g
  amount: number;                // 份量 g
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';  // 餐次
  imageUrl?: string;             // 食物图片 URL（缩略图，单张照片多份食物共享同一 URL）
  mealPhotoId?: string;          // 关联的餐次照片 ID
  timestamp: string;             // 添加时间 ISO 格式
}

/** 餐次照片（一张照片可关联多份食物） */
export interface MealPhoto {
  id: string;                    // 唯一 ID
  url: string;                   // 压缩后的缩略图 data URL
  date: string;                  // 日期 yyyy-MM-dd
  mealType: FoodItem['mealType']; // 所属餐次
  foodIds: string[];             // 关联的食物 ID 列表
  createdAt: string;             // 创建时间 ISO
}

/** 单日饮食记录 */
export interface DietRecord {
  date: string;                  // 日期 yyyy-MM-dd
  meals: FoodItem[];             // 当日所有食物
  totalCalories: number;         // 当日总热量
  waterIntake: number;           // 当日饮水量 ml
}

/* ==================== 身体数据 ==================== */

/** 体重记录 */
export interface WeightRecord {
  date: string;                  // 日期 yyyy-MM-dd
  weight: number;                // 体重 kg
  note?: string;                 // 备注
}

/* ==================== 健身计划 ==================== */

/** 单个训练动作 */
export interface WorkoutExercise {
  name: string;                  // 动作名称
  sets?: number;                 // 组数
  reps?: string;                 // 每组次数
  duration?: string;             // 持续时间（分钟/秒）
  rest?: string;                 // 休息时间
  description: string;           // 动作描述
  muscleGroup: string;           // 目标肌群
  difficulty: 'easy' | 'medium' | 'hard';  // 难度
}

/** 单次训练计划（v1.0 兼容） */
export interface WorkoutPlan {
  id: string;
  date: string;
  mode: 'gym' | 'home' | 'dorm';
  freeTimeMinutes: number;
  goal: 'fat_loss' | 'muscle_gain' | 'maintain' | 'cardio';
  exercises: WorkoutExercise[];
  warmup: WorkoutExercise[];
  cooldown: WorkoutExercise[];
  estimatedCalories: number;
  completed: boolean;
}

/* ==================== 周课程表（v2.0 新增） ==================== */

/** 一天中的时间段 */
export type TimeSlot = 
  | 'morning_early'   // 清晨 6:00-8:00
  | 'morning'         // 上午 8:00-11:00
  | 'afternoon'       // 下午 14:00-17:00
  | 'evening';        // 晚间 18:00-21:00

/** 时间段配置映射 */
export const TIME_SLOT_CONFIG: Record<TimeSlot, { label: string; range: string; color: string }> = {
  morning_early: { label: '清晨', range: '6:00 - 8:00', color: 'butter' },
  morning:       { label: '上午', range: '8:00 - 11:00', color: 'peach' },
  afternoon:     { label: '下午', range: '14:00 - 17:00', color: 'sky' },
  evening:       { label: '晚间', range: '18:00 - 21:00', color: 'lavender' },
};

/** 星期映射 */
export const WEEKDAY_LABELS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] as const;
export type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;  // 周一=0 到 周日=6

/** 单个时段的训练安排 */
export interface WeeklySlotPlan {
  day: WeekDay;                   // 星期几
  timeSlot: TimeSlot;             // 时间段
  exercises: WorkoutExercise[];   // 训练动作列表
  warmup: WorkoutExercise[];      // 热身
  cooldown: WorkoutExercise[];    // 放松
  estimatedCalories: number;      // 预估消耗 kcal
  completed: boolean;             // 是否已完成
}

/** 周健身课程表 */
export interface WeeklySchedule {
  id: string;                     // 唯一 ID
  createdAt: string;              // 创建时间
  mode: 'gym' | 'home' | 'dorm'; // 训练场地
  goal: 'fat_loss' | 'muscle_gain' | 'maintain' | 'cardio'; // 训练目标
  slots: WeeklySlotPlan[];        // 所有排期的训练安排
  totalSlots: number;             // 总排课数
  completedSlots: number;         // 已完成数
}

/* ==================== 打卡系统 ==================== */

/** 打卡记录 */
export interface CheckInRecord {
  date: string;                  // 日期 yyyy-MM-dd
  completed: boolean;            // 是否打卡
  calorieGoalMet: boolean;       // 是否达标热量
  workoutCompleted: boolean;     // 是否完成训练
  note?: string;                 // 打卡备注
}

/* ==================== 全局应用状态 ==================== */

/** 应用主状态 */
export interface AppState {
  /** 当前登录状态 */
  isLoggedIn: boolean;
  /** 当前登录用户 */
  currentUser: UserAccount | null;
  /** 所有注册用户列表 */
  users: UserAccount[];
  
  /** 用户个人资料（可能为 null，表示未完成初始设置） */
  profile: UserProfile | null;
  /** 体重历史记录 */
  weightHistory: WeightRecord[];
  /** 饮食记录 */
  dietHistory: DietRecord[];
  /** 餐次照片（一张照片关联多份食物） */
  mealPhotos: MealPhoto[];
  /** 历史训练计划（v1.0 兼容） */
  workoutPlans: WorkoutPlan[];
  /** 周课程表（v2.0 新增） */
  weeklySchedule: WeeklySchedule | null;
  /** 打卡记录 */
  checkIns: CheckInRecord[];
  /** 当前活跃 Tab */
  activeTab: 'dashboard' | 'diet' | 'body' | 'plan' | 'profile';
}
