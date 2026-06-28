/**
 * 保研模拟器 - 类型定义模块
 * 从 App.tsx 中提取的所有类型定义
 */

// 玩家属性
export interface PlayerStats {
  gpa: number;         // 绩点 (0-4.5)
  research: number;    // 科研/项目 (0-100)
  competition: number; // 竞赛 (0-100)
  english: number;     // 英语 (0-100)
  mental: number;      // 心态 (0-100)
  stamina: number;     // 体力 (0-100)
}

// 游戏阶段
export type GamePhase = 'start' | 'gaokao' | 'university_selection' | 'university_failed' | 'course_selection' | 'main_game' | 'exam' | 'summer_camp' | 'pre_recommendation' | 'game_over';

// 专业类型
export type MajorType = 'cs' | 'biology' | 'humanities' | 'general' | 'ee' | 'medicine' | 'law' | 'art';

// 游戏事件
export interface GameEvent {
  title: string;
  description: string;
  options: {
    text: string;
    effect: (stats: PlayerStats) => { newStats: PlayerStats; log: string; moneyChange?: number };
  }[];
  majorRestriction?: MajorType[];
}

// 课程
export interface Course {
  id: string;
  name: string;
  difficulty: number; // 1-5
  credit: number;
  type: 'compulsory' | 'elective' | 'general';
  semester: number;
  majorRestriction?: MajorType[];
  mastery: number; // 掌握度 (0-100)
  description: string;
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

// 导师状态
export type MentorStatus = 'none' | 'contacting' | 'fish_pond' | 'verbal_offer' | 'hard_offer' | 'rejected';

// 导师
export interface Mentor {
  id: string;
  name: string;
  title: string;
  reputation: number; // 名望 (0-100)
  friendship: number; // 亲密度 (0-100)
  university: string;
  school: string;      // 学院/研究所
  researchField: string;
  status: MentorStatus;
}

// 申请
export interface Application {
  university: string;
  major: string;
  status: 'pending' | 'interviewing' | 'accepted' | 'rejected' | 'waitlist';
  phase: 'summer_camp' | 'pre_recommendation';
}

// 面试问题
export interface InterviewQuestion {
  id: string;
  text: string;
  options: {
    text: string;
    score: number;
    feedback: string;
  }[];
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

// 游戏状态
export interface GameState {
  phase: GamePhase;
  semester: number;    // 当前学期 (1-6, 大一到大三)
  week: number;        // 当前周 (1-18)
  money: number;       // 零钱
  logs: string[];      // 游戏日志
  stats: PlayerStats;
  resume: ResumeItem[]; // 个人简历
  masteryEfficiency: number; // 掌握度提升效率倍率
  researchEfficiency: number;  // 科研提升效率倍率
  competitionEfficiency: number; // 竞赛提升效率倍率
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

// 大学
export interface University {
  name: string;
  minScore: number;
  tier: string;
  tags: string[];
  description: string;
  baoyanRate: number; // 保研率百分比
}

// 专业
export interface Major {
  name: string;
  type: MajorType;
  description: string;
  bonus: string;
}

// 背景
export interface Background {
  name: string;
  description: string;
  stats: PlayerStats;
  masteryEfficiency: number;
  money?: number;
}