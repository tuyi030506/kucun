// 配料表类型定义
export interface Ingredient {
  id: string;
  name: string;
  unit: string;
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: RecipeIngredient[];
}

export interface RecipeIngredient {
  ingredientId: string;
  ingredientName: string;
  amount: number;
  unit: string;
}

// 每日数据录入类型定义
export interface DailyEntry {
  id: string;
  date: string;
  records: StockRecord[];
}

export interface StockRecord {
  id: string;
  ingredientId: string;
  ingredientName: string;
  purchaseAmount: number;
  salesAmount: number;
  soldAmount: number;
  unit: string;
}

// 库存分析类型定义
export interface InventoryAnalysis {
  date: string;
  ingredientId: string;
  ingredientName: string;
  theoreticalConsumption: number;
  actualConsumption: number;
  lossRate: number;
  unit: string;
}

// 用户设置类型定义
export interface UserSettings {
  lossRateThreshold: number; // 损耗率阈值
  notificationEnabled: boolean;
  dateFormat: string;
} 