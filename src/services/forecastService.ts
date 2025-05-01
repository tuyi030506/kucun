import { StoreMetrics, PurchaseForecast } from '../types/store';

export class ForecastService {
  // 预测安全库存天数
  private safetyStockDays = 3;
  // 最小订货周期（天）
  private minOrderCycle = 2;
  // 历史数据读取天数
  private historyDays = 7;
  
  /**
   * 生成进货预测
   * @param storeId 店铺ID
   * @param historyData 历史数据，最近7天的数据，按日期降序排列
   */
  public generatePurchaseForecast(
    storeId: string, 
    historyData: StoreMetrics[]
  ): PurchaseForecast[] {
    const forecasts: PurchaseForecast[] = [];
    
    // 确保有足够的历史数据
    if (historyData.length === 0) {
      return forecasts;
    }
    
    // 获取最新的库存数据（第一天的数据）
    const latestMetrics = historyData[0];
    
    // 处理每种原料
    latestMetrics.ingredients.forEach(ingredient => {
      // 计算历史平均消耗
      const usageHistory = historyData.map(day => {
        const ing = day.ingredients.find(i => i.ingredientId === ingredient.ingredientId);
        return ing ? ing.actualUsage : 0;
      });
      
      // 计算平均每日消耗
      const averageDailyUsage = this.calculateAverage(usageHistory);
      
      // 如果没有消耗，跳过
      if (averageDailyUsage <= 0) {
        return;
      }
      
      // 计算当前库存可以维持的天数
      const daysRemaining = ingredient.stock / averageDailyUsage;
      
      // 计算建议进货时间
      const daysToOrder = Math.max(0, daysRemaining - this.safetyStockDays);
      
      // 计算建议进货量
      const recommendedPurchase = this.calculateRecommendedPurchase(
        averageDailyUsage,
        ingredient.stock,
        this.safetyStockDays,
        this.minOrderCycle
      );
      
      // 计算预计成本
      const estimatedCost = recommendedPurchase * ingredient.costPerUnit;
      
      // 计算潜在节省（简化计算：假设过去进货量为平均消耗的1.2倍）
      const historicalPurchase = averageDailyUsage * this.minOrderCycle * 1.2;
      const potentialSavings = (historicalPurchase - recommendedPurchase) * ingredient.costPerUnit;
      
      // 添加到预测结果
      forecasts.push({
        storeId,
        ingredientId: ingredient.ingredientId,
        ingredientName: ingredient.name,
        unit: ingredient.unit,
        currentStock: ingredient.stock,
        averageDailyUsage,
        recommendedPurchase,
        daysToOrder,
        estimatedCost,
        potentialSavings: potentialSavings > 0 ? potentialSavings : 0
      });
    });
    
    return forecasts;
  }
  
  /**
   * 计算数组平均值
   */
  private calculateAverage(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    const sum = numbers.reduce((total, num) => total + num, 0);
    return sum / numbers.length;
  }
  
  /**
   * 计算建议进货量
   * 公式: (平均日消耗 × 订货周期) + 安全库存 - 当前库存
   */
  private calculateRecommendedPurchase(
    averageDailyUsage: number,
    currentStock: number,
    safetyStockDays: number,
    orderCycleDays: number
  ): number {
    const safetyStock = averageDailyUsage * safetyStockDays;
    const cycleDemand = averageDailyUsage * orderCycleDays;
    const recommendedAmount = cycleDemand + safetyStock - currentStock;
    
    // 如果计算结果为负，说明库存充足，不需要进货
    return Math.max(0, recommendedAmount);
  }
} 