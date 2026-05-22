/**
 * SlimFit v2.0 - 模拟数据 & 生成器
 * 
 * 包含默认用户数据、健康食谱、训练视频、
 * 训练计划生成器、周课程表生成器
 * 
 * @since 2026-04-21 v2.0 全面升级
 */

import {
  UserProfile, WeightRecord, DietRecord, CheckInRecord, WorkoutPlan, WorkoutExercise,
  WeeklySchedule, WeeklySlotPlan, TimeSlot, WeekDay,
} from '../types';
import { subDays, format } from 'date-fns';

const today = new Date();
const fmt = (d: Date) => format(d, 'yyyy-MM-dd');

/* ==================== 默认用户资料 ==================== */

export const defaultProfile: UserProfile = {
  name: '小雨',
  avatar: '',
  age: 23,
  gender: 'female',
  height: 163,
  currentWeight: 58.5,
  goalWeight: 52.0,
  activityLevel: 'light',
  dailyCalorieGoal: 1500,
  reminderEnabled: true,
  reminderTime: '08:00',
};

/* ==================== 默认体重历史 ==================== */

export const defaultWeightHistory: WeightRecord[] = [
  { date: fmt(subDays(today, 30)), weight: 62.0 },
  { date: fmt(subDays(today, 27)), weight: 61.5 },
  { date: fmt(subDays(today, 24)), weight: 61.2 },
  { date: fmt(subDays(today, 21)), weight: 60.8 },
  { date: fmt(subDays(today, 18)), weight: 60.3 },
  { date: fmt(subDays(today, 15)), weight: 59.9 },
  { date: fmt(subDays(today, 12)), weight: 59.5 },
  { date: fmt(subDays(today, 9)), weight: 59.1 },
  { date: fmt(subDays(today, 6)), weight: 58.8 },
  { date: fmt(subDays(today, 3)), weight: 58.6 },
  { date: fmt(today), weight: 58.5 },
];

/* ==================== 默认饮食记录 ==================== */

export const defaultDietHistory: DietRecord[] = [
  {
    date: fmt(today),
    meals: [
      {
        id: '1', name: '燕麦粥', calories: 280, protein: 10, carbs: 48, fat: 5,
        amount: 200, mealType: 'breakfast', timestamp: new Date().toISOString(), date: fmt(today),
      },
      {
        id: '2', name: '水煮鸡胸肉', calories: 165, protein: 31, carbs: 0, fat: 3.6,
        amount: 150, mealType: 'lunch', timestamp: new Date().toISOString(), date: fmt(today),
      },
      {
        id: '3', name: '西兰花炒蛋', calories: 190, protein: 14, carbs: 8, fat: 11,
        amount: 200, mealType: 'lunch', timestamp: new Date().toISOString(), date: fmt(today),
      },
    ],
    totalCalories: 635,
    waterIntake: 1200,
  },
];

/* ==================== 默认打卡记录 ==================== */

export const defaultCheckIns: CheckInRecord[] = Array.from({ length: 30 }, (_, i) => ({
  date: fmt(subDays(today, 29 - i)),
  completed: Math.random() > 0.25,
  calorieGoalMet: Math.random() > 0.3,
  workoutCompleted: Math.random() > 0.4,
}));

/* ==================== AI 拍照识别模拟食物库 ==================== */

export const mockFoodDatabase = [
  { name: '鸡蛋', calories: 72, protein: 6.3, carbs: 0.4, fat: 5, amount: 60 },
  { name: '全麦吐司', calories: 80, protein: 3.5, carbs: 15, fat: 1, amount: 30 },
  { name: '牛油果', calories: 160, protein: 2, carbs: 9, fat: 15, amount: 100 },
  { name: '希腊酸奶', calories: 100, protein: 17, carbs: 6, fat: 1, amount: 170 },
  { name: '香蕉', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, amount: 100 },
  { name: '鸡胸肉', calories: 165, protein: 31, carbs: 0, fat: 3.6, amount: 100 },
  { name: '西兰花', calories: 34, protein: 2.8, carbs: 7, fat: 0.4, amount: 100 },
  { name: '燕麦', calories: 389, protein: 17, carbs: 66, fat: 7, amount: 100 },
  { name: '三文鱼', calories: 208, protein: 20, carbs: 0, fat: 13, amount: 100 },
  { name: '红薯', calories: 86, protein: 1.6, carbs: 20, fat: 0.1, amount: 100 },
  { name: '虾仁', calories: 99, protein: 24, carbs: 0.2, fat: 0.3, amount: 100 },
  { name: '番茄', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, amount: 100 },
  { name: '紫薯', calories: 82, protein: 1.3, carbs: 18, fat: 0.1, amount: 100 },
  { name: '豆腐', calories: 76, protein: 8, carbs: 1.9, fat: 4.8, amount: 100 },
  { name: '橙子', calories: 47, protein: 0.9, carbs: 12, fat: 0.1, amount: 100 },
];

