import { Recipe, Ingredient, DailyEntry, UserSettings } from '../types';

// 本地存储键名
const STORAGE_KEYS = {
  INGREDIENTS: 'inventory_ingredients',
  RECIPES: 'inventory_recipes',
  DAILY_ENTRIES: 'inventory_daily_entries',
  SETTINGS: 'inventory_settings'
};

// 默认设置
const DEFAULT_SETTINGS: UserSettings = {
  lossRateThreshold: 5,
  notificationEnabled: true,
  dateFormat: 'YYYY-MM-DD'
};

// 获取配料列表
export const getIngredients = (): Ingredient[] => {
  const data = localStorage.getItem(STORAGE_KEYS.INGREDIENTS);
  return data ? JSON.parse(data) : [];
};

// 保存配料列表
export const saveIngredients = (ingredients: Ingredient[]): void => {
  localStorage.setItem(STORAGE_KEYS.INGREDIENTS, JSON.stringify(ingredients));
};

// 获取配料表
export const getRecipes = (): Recipe[] => {
  const data = localStorage.getItem(STORAGE_KEYS.RECIPES);
  return data ? JSON.parse(data) : [];
};

// 保存配料表
export const saveRecipes = (recipes: Recipe[]): void => {
  localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(recipes));
};

// 获取每日录入数据
export const getDailyEntries = (): DailyEntry[] => {
  const data = localStorage.getItem(STORAGE_KEYS.DAILY_ENTRIES);
  return data ? JSON.parse(data) : [];
};

// 保存每日录入数据
export const saveDailyEntries = (entries: DailyEntry[]): void => {
  localStorage.setItem(STORAGE_KEYS.DAILY_ENTRIES, JSON.stringify(entries));
};

// 获取用户设置
export const getSettings = (): UserSettings => {
  const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  return data ? JSON.parse(data) : DEFAULT_SETTINGS;
};

// 保存用户设置
export const saveSettings = (settings: UserSettings): void => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
};

// 初始化应用数据
export const initializeAppData = (): void => {
  // 如果没有配料，添加一些默认配料
  if (getIngredients().length === 0) {
    const defaultIngredients: Ingredient[] = [
      { id: '1', name: '面粉', unit: '千克' },
      { id: '2', name: '糖', unit: '千克' },
      { id: '3', name: '奶油', unit: '千克' },
      { id: '4', name: '鸡蛋', unit: '个' },
      { id: '5', name: '牛奶', unit: '升' }
    ];
    saveIngredients(defaultIngredients);
  }

  // 如果没有配料表，添加一些默认配料表
  if (getRecipes().length === 0) {
    const defaultRecipes: Recipe[] = [
      {
        id: '1',
        name: '面包',
        ingredients: [
          { ingredientId: '1', ingredientName: '面粉', amount: 0.5, unit: '千克' },
          { ingredientId: '2', ingredientName: '糖', amount: 0.1, unit: '千克' },
          { ingredientId: '5', ingredientName: '牛奶', amount: 0.2, unit: '升' }
        ]
      },
      {
        id: '2',
        name: '蛋糕',
        ingredients: [
          { ingredientId: '1', ingredientName: '面粉', amount: 0.3, unit: '千克' },
          { ingredientId: '2', ingredientName: '糖', amount: 0.2, unit: '千克' },
          { ingredientId: '3', ingredientName: '奶油', amount: 0.1, unit: '千克' },
          { ingredientId: '4', ingredientName: '鸡蛋', amount: 4, unit: '个' }
        ]
      }
    ];
    saveRecipes(defaultRecipes);
  }

  // 确保设置存在
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    saveSettings(DEFAULT_SETTINGS);
  }
}; 