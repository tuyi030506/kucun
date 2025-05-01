import { v4 as uuidv4 } from 'uuid';

// 生成唯一ID
export const generateId = (): string => {
  return uuidv4();
};

// 格式化日期
export const formatDate = (date: Date, format: string = 'YYYY-MM-DD'): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return format
    .replace('YYYY', year.toString())
    .replace('MM', month)
    .replace('DD', day);
};

// 获取当前日期
export const getCurrentDate = (format: string = 'YYYY-MM-DD'): string => {
  return formatDate(new Date(), format);
};

// 数字格式化，保留固定小数位
export const formatNumber = (num: number, digits: number = 2): string => {
  return num.toFixed(digits);
};

// 百分比格式化
export const formatPercentage = (value: number, digits: number = 2): string => {
  return `${formatNumber(value, digits)}%`;
};

// 深拷贝对象
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

// 生成一周日期范围
export const getWeekDateRange = (): { startDate: string; endDate: string } => {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 is Sunday, 6 is Saturday
  const startDate = new Date(now);
  startDate.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  
  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate)
  };
};

// 生成月份日期范围
export const getMonthDateRange = (): { startDate: string; endDate: string } => {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate)
  };
}; 