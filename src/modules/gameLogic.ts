/**
 * 保研模拟器 - 游戏逻辑模块
 * 从 App.tsx 中提取的核心游戏逻辑函数
 */

import { GameState, PlayerStats, Course, ExamReport, University } from './types';
import { SEMESTER_NAMES } from './constants';

// 计算成功概率
export const calculateSuccessChance = (state: GameState): number => {
  const gpaFactor = state.stats.gpa / 4.5 * 30;
  const resumeScore = state.resume.reduce((sum, item) => sum + item.score, 0);
  const resumeFactor = resumeScore / 200 * 25;
  const englishFactor = state.stats.english / 100 * 15;
  const socialFactor = (state.social.classmates + state.social.seniors) / 200 * 15;
  const mentalFactor = state.stats.mental / 100 * 15;
  
  return Math.min(100, Math.max(0, gpaFactor + resumeFactor + englishFactor + socialFactor + mentalFactor));
};

// 计算考试报告
export const calculateExamResults = (
  courses: Course[],
  stats: PlayerStats,
  state: GameState,
  _examType: 'midterm' | 'final' // 参数名前缀_表示未使用
): ExamReport => {
  const results = courses.map(course => {
    const baseScore = course.mastery;
    const difficultyMod = 5 - course.difficulty;
    const mentalMod = stats.mental > 60 ? 10 : -10;
    const staminaMod = stats.stamina > 50 ? 5 : -5;
    const randomness = Math.random() * 20 - 10;
    
    let score = Math.min(100, Math.max(0, baseScore + difficultyMod * 5 + mentalMod + staminaMod + randomness));
    
    // 根据掌握度调整分数
    if (course.mastery > 80) score += 5;
    if (course.mastery < 40) score -= 10;
    
    const grade = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F';
    
    return {
      courseName: course.name,
      score: Math.round(score),
      grade,
      credit: course.credit
    };
  });
  
  const totalCredits = results.reduce((sum, r) => sum + r.credit, 0);
  const weightedSum = results.reduce((sum, r) => {
    const gradePoint = r.grade === 'A' ? 4.0 : r.grade === 'B' ? 3.0 : r.grade === 'C' ? 2.0 : r.grade === 'D' ? 1.0 : 0;
    return sum + gradePoint * r.credit;
  }, 0);
  
  const newGpa = totalCredits > 0 ? weightedSum / totalCredits : stats.gpa;
  
  return {
    results,
    prevGpa: stats.gpa,
    newGpa: Math.min(4.5, Math.max(0, newGpa)),
    semesterName: SEMESTER_NAMES[Math.max(0, state.semester - 1)] || "未知学期"
  };
};

// 导师互动
export const handleMentorInteraction = (
  mentorId: string,
  state: GameState
): { newState: GameState; log: string } => {
  const mentor = state.mentors.find(m => m.id === mentorId);
  if (!mentor) {
    return { newState: state, log: "导师不存在" };
  }
  
  const friendshipIncrease = Math.floor(Math.random() * 15) + 5;
  const staminaCost = 15;
  
  const updatedMentors = state.mentors.map(m => {
    if (m.id === mentorId) {
      return {
        ...m,
        friendship: Math.min(100, m.friendship + friendshipIncrease)
      };
    }
    return m;
  });
  
  const log = `你与${mentor.name}导师进行了深度交流，亲密度提升了${friendshipIncrease}点。`;
  
  return {
    newState: {
      ...state,
      mentors: updatedMentors,
      stats: {
        ...state.stats,
        stamina: state.stats.stamina - staminaCost
      }
    },
    log
  };
};

// 导师套磁
export const handleTaoci = (
  mentorId: string,
  state: GameState
): { newState: GameState; log: string } => {
  const mentor = state.mentors.find(m => m.id === mentorId);
  if (!mentor) {
    return { newState: state, log: "导师不存在" };
  }
  
  const staminaCost = 15;
  const successChance = (mentor.friendship + mentor.reputation) / 200 + 0.2;
  const isSuccess = Math.random() < successChance;
  
  let newStatus = mentor.status;
  let log = "";
  
  if (mentor.status === 'none') {
    if (isSuccess) {
      newStatus = 'fish_pond';
      log = `你成功向${mentor.name}导师套磁，进入了鱼塘名单。`;
    } else {
      newStatus = 'rejected';
      log = `套磁失败，${mentor.name}导师婉拒了你的请求。`;
    }
  } else if (mentor.status === 'fish_pond') {
    if (isSuccess && Math.random() < 0.4) {
      newStatus = 'verbal_offer';
      log = `恭喜！${mentor.name}导师给了你口头offer！`;
    } else {
      log = `还在鱼塘中，需要继续努力提升亲密度。`;
    }
  }
  
  const updatedMentors = state.mentors.map(m => {
    if (m.id === mentorId) {
      return { ...m, status: newStatus };
    }
    return m;
  });
  
  return {
    newState: {
      ...state,
      mentors: updatedMentors,
      stats: {
        ...state.stats,
        stamina: state.stats.stamina - staminaCost
      }
    },
    log
  };
};

// 计算申请成功率
export const calculateApplicationChance = (
  uni: University,
  state: GameState
): number => {
  const resumeScore = state.resume.reduce((sum, item) => sum + item.score, 0);
  
  // 简化计算（实际实现需要更复杂，需要考虑院校层级）
  let successChance = 
    (state.stats.gpa / 4.5) * 0.25 + 
    (resumeScore / 200) * 0.25 + 
    (state.stats.english / 100) * 0.10 + 
    (state.social.seniors / 100) * 0.10;
  
  // 导师套磁状态影响
  const uniMentors = state.mentors.filter(m => m.university === uni.name);
  uniMentors.forEach(m => {
    if (m.status === 'hard_offer') successChance += 0.4;
    else if (m.status === 'verbal_offer') successChance += 0.2;
    else if (m.status === 'fish_pond') successChance += 0.05;
    else if (m.status === 'rejected') successChance -= 0.15;
  });
  
  // 保研率修正
  const baoyanRateFactor = (uni.baoyanRate / 30);
  successChance *= (0.7 + baoyanRateFactor * 0.3);
  
  return Math.min(1, Math.max(0, successChance));
};

// 面试回答处理
export const handleInterviewAnswer = (
  _questionId: string, // 参数名前缀_表示未使用
  optionIndex: number,
  state: GameState
): { newState: GameState; feedback: string } => {
  if (!state.currentInterview) {
    return { newState: state, feedback: "面试不存在" };
  }
  
  const question = state.currentInterview.questions[state.currentInterview.currentQuestionIndex];
  const option = question.options[optionIndex];
  
  const newTotalScore = state.currentInterview.totalScore + option.score;
  const nextQuestionIndex = state.currentInterview.currentQuestionIndex + 1;
  
  return {
    newState: {
      ...state,
      currentInterview: {
        ...state.currentInterview,
        currentQuestionIndex: nextQuestionIndex,
        totalScore: newTotalScore
      }
    },
    feedback: option.feedback
  };
};

// 注意：完整的游戏逻辑函数将在后续补充
// 包括：
// - startGaokao (高考开始)
// - selectUniversity (大学选择)
// - selectMajor (专业选择)
// - handleWeekActions (周活动处理)
// - calculateOutcome (结局计算)
// 等等