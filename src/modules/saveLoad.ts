/**
 * 保研模拟器 - 保存/加载模块
 * 实现游戏进度持久化功能
 */

import { GameState } from './types';

const STORAGE_KEY = 'baoyan_simulator_save';
const STORAGE_VERSION = '1.0.0';

/**
 * 保存游戏状态到 localStorage
 */
export const saveGameState = (state: GameState): boolean => {
  try {
    const saveData = {
      version: STORAGE_VERSION,
      timestamp: Date.now(),
      state: state
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
    console.log('游戏进度已保存');
    return true;
  } catch (error) {
    console.error('保存失败:', error);
    return false;
  }
};

/**
 * 从 localStorage 加载游戏状态
 */
export const loadGameState = (): GameState | null => {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    
    if (!savedData) {
      console.log('未找到保存的游戏进度');
      return null;
    }
    
    const parsedData = JSON.parse(savedData);
    
    // 版本检查（未来可以添加版本迁移逻辑）
    if (parsedData.version !== STORAGE_VERSION) {
      console.warn(`存档版本不匹配: ${parsedData.version} vs ${STORAGE_VERSION}`);
      // 可以在这里添加版本迁移逻辑
    }
    
    console.log(`游戏进度已加载 (保存时间: ${new Date(parsedData.timestamp).toLocaleString()})`);
    return parsedData.state;
  } catch (error) {
    console.error('加载失败:', error);
    return null;
  }
};

/**
 * 检查是否有保存的游戏进度
 */
export const hasSavedGame = (): boolean => {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    return savedData !== null;
  } catch (error) {
    return false;
  }
};

/**
 * 删除保存的游戏进度
 */
export const deleteSavedGame = (): boolean => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('游戏进度已删除');
    return true;
  } catch (error) {
    console.error('删除失败:', error);
    return false;
  }
};

/**
 * 获取存档信息（不加载完整状态）
 */
export const getSaveInfo = (): { exists: boolean; timestamp?: number; phase?: string } => {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    
    if (!savedData) {
      return { exists: false };
    }
    
    const parsedData = JSON.parse(savedData);
    return {
      exists: true,
      timestamp: parsedData.timestamp,
      phase: parsedData.state?.phase
    };
  } catch (error) {
    return { exists: false };
  }
};

/**
 * 自动保存（每次关键操作后调用）
 */
export const autoSave = (state: GameState): void => {
  // 只在游戏进行中自动保存
  if (state.phase !== 'start' && !state.isGameOver) {
    saveGameState(state);
  }
};

/**
 * 导出存档为JSON文件（用于备份）
 */
export const exportSaveAsJSON = (state: GameState): string => {
  const saveData = {
    version: STORAGE_VERSION,
    timestamp: Date.now(),
    state: state,
    exportDate: new Date().toISOString()
  };
  
  return JSON.stringify(saveData, null, 2);
};

/**
 * 从JSON导入存档
 */
export const importSaveFromJSON = (jsonString: string): GameState | null => {
  try {
    const saveData = JSON.parse(jsonString);
    
    if (!saveData.state) {
      throw new Error('无效的存档格式');
    }
    
    // 保存到localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
    
    return saveData.state;
  } catch (error) {
    console.error('导入失败:', error);
    return null;
  }
};

/**
 * 获取多个存档（未来可以支持多存档位）
 * 当前版本只支持单个存档
 */
export const getMultipleSaves = (): Array<{ slot: number; info: ReturnType<typeof getSaveInfo> }> => {
  // 简化版：只返回当前存档
  const currentSave = getSaveInfo();
  return [{ slot: 0, info: currentSave }];
};

/**
 * 保存到指定存档位（未来功能）
 */
export const saveToSlot = (state: GameState, slot: number): boolean => {
  const slotKey = `${STORAGE_KEY}_slot_${slot}`;
  try {
    const saveData = {
      version: STORAGE_VERSION,
      timestamp: Date.now(),
      slot: slot,
      state: state
    };
    
    localStorage.setItem(slotKey, JSON.stringify(saveData));
    return true;
  } catch (error) {
    console.error(`保存到存档位 ${slot} 失败:`, error);
    return false;
  }
};

/**
 * 从指定存档位加载（未来功能）
 */
export const loadFromSlot = (slot: number): GameState | null => {
  const slotKey = `${STORAGE_KEY}_slot_${slot}`;
  try {
    const savedData = localStorage.getItem(slotKey);
    
    if (!savedData) {
      return null;
    }
    
    const parsedData = JSON.parse(savedData);
    return parsedData.state;
  } catch (error) {
    console.error(`从存档位 ${slot} 加载失败:`, error);
    return null;
  }
};