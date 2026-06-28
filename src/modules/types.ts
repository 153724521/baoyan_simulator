/**
 * 保研模拟器 - 类型定义模块
 */

// 玩家属性
export interface PlayerStats {
  gpa: number;
  research: number;
  competition: number;
  english: number;
  mental: number;
  stamina: number;
}

// 游戏阶段
export type GamePhase = 'start' | 'gaokao' | 'university_selection' | 'university_failed' | 'course_selection' | 'main_game' | 'exam' | 'summer_camp' | 'pre_recommendation' | 'game_over';

// 专业类型
export type MajorType = 'cs' | 'biology' | 'humanities' | 'general' | 'ee' | 'medicine' | 'law' | 'art';

// 课程
export interface Course {
  id: string;
  name: string;
  difficulty: number;
  credit: number;
  type: 'compulsory' | 'elective' | 'general';
  semester: number;
  majorRestriction?: MajorType[];
  mastery: number;
  description: string;
}

// 导师状态
export type MentorStatus = 'none' | 'contacting' | 'fish_pond' | 'verbal_offer' | 'hard_offer' | 'rejected';

// 导师
export interface Mentor {
  id: string;
  name: string;
  title: string;
  reputation: number;
  friendship: number;
  university: string;
  school: string;
  researchField: string;
  status: MentorStatus;
}

// 面试问题
export interface InterviewQuestion {
  id: string;
  text: string;
  options: Array<{
    text: string;
    score: number;
    feedback: string;
  }>;
}

// 大学
export interface University {
  name: string;
  minScore: number;
  tier: string;
  tags: string[];
  description: string;
  baoyanRate: number;
}

// 简历质量
export type ResumeQuality = 'common' | 'rare' | 'epic' | 'legendary';

// 简历项目
export interface ResumeItem {
  id: string;
  type: 'research' | 'competition';
  name: string;
  score: number;
  quality: ResumeQuality;
}

// 游戏事件
export interface GameEvent {
  title: string;
  description: string;
  options: Array<{
    text: string;
    effect: (stats: PlayerStats) => { newStats: PlayerStats; log: string; moneyChange?: number };
  }>;
  majorRestriction?: MajorType[];
}

// 游戏状态
export interface GameState {
  phase: GamePhase;
  semester: number;
  week: number;
  money: number;
  logs: string[];
  stats: PlayerStats;
  resume: ResumeItem[];
  masteryEfficiency: number;
  researchEfficiency: number;
  competitionEfficiency: number;
  isGameOver: boolean;
  gameMessage: string;
  currentEvent: GameEvent | null;
  currentInterview: CurrentInterview | null;
  background: string;
  gaokaoScore: number;
  university: string;
  major: string;
  majorType: MajorType;
  failedUniversity?: string;
  rejectionCount: number;
  courses: Course[];
  mentors: Mentor[];
  potentialMentors: Mentor[];
  social: {
    classmates: number;
    seniors: number;
  };
  applications: Application[];
  activeExam: { type: 'midterm' | 'final' } | null;
  showExamReport: boolean;
  examReport: ExamReport | null;
  selectedActions: Action[];
  weekSummary: {
    gains: Partial<PlayerStats> & { money?: number; classmates?: number; seniors?: number; mastery?: number };
    logs: string[];
  };
  showWeeklySummary: boolean;
  purchaseCounts: Record<string, number>;
  endingStats?: {
    title: string;
    detail: string;
    fancyQuote: string;
    careerStats: {
      finalGpa: number;
      totalResumeScore: number;
      finalEnglish: number;
      finalSocial: number;
      finalMoney: number;
    };
    applicationStats: {
      summerCamp: {
        applied: number;
        interviews: number;
        offers: number;
      };
      preRec: {
        applied: number;
        interviews: number;
        offers: number;
      };
    };
  };
}

// 当前面试
export interface CurrentInterview {
  university: string;
  major: string;
  phase: 'summer_camp' | 'pre_recommendation';
  questions: InterviewQuestion[];
  currentQuestionIndex: number;
  totalScore: number;
  backgroundScore: number;
}

// 行动
export interface Action {
  name: string;
  description: string;
  icon: React.ReactNode;
  cost: Partial<PlayerStats> & { money?: number };
  gain: Partial<PlayerStats> & { mastery?: number; money?: number };
  socialGain?: {
    classmates?: number;
    seniors?: number;
  };
  chance?: number;
}

// 申请
export interface Application {
  university: string;
  major: string;
  status: 'pending' | 'interviewing' | 'accepted' | 'rejected' | 'waitlist';
  phase: 'summer_camp' | 'pre_recommendation';
}

// 考试结果
export interface ExamResult {
  courseName: string;
  score: number;
  grade: string;
  credit: number;
}

// 考试报告
export interface ExamReport {
  results: ExamResult[];
  prevGpa: number;
  newGpa: number;
  semesterName: string;
}