/* ==================== 健康食谱推荐 ==================== */

export const healthyFoodRecommendations = [
  {
    id: 'r1', name: '藜麦蔬菜沙拉', calories: 320, protein: 12, carbs: 45, fat: 8,
    tags: ['低脂', '高纤维', '素食'], color: 'mint', emoji: '🥗',
    tip: '富含完整蛋白质，助力增肌减脂',
  },
  {
    id: 'r2', name: '三文鱼藜麦碗', calories: 450, protein: 35, carbs: 40, fat: 12,
    tags: ['高蛋白', 'Omega-3', '减脂'], color: 'peach', emoji: '🐟',
    tip: 'Omega-3 促进脂肪代谢',
  },
  {
    id: 'r3', name: '希腊酸奶果冻杯', calories: 180, protein: 15, carbs: 22, fat: 3,
    tags: ['低卡', '高钙', '益生菌'], color: 'lavender', emoji: '🍮',
    tip: '饱腹感强，肠道友好',
  },
  {
    id: 'r4', name: '鸡蛋蔬菜卷饼', calories: 260, protein: 18, carbs: 28, fat: 7,
    tags: ['低卡', '快手', '早餐'], color: 'butter', emoji: '🌯',
    tip: '快手高蛋白早餐首选',
  },
  {
    id: 'r5', name: '紫薯燕麦碗', calories: 290, protein: 10, carbs: 55, fat: 4,
    tags: ['高纤维', '低GI', '饱腹'], color: 'lavender', emoji: '🍠',
    tip: '低GI稳定血糖，持久饱腹',
  },
  {
    id: 'r6', name: '虾仁牛油果沙拉', calories: 380, protein: 28, carbs: 18, fat: 22,
    tags: ['高蛋白', '健康脂肪', '低碳'], color: 'mint', emoji: '🦐',
    tip: '优质蛋白+健康脂肪组合',
  },
];

/* ==================== 训练视频推荐 ==================== */

export const workoutVideos = [
  { id: 'v1', title: '15分钟全身燃脂 HIIT', duration: '15 min', calories: 180, level: '初级', color: 'peach', emoji: '🔥' },
  { id: 'v2', title: '瑜伽晨间拉伸 · 唤醒身体', duration: '20 min', calories: 80, level: '入门', color: 'lavender', emoji: '🧘' },
  { id: 'v3', title: '腹肌撕裂者 · 核心训练', duration: '12 min', calories: 150, level: '中级', color: 'mint', emoji: '💪' },
  { id: 'v4', title: '全身塑形 · Pilates 进阶', duration: '25 min', calories: 200, level: '中级', color: 'sky', emoji: '🤸' },
  { id: 'v5', title: '睡前10分钟放松拉伸', duration: '10 min', calories: 40, level: '入门', color: 'butter', emoji: '🌙' },
];

/* ==================== 训练动作库 ==================== */

