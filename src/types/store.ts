// 店铺基础信息
export interface Store {
  id: string;
  name: string;
  region: string;
  type: 'standard' | 'flagship';
  status: 'active' | 'inactive';
}

// 店铺运营数据
export interface StoreMetrics {
  storeId: string;
  date: string;
  ingredients: IngredientUsage[];
  sales: SaleRecord[];
  alerts: Alert[];
}

// 原料使用记录
export interface IngredientUsage {
  ingredientId: string;
  name: string;
  theoreticalUsage: number;  // 理论用量
  actualUsage: number;       // 实际用量
  stock: number;            // 当前库存
  unit: string;            // 单位
  costPerUnit: number;     // 单位成本
}

// 销售记录
export interface SaleRecord {
  productId: string;
  productName: string;
  quantity: number;
  amount: number;
  platform: 'meituan' | 'eleme' | 'own';
}

// 预警信息
export interface Alert {
  id: string;
  storeId: string;
  type: AlertType;
  level: AlertLevel;
  timestamp: string;
  metric: string;
  value: number;
  threshold: number;
  message: string;
  suggestions: string[];
  status: 'new' | 'processing' | 'resolved';
  costImpact?: number;     // 成本影响
}

// 预警类型
export enum AlertType {
  HIGH_LOSS_RATE = '损耗率过高',
  LOW_STOCK = '库存不足',
  ABNORMAL_USAGE = '异常用量',
  SALES_DROP = '销量下降',
  COST_INCREASE = '成本上升'
}

// 预警等级
export enum AlertLevel {
  URGENT = 'urgent',
  WARNING = 'warning',
  NOTICE = 'notice'
}

// 监控配置
export interface MonitorConfig {
  lossRateThreshold: number;      // 损耗率阈值
  stockWarningDays: number;       // 库存预警天数
  salesDropThreshold: number;     // 销量下降阈值
  costIncreaseThreshold: number;  // 成本上升阈值
  checkInterval: number;          // 检查间隔（分钟）
}

// 进货预测
export interface PurchaseForecast {
  storeId: string;
  ingredientId: string;
  ingredientName: string;
  unit: string;
  currentStock: number;
  averageDailyUsage: number;      // 平均每日消耗量
  recommendedPurchase: number;    // 建议进货量
  daysToOrder: number;           // 建议几天后进货
  estimatedCost: number;         // 预计成本
  potentialSavings: number;      // 潜在节省（相比历史进货）
} 