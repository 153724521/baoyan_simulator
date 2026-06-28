/**
 * 保研模拟器 - 模块统一导出
 */

// 类型定义
export * from './types';

// 常量数据
export * from './constants';

// 游戏逻辑
export * from './gameLogic';

// 保存/加载
export * from './saveLoad';

// 从 constants 中导出所有常量和函数
export {
  SEMESTER_NAMES,
  UNIVERSITIES,
  MAJORS,
  ALL_COURSES,
  INITIAL_STATS,
  INITIAL_MENTORS,
  INTERVIEW_QUESTIONS,
  MENTOR_DATA,
  generateRandomMentor,
  generateNewMentorBatch
} from './constants';