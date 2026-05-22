/**
 * 中国食物营养数据库 v1.0
 * 基于中国食物成分表（第6版）
 * 每100g可食部的营养成分
 */

export interface NutritionData {
  calories: number;  // kcal
  protein: number;    // g
  carbs: number;      // g
  fat: number;         // g
}

export interface FoodItem {
  id: string;
  name: string;
  category: string;
  nutrition: NutritionData;
  aliases?: string[];
}

/**
 * 营养计算公式
 * 总营养 = (每100g标准值 ÷ 100) × 实际重量(g)
 */
export function calculateNutrition(per100g: NutritionData, weight: number): NutritionData {
  const factor = weight / 100;
  return {
    calories: Math.round(per100g.calories * factor),
    protein: Math.round(per100g.protein * factor * 10) / 10,
    carbs: Math.round(per100g.carbs * factor * 10) / 10,
    fat: Math.round(per100g.fat * factor * 10) / 10,
  };
}

// ==================== 食物数据库 ====================
export const foodDatabase: FoodItem[] = [
  // 主食类
  { id: '1', name: '米饭', category: '主食', nutrition: { calories: 116, protein: 2.6, carbs: 25.9, fat: 0.3 }, aliases: ['白米饭', '粳米饭'] },
  { id: '2', name: '馒头', category: '主食', nutrition: { calories: 223, protein: 7.0, carbs: 47.0, fat: 1.1 } },
  { id: '3', name: '面条', category: '主食', nutrition: { calories: 284, protein: 8.3, carbs: 59.5, fat: 0.8 }, aliases: ['挂面', '干面条'] },
  { id: '4', name: '饺子', category: '主食', nutrition: { calories: 242, protein: 9.5, carbs: 31.8, fat: 9.2 }, aliases: ['水饺'] },
  { id: '5', name: '包子', category: '主食', nutrition: { calories: 227, protein: 7.2, carbs: 40.1, fat: 5.0 }, aliases: ['肉包', '菜包'] },
  { id: '6', name: '油条', category: '主食', nutrition: { calories: 386, protein: 6.9, carbs: 51.0, fat: 17.6 } },
  { id: '7', name: '煎饼', category: '主食', nutrition: { calories: 229, protein: 5.6, carbs: 44.5, fat: 4.0 } },
  { id: '8', name: '烧饼', category: '主食', nutrition: { calories: 257, protein: 8.0, carbs: 45.7, fat: 6.0 }, aliases: ['芝麻烧饼'] },
  { id: '9', name: '红薯', category: '主食', nutrition: { calories: 99, protein: 1.1, carbs: 23.6, fat: 0.1 }, aliases: ['地瓜', '番薯'] },
  { id: '10', name: '土豆', category: '主食', nutrition: { calories: 76, protein: 2.0, carbs: 17.0, fat: 0.1 }, aliases: ['马铃薯'] },
  { id: '11', name: '玉米', category: '主食', nutrition: { calories: 112, protein: 4.0, carbs: 22.8, fat: 1.2 }, aliases: ['玉米棒'] },
  { id: '12', name: '燕麦', category: '主食', nutrition: { calories: 367, protein: 15.0, carbs: 66.3, fat: 6.7 }, aliases: ['燕麦片'] },
  { id: '13', name: '小米粥', category: '主食', nutrition: { calories: 46, protein: 1.2, carbs: 9.8, fat: 0.4 } },
  { id: '14', name: '年糕', category: '主食', nutrition: { calories: 154, protein: 2.4, carbs: 34.5, fat: 0.5 }, aliases: ['糍粑'] },
  { id: '15', name: '汤圆', category: '主食', nutrition: { calories: 177, protein: 4.0, carbs: 35.0, fat: 2.7 } },
  { id: '16', name: '小米', category: '主食', nutrition: { calories: 361, protein: 9.0, carbs: 75.1, fat: 3.1 } },
  { id: '17', name: '糙米', category: '主食', nutrition: { calories: 348, protein: 7.2, carbs: 73.7, fat: 2.7 } },
  { id: '18', name: '糯米', category: '主食', nutrition: { calories: 348, protein: 7.3, carbs: 77.5, fat: 1.0 }, aliases: ['江米'] },
  { id: '19', name: '荞麦', category: '主食', nutrition: { calories: 324, protein: 9.3, carbs: 66.5, fat: 2.4 } },
  { id: '20', name: '山药', category: '主食', nutrition: { calories: 64, protein: 1.9, carbs: 14.4, fat: 0.2 }, aliases: ['淮山'] },
  { id: '21', name: '芋头', category: '主食', nutrition: { calories: 80, protein: 1.5, carbs: 18.6, fat: 0.1 } },
  { id: '22', name: '莲藕', category: '主食', nutrition: { calories: 70, protein: 1.9, carbs: 15.8, fat: 0.2 } },
  { id: '23', name: '紫薯', category: '主食', nutrition: { calories: 74, protein: 1.4, carbs: 17.3, fat: 0.1 } },
  { id: '24', name: '玉米面', category: '主食', nutrition: { calories: 328, protein: 8.0, carbs: 71.6, fat: 3.8 } },
  { id: '25', name: '薏米', category: '主食', nutrition: { calories: 361, protein: 12.8, carbs: 69.1, fat: 3.3 }, aliases: ['薏仁'] },
  { id: '26', name: '黑米', category: '主食', nutrition: { calories: 341, protein: 9.4, carbs: 72.2, fat: 2.5 } },
  { id: '27', name: '方便面', category: '主食', nutrition: { calories: 472, protein: 9.5, carbs: 60.9, fat: 21.1 }, aliases: ['泡面'] },
  { id: '28', name: '披萨', category: '主食', nutrition: { calories: 235, protein: 9.0, carbs: 26.0, fat: 10.3 } },
  { id: '29', name: '汉堡', category: '主食', nutrition: { calories: 295, protein: 12.0, carbs: 30.0, fat: 13.0 } },
  { id: '30', name: '三明治', category: '主食', nutrition: { calories: 250, protein: 8.0, carbs: 28.0, fat: 12.0 } },

  // 肉类
  { id: '31', name: '猪肉', category: '肉类', nutrition: { calories: 395, protein: 13.2, carbs: 0, fat: 37.0 }, aliases: ['五花肉'] },
  { id: '32', name: '猪里脊', category: '肉类', nutrition: { calories: 155, protein: 20.3, carbs: 0, fat: 7.9 } },
  { id: '33', name: '猪排骨', category: '肉类', nutrition: { calories: 278, protein: 16.7, carbs: 0, fat: 23.1 } },
  { id: '34', name: '猪蹄', category: '肉类', nutrition: { calories: 259, protein: 22.6, carbs: 0, fat: 18.8 }, aliases: ['猪脚'] },
  { id: '35', name: '猪肝', category: '肉类', nutrition: { calories: 134, protein: 22.7, carbs: 0, fat: 4.0 } },
  { id: '36', name: '牛肉', category: '肉类', nutrition: { calories: 125, protein: 17.8, carbs: 0, fat: 5.3 } },
  { id: '37', name: '牛里脊', category: '肉类', nutrition: { calories: 107, protein: 21.0, carbs: 0, fat: 2.0 }, aliases: ['牛柳'] },
  { id: '38', name: '牛腩', category: '肉类', nutrition: { calories: 135, protein: 16.2, carbs: 0, fat: 7.1 } },
  { id: '39', name: '牛排', category: '肉类', nutrition: { calories: 153, protein: 18.0, carbs: 0, fat: 8.5 } },
  { id: '40', name: '羊肉', category: '肉类', nutrition: { calories: 220, protein: 17.1, carbs: 0, fat: 16.3 } },
  { id: '41', name: '羊排', category: '肉类', nutrition: { calories: 294, protein: 14.7, carbs: 0, fat: 25.8 } },
  { id: '42', name: '鸡胸肉', category: '肉类', nutrition: { calories: 133, protein: 24.6, carbs: 0, fat: 3.1 } },
  { id: '43', name: '鸡腿肉', category: '肉类', nutrition: { calories: 181, protein: 20.2, carbs: 0, fat: 10.9 } },
  { id: '44', name: '鸡翅', category: '肉类', nutrition: { calories: 194, protein: 18.3, carbs: 0, fat: 13.0 } },
  { id: '45', name: '鸡爪', category: '肉类', nutrition: { calories: 254, protein: 23.9, carbs: 0, fat: 16.8 }, aliases: ['凤爪'] },
  { id: '46', name: '鸭肉', category: '肉类', nutrition: { calories: 240, protein: 15.5, carbs: 0, fat: 19.7 } },
  { id: '47', name: '鹅肉', category: '肉类', nutrition: { calories: 251, protein: 19.9, carbs: 0, fat: 18.8 } },
  { id: '48', name: '火鸡肉', category: '肉类', nutrition: { calories: 135, protein: 29.3, carbs: 0, fat: 1.2 } },
  { id: '49', name: '腊肉', category: '肉类', nutrition: { calories: 498, protein: 11.8, carbs: 0, fat: 48.8 } },
  { id: '50', name: '香肠', category: '肉类', nutrition: { calories: 290, protein: 13.0, carbs: 0, fat: 25.0 } },
  { id: '51', name: '火腿', category: '肉类', nutrition: { calories: 320, protein: 16.0, carbs: 0, fat: 27.4 } },
  { id: '52', name: '午餐肉', category: '肉类', nutrition: { calories: 229, protein: 9.0, carbs: 0, fat: 20.0 } },
  { id: '53', name: '肉丸', category: '肉类', nutrition: { calories: 205, protein: 12.0, carbs: 3.0, fat: 15.5 } },
  { id: '54', name: '卤牛肉', category: '肉类', nutrition: { calories: 185, protein: 27.0, carbs: 2.0, fat: 7.0 }, aliases: ['酱牛肉'] },
  { id: '55', name: '北京烤鸭', category: '肉类', nutrition: { calories: 436, protein: 16.6, carbs: 0, fat: 40.0 } },
  { id: '56', name: '烧鸡', category: '肉类', nutrition: { calories: 267, protein: 24.0, carbs: 2.0, fat: 18.0 } },
  { id: '57', name: '炸鸡', category: '肉类', nutrition: { calories: 298, protein: 20.0, carbs: 10.0, fat: 20.0 } },
  { id: '58', name: '可乐鸡翅', category: '肉类', nutrition: { calories: 245, protein: 18.0, carbs: 12.0, fat: 15.0 } },
  { id: '59', name: '宫保鸡丁', category: '肉类', nutrition: { calories: 197, protein: 15.0, carbs: 8.0, fat: 12.0 } },
  { id: '60', name: '鱼香肉丝', category: '肉类', nutrition: { calories: 185, protein: 12.0, carbs: 6.0, fat: 13.0 } },
  { id: '61', name: '糖醋里脊', category: '肉类', nutrition: { calories: 215, protein: 14.0, carbs: 18.0, fat: 11.0 } },
  { id: '62', name: '红烧肉', category: '肉类', nutrition: { calories: 478, protein: 12.0, carbs: 8.0, fat: 45.0 } },
  { id: '63', name: '回锅肉', category: '肉类', nutrition: { calories: 315, protein: 12.0, carbs: 3.0, fat: 28.0 } },
  { id: '64', name: '东坡肉', category: '肉类', nutrition: { calories: 485, protein: 11.0, carbs: 5.0, fat: 48.0 } },
  { id: '65', name: '梅菜扣肉', category: '肉类', nutrition: { calories: 352, protein: 12.0, carbs: 8.0, fat: 30.0 } },
  { id: '66', name: '狮子头', category: '肉类', nutrition: { calories: 245, protein: 12.0, carbs: 8.0, fat: 18.0 } },
  { id: '67', name: '糖醋排骨', category: '肉类', nutrition: { calories: 265, protein: 14.0, carbs: 15.0, fat: 17.0 } },
  { id: '68', name: '辣子鸡', category: '肉类', nutrition: { calories: 210, protein: 18.0, carbs: 5.0, fat: 14.0 } },
  { id: '69', name: '口水鸡', category: '肉类', nutrition: { calories: 225, protein: 18.0, carbs: 6.0, fat: 15.0 } },
  { id: '70', name: '白切鸡', category: '肉类', nutrition: { calories: 175, protein: 20.0, carbs: 0, fat: 10.0 } },
  { id: '71', name: '铁板牛柳', category: '肉类', nutrition: { calories: 185, protein: 18.0, carbs: 6.0, fat: 10.0 } },
  { id: '72', name: '水煮牛肉', category: '肉类', nutrition: { calories: 175, protein: 20.0, carbs: 4.0, fat: 10.0 } },
  { id: '73', name: '京酱肉丝', category: '肉类', nutrition: { calories: 185, protein: 12.0, carbs: 8.0, fat: 12.0 } },
  { id: '74', name: '酱爆鸡丁', category: '肉类', nutrition: { calories: 195, protein: 15.0, carbs: 8.0, fat: 13.0 } },
  { id: '75', name: '蚂蚁上树', category: '肉类', nutrition: { calories: 185, protein: 8.0, carbs: 22.0, fat: 8.0 } },
  { id: '76', name: '粉蒸肉', category: '肉类', nutrition: { calories: 285, protein: 13.0, carbs: 18.0, fat: 19.0 } },
  { id: '77', name: '木须肉', category: '肉类', nutrition: { calories: 145, protein: 10.0, carbs: 6.0, fat: 9.0 } },

  // 水产类
  { id: '78', name: '草鱼', category: '水产', nutrition: { calories: 112, protein: 18.5, carbs: 0, fat: 4.3 } },
  { id: '79', name: '鲤鱼', category: '水产', nutrition: { calories: 109, protein: 18.4, carbs: 0, fat: 3.5 } },
  { id: '80', name: '鲫鱼', category: '水产', nutrition: { calories: 93, protein: 17.1, carbs: 0, fat: 2.5 } },
  { id: '81', name: '鳜鱼', category: '水产', nutrition: { calories: 117, protein: 20.6, carbs: 0, fat: 3.5 }, aliases: ['桂鱼'] },
  { id: '82', name: '鲈鱼', category: '水产', nutrition: { calories: 105, protein: 18.6, carbs: 0, fat: 3.1 } },
  { id: '83', name: '黄鳝', category: '水产', nutrition: { calories: 89, protein: 17.9, carbs: 0, fat: 1.7 }, aliases: ['鳝鱼'] },
  { id: '84', name: '泥鳅', category: '水产', nutrition: { calories: 90, protein: 17.8, carbs: 0, fat: 2.0 } },
  { id: '85', name: '带鱼', category: '水产', nutrition: { calories: 127, protein: 17.7, carbs: 0, fat: 6.0 } },
  { id: '86', name: '鲳鱼', category: '水产', nutrition: { calories: 115, protein: 18.0, carbs: 0, fat: 4.5 }, aliases: ['平鱼'] },
  { id: '87', name: '黄花鱼', category: '水产', nutrition: { calories: 99, protein: 18.2, carbs: 0, fat: 2.5 } },
  { id: '88', name: '三文鱼', category: '水产', nutrition: { calories: 139, protein: 17.2, carbs: 0, fat: 7.8 } },
  { id: '89', name: '金枪鱼', category: '水产', nutrition: { calories: 144, protein: 23.3, carbs: 0, fat: 4.5 }, aliases: ['吞拿鱼'] },
  { id: '90', name: '鳕鱼', category: '水产', nutrition: { calories: 88, protein: 20.4, carbs: 0, fat: 0.5 } },
  { id: '91', name: '龙利鱼', category: '水产', nutrition: { calories: 90, protein: 18.0, carbs: 0, fat: 1.5 } },
  { id: '92', name: '对虾', category: '水产', nutrition: { calories: 93, protein: 20.3, carbs: 0, fat: 0.7 }, aliases: ['明虾'] },
  { id: '93', name: '基围虾', category: '水产', nutrition: { calories: 101, protein: 18.7, carbs: 0, fat: 2.4 } },
  { id: '94', name: '龙虾', category: '水产', nutrition: { calories: 90, protein: 18.6, carbs: 0, fat: 1.0 } },
  { id: '95', name: '螃蟹', category: '水产', nutrition: { calories: 97, protein: 16.0, carbs: 0, fat: 3.1 }, aliases: ['河蟹', '大闸蟹'] },
  { id: '96', name: '鲍鱼', category: '水产', nutrition: { calories: 84, protein: 18.3, carbs: 0, fat: 0.8 } },
  { id: '97', name: '海参', category: '水产', nutrition: { calories: 71, protein: 14.9, carbs: 0, fat: 0.8 } },
  { id: '98', name: '扇贝', category: '水产', nutrition: { calories: 60, protein: 11.1, carbs: 0, fat: 0.6 }, aliases: ['干贝'] },
  { id: '99', name: '生蚝', category: '水产', nutrition: { calories: 57, protein: 10.9, carbs: 0, fat: 1.5 }, aliases: ['牡蛎'] },
  { id: '100', name: '蛤蜊', category: '水产', nutrition: { calories: 62, protein: 11.8, carbs: 0, fat: 1.5 }, aliases: ['花蛤'] },
  { id: '101', name: '墨鱼', category: '水产', nutrition: { calories: 83, protein: 15.7, carbs: 0, fat: 1.5 }, aliases: ['乌贼'] },
  { id: '102', name: '章鱼', category: '水产', nutrition: { calories: 52, protein: 10.6, carbs: 0, fat: 0.5 }, aliases: ['八爪鱼'] },
  { id: '103', name: '鱿鱼', category: '水产', nutrition: { calories: 75, protein: 14.0, carbs: 0, fat: 1.2 } },
  { id: '104', name: '鳗鱼', category: '水产', nutrition: { calories: 181, protein: 18.6, carbs: 0, fat: 11.7 } },
  { id: '105', name: '清蒸鱼', category: '水产', nutrition: { calories: 98, protein: 17.0, carbs: 0, fat: 3.0 } },
  { id: '106', name: '红烧鱼', category: '水产', nutrition: { calories: 138, protein: 16.0, carbs: 5.0, fat: 6.0 } },
  { id: '107', name: '水煮鱼', category: '水产', nutrition: { calories: 168, protein: 15.0, carbs: 3.0, fat: 11.0 }, aliases: ['麻辣鱼'] },
  { id: '108', name: '酸菜鱼', category: '水产', nutrition: { calories: 135, protein: 15.0, carbs: 5.0, fat: 6.0 } },
  { id: '109', name: '剁椒鱼头', category: '水产', nutrition: { calories: 145, protein: 17.0, carbs: 2.0, fat: 8.0 } },
  { id: '110', name: '糖醋鱼', category: '水产', nutrition: { calories: 156, protein: 14.0, carbs: 12.0, fat: 7.0 } },
  { id: '111', name: '松鼠桂鱼', category: '水产', nutrition: { calories: 198, protein: 16.0, carbs: 10.0, fat: 12.0 } },
  { id: '112', name: '油焖大虾', category: '水产', nutrition: { calories: 185, protein: 16.0, carbs: 4.0, fat: 12.0 } },
  { id: '113', name: '白灼虾', category: '水产', nutrition: { calories: 105, protein: 18.0, carbs: 1.0, fat: 3.0 } },
  { id: '114', name: '清蒸大闸蟹', category: '水产', nutrition: { calories: 120, protein: 14.0, carbs: 2.0, fat: 6.0 } },
  { id: '115', name: '蒜蓉粉丝蒸扇贝', category: '水产', nutrition: { calories: 125, protein: 12.0, carbs: 8.0, fat: 6.0 } },
  { id: '116', name: '鱼丸', category: '水产', nutrition: { calories: 107, protein: 14.0, carbs: 5.0, fat: 3.5 } },
  { id: '117', name: '虾仁', category: '水产', nutrition: { calories: 87, protein: 19.0, carbs: 0, fat: 0.5 } },
  { id: '118', name: '虾皮', category: '水产', nutrition: { calories: 153, protein: 30.7, carbs: 0, fat: 2.2 } },

  // 蛋类
  { id: '119', name: '鸡蛋', category: '蛋类', nutrition: { calories: 139, protein: 13.3, carbs: 1.3, fat: 9.5 }, aliases: ['鸡卵'] },
  { id: '120', name: '鸡蛋清', category: '蛋类', nutrition: { calories: 45, protein: 9.6, carbs: 1.2, fat: 0.1 }, aliases: ['蛋清'] },
  { id: '121', name: '鸡蛋黄', category: '蛋类', nutrition: { calories: 328, protein: 15.4, carbs: 1.8, fat: 28.2 }, aliases: ['蛋黄'] },
  { id: '122', name: '鸭蛋', category: '蛋类', nutrition: { calories: 180, protein: 13.0, carbs: 1.5, fat: 13.0 } },
  { id: '123', name: '咸鸭蛋', category: '蛋类', nutrition: { calories: 190, protein: 12.7, carbs: 4.5, fat: 13.7 } },
  { id: '124', name: '皮蛋', category: '蛋类', nutrition: { calories: 171, protein: 14.8, carbs: 0.5, fat: 12.4 }, aliases: ['松花蛋'] },
  { id: '125', name: '鹅蛋', category: '蛋类', nutrition: { calories: 196, protein: 13.9, carbs: 2.2, fat: 14.4 } },
  { id: '126', name: '鹌鹑蛋', category: '蛋类', nutrition: { calories: 160, protein: 13.1, carbs: 1.5, fat: 11.1 } },
  { id: '127', name: '茶叶蛋', category: '蛋类', nutrition: { calories: 153, protein: 11.5, carbs: 2.5, fat: 10.5 }, aliases: ['茶蛋'] },
  { id: '128', name: '卤蛋', category: '蛋类', nutrition: { calories: 168, protein: 12.0, carbs: 3.0, fat: 12.0 } },
  { id: '129', name: '煎蛋', category: '蛋类', nutrition: { calories: 199, protein: 12.0, carbs: 1.0, fat: 16.0 }, aliases: ['荷包蛋'] },
  { id: '130', name: '蒸蛋', category: '蛋类', nutrition: { calories: 111, protein: 10.0, carbs: 2.0, fat: 7.0 }, aliases: ['鸡蛋羹'] },
  { id: '131', name: '炒鸡蛋', category: '蛋类', nutrition: { calories: 196, protein: 12.5, carbs: 2.5, fat: 15.0 } },
  { id: '132', name: '蛋炒饭', category: '蛋类', nutrition: { calories: 167, protein: 5.5, carbs: 22.0, fat: 7.0 } },

  // 蔬菜类
  { id: '133', name: '白菜', category: '蔬菜', nutrition: { calories: 17, protein: 1.5, carbs: 3.2, fat: 0.1 }, aliases: ['大白菜'] },
  { id: '134', name: '小白菜', category: '蔬菜', nutrition: { calories: 14, protein: 1.5, carbs: 2.0, fat: 0.3 }, aliases: ['青菜'] },
  { id: '135', name: '油菜', category: '蔬菜', nutrition: { calories: 15, protein: 1.3, carbs: 2.6, fat: 0.3 } },
  { id: '136', name: '菠菜', category: '蔬菜', nutrition: { calories: 24, protein: 2.6, carbs: 4.5, fat: 0.3 } },
  { id: '137', name: '生菜', category: '蔬菜', nutrition: { calories: 15, protein: 1.4, carbs: 2.3, fat: 0.2 } },
  { id: '138', name: '油麦菜', category: '蔬菜', nutrition: { calories: 12, protein: 1.1, carbs: 2.1, fat: 0.2 } },
  { id: '139', name: '空心菜', category: '蔬菜', nutrition: { calories: 20, protein: 2.2, carbs: 3.6, fat: 0.3 }, aliases: ['通菜'] },
  { id: '140', name: '茼蒿', category: '蔬菜', nutrition: { calories: 21, protein: 1.9, carbs: 3.5, fat: 0.3 }, aliases: ['皇帝菜'] },
  { id: '141', name: '芹菜', category: '蔬菜', nutrition: { calories: 14, protein: 0.8, carbs: 3.3, fat: 0.1 } },
  { id: '142', name: '香菜', category: '蔬菜', nutrition: { calories: 31, protein: 1.8, carbs: 6.2, fat: 0.4 }, aliases: ['芫荽'] },
  { id: '143', name: '韭菜', category: '蔬菜', nutrition: { calories: 26, protein: 2.4, carbs: 4.6, fat: 0.4 } },
  { id: '144', name: '大葱', category: '蔬菜', nutrition: { calories: 28, protein: 1.3, carbs: 6.5, fat: 0.3 } },
  { id: '145', name: '小葱', category: '蔬菜', nutrition: { calories: 24, protein: 1.6, carbs: 4.7, fat: 0.2 } },
  { id: '146', name: '洋葱', category: '蔬菜', nutrition: { calories: 39, protein: 1.1, carbs: 9.0, fat: 0.2 }, aliases: ['葱头'] },
  { id: '147', name: '大蒜', category: '蔬菜', nutrition: { calories: 128, protein: 4.5, carbs: 27.6, fat: 0.2 } },
  { id: '148', name: '生姜', category: '蔬菜', nutrition: { calories: 41, protein: 1.3, carbs: 9.1, fat: 0.6 }, aliases: ['姜'] },
  { id: '149', name: '黄瓜', category: '蔬菜', nutrition: { calories: 15, protein: 0.8, carbs: 3.0, fat: 0.2 }, aliases: ['青瓜'] },
  { id: '150', name: '冬瓜', category: '蔬菜', nutrition: { calories: 10, protein: 0.3, carbs: 2.4, fat: 0.1 } },
  { id: '151', name: '苦瓜', category: '蔬菜', nutrition: { calories: 19, protein: 1.0, carbs: 4.2, fat: 0.2 }, aliases: ['凉瓜'] },
  { id: '152', name: '丝瓜', category: '蔬菜', nutrition: { calories: 20, protein: 1.0, carbs: 4.2, fat: 0.2 }, aliases: ['水瓜'] },
  { id: '153', name: '南瓜', category: '蔬菜', nutrition: { calories: 23, protein: 0.7, carbs: 5.3, fat: 0.1 }, aliases: ['倭瓜'] },
  { id: '154', name: '西葫芦', category: '蔬菜', nutrition: { calories: 18, protein: 0.8, carbs: 3.8, fat: 0.2 }, aliases: ['角瓜'] },
  { id: '155', name: '西红柿', category: '蔬菜', nutrition: { calories: 19, protein: 0.9, carbs: 4.0, fat: 0.2 }, aliases: ['番茄'] },
  { id: '156', name: '茄子', category: '蔬菜', nutrition: { calories: 21, protein: 1.1, carbs: 4.5, fat: 0.2 } },
  { id: '157', name: '青椒', category: '蔬菜', nutrition: { calories: 23, protein: 1.0, carbs: 5.4, fat: 0.3 }, aliases: ['甜椒'] },
  { id: '158', name: '辣椒', category: '蔬菜', nutrition: { calories: 32, protein: 1.4, carbs: 7.0, fat: 0.3 }, aliases: ['尖椒'] },
  { id: '159', name: '彩椒', category: '蔬菜', nutrition: { calories: 26, protein: 1.0, carbs: 6.0, fat: 0.2 }, aliases: ['灯笼椒'] },
  { id: '160', name: '菜花', category: '蔬菜', nutrition: { calories: 24, protein: 2.1, carbs: 4.2, fat: 0.2 }, aliases: ['花椰菜'] },
  { id: '161', name: '西兰花', category: '蔬菜', nutrition: { calories: 34, protein: 3.5, carbs: 5.1, fat: 0.4 }, aliases: ['绿菜花'] },
  { id: '162', name: '芥蓝', category: '蔬菜', nutrition: { calories: 19, protein: 2.0, carbs: 2.6, fat: 0.3 } },
  { id: '163', name: '卷心菜', category: '蔬菜', nutrition: { calories: 22, protein: 1.5, carbs: 4.3, fat: 0.2 }, aliases: ['洋白菜'] },
  { id: '164', name: '紫甘蓝', category: '蔬菜', nutrition: { calories: 24, protein: 1.4, carbs: 5.0, fat: 0.2 } },
  { id: '165', name: '苋菜', category: '蔬菜', nutrition: { calories: 25, protein: 2.8, carbs: 3.8, fat: 0.3 }, aliases: ['米苋'] },
  { id: '166', name: '莴笋', category: '蔬菜', nutrition: { calories: 14, protein: 1.0, carbs: 2.6, fat: 0.1 }, aliases: ['莴苣'] },
  { id: '167', name: '竹笋', category: '蔬菜', nutrition: { calories: 25, protein: 2.6, carbs: 3.8, fat: 0.2 } },
  { id: '168', name: '芦笋', category: '蔬菜', nutrition: { calories: 18, protein: 1.8, carbs: 3.0, fat: 0.1 } },
  { id: '169', name: '茭白', category: '蔬菜', nutrition: { calories: 26, protein: 1.2, carbs: 5.9, fat: 0.2 } },
  { id: '170', name: '魔芋', category: '蔬菜', nutrition: { calories: 7, protein: 0.1, carbs: 1.6, fat: 0.1 }, aliases: ['蒟蒻'] },
  { id: '171', name: '木耳', category: '蔬菜', nutrition: { calories: 21, protein: 1.5, carbs: 3.7, fat: 0.2 }, aliases: ['黑木耳'] },
  { id: '172', name: '银耳', category: '蔬菜', nutrition: { calories: 262, protein: 10.0, carbs: 63.0, fat: 1.4 }, aliases: ['白木耳'] },
  { id: '173', name: '香菇', category: '蔬菜', nutrition: { calories: 26, protein: 2.2, carbs: 3.9, fat: 0.3 }, aliases: ['冬菇'] },
  { id: '174', name: '金针菇', category: '蔬菜', nutrition: { calories: 22, protein: 2.4, carbs: 3.3, fat: 0.4 }, aliases: ['朴菇'] },
  { id: '175', name: '平菇', category: '蔬菜', nutrition: { calories: 18, protein: 1.9, carbs: 2.7, fat: 0.3 }, aliases: ['侧耳'] },
  { id: '176', name: '杏鲍菇', category: '蔬菜', nutrition: { calories: 26, protein: 1.3, carbs: 5.1, fat: 0.1 } },
  { id: '177', name: '白玉菇', category: '蔬菜', nutrition: { calories: 18, protein: 1.5, carbs: 3.0, fat: 0.2 } },
  { id: '178', name: '口蘑', category: '蔬菜', nutrition: { calories: 27, protein: 3.7, carbs: 2.1, fat: 0.2 } },
  { id: '179', name: '荠菜', category: '蔬菜', nutrition: { calories: 27, protein: 2.9, carbs: 3.8, fat: 0.4 } },
  { id: '180', name: '豆芽', category: '蔬菜', nutrition: { calories: 18, protein: 2.1, carbs: 2.5, fat: 0.3 } },
  { id: '181', name: '黄豆芽', category: '蔬菜', nutrition: { calories: 44, protein: 4.5, carbs: 4.5, fat: 1.8 } },
  { id: '182', name: '绿豆芽', category: '蔬菜', nutrition: { calories: 18, protein: 2.1, carbs: 2.5, fat: 0.3 } },
  { id: '183', name: '荷兰豆', category: '蔬菜', nutrition: { calories: 30, protein: 2.5, carbs: 4.9, fat: 0.2 } },
  { id: '184', name: '豌豆苗', category: '蔬菜', nutrition: { calories: 34, protein: 3.8, carbs: 4.2, fat: 0.6 }, aliases: ['龙须菜'] },
  { id: '185', name: '四季豆', category: '蔬菜', nutrition: { calories: 28, protein: 1.9, carbs: 5.1, fat: 0.2 }, aliases: ['菜豆'] },
  { id: '186', name: '毛豆', category: '蔬菜', nutrition: { calories: 131, protein: 13.1, carbs: 9.5, fat: 5.0 }, aliases: ['青豆'] },
  { id: '187', name: '秋葵', category: '蔬菜', nutrition: { calories: 37, protein: 2.0, carbs: 7.4, fat: 0.2 }, aliases: ['羊角豆'] },
  { id: '188', name: '紫菜', category: '蔬菜', nutrition: { calories: 207, protein: 26.7, carbs: 22.1, fat: 1.1 } },
  { id: '189', name: '海带', category: '蔬菜', nutrition: { calories: 12, protein: 1.2, carbs: 1.6, fat: 0.1 } },
  { id: '190', name: '裙带菜', category: '蔬菜', nutrition: { calories: 45, protein: 3.0, carbs: 7.0, fat: 0.5 } },

  // 家常菜
  { id: '191', name: '番茄炒蛋', category: '家常菜', nutrition: { calories: 115, protein: 8.0, carbs: 5.0, fat: 7.0 } },
  { id: '192', name: '青椒炒肉', category: '家常菜', nutrition: { calories: 155, protein: 12.0, carbs: 4.0, fat: 10.0 } },
  { id: '193', name: '土豆烧牛肉', category: '家常菜', nutrition: { calories: 185, protein: 15.0, carbs: 8.0, fat: 11.0 } },
  { id: '194', name: '红烧茄子', category: '家常菜', nutrition: { calories: 95, protein: 2.5, carbs: 10.0, fat: 5.0 } },
  { id: '195', name: '麻婆豆腐', category: '家常菜', nutrition: { calories: 165, protein: 10.0, carbs: 8.0, fat: 11.0 } },
  { id: '196', name: '酸辣土豆丝', category: '家常菜', nutrition: { calories: 105, protein: 2.5, carbs: 15.0, fat: 4.0 } },
  { id: '197', name: '干煸四季豆', category: '家常菜', nutrition: { calories: 115, protein: 4.5, carbs: 12.0, fat: 6.0 } },
  { id: '198', name: '蒜蓉西兰花', category: '家常菜', nutrition: { calories: 55, protein: 3.5, carbs: 6.0, fat: 2.5 } },
  { id: '199', name: '清炒油菜', category: '家常菜', nutrition: { calories: 45, protein: 2.0, carbs: 4.0, fat: 2.5 } },
  { id: '200', name: '凉拌黄瓜', category: '家常菜', nutrition: { calories: 35, protein: 1.0, carbs: 4.0, fat: 1.5 }, aliases: ['拍黄瓜'] },
  { id: '201', name: '皮蛋豆腐', category: '家常菜', nutrition: { calories: 120, protein: 9.0, carbs: 3.0, fat: 8.0 } },
  { id: '202', name: '小葱拌豆腐', category: '家常菜', nutrition: { calories: 110, protein: 8.0, carbs: 4.0, fat: 7.5 } },
  { id: '203', name: '地三鲜', category: '家常菜', nutrition: { calories: 125, protein: 4.0, carbs: 15.0, fat: 6.0 } },
  { id: '204', name: '佛跳墙', category: '家常菜', nutrition: { calories: 195, protein: 18.0, carbs: 6.0, fat: 11.0 } },
  { id: '205', name: '冬瓜排骨汤', category: '家常菜', nutrition: { calories: 85, protein: 7.0, carbs: 4.0, fat: 5.0 } },
  { id: '206', name: '紫菜蛋花汤', category: '家常菜', nutrition: { calories: 35, protein: 2.0, carbs: 2.0, fat: 2.0 } },
  { id: '207', name: '番茄鸡蛋汤', category: '家常菜', nutrition: { calories: 55, protein: 3.0, carbs: 4.0, fat: 3.0 } },
  { id: '208', name: '酸辣汤', category: '家常菜', nutrition: { calories: 65, protein: 2.5, carbs: 6.0, fat: 3.5 } },
  { id: '209', name: '玉米排骨汤', category: '家常菜', nutrition: { calories: 95, protein: 8.0, carbs: 5.0, fat: 5.5 } },
  { id: '210', name: '萝卜炖牛肉', category: '家常菜', nutrition: { calories: 145, protein: 14.0, carbs: 5.0, fat: 8.0 } },
  { id: '211', name: '番茄牛腩', category: '家常菜', nutrition: { calories: 155, protein: 14.0, carbs: 8.0, fat: 8.5 } },
  { id: '212', name: '麻辣香锅', category: '家常菜', nutrition: { calories: 185, protein: 10.0, carbs: 12.0, fat: 12.0 } },
  { id: '213', name: '黄焖鸡', category: '家常菜', nutrition: { calories: 220, protein: 14.0, carbs: 25.0, fat: 9.0 } },
  { id: '214', name: '蛋炒饭', category: '家常菜', nutrition: { calories: 185, protein: 6.0, carbs: 28.0, fat: 6.0 }, aliases: ['扬州炒饭'] },
  { id: '215', name: '炒米粉', category: '家常菜', nutrition: { calories: 175, protein: 5.0, carbs: 30.0, fat: 5.0 } },
  { id: '216', name: '炒河粉', category: '家常菜', nutrition: { calories: 165, protein: 4.5, carbs: 28.0, fat: 5.0 } },
  { id: '217', name: '炒年糕', category: '家常菜', nutrition: { calories: 165, protein: 4.0, carbs: 32.0, fat: 4.0 } },
  { id: '218', name: '煎饺', category: '家常菜', nutrition: { calories: 225, protein: 8.0, carbs: 28.0, fat: 10.0 } },
  { id: '219', name: '锅贴', category: '家常菜', nutrition: { calories: 235, protein: 8.0, carbs: 26.0, fat: 12.0 } },
  { id: '220', name: '小笼包', category: '家常菜', nutrition: { calories: 235, protein: 9.0, carbs: 28.0, fat: 11.0 }, aliases: ['汤包'] },
  { id: '221', name: '蒸饺', category: '家常菜', nutrition: { calories: 195, protein: 8.0, carbs: 28.0, fat: 7.0 } },
  { id: '222', name: '春卷', category: '家常菜', nutrition: { calories: 265, protein: 6.0, carbs: 32.0, fat: 14.0 } },
  { id: '223', name: '葱油饼', category: '家常菜', nutrition: { calories: 295, protein: 7.0, carbs: 38.0, fat: 15.0 } },
  { id: '224', name: '肉夹馍', category: '家常菜', nutrition: { calories: 335, protein: 14.0, carbs: 35.0, fat: 17.0 } },
  { id: '225', name: '凉皮', category: '家常菜', nutrition: { calories: 145, protein: 3.0, carbs: 30.0, fat: 2.0 } },
  { id: '226', name: '担担面', category: '家常菜', nutrition: { calories: 235, protein: 8.0, carbs: 35.0, fat: 8.0 } },
  { id: '227', name: '重庆小面', category: '家常菜', nutrition: { calories: 225, protein: 7.0, carbs: 32.0, fat: 8.0 } },
  { id: '228', name: '兰州拉面', category: '家常菜', nutrition: { calories: 245, protein: 9.0, carbs: 35.0, fat: 8.5 } },
  { id: '229', name: '油泼面', category: '家常菜', nutrition: { calories: 255, protein: 8.0, carbs: 38.0, fat: 9.5 } },
  { id: '230', name: '炸酱面', category: '家常菜', nutrition: { calories: 265, protein: 9.0, carbs: 38.0, fat: 9.0 } },
  { id: '231', name: '热干面', category: '家常菜', nutrition: { calories: 255, protein: 8.0, carbs: 40.0, fat: 9.0 } },
  { id: '232', name: '过桥米线', category: '家常菜', nutrition: { calories: 195, protein: 6.0, carbs: 32.0, fat: 5.5 } },
  { id: '233', name: '螺蛳粉', category: '家常菜', nutrition: { calories: 215, protein: 7.0, carbs: 35.0, fat: 7.0 } },
  { id: '234', name: '肠粉', category: '家常菜', nutrition: { calories: 165, protein: 4.5, carbs: 28.0, fat: 4.5 } },
  { id: '235', name: '虾饺', category: '家常菜', nutrition: { calories: 195, protein: 10.0, carbs: 22.0, fat: 8.0 } },

  // 水果类
  { id: '236', name: '苹果', category: '水果', nutrition: { calories: 52, protein: 0.2, carbs: 13.5, fat: 0.2 } },
  { id: '237', name: '梨', category: '水果', nutrition: { calories: 50, protein: 0.4, carbs: 13.1, fat: 0.2 }, aliases: ['雪梨', '鸭梨'] },
  { id: '238', name: '香蕉', category: '水果', nutrition: { calories: 91, protein: 1.4, carbs: 22.8, fat: 0.2 } },
  { id: '239', name: '橙子', category: '水果', nutrition: { calories: 47, protein: 0.8, carbs: 11.8, fat: 0.1 }, aliases: ['甜橙'] },
  { id: '240', name: '橘子', category: '水果', nutrition: { calories: 50, protein: 0.7, carbs: 12.5, fat: 0.1 }, aliases: ['蜜橘'] },
  { id: '241', name: '柚子', category: '水果', nutrition: { calories: 42, protein: 0.8, carbs: 10.3, fat: 0.2 } },
  { id: '242', name: '葡萄', category: '水果', nutrition: { calories: 67, protein: 0.6, carbs: 17.1, fat: 0.2 }, aliases: ['提子'] },
  { id: '243', name: '西瓜', category: '水果', nutrition: { calories: 31, protein: 0.6, carbs: 7.9, fat: 0.1 } },
  { id: '244', name: '哈密瓜', category: '水果', nutrition: { calories: 34, protein: 0.5, carbs: 8.3, fat: 0.1 } },
  { id: '245', name: '甜瓜', category: '水果', nutrition: { calories: 26, protein: 0.4, carbs: 6.2, fat: 0.1 }, aliases: ['香瓜'] },
  { id: '246', name: '草莓', category: '水果', nutrition: { calories: 30, protein: 1.0, carbs: 7.1, fat: 0.2 } },
  { id: '247', name: '蓝莓', category: '水果', nutrition: { calories: 57, protein: 0.7, carbs: 14.5, fat: 0.3 } },
  { id: '248', name: '猕猴桃', category: '水果', nutrition: { calories: 61, protein: 0.8, carbs: 15.2, fat: 0.4 }, aliases: ['奇异果'] },
  { id: '249', name: '菠萝', category: '水果', nutrition: { calories: 44, protein: 0.5, carbs: 10.8, fat: 0.1 }, aliases: ['凤梨'] },
  { id: '250', name: '芒果', category: '水果', nutrition: { calories: 65, protein: 0.9, carbs: 16.2, fat: 0.3 } },
  { id: '251', name: '木瓜', category: '水果', nutrition: { calories: 29, protein: 0.4, carbs: 7.2, fat: 0.1 } },
  { id: '252', name: '火龙果', category: '水果', nutrition: { calories: 55, protein: 1.1, carbs: 13.3, fat: 0.2 } },
  { id: '253', name: '荔枝', category: '水果', nutrition: { calories: 71, protein: 0.9, carbs: 17.3, fat: 0.2 } },
  { id: '254', name: '龙眼', category: '水果', nutrition: { calories: 73, protein: 1.2, carbs: 17.6, fat: 0.1 }, aliases: ['桂圆'] },
  { id: '255', name: '枇杷', category: '水果', nutrition: { calories: 41, protein: 0.8, carbs: 9.8, fat: 0.2 } },
  { id: '256', name: '杨梅', category: '水果', nutrition: { calories: 28, protein: 0.8, carbs: 6.7, fat: 0.1 } },
  { id: '257', name: '山楂', category: '水果', nutrition: { calories: 95, protein: 0.5, carbs: 25.1, fat: 0.1 }, aliases: ['红果'] },
  { id: '258', name: '樱桃', category: '水果', nutrition: { calories: 63, protein: 1.1, carbs: 15.4, fat: 0.2 }, aliases: ['车厘子'] },
  { id: '259', name: '桃子', category: '水果', nutrition: { calories: 51, protein: 0.9, carbs: 12.2, fat: 0.3 }, aliases: ['蜜桃', '油桃'] },
  { id: '260', name: '李子', category: '水果', nutrition: { calories: 38, protein: 0.7, carbs: 9.1, fat: 0.2 }, aliases: ['梅子'] },
  { id: '261', name: '杏', category: '水果', nutrition: { calories: 38, protein: 0.9, carbs: 9.3, fat: 0.1 } },
  { id: '262', name: '红枣', category: '水果', nutrition: { calories: 125, protein: 1.1, carbs: 33.0, fat: 0.3 } },
  { id: '263', name: '柿子', category: '水果', nutrition: { calories: 74, protein: 0.6, carbs: 19.6, fat: 0.1 } },
  { id: '264', name: '石榴', category: '水果', nutrition: { calories: 73, protein: 1.3, carbs: 18.7, fat: 0.2 } },
  { id: '265', name: '无花果', category: '水果', nutrition: { calories: 65, protein: 1.5, carbs: 16.9, fat: 0.1 } },
  { id: '266', name: '椰子', category: '水果', nutrition: { calories: 231, protein: 2.5, carbs: 31.3, fat: 12.1 } },
  { id: '267', name: '榴莲', category: '水果', nutrition: { calories: 147, protein: 1.5, carbs: 33.0, fat: 3.3 } },
  { id: '268', name: '菠萝蜜', category: '水果', nutrition: { calories: 95, protein: 1.5, carbs: 25.0, fat: 0.1 } },
  { id: '269', name: '百香果', category: '水果', nutrition: { calories: 97, protein: 2.2, carbs: 23.4, fat: 0.7 }, aliases: ['鸡蛋果'] },
  { id: '270', name: '牛油果', category: '水果', nutrition: { calories: 160, protein: 2.0, carbs: 8.5, fat: 15.0 }, aliases: ['鳄梨'] },
  { id: '271', name: '番石榴', category: '水果', nutrition: { calories: 41, protein: 1.1, carbs: 9.8, fat: 0.4 }, aliases: ['芭乐'] },
  { id: '272', name: '山竹', category: '水果', nutrition: { calories: 72, protein: 0.7, carbs: 18.5, fat: 0.2 } },
  { id: '273', name: '葡萄干', category: '水果', nutrition: { calories: 341, protein: 2.5, carbs: 83.4, fat: 0.3 } },
  { id: '274', name: '桂圆干', category: '水果', nutrition: { calories: 277, protein: 4.0, carbs: 68.0, fat: 0.6 } },
  { id: '275', name: '红枣干', category: '水果', nutrition: { calories: 282, protein: 2.1, carbs: 71.6, fat: 0.4 } },

  // 豆类及豆制品
  { id: '276', name: '黄豆', category: '豆类', nutrition: { calories: 390, protein: 35.0, carbs: 34.2, fat: 16.0 } },
  { id: '277', name: '黑豆', category: '豆类', nutrition: { calories: 381, protein: 36.0, carbs: 33.6, fat: 15.9 } },
  { id: '278', name: '绿豆', category: '豆类', nutrition: { calories: 329, protein: 23.1, carbs: 62.0, fat: 0.8 } },
  { id: '279', name: '红豆', category: '豆类', nutrition: { calories: 324, protein: 20.2, carbs: 63.4, fat: 0.6 }, aliases: ['赤豆'] },
  { id: '280', name: '芸豆', category: '豆类', nutrition: { calories: 334, protein: 21.4, carbs: 62.5, fat: 1.3 } },
  { id: '281', name: '豆腐', category: '豆制品', nutrition: { calories: 81, protein: 8.1, carbs: 3.8, fat: 3.7 } },
  { id: '282', name: '北豆腐', category: '豆制品', nutrition: { calories: 98, protein: 9.2, carbs: 2.6, fat: 5.8 }, aliases: ['老豆腐'] },
  { id: '283', name: '南豆腐', category: '豆制品', nutrition: { calories: 57, protein: 5.7, carbs: 3.2, fat: 2.1 }, aliases: ['嫩豆腐'] },
  { id: '284', name: '内酯豆腐', category: '豆制品', nutrition: { calories: 49, protein: 4.6, carbs: 2.3, fat: 1.8 } },
  { id: '285', name: '豆腐干', category: '豆制品', nutrition: { calories: 140, protein: 12.2, carbs: 4.8, fat: 8.5 }, aliases: ['香干'] },
  { id: '286', name: '素鸡', category: '豆制品', nutrition: { calories: 192, protein: 16.5, carbs: 3.6, fat: 12.5 } },
  { id: '287', name: '豆腐皮', category: '豆制品', nutrition: { calories: 447, protein: 44.8, carbs: 14.8, fat: 22.3 }, aliases: ['油皮'] },
  { id: '288', name: '腐竹', category: '豆制品', nutrition: { calories: 459, protein: 44.5, carbs: 22.3, fat: 21.7 } },
  { id: '289', name: '千张', category: '豆制品', nutrition: { calories: 262, protein: 24.5, carbs: 3.5, fat: 16.0 }, aliases: ['百叶'] },
  { id: '290', name: '腐乳', category: '豆制品', nutrition: { calories: 133, protein: 10.9, carbs: 5.8, fat: 8.2 }, aliases: ['豆腐乳'] },
  { id: '291', name: '豆浆', category: '豆制品', nutrition: { calories: 33, protein: 2.9, carbs: 1.2, fat: 1.6 }, aliases: ['豆奶'] },
  { id: '292', name: '豆花', category: '豆制品', nutrition: { calories: 40, protein: 4.0, carbs: 2.0, fat: 1.5 }, aliases: ['豆腐脑'] },
  { id: '293', name: '臭豆腐', category: '豆制品', nutrition: { calories: 130, protein: 9.0, carbs: 4.0, fat: 9.0 } },
  { id: '294', name: '纳豆', category: '豆制品', nutrition: { calories: 212, protein: 17.7, carbs: 11.0, fat: 10.0 } },
  { id: '295', name: '豆瓣酱', category: '豆制品', nutrition: { calories: 178, protein: 8.2, carbs: 12.0, fat: 11.0 } },

  // 奶类及奶制品
  { id: '296', name: '牛奶', category: '奶类', nutrition: { calories: 61, protein: 3.0, carbs: 3.4, fat: 3.2 }, aliases: ['纯牛奶'] },
  { id: '297', name: '全脂牛奶', category: '奶类', nutrition: { calories: 61, protein: 3.0, carbs: 3.4, fat: 3.2 } },
  { id: '298', name: '脱脂牛奶', category: '奶类', nutrition: { calories: 33, protein: 3.0, carbs: 3.4, fat: 0.1 } },
  { id: '299', name: '酸奶', category: '奶制品', nutrition: { calories: 72, protein: 2.5, carbs: 9.3, fat: 2.5 } },
  { id: '300', name: '奶酪', category: '奶制品', nutrition: { calories: 328, protein: 25.7, carbs: 3.5, fat: 23.5 }, aliases: ['芝士'] },
  { id: '301', name: '奶油奶酪', category: '奶制品', nutrition: { calories: 342, protein: 6.0, carbs: 4.0, fat: 34.0 } },
  { id: '302', name: '羊奶', category: '奶类', nutrition: { calories: 59, protein: 1.5, carbs: 3.5, fat: 3.5 } },
  { id: '303', name: '炼乳', category: '奶制品', nutrition: { calories: 332, protein: 8.0, carbs: 54.0, fat: 9.0 } },
  { id: '304', name: '淡奶油', category: '奶制品', nutrition: { calories: 340, protein: 2.2, carbs: 2.8, fat: 36.0 } },
  { id: '305', name: '黄油', category: '奶制品', nutrition: { calories: 717, protein: 0.7, carbs: 0.1, fat: 81.0 }, aliases: ['牛油'] },
  { id: '306', name: '奶粉', category: '奶类', nutrition: { calories: 484, protein: 26.0, carbs: 52.0, fat: 20.0 } },
  { id: '307', name: '冰淇淋', category: '奶制品', nutrition: { calories: 207, protein: 3.5, carbs: 24.0, fat: 11.0 }, aliases: ['冰激凌'] },
  { id: '308', name: '布丁', category: '奶制品', nutrition: { calories: 120, protein: 3.0, carbs: 18.0, fat: 4.0 } },
  { id: '309', name: '芝士蛋糕', category: '奶制品', nutrition: { calories: 257, protein: 5.0, carbs: 28.0, fat: 14.0 } },
  { id: '310', name: '提拉米苏', category: '奶制品', nutrition: { calories: 290, protein: 5.0, carbs: 25.0, fat: 18.0 } },

  // 坚果类
  { id: '311', name: '花生', category: '坚果', nutrition: { calories: 563, protein: 24.8, carbs: 16.2, fat: 49.2 } },
  { id: '312', name: '炒花生', category: '坚果', nutrition: { calories: 588, protein: 21.0, carbs: 23.0, fat: 51.0 } },
  { id: '313', name: '花生酱', category: '坚果', nutrition: { calories: 600, protein: 22.0, carbs: 18.0, fat: 53.0 } },
  { id: '314', name: '核桃', category: '坚果', nutrition: { calories: 646, protein: 15.2, carbs: 19.1, fat: 58.8 } },
  { id: '315', name: '核桃仁', category: '坚果', nutrition: { calories: 646, protein: 15.2, carbs: 19.1, fat: 58.8 } },
  { id: '316', name: '杏仁', category: '坚果', nutrition: { calories: 578, protein: 20.0, carbs: 21.0, fat: 50.0 } },
  { id: '317', name: '巴旦木', category: '坚果', nutrition: { calories: 579, protein: 21.0, carbs: 19.0, fat: 50.0 }, aliases: ['扁桃仁'] },
  { id: '318', name: '开心果', category: '坚果', nutrition: { calories: 560, protein: 18.0, carbs: 20.0, fat: 45.0 } },
  { id: '319', name: '腰果', category: '坚果', nutrition: { calories: 559, protein: 18.0, carbs: 27.0, fat: 44.0 } },
  { id: '320', name: '榛子', category: '坚果', nutrition: { calories: 594, protein: 20.0, carbs: 15.0, fat: 55.0 } },
  { id: '321', name: '松子', category: '坚果', nutrition: { calories: 619, protein: 14.0, carbs: 21.0, fat: 58.0 } },
  { id: '322', name: '栗子', category: '坚果', nutrition: { calories: 188, protein: 4.2, carbs: 42.0, fat: 0.7 }, aliases: ['板栗'] },
  { id: '323', name: '夏威夷果', category: '坚果', nutrition: { calories: 688, protein: 8.0, carbs: 13.0, fat: 73.0 } },
  { id: '324', name: '碧根果', category: '坚果', nutrition: { calories: 692, protein: 9.0, carbs: 13.0, fat: 74.0 } },
  { id: '325', name: '葵花子', category: '坚果', nutrition: { calories: 597, protein: 23.0, carbs: 20.0, fat: 53.0 }, aliases: ['瓜子'] },
  { id: '326', name: '南瓜子', category: '坚果', nutrition: { calories: 566, protein: 33.0, carbs: 5.0, fat: 48.0 } },
  { id: '327', name: '莲子', category: '坚果', nutrition: { calories: 350, protein: 17.0, carbs: 67.0, fat: 2.0 } },
  { id: '328', name: '混合坚果', category: '坚果', nutrition: { calories: 600, protein: 18.0, carbs: 18.0, fat: 52.0 }, aliases: ['每日坚果'] },

  // 零食甜点类
  { id: '329', name: '饼干', category: '零食', nutrition: { calories: 435, protein: 6.0, carbs: 72.0, fat: 15.0 }, aliases: ['曲奇'] },
  { id: '330', name: '曲奇', category: '零食', nutrition: { calories: 484, protein: 5.0, carbs: 62.0, fat: 24.0 } },
  { id: '331', name: '薯片', category: '零食', nutrition: { calories: 548, protein: 5.0, carbs: 50.0, fat: 37.0 } },
  { id: '332', name: '薯条', category: '零食', nutrition: { calories: 312, protein: 3.0, carbs: 41.0, fat: 15.0 } },
  { id: '333', name: '爆米花', category: '零食', nutrition: { calories: 387, protein: 13.0, carbs: 78.0, fat: 5.0 } },
  { id: '334', name: '棉花糖', category: '零食', nutrition: { calories: 321, protein: 2.0, carbs: 80.0, fat: 0.2 } },
  { id: '335', name: '巧克力', category: '零食', nutrition: { calories: 546, protein: 5.0, carbs: 56.0, fat: 33.0 } },
  { id: '336', name: '牛奶巧克力', category: '零食', nutrition: { calories: 550, protein: 6.0, carbs: 55.0, fat: 33.0 } },
  { id: '337', name: '黑巧克力', category: '零食', nutrition: { calories: 546, protein: 5.0, carbs: 56.0, fat: 33.0 } },
  { id: '338', name: '士力架', category: '零食', nutrition: { calories: 488, protein: 9.0, carbs: 58.0, fat: 25.0 } },
  { id: '339', name: '沙琪玛', category: '零食', nutrition: { calories: 436, protein: 7.0, carbs: 67.0, fat: 16.0 } },
  { id: '340', name: '蛋黄派', category: '零食', nutrition: { calories: 416, protein: 5.0, carbs: 65.0, fat: 16.0 } },
  { id: '341', name: '瑞士卷', category: '零食', nutrition: { calories: 320, protein: 4.0, carbs: 48.0, fat: 13.0 } },
  { id: '342', name: '蛋糕', category: '零食', nutrition: { calories: 374, protein: 5.0, carbs: 55.0, fat: 15.0 } },
  { id: '343', name: '奶油蛋糕', category: '零食', nutrition: { calories: 420, protein: 4.0, carbs: 50.0, fat: 23.0 } },
  { id: '344', name: '慕斯蛋糕', category: '零食', nutrition: { calories: 280, protein: 4.0, carbs: 30.0, fat: 16.0 } },
  { id: '345', name: '泡芙', category: '零食', nutrition: { calories: 330, protein: 6.0, carbs: 32.0, fat: 20.0 } },
  { id: '346', name: '甜甜圈', category: '零食', nutrition: { calories: 435, protein: 5.0, carbs: 55.0, fat: 22.0 } },
  { id: '347', name: '马卡龙', category: '零食', nutrition: { calories: 410, protein: 5.0, carbs: 60.0, fat: 18.0 } },
  { id: '348', name: '蛋黄酥', category: '零食', nutrition: { calories: 420, protein: 7.0, carbs: 42.0, fat: 24.0 } },
  { id: '349', name: '凤梨酥', category: '零食', nutrition: { calories: 400, protein: 4.0, carbs: 55.0, fat: 18.0 } },
  { id: '350', name: '麻薯', category: '零食', nutrition: { calories: 280, protein: 4.0, carbs: 55.0, fat: 4.0 }, aliases: ['麻糬'] },
  { id: '351', name: '果冻', category: '零食', nutrition: { calories: 82, protein: 0, carbs: 20.0, fat: 0 } },
  { id: '352', name: '龟苓膏', category: '零食', nutrition: { calories: 50, protein: 1.0, carbs: 10.0, fat: 0.5 } },
  { id: '353', name: '雪糕', category: '零食', nutrition: { calories: 130, protein: 2.0, carbs: 20.0, fat: 5.0 } },
  { id: '354', name: '冰沙', category: '零食', nutrition: { calories: 90, protein: 0, carbs: 23.0, fat: 0 } },
  { id: '355', name: '奶糖', category: '零食', nutrition: { calories: 400, protein: 2.0, carbs: 78.0, fat: 8.0 } },

  // 饮品类
  { id: '356', name: '白开水', category: '饮品', nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 } },
  { id: '357', name: '矿泉水', category: '饮品', nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 } },
  { id: '358', name: '苏打水', category: '饮品', nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 } },
  { id: '359', name: '绿茶', category: '饮品', nutrition: { calories: 1, protein: 0, carbs: 0.2, fat: 0 } },
  { id: '360', name: '红茶', category: '饮品', nutrition: { calories: 1, protein: 0, carbs: 0.3, fat: 0 } },
  { id: '361', name: '乌龙茶', category: '饮品', nutrition: { calories: 1, protein: 0, carbs: 0.2, fat: 0 } },
  { id: '362', name: '柠檬水', category: '饮品', nutrition: { calories: 5, protein: 0, carbs: 1.2, fat: 0 } },
  { id: '363', name: '蜂蜜水', category: '饮品', nutrition: { calories: 50, protein: 0, carbs: 13.0, fat: 0 } },
  { id: '364', name: '奶茶', category: '饮品', nutrition: { calories: 60, protein: 0.5, carbs: 10.0, fat: 2.0 } },
  { id: '365', name: '珍珠奶茶', category: '饮品', nutrition: { calories: 85, protein: 0.5, carbs: 15.0, fat: 2.5 } },
  { id: '366', name: '奶盖奶茶', category: '饮品', nutrition: { calories: 110, protein: 1.0, carbs: 16.0, fat: 4.5 } },
  { id: '367', name: '拿铁咖啡', category: '饮品', nutrition: { calories: 67, protein: 3.4, carbs: 5.0, fat: 3.2 } },
  { id: '368', name: '美式咖啡', category: '饮品', nutrition: { calories: 2, protein: 0.3, carbs: 0, fat: 0 } },
  { id: '369', name: '卡布奇诺', category: '饮品', nutrition: { calories: 75, protein: 4.0, carbs: 5.0, fat: 4.0 } },
  { id: '370', name: '摩卡咖啡', category: '饮品', nutrition: { calories: 180, protein: 4.0, carbs: 30.0, fat: 6.0 } },
  { id: '371', name: '浓缩咖啡', category: '饮品', nutrition: { calories: 3, protein: 0.1, carbs: 0, fat: 0 } },
  { id: '372', name: '生椰拿铁', category: '饮品', nutrition: { calories: 120, protein: 2.5, carbs: 15.0, fat: 6.0 } },
  { id: '373', name: '可乐', category: '饮品', nutrition: { calories: 42, protein: 0, carbs: 10.6, fat: 0 } },
  { id: '374', name: '雪碧', category: '饮品', nutrition: { calories: 41, protein: 0, carbs: 10.3, fat: 0 } },
  { id: '375', name: '冰红茶', category: '饮品', nutrition: { calories: 28, protein: 0, carbs: 7.0, fat: 0 } },
  { id: '376', name: '橙汁', category: '饮品', nutrition: { calories: 45, protein: 0.5, carbs: 10.5, fat: 0 } },
  { id: '377', name: '苹果汁', category: '饮品', nutrition: { calories: 44, protein: 0.1, carbs: 11.0, fat: 0 } },
  { id: '378', name: '葡萄汁', category: '饮品', nutrition: { calories: 60, protein: 0.2, carbs: 15.0, fat: 0 } },
  { id: '379', name: '椰子水', category: '饮品', nutrition: { calories: 19, protein: 0.5, carbs: 3.7, fat: 0 } },
  { id: '380', name: '酸梅汤', category: '饮品', nutrition: { calories: 45, protein: 0, carbs: 11.0, fat: 0 } },
  { id: '381', name: '凉茶', category: '饮品', nutrition: { calories: 10, protein: 0, carbs: 2.5, fat: 0 } },
  { id: '382', name: '养乐多', category: '饮品', nutrition: { calories: 65, protein: 1.1, carbs: 14.0, fat: 0.2 } },
  { id: '383', name: '功能饮料', category: '饮品', nutrition: { calories: 45, protein: 0, carbs: 11.0, fat: 0 } },
  { id: '384', name: '啤酒', category: '饮品', nutrition: { calories: 43, protein: 0.4, carbs: 3.1, fat: 0 } },
  { id: '385', name: '红酒', category: '饮品', nutrition: { calories: 74, protein: 0.1, carbs: 2.5, fat: 0 } },
  { id: '386', name: '白酒', category: '饮品', nutrition: { calories: 280, protein: 0, carbs: 0, fat: 0 } },
  { id: '387', name: '米酒', category: '饮品', nutrition: { calories: 50, protein: 0.5, carbs: 8.0, fat: 0 }, aliases: ['醪糟'] },
  { id: '388', name: '鸡尾酒', category: '饮品', nutrition: { calories: 120, protein: 0, carbs: 10.0, fat: 0 } },
  { id: '389', name: '运动饮料', category: '饮品', nutrition: { calories: 26, protein: 0, carbs: 6.5, fat: 0 } },
  { id: '390', name: '杏仁露', category: '饮品', nutrition: { calories: 45, protein: 0.8, carbs: 7.5, fat: 1.2 } },
  { id: '391', name: '豆奶', category: '饮品', nutrition: { calories: 30, protein: 2.4, carbs: 1.8, fat: 1.0 } },
  { id: '392', name: '燕麦奶', category: '饮品', nutrition: { calories: 35, protein: 0.5, carbs: 7.0, fat: 0.5 } },
];