/** 训练动作数据库 - 按场景×目标分类 */
const exerciseLibrary: Record<string, WorkoutExercise[]> = {
  gym_fat_loss: [
    { name: '椭圆机热身', sets: 1, reps: undefined, duration: '5', rest: '0', description: '【目标】提升心率，激活全身肌肉。\n【动作】双手扶把，双脚踩踏板，保持匀速蹬踏。\n【姿势】背部挺直，核心微收，目视前方。\n【呼吸】鼻吸口呼，保持均匀节奏。\n【心 率】保持最大心率 60%-65%（约 120-130 bpm）。', muscleGroup: '全身', difficulty: 'easy' },
    { name: '杠铃深蹲', sets: 4, reps: '12-15', duration: undefined, rest: '60s', description: '【目标】强化股四头肌、臀大肌。\n【准备】双脚与肩同宽，脚尖微朝外 15°，杠铃置于斜方肌上方。\n【下蹲】吸气，屈髋屈膝，像坐椅子一样向后向下，大腿与地面平行或略低，膝盖对准脚尖方向。\n【起身】呼气，脚跟发力蹬地回到站立位，顶峰夹紧臀部。\n【常见错误】膝盖内扣（应主动外展）、弓背（核心收紧）、脚跟离地（重心在脚中部）。', muscleGroup: '腿部', difficulty: 'medium' },
    { name: '哑铃弓步', sets: 3, reps: '10/腿', duration: undefined, rest: '60s', description: '【目标】单腿力量平衡，强化臀腿稳定肌群。\n【准备】双手各持哑铃，自然下垂于体侧，双脚并拢站立。\n【动作】右腿前跨一大步，吸气下蹲至前大腿平行地面、后膝接近但不触地。\n【注意】前脚膝盖不超过脚尖，躯干保持垂直于地面，不要前倾。\n【还原】前脚蹬地发力，呼气回到起始位，换腿重复。', muscleGroup: '腿部', difficulty: 'medium' },
    { name: '器械推胸', sets: 3, reps: '12', duration: undefined, rest: '60s', description: '【目标】强化胸大肌、肱三头肌。\n【准备】坐于器械椅上，调整坐垫高度使把手与胸中部对齐，背部贴紧靠垫。\n【推出】呼气，双手向前推至手臂接近伸直但不锁死肘关节。\n【顶峰】在伸展位停留 1 秒，感受胸肌挤压。\n【收回】吸气，缓慢控制收回至起始位，保持肌肉持续紧张。', muscleGroup: '胸部', difficulty: 'medium' },
    { name: '高位下拉', sets: 3, reps: '12', duration: undefined, rest: '60s', description: '【目标】强化背阔肌、菱形肌，改善体态。\n【准备】坐姿调整大腿垫至稳固，宽握把手上方，手臂完全伸展。\n【下拉】呼气，肩胛骨先下沉后收，用背部力量将把手拉至上胸位置，身体后倾约 15°。\n【顶峰】在最低点停顿 1 秒，充分挤压背部。\n【还原】吸气，控制将把手缓慢送回，手臂完全伸展但不耸肩。', muscleGroup: '背部', difficulty: 'medium' },
    { name: '跑步机冲刺间歇', sets: 1, reps: undefined, duration: '15', rest: '0', description: '【目标】提升心肺耐力和冲刺爆发力。\n【方式】HIIT 间歇模式。\n【方案】30 秒冲刺（速度 12-14 km/h）+ 30 秒慢跑（速度 5-6 km/h），交替 6-8 轮。\n【注意】冲刺时保持身体微前倾，手臂大幅摆动；慢跑时不要完全停下。', muscleGroup: '全身', difficulty: 'hard' },
  ],
  gym_muscle_gain: [
    { name: '杠铃卧推', sets: 4, reps: '8-10', duration: undefined, rest: '90s', description: '【目标】增强胸大肌厚度和肱三头肌力量。\n【准备】仰卧平凳，握距比肩宽 1.5 倍，双脚踩实地板。\n【下放】吸气，控制杠铃缓慢降至下胸位置（约乳头线），肘关节约 45°。\n【推起】呼气，胸肌发力将杠铃推回起始位，手臂伸直但不锁死。\n【注意】臀部不离凳，不要弹胸借力。', muscleGroup: '胸部', difficulty: 'hard' },
    { name: '杠铃深蹲', sets: 4, reps: '8-10', duration: undefined, rest: '90s', description: '【目标】发展下肢整体力量和围度。\n【准备】杠铃置于斜方肌上（非颈椎），双脚略宽于肩，脚尖微朝外。\n【下蹲】吸气，屈髋屈膝至大腿低于平行位，保持躯干紧绷。\n【起身】呼气，脚跟发力，臀腿同时伸展，顶峰收缩臀部。\n【安全】上大重量时务必使用深蹲架和安全杠。', muscleGroup: '腿部', difficulty: 'hard' },
    { name: '引体向上', sets: 4, reps: '6-8', duration: undefined, rest: '90s', description: '【目标】背阔肌宽度和握力的终极动作。\n【握法】正手宽握（略宽于肩），手臂完全伸展悬挂。\n【上拉】呼气，肩胛下沉，背部发力，下巴过杠。\n【顶峰】顶部停留 1 秒充分挤压背部。\n【下放】吸气，控制缓慢下放，全程不摆动。\n【辅助】无法完成时可使用弹力带辅助或做反向划船。', muscleGroup: '背部', difficulty: 'hard' },
    { name: '哑铃肩推', sets: 3, reps: '10-12', duration: undefined, rest: '60s', description: '【目标】强化三角肌前束和中束。\n【准备】坐姿，哑铃置于肩部两侧，掌心朝前，背部贴靠垫。\n【推举】呼气，垂直向上推至手臂接近伸直。\n【下放】吸气，控制哑铃缓慢回到起始位。\n【注意】核心收紧避免过度弓腰，不要借力甩动。', muscleGroup: '肩部', difficulty: 'medium' },
    { name: '绳索弯举', sets: 3, reps: '12', duration: undefined, rest: '60s', description: '【目标】孤立刺激肱二头肌。\n【准备】站姿，双手握住低位绳索把手，掌心朝上。\n【弯举】呼气，屈肘将绳索向上弯至肩部，顶峰挤压二头。\n【下放】吸气，控制缓慢伸展手臂，离心阶段保持 2-3 秒。\n【注意】大臂贴身不动，不要摆肩借力。', muscleGroup: '手臂', difficulty: 'medium' },
  ],
  gym_maintain: [
    { name: '跑步机慢跑', sets: 1, reps: undefined, duration: '20', rest: '0', description: '【目标】维持心肺功能，轻度燃脂。\n【速度】5-7 km/h，心率控制在 130-150 bpm。\n【姿势】自然摆臂，步幅适中，脚掌中前部着地。\n【注意】保持交谈自如的强度（"谈话测试"）。', muscleGroup: '心肺', difficulty: 'easy' },
    { name: '器械推胸', sets: 3, reps: '12', duration: undefined, rest: '60s', description: '【目标】维持胸部力量和形态。\n【准备】调整座椅高度，把手与胸中部平齐。\n【推出】呼气，平稳推至手臂接近伸直。\n【收回】吸气，控制缓慢收回。全程感受胸肌收缩。', muscleGroup: '胸部', difficulty: 'medium' },
    { name: '高位下拉', sets: 3, reps: '12', duration: undefined, rest: '60s', description: '【目标】维持背部力量和良好体态。\n【动作】宽握把手，下拉至上胸，肩胛骨主动收缩。\n【节奏】下拉 2 秒，顶峰停 1 秒，还原 3 秒。', muscleGroup: '背部', difficulty: 'medium' },
    { name: '腿举', sets: 3, reps: '15', duration: undefined, rest: '60s', description: '【目标】安全维持腿部力量。\n【准备】脚与肩同宽置于踏板上方，解开安全锁。\n【下放】吸气，缓慢屈膝至 90°。\n【推起】呼气，脚跟发力推回，膝盖不完全锁死。', muscleGroup: '腿部', difficulty: 'easy' },
    { name: '平板支撑', sets: 3, reps: undefined, duration: '45s', rest: '30s', description: '【目标】强化核心稳定肌群。\n【姿势】前臂撑地，肘在肩正下方，身体从头到脚一条直线。\n【关键】收紧臀部和腹部，不要塌腰或拱臀。\n【呼吸】保持均匀呼吸，不要憋气。', muscleGroup: '核心', difficulty: 'medium' },
  ],
  gym_cardio: [
    { name: '动感单车', sets: 1, reps: undefined, duration: '25', rest: '0', description: '【目标】高强度燃脂，提升下肢耐力。\n【设置】阻力 6-8，保持 RPM 80-100。\n【结构】5 分钟热身 + (2 分钟冲刺 + 2 分钟恢复) × 5 轮。\n【姿势】上半身稳定，核心微收，膝盖对准脚尖方向。', muscleGroup: '心肺', difficulty: 'hard' },
    { name: '划船机', sets: 1, reps: undefined, duration: '10', rest: '60s', description: '【目标】全身协调发力，加强背部。\n【顺序】蹬腿 → 展髋 → 拉臂，还原时反向顺序。\n【节奏】拉桨 1 秒，回桨 2 秒，保持流畅。\n【注意】不要耸肩，背部主导发力。', muscleGroup: '全身', difficulty: 'medium' },
    { name: '椭圆机', sets: 1, reps: undefined, duration: '15', rest: '0', description: '【目标】中高强度有氧，关节友好。\n【阻力】8-10，保持 RPM 60-70。\n【姿势】双手轻扶把手，核心微收，全脚掌接触踏板。\n【注意】不要趴在机器上，保持直立姿态。', muscleGroup: '心肺', difficulty: 'medium' },
    { name: '战绳训练', sets: 4, reps: '30s', duration: undefined, rest: '30s', description: '【目标】爆发力和核心稳定性的极限训练。\n【准备】双脚与肩同宽，微屈膝，双手各持绳端。\n【动作】交替上下甩绳，同时保持核心紧绷。\n【注意】全程保持呼吸，不要憋气，髋部稳定不摇摆。', muscleGroup: '全身', difficulty: 'hard' },
  ],
  home_fat_loss: [
    { name: '开合跳', sets: 3, reps: '30', duration: undefined, rest: '30s', description: '【目标】全身热身燃脂。\n【起始】双脚并拢，双臂自然下垂。\n【动作】跳起分腿（宽于肩）+ 双臂上举击掌，再跳回起始位。\n【呼吸】跳开时吸气，收回时呼气。\n【注意】膝盖微屈缓冲落地，核心收紧保持平衡。', muscleGroup: '全身', difficulty: 'easy' },
    { name: '波比跳', sets: 4, reps: '10', duration: undefined, rest: '45s', description: '【目标】极限燃脂 + 全身力量。\n【连贯动作】①站立 → ②下蹲手撑地 → ③双脚后跳至平板位 → ④俯卧撑一次 → ⑤双脚跳回 → ⑥爆发跳起手臂上举。\n【呼吸】下蹲时吸气，跳起时呼气。\n【简化版】可省略俯卧撑，或双脚逐一后撤。', muscleGroup: '全身', difficulty: 'hard' },
    { name: '徒手深蹲', sets: 4, reps: '20', duration: undefined, rest: '30s', description: '【目标】强化臀腿，基础动作之王。\n【准备】双脚与肩同宽，脚尖微朝外，双臂前平举或抱胸。\n【下蹲】吸气，臀部向后坐，膝盖对准脚尖，下蹲至大腿与地面平行。\n【起身】呼气，脚后跟发力站起，顶峰夹臀。\n【常见错误】膝盖内扣、脚跟抬起、弓背。', muscleGroup: '腿部', difficulty: 'medium' },
    { name: '俯卧撑', sets: 3, reps: '12-15', duration: undefined, rest: '45s', description: '【目标】强化胸肌、三角肌前束、肱三头肌。\n【准备】双手略宽于肩，身体从头到脚一条直线。\n【下放】吸气，屈肘至胸部接近地面，肘与身体约 45°。\n【推起】呼气，胸部和手臂发力推回起始位。\n【简化】膝盖着地做跪姿俯卧撑。', muscleGroup: '胸部', difficulty: 'medium' },
    { name: '平板支撑', sets: 3, reps: undefined, duration: '45s', rest: '30s', description: '【目标】强化整个核心肌群。\n【姿势】前臂撑地，肘在肩正下方，身体成一直线。\n【关键】收紧腹肌和臀部，不塌腰不拱臀。\n【呼吸】均匀呼吸，不要憋气。\n【进阶】尝试侧平板支撑或抬腿平板。', muscleGroup: '核心', difficulty: 'medium' },
    { name: '高抬腿冲刺', sets: 4, reps: undefined, duration: '30s', rest: '30s', description: '【目标】提升心率和腿部爆发力。\n【姿势】原地快速交替抬腿，膝盖尽量抬至腰部高度。\n【手臂】配合大幅摆臂。\n【注意】前脚掌着地，核心收紧稳住躯干。', muscleGroup: '全身', difficulty: 'hard' },
  ],
  home_muscle_gain: [
    { name: '钻石俯卧撑', sets: 4, reps: '10', duration: undefined, rest: '60s', description: '【目标】重点刺激肱三头肌和胸肌内侧。\n【准备】双手拇指和食指相触形成钻石形状，置于胸下。\n【下放】吸气，缓慢下放至胸部触碰手背。\n【推起】呼气，三头肌发力推回。\n【注意】身体保持直线，肘部贴近身体侧方。', muscleGroup: '手臂', difficulty: 'hard' },
    { name: '保加利亚分腿蹲', sets: 3, reps: '10/腿', duration: undefined, rest: '60s', description: '【目标】单侧腿部力量，改善平衡和稳定性。\n【准备】后脚放在沙发或椅子边缘，前脚向前一步。\n【下蹲】吸气，前腿屈膝至大腿与地面平行。\n【起身】呼气，前脚脚跟发力站起。\n【注意】躯干保持直立，前腿膝盖不超脚尖。', muscleGroup: '腿部', difficulty: 'hard' },
    { name: '超人式', sets: 3, reps: '15', duration: undefined, rest: '30s', description: '【目标】强化下背部和臀部肌群。\n【起始】俯卧，双臂前伸，双腿伸直并拢。\n【动作】同时抬起双臂和双腿，像超人飞行。\n【顶峰】在最高点停顿 2 秒，挤压背部。\n【呼吸】抬起时呼气，放下时吸气。', muscleGroup: '背部', difficulty: 'medium' },
    { name: '窄距俯卧撑', sets: 3, reps: '12', duration: undefined, rest: '45s', description: '【目标】刺激肱三头肌和胸肌。\n【准备】双手与肩同宽，手指朝前。\n【关键】下放时肘部贴近身体两侧，不要外展。\n【呼吸】下放吸气，推起呼气。', muscleGroup: '胸部', difficulty: 'medium' },
    { name: '侧平板支撑', sets: 3, reps: undefined, duration: '30s/侧', rest: '30s', description: '【目标】强化腹斜肌和侧向核心稳定。\n【姿势】侧身，前臂撑地，身体侧向一条直线。\n【关键】髋部抬高不要下沉，核心持续收紧。\n【进阶】上方腿抬起增加难度。', muscleGroup: '核心', difficulty: 'medium' },
  ],
  home_maintain: [
    { name: '原地慢跑', sets: 1, reps: undefined, duration: '10', rest: '0', description: '【目标】轻度有氧，维持心肺。\n【速度】中等速度，每分钟约 120-140 步。\n【姿势】自然摆臂，核心微收，前脚掌着地。', muscleGroup: '心肺', difficulty: 'easy' },
    { name: '俯卧撑', sets: 3, reps: '10', duration: undefined, rest: '45s', description: '【目标】维持上肢基础力量。\n【准备】双手与肩同宽，身体成直线。\n【节奏】下放 2 秒，底部停 1 秒，推起 1 秒。\n【注意】控制动作质量，不求次数。', muscleGroup: '胸部', difficulty: 'medium' },
    { name: '徒手深蹲', sets: 3, reps: '15', duration: undefined, rest: '30s', description: '【目标】维持下肢力量。\n【动作】标准深蹲，臀部向后坐，膝盖对准脚尖。\n【节奏】下蹲 2 秒，底部停 1 秒，起立 1 秒。', muscleGroup: '腿部', difficulty: 'easy' },
    { name: '卷腹', sets: 3, reps: '15', duration: undefined, rest: '30s', description: '【目标】强化腹部肌肉。\n【起始】仰卧屈膝，双手轻扶耳侧。\n【动作】呼气，肩胛骨离地卷起，下背部贴地。\n【还原】吸气，控制缓慢放下。\n【注意】不要用手拉脖子，用腹肌发力。', muscleGroup: '腹部', difficulty: 'easy' },
  ],
  home_cardio: [
    { name: '高抬腿', sets: 4, reps: undefined, duration: '30s', rest: '30s', description: '【目标】快速提升心率。\n【姿势】原地快速抬膝至腰部，手臂配合摆动。\n【呼吸】快速鼻吸口呼。\n【注意】核心收紧，身体不要后仰。', muscleGroup: '心肺', difficulty: 'medium' },
    { name: '登山者', sets: 4, reps: '20', duration: undefined, rest: '30s', description: '【目标】全身核心 + 有氧燃脂。\n【起始】平板支撑姿势。\n【动作】交替快速提膝向胸部，像在爬山。\n【呼吸】保持均匀呼吸节奏。\n【注意】髋部不要抬太高或下沉。', muscleGroup: '全身', difficulty: 'hard' },
    { name: '开合跳', sets: 3, reps: '30', duration: undefined, rest: '20s', description: '【目标】全身燃脂 + 协调性。\n【动作】跳起分腿手击掌，跳回并腿。\n【注意】膝盖缓冲落地，动作连贯。', muscleGroup: '全身', difficulty: 'easy' },
    { name: '波比跳', sets: 3, reps: '8', duration: undefined, rest: '45s', description: '【目标】HIIT 核心动作，极限燃脂。\n【动作】蹲→平板→俯卧撑→收腿→跳起。\n【呼吸】站立时吸气，跳起时呼气。\n【简化】省略俯卧撑和跳跃。', muscleGroup: '全身', difficulty: 'hard' },
  ],
  dorm_fat_loss: [
    { name: '原地踏步热身', sets: 1, reps: undefined, duration: '3', rest: '0', description: '【目标】升高体温，活动关节。\n【动作】原地踏步，配合肩部环绕和髋部画圆。\n【注意】缓慢增加幅度，不要勉强。', muscleGroup: '全身', difficulty: 'easy' },
    { name: '靠墙深蹲', sets: 3, reps: undefined, duration: '45s', rest: '30s', description: '【目标】安全强化大腿耐力。\n【准备】背部贴墙，双脚前移一步，与肩同宽。\n【动作】沿墙下蹲至大腿平行地面，保持 45 秒。\n【注意】膝盖对准脚尖，不超脚尖。', muscleGroup: '腿部', difficulty: 'easy' },
    { name: '桌边俯卧撑', sets: 3, reps: '15', duration: undefined, rest: '30s', description: '【目标】利用书桌做上肢训练。\n【准备】双手撑桌沿，身体倾斜成直线。\n【动作】屈肘下放，胸部接近桌面后推回。\n【注意】身体保持直线，不塌腰。', muscleGroup: '胸部', difficulty: 'easy' },
    { name: '卷腹', sets: 3, reps: '20', duration: undefined, rest: '30s', description: '【目标】精准刺激腹直肌。\n【起始】仰卧屈膝，手扶耳侧。\n【动作】肩胛离地卷起，顶峰停留 1 秒。\n【呼吸】卷起时呼气，放下时吸气。\n【注意】下背始终贴地，不用手拉脖子。', muscleGroup: '腹部', difficulty: 'medium' },
    { name: '臀桥', sets: 3, reps: '20', duration: undefined, rest: '30s', description: '【目标】激活臀大肌，改善久坐臀无力。\n【起始】仰卧屈膝，脚掌平放，手放体侧。\n【动作】呼气，臀部发力上抬至肩-髋-膝成直线。\n【顶峰】夹紧臀部停留 2 秒。\n【下放】吸气，控制缓慢放下。', muscleGroup: '臀部', difficulty: 'easy' },
    { name: '蚌式开合', sets: 3, reps: '20/侧', duration: undefined, rest: '30s', description: '【目标】强化臀中肌，改善髋部稳定。\n【起始】侧躺，屈膝约 45°，脚后跟并拢。\n【动作】上腿缓慢外展打开，像蚌壳张开。\n【注意】骨盆不动，只用臀肌发力。', muscleGroup: '臀部', difficulty: 'easy' },
  ],
  dorm_muscle_gain: [
    { name: '窄距俯卧撑', sets: 4, reps: '12', duration: undefined, rest: '45s', description: '【目标】利用书桌强化肱三头肌。\n【准备】双手与肩同宽撑桌。\n【动作】慢速下放，肘部贴近体侧。\n【呼吸】下放吸气，推起呼气。', muscleGroup: '手臂', difficulty: 'medium' },
    { name: '保加利亚分腿蹲', sets: 3, reps: '10/腿', duration: undefined, rest: '45s', description: '【目标】宿舍最佳腿部增肌动作。\n【准备】后脚放床沿，前脚前跨一步。\n【动作】垂直下蹲至前大腿平行地面。\n【注意】躯干直立，前膝盖不超脚尖。', muscleGroup: '腿部', difficulty: 'hard' },
    { name: '椅子臂屈伸', sets: 3, reps: '12', duration: undefined, rest: '45s', description: '【目标】利用椅子锻炼肱三头肌。\n【准备】双手撑椅子边缘，身体悬空。\n【动作】屈肘下降至肘约 90°，再推回。\n【注意】背部靠近椅子，不要离太远。', muscleGroup: '手臂', difficulty: 'medium' },
    { name: '单腿臀桥', sets: 3, reps: '12/腿', duration: undefined, rest: '30s', description: '【目标】单侧臀肌强化。\n【起始】仰卧，单脚撑地，另一腿抬起。\n【动作】支撑腿臀部发力上抬。\n【注意】髋部保持水平，不要倾斜。', muscleGroup: '臀部', difficulty: 'medium' },
  ],
  dorm_maintain: [
    { name: '伸展运动', sets: 1, reps: undefined, duration: '5', rest: '0', description: '【目标】全身拉伸，缓解久坐僵硬。\n【内容】颈部环绕→肩部拉伸→体侧屈→髋部画圆→腿后侧拉伸。\n【注意】每个动作保持 15-30 秒，不要弹振。', muscleGroup: '全身', difficulty: 'easy' },
    { name: '靠墙俯卧撑', sets: 3, reps: '15', duration: undefined, rest: '30s', description: '【目标】最轻松的俯卧撑变式。\n【准备】面向墙壁站立，双手扶墙与肩同宽。\n【动作】身体倾斜，屈肘接近墙壁后推回。', muscleGroup: '胸部', difficulty: 'easy' },
    { name: '坐姿抬腿', sets: 3, reps: '15', duration: undefined, rest: '30s', description: '【目标】在椅子上锻炼腹部。\n【准备】坐椅子边缘，双手扶椅面。\n【动作】双腿并拢抬起至水平，缓慢放下。\n【注意】背部挺直，用腹部发力。', muscleGroup: '腹部', difficulty: 'easy' },
    { name: '站立提踵', sets: 3, reps: '20', duration: undefined, rest: '30s', description: '【目标】强化小腿肌肉。\n【准备】扶椅站立，双脚与肩同宽。\n【动作】缓慢踮起脚尖至最高点，停顿 2 秒后缓慢放下。\n【注意】动作要慢，感受小腿收缩。', muscleGroup: '小腿', difficulty: 'easy' },
  ],
  dorm_cardio: [
    { name: '原地高抬腿', sets: 3, reps: undefined, duration: '30s', rest: '30s', description: '【目标】快速提心率，宿舍有氧首选。\n【动作】交替抬膝至腰部，手臂配合摆动。\n【注意】落地要轻，避免吵到楼下。', muscleGroup: '心肺', difficulty: 'medium' },
    { name: '开合跳', sets: 3, reps: '25', duration: undefined, rest: '30s', description: '【目标】全身燃脂，提升协调性。\n【注意】落地轻，膝盖缓冲。可穿鞋做减小噪音。', muscleGroup: '全身', difficulty: 'easy' },
    { name: '波比跳', sets: 3, reps: '8', duration: undefined, rest: '45s', description: '【目标】宿舍最高燃脂效率。\n【动作】简化版（省略跳起），控制落地轻。\n【注意】下地时用瑜伽垫缓冲。', muscleGroup: '全身', difficulty: 'hard' },
    { name: '跳绳（模拟）', sets: 3, reps: undefined, duration: '60s', rest: '30s', description: '【目标】无绳模拟跳绳，不占空间。\n【动作】手腕转动模拟甩绳，双脚交替小跳。\n【注意】核心收紧，落地轻巧。', muscleGroup: '全身', difficulty: 'medium' },
  ],
};

/** 通用热身动作 */
const warmupPool: WorkoutExercise[] = [
  { name: '颈部环绕', sets: undefined, reps: '各方向5次', duration: undefined, rest: '0', description: '缓慢转动，感受拉伸', muscleGroup: '颈部', difficulty: 'easy' },
  { name: '肩关节环绕', sets: undefined, reps: '前后各10次', duration: undefined, rest: '0', description: '大范围圆周运动', muscleGroup: '肩部', difficulty: 'easy' },
  { name: '髋关节画圆', sets: undefined, reps: '各10次', duration: undefined, rest: '0', description: '双手叉腰，缓慢旋转', muscleGroup: '髋部', difficulty: 'easy' },
];

/** 通用放松动作 */
const cooldownPool: WorkoutExercise[] = [
  { name: '站姿体前屈', sets: undefined, reps: undefined, duration: '30s', rest: '0', description: '双腿伸直，缓慢向下弯腰', muscleGroup: '腿后侧', difficulty: 'easy' },
  { name: '蝴蝶式拉伸', sets: undefined, reps: undefined, duration: '30s', rest: '0', description: '坐姿，双脚相对，向前倾', muscleGroup: '大腿内侧', difficulty: 'easy' },
  { name: '儿童式放松', sets: undefined, reps: undefined, duration: '1min', rest: '0', description: '跪坐，身体前倾，手臂前伸', muscleGroup: '全身', difficulty: 'easy' },
];

