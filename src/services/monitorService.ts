import { v4 as uuidv4 } from 'uuid';
import {
  Store,
  StoreMetrics,
  Alert,
  AlertType,
  AlertLevel,
  MonitorConfig,
  IngredientUsage
} from '../types/store';

export class MonitorService {
  private config: MonitorConfig = {
    lossRateThreshold: 5,        // 5%
    stockWarningDays: 3,         // 3天库存预警
    salesDropThreshold: 20,      // 销量下降20%预警
    costIncreaseThreshold: 10,   // 成本上升10%预警
    checkInterval: 15            // 每15分钟检查一次
  };

  // 检查单个店铺
  async checkStore(metrics: StoreMetrics): Promise<Alert[]> {
    const alerts: Alert[] = [];
    
    // 检查损耗率
    const lossRateAlerts = this.checkLossRate(metrics);
    alerts.push(...lossRateAlerts);
    
    // 检查库存
    const stockAlerts = this.checkStock(metrics);
    alerts.push(...stockAlerts);
    
    // 检查销量
    const salesAlerts = this.checkSales(metrics);
    alerts.push(...salesAlerts);
    
    return alerts;
  }

  // 检查损耗率
  private checkLossRate(metrics: StoreMetrics): Alert[] {
    const alerts: Alert[] = [];
    
    metrics.ingredients.forEach(ingredient => {
      const lossRate = this.calculateLossRate(ingredient);
      
      if (lossRate > this.config.lossRateThreshold) {
        alerts.push(this.createAlert({
          storeId: metrics.storeId,
          type: AlertType.HIGH_LOSS_RATE,
          level: lossRate > this.config.lossRateThreshold * 2 ? AlertLevel.URGENT : AlertLevel.WARNING,
          metric: ingredient.name,
          value: lossRate,
          threshold: this.config.lossRateThreshold,
          message: `${ingredient.name}损耗率${lossRate.toFixed(1)}%，超过${this.config.lossRateThreshold}%阈值`,
          suggestions: [
            '1. 立即盘点该原料库存，核实数据准确性',
            '2. 检查原料保存条件是否合适',
            '3. 复查制作流程和操作规范',
            '4. 对员工进行培训，强调原料使用规范',
            '5. 考虑调整配料表或产品定价'
          ]
        }));
      }
    });
    
    return alerts;
  }

  // 检查库存
  private checkStock(metrics: StoreMetrics): Alert[] {
    const alerts: Alert[] = [];
    
    metrics.ingredients.forEach(ingredient => {
      const daysRemaining = this.calculateStockDays(ingredient);
      
      if (daysRemaining < this.config.stockWarningDays) {
        alerts.push(this.createAlert({
          storeId: metrics.storeId,
          type: AlertType.LOW_STOCK,
          level: daysRemaining < 1 ? AlertLevel.URGENT : AlertLevel.WARNING,
          metric: ingredient.name,
          value: daysRemaining,
          threshold: this.config.stockWarningDays,
          message: `${ingredient.name}库存仅剩${daysRemaining.toFixed(1)}天用量`,
          suggestions: [
            '1. 立即补充库存',
            '2. 检查供应商供货周期',
            '3. 考虑调整安全库存量',
            '4. 优化采购计划'
          ]
        }));
      }
    });
    
    return alerts;
  }

  // 检查销量变化
  private checkSales(metrics: StoreMetrics): Alert[] {
    // 实现销量检查逻辑
    return [];
  }

  // 计算损耗率
  private calculateLossRate(ingredient: IngredientUsage): number {
    if (ingredient.theoreticalUsage === 0) return 0;
    return ((ingredient.actualUsage - ingredient.theoreticalUsage) / ingredient.theoreticalUsage) * 100;
  }

  // 计算剩余库存天数
  private calculateStockDays(ingredient: IngredientUsage): number {
    const dailyUsage = ingredient.actualUsage; // 这里应该使用平均日消耗
    if (dailyUsage === 0) return 999;
    return ingredient.stock / dailyUsage;
  }

  // 创建预警
  private createAlert(params: Partial<Alert>): Alert {
    return {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      status: 'new',
      ...params
    } as Alert;
  }
} 