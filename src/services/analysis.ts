import { Recipe, DailyEntry, StockRecord, InventoryAnalysis } from '../types';
import { getRecipes, getDailyEntries } from './storage';

// 计算某一天某原料的理论消耗量
export const calculateTheoreticalConsumption = (
  date: string,
  ingredientId: string
): number => {
  const recipes = getRecipes();
  const dailyEntries = getDailyEntries();
  const dailyEntry = dailyEntries.find(entry => entry.date === date);
  
  if (!dailyEntry) {
    return 0;
  }
  
  let totalConsumption = 0;
  
  // 遍历所有配料表
  recipes.forEach(recipe => {
    // 查找该原料在配料表中的用量
    const recipeIngredient = recipe.ingredients.find(
      ingredient => ingredient.ingredientId === ingredientId
    );
    
    if (recipeIngredient) {
      // 根据销售数据计算理论消耗
      const record = dailyEntry.records.find(r => 
        r.ingredientId === recipeIngredient.ingredientId
      );
      
      if (record && record.soldAmount > 0) {
        // 计算这个原料在这个产品中的理论消耗量
        totalConsumption += recipeIngredient.amount * record.soldAmount;
      }
    }
  });
  
  return totalConsumption;
};

// 计算损耗率
export const calculateLossRate = (
  theoreticalConsumption: number,
  actualConsumption: number
): number => {
  if (theoreticalConsumption === 0) {
    return 0;
  }
  
  return ((theoreticalConsumption - actualConsumption) / theoreticalConsumption) * 100;
};

// 计算实际消耗量
export const calculateActualConsumption = (
  purchaseAmount: number,
  soldAmount: number
): number => {
  return purchaseAmount - soldAmount;
};

// 获取指定日期的分析数据
export const getDailyAnalysis = (date: string): InventoryAnalysis[] => {
  const dailyEntries = getDailyEntries();
  const dailyEntry = dailyEntries.find(entry => entry.date === date);
  
  if (!dailyEntry) {
    return [];
  }
  
  return dailyEntry.records.map(record => {
    const theoreticalConsumption = calculateTheoreticalConsumption(date, record.ingredientId);
    const actualConsumption = calculateActualConsumption(
      record.purchaseAmount,
      record.soldAmount
    );
    const lossRate = calculateLossRate(theoreticalConsumption, actualConsumption);
    
    return {
      date,
      ingredientId: record.ingredientId,
      ingredientName: record.ingredientName,
      theoreticalConsumption,
      actualConsumption,
      lossRate,
      unit: record.unit
    };
  });
};

// 获取日期范围内的分析数据
export const getAnalysisInDateRange = (
  startDate: string,
  endDate: string
): InventoryAnalysis[] => {
  const dailyEntries = getDailyEntries();
  const entriesInRange = dailyEntries.filter(
    entry => entry.date >= startDate && entry.date <= endDate
  );
  
  let result: InventoryAnalysis[] = [];
  
  entriesInRange.forEach(entry => {
    const analysisForDay = getDailyAnalysis(entry.date);
    result = [...result, ...analysisForDay];
  });
  
  return result;
};

// 检查是否有异常损耗
export const checkAbnormalLoss = (
  analysis: InventoryAnalysis[],
  threshold: number
): InventoryAnalysis[] => {
  return analysis.filter(item => item.lossRate > threshold);
}; 