/* ==================== 训练计划生成器（v1.0 兼容） ==================== */

/**
 * 生成单次训练计划
 * @param mode 训练场地
 * @param freeMinutes 可用时间
 * @param goal 训练目标
 */
export const generateWorkoutPlan = (
  mode: 'gym' | 'home' | 'dorm',
  freeMinutes: number,
  goal: 'fat_loss' | 'muscle_gain' | 'maintain' | 'cardio'
): WorkoutPlan => {
  const key = `${mode}_${goal}`;
  const exercises = exerciseLibrary[key] || exerciseLibrary['home_fat_loss'];

  return {
    id: Date.now().toString(),
    date: fmt(today),
    mode,
    freeTimeMinutes: freeMinutes,
    goal,
    exercises: exercises.slice(0, Math.max(3, Math.min(exercises.length, Math.floor(freeMinutes / 5)))),
    warmup: warmupPool,
    cooldown: cooldownPool,
    estimatedCalories: Math.round(freeMinutes * (mode === 'gym' ? 8 : mode === 'home' ? 6 : 4)),
    completed: false,
  };
};

/* ==================== 周课程表生成器（v2.0 新增） ==================== */

/**
 * 生成周健身课程表
 * 根据选择的星期 + 时段组合，为每个时段生成专属训练内容
 *
 * @param mode          训练场地
 * @param goal          训练目标
 * @param selectedDays  用户勾选的星期数组（0=周一…6=周日）
 * @param selectedTimeSlots 用户勾选的时段数组
 * @returns 完整的周课程表
 */