// ==================== 分类统计 ====================
export const categoryStats = {
  total: foodDatabase.length,
  categories: [...new Set(foodDatabase.map(f => f.category))].length,
};

// ==================== 模糊搜索 ====================
/**
 * 模糊搜索食物
 * 支持食物名称、别名搜索
 * @param query 搜索关键词
 * @param limit 返回结果数量限制
 */
export function searchFoods(query: string, limit: number = 10): FoodItem[] {
  if (!query || query.trim() === '') return [];
  
  const normalizedQuery = query.toLowerCase().trim();
  
  return foodDatabase
    .map(food => {
      let score = 0;
      
      // 完全匹配名称
      if (food.name.toLowerCase() === normalizedQuery) {
        score = 100;
      }
      // 名称开头匹配
      else if (food.name.toLowerCase().startsWith(normalizedQuery)) {
        score = 80;
      }
      // 名称包含搜索词
      else if (food.name.toLowerCase().includes(normalizedQuery)) {
        score = 60;
      }
      // 别名匹配
      else if (food.aliases?.some(alias => 
        alias.toLowerCase().includes(normalizedQuery)
      )) {
        score = 40;
      }
      
      return { food, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.food);
}

// ==================== 按分类获取食物 ====================
export function getFoodsByCategory(category: string): FoodItem[] {
  return foodDatabase.filter(f => f.category === category);
}

// ==================== 获取所有分类 ====================
export function getAllCategories(): string[] {
  return [...new Set(foodDatabase.map(f => f.category))].sort();
}