export const generateWeeklySchedule = (
  mode: 'gym' | 'home' | 'dorm',
  goal: 'fat_loss' | 'muscle_gain' | 'maintain' | 'cardio',
  selectedDays: WeekDay[],
  selectedTimeSlots: TimeSlot[],
): WeeklySchedule => {
  const key = `${mode}_${goal}`;
  const allExercises = exerciseLibrary[key] || exerciseLibrary['home_fat_loss'];

  // 每天不同的训练重点，让课程表更丰富
  const dailyFocus: Array<{ focus: string; variation: number }> = [
    { focus: '上肢+核心', variation: 0 },
    { focus: '下肢+臀部', variation: 1 },
    { focus: '全身燃脂', variation: 2 },
    { focus: '核心力量', variation: 0 },
    { focus: '背部+胸部', variation: 1 },
    { focus: '全身塑形', variation: 2 },
    { focus: '恢复拉伸', variation: 0 },
  ];

  // 展开 days × timeSlots 的笛卡尔积，生成所有排期
  const slots: WeeklySlotPlan[] = [];
  for (const day of selectedDays) {
    for (const timeSlot of selectedTimeSlots) {
      const focusInfo = dailyFocus[day];
      // 根据天次+时段变化选取不同动作组合，保证课程多样性
      const slotOffset = selectedTimeSlots.indexOf(timeSlot);
      const startIdx = (focusInfo.variation * 2 + day + slotOffset) % allExercises.length;
      const exercises: WorkoutExercise[] = [];

      for (let i = 0; i < Math.min(4, allExercises.length); i++) {
        exercises.push(allExercises[(startIdx + i) % allExercises.length]);
      }

      slots.push({
        day,
        timeSlot,
        exercises,
        warmup: warmupPool.slice(0, 2),
        cooldown: cooldownPool.slice(0, 2),
        estimatedCalories: Math.round(30 * (mode === 'gym' ? 8 : mode === 'home' ? 6 : 4)),
        completed: false,
      });
    }
  }

  return {
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    mode,
    goal,
    slots,
    totalSlots: slots.length,
    completedSlots: 0,
  };
};
