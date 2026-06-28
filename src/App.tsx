import React, { useState, useEffect, useRef } from 'react';
import { 
  Book, 
  Brain, 
  Coffee, 
  Cpu, 
  GraduationCap, 
  Heart, 
  History, 
  Lightbulb, 
  Award, 
  Zap,
  TrendingUp,
  AlertCircle,
  Users,
  ChevronRight,
  Trophy,
  BarChart3,
  Target,
  DollarSign,
  Briefcase
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utility ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
interface PlayerStats {
  gpa: number;         // 绩点 (0-4.5)
  research: number;    // 科研/项目 (0-100)
  competition: number; // 竞赛 (0-100)
  english: number;     // 英语 (0-100)
  mental: number;      // 心态 (0-100)
  stamina: number;     // 体力 (0-100)
}

type GamePhase = 'start' | 'gaokao' | 'university_selection' | 'university_failed' | 'course_selection' | 'main_game' | 'exam' | 'summer_camp' | 'pre_recommendation' | 'game_over';
type MajorType = 'cs' | 'biology' | 'humanities' | 'general' | 'ee' | 'medicine' | 'law' | 'art';

interface GameEvent {
  title: string;
  description: string;
  options: {
    text: string;
    effect: (stats: PlayerStats) => { newStats: PlayerStats; log: string; moneyChange?: number };
  }[];
  majorRestriction?: MajorType[];
}

interface Course {
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

interface ExamResult {
  courseName: string;
  score: number;
  grade: string;
  credit: number;
}

interface ExamReport {
  results: ExamResult[];
  prevGpa: number;
  newGpa: number;
  semesterName: string;
}

type MentorStatus = 'none' | 'contacting' | 'fish_pond' | 'verbal_offer' | 'hard_offer' | 'rejected';

interface Mentor {
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

interface Application {
  university: string;
  major: string;
  status: 'pending' | 'interviewing' | 'accepted' | 'rejected' | 'waitlist';
  phase: 'summer_camp' | 'pre_recommendation';
}

interface InterviewQuestion {
  id: string;
  text: string;
  options: {
    text: string;
    score: number;
    feedback: string;
  }[];
}

interface CurrentInterview {
  university: string;
  major: string;
  phase: 'summer_camp' | 'pre_recommendation';
  questions: InterviewQuestion[];
  currentQuestionIndex: number;
  totalScore: number;
  backgroundScore: number;
}

type ResumeQuality = 'common' | 'rare' | 'epic' | 'legendary';

interface ResumeItem {
  id: string;
  type: 'research' | 'competition';
  name: string;
  score: number;
  quality: ResumeQuality;
}

interface GameState {
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

interface Action {
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

// --- Constants ---
const SEMESTER_NAMES = ["大一上", "大一下", "大二上", "大二下", "大三上", "大三下", "大四上", "大四下"];

interface University {
  name: string;
  minScore: number;
  tier: string;
  tags: string[];
  description: string;
  baoyanRate: number; // 保研率百分比
}

const UNIVERSITIES: University[] = [
  // T0 - 顶尖学府
  { name: "清华大学", minScore: 695, tier: "T0", tags: ["C9", "顶尖"], baoyanRate: 58, description: "国内最高学府，保研率极高，但竞争也是地狱级。" },
  { name: "北京大学", minScore: 693, tier: "T0", tags: ["C9", "顶尖"], baoyanRate: 55, description: "人文与理学巅峰，氛围自由但学术要求极高。" },

  // T1 - 华五/C9
  { name: "复旦大学", minScore: 683, tier: "T1", tags: ["C9", "华五"], baoyanRate: 33, description: "文理医并重，保研名额充足，出国氛围浓厚。" },
  { name: "上海交通大学", minScore: 685, tier: "T1", tags: ["C9", "华五"], baoyanRate: 35, description: "工科强校，科研资源丰富，保研去向极佳。" },
  { name: "浙江大学", minScore: 680, tier: "T1", tags: ["C9", "华五"], baoyanRate: 30, description: "规模宏大，学科齐全，校友资源极其广泛。" },
  { name: "南京大学", minScore: 678, tier: "T1", tags: ["C9", "华五"], baoyanRate: 28, description: "低调务实，基础学科极强，学术风气纯正。" },
  { name: "中国科学技术大学", minScore: 682, tier: "T1", tags: ["C9", "华五"], baoyanRate: 45, description: "科研神校，全员科研氛围，保研率极高。" },
  { name: "哈尔滨工业大学", minScore: 670, tier: "T1", tags: ["C9", "国防"], baoyanRate: 27, description: "规格严格，功夫到家，航天强校，保研率稳健。" },
  { name: "西安交通大学", minScore: 665, tier: "T1", tags: ["C9", "西北"], baoyanRate: 25, description: "西北工科之光，作风硬朗，保研政策稳定。" },

  // T2 - 强势985
  { name: "同济大学", minScore: 675, tier: "T2", tags: ["985", "建筑"], baoyanRate: 28, description: "建筑与土木的殿堂，对德语区交流机会极多。" },
  { name: "北京航空航天大学", minScore: 672, tier: "T2", tags: ["985", "国防"], baoyanRate: 26, description: "航空航天领军，计算机实力极强。" },
  { name: "北京理工大学", minScore: 668, tier: "T2", tags: ["985", "国防"], baoyanRate: 24, description: "国防七子，工科实力雄厚。" },
  { name: "南开大学", minScore: 662, tier: "T2", tags: ["985", "综合"], baoyanRate: 22, description: "允公允能，日新月异。基础学科底蕴深厚。" },
  { name: "天津大学", minScore: 660, tier: "T2", tags: ["985", "工科"], baoyanRate: 21, description: "实事求是，工科实力雄厚，作风稳健。" },
  { name: "武汉大学", minScore: 665, tier: "T2", tags: ["985", "名校"], baoyanRate: 23, description: "樱花大道下的学术殿堂，综合实力极其稳健。" },
  { name: "华中科技大学", minScore: 663, tier: "T2", tags: ["985", "名校"], baoyanRate: 22, description: "森林大学，工科实力位居国内前列。" },
  { name: "东南大学", minScore: 662, tier: "T2", tags: ["985", "建筑"], baoyanRate: 23, description: "止于至善。建筑、土木、交通、通信均为国内顶尖。" },
  { name: "中山大学", minScore: 658, tier: "T2", tags: ["985", "强省"], baoyanRate: 22, description: "华南第一学府，医科 and 理科非常强劲。" },
  { name: "四川大学", minScore: 652, tier: "T2", tags: ["985", "综合"], baoyanRate: 20, description: "海纳百川，有容乃大。医学 and 文科极具优势。" },
  { name: "华南理工大学", minScore: 650, tier: "T2", tags: ["985", "大湾区"], baoyanRate: 19, description: "大湾区工科领头羊，就业极佳。" },
  { name: "山东大学", minScore: 648, tier: "T2", tags: ["985", "综合"], baoyanRate: 18, description: "历史悠久，医学与文史哲见长。" },
  { name: "厦门大学", minScore: 655, tier: "T2", tags: ["985", "最美"], baoyanRate: 20, description: "南方之强，经管与化学顶尖。" },
  { name: "吉林大学", minScore: 635, tier: "T2", tags: ["985", "巨无霸"], baoyanRate: 17, description: "规模极大，学科极其齐全。" },
  { name: "中南大学", minScore: 645, tier: "T2", tags: ["985", "矿冶"], baoyanRate: 20, description: "有色金属之都，医学同样强劲。" },
  { name: "湖南大学", minScore: 642, tier: "T2", tags: ["985", "千年学府"], baoyanRate: 18, description: "千年学府，土木与金融底蕴深厚。" },
  { name: "电子科技大学", minScore: 660, tier: "T2", tags: ["985", "成电"], baoyanRate: 21, description: "电子信息领域的排头兵。" },
  { name: "重庆大学", minScore: 638, tier: "T2", tags: ["985", "西南"], baoyanRate: 16, description: "山城之光，建筑与电气实力雄厚。" },
  { name: "西北工业大学", minScore: 655, tier: "T2", tags: ["985", "国防"], baoyanRate: 22, description: "三航特色鲜明，国防科技顶尖。" },
  { name: "大连理工大学", minScore: 645, tier: "T2", tags: ["985", "化工"], baoyanRate: 18, description: "东北工科重镇，化工与机械极强。" },
  { name: "华东师范大学", minScore: 668, tier: "T2", tags: ["985", "教育"], baoyanRate: 25, description: "教育与文理并重，保研去向多为名牌中学或名校深造。" },
  { name: "中国农业大学", minScore: 630, tier: "T2", tags: ["985", "农业"], baoyanRate: 24, description: "农学界的最高学府。" },
  { name: "兰州大学", minScore: 615, tier: "T2", tags: ["985", "西北"], baoyanRate: 18, description: "独树一帜，基础学科实力惊人。" },
  { name: "东北大学", minScore: 625, tier: "T2", tags: ["985", "冶金"], baoyanRate: 16, description: "白山黑水，自强不息，控制与冶金领先。" },

  // T3 - 强势211 / 特色名校
  { name: "中国人民大学", minScore: 680, tier: "T3", tags: ["985", "人文"], baoyanRate: 30, description: "人文社科顶尖，保研去向极佳。" },
  { name: "北京师范大学", minScore: 675, tier: "T3", tags: ["985", "教育"], baoyanRate: 28, description: "师范教育领军，心理学全国第一。" },
  { name: "中央财经大学", minScore: 665, tier: "T3", tags: ["211", "财经"], baoyanRate: 18, description: "金融街的入场券，保研去向多为顶级金融机构。" },
  { name: "上海财经大学", minScore: 668, tier: "T3", tags: ["211", "财经"], baoyanRate: 19, description: "魔都财经巅峰，保研竞争异常激烈。" },
  { name: "对外经济贸易大学", minScore: 662, tier: "T3", tags: ["211", "财经"], baoyanRate: 17, description: "外向型名校，经贸与小语种强势。" },
  { name: "中国政法大学", minScore: 660, tier: "T3", tags: ["211", "法学"], baoyanRate: 18, description: "法学界的最高殿堂，法学专业保研率可观。" },
  { name: "北京邮电大学", minScore: 658, tier: "T3", tags: ["211", "行业强校"], baoyanRate: 20, description: "信息黄埔，互联网行业的保研敲门砖。" },
  { name: "北京交通大学", minScore: 635, tier: "T3", tags: ["211", "交通"], baoyanRate: 16, description: "轨道交通领域领军。" },
  { name: "北京科技大学", minScore: 638, tier: "T3", tags: ["211", "冶金"], baoyanRate: 17, description: "钢铁摇篮，材料科学顶尖。" },
  { name: "南京航空航天大学", minScore: 645, tier: "T3", tags: ["211", "国防"], baoyanRate: 18, description: "三航名校，直升机技术国内唯一。" },
  { name: "南京理工大学", minScore: 642, tier: "T3", tags: ["211", "国防"], baoyanRate: 17, description: "兵器科学之冠。" },
  { name: "河海大学", minScore: 625, tier: "T3", tags: ["211", "水利"], baoyanRate: 15, description: "水利工程世界顶尖。" },
  { name: "苏州大学", minScore: 640, tier: "T3", tags: ["211", "最强地级市"], baoyanRate: 14, description: "江苏省属211领头羊，科研产出惊人。" },
  { name: "上海大学", minScore: 632, tier: "T3", tags: ["211", "综合"], baoyanRate: 12, description: "魔都亲儿子，资源极其丰富。" },
  { name: "暨南大学", minScore: 625, tier: "T3", tags: ["211", "华侨"], baoyanRate: 13, description: "华侨最高学府，国际化程度高，经管类专业热门。" },
  { name: "西南财经大学", minScore: 630, tier: "T3", tags: ["211", "财经"], baoyanRate: 15, description: "财经名校，保研竞争主要集中在金融 and 会计。" },
  { name: "中南财经政法大学", minScore: 635, tier: "T3", tags: ["211", "财经"], baoyanRate: 16, description: "经法双强，保研去向稳健。" },
  { name: "华中师范大学", minScore: 630, tier: "T3", tags: ["211", "教育"], baoyanRate: 15, description: "中部教育重镇。" },
  { name: "南京师范大学", minScore: 632, tier: "T3", tags: ["211", "教育"], baoyanRate: 14, description: "江南名校，人文社科极强。" },
  { name: "西南大学", minScore: 615, tier: "T3", tags: ["211", "综合"], baoyanRate: 13, description: "规模巨大，教育与农学见长。" },
  { name: "西北大学", minScore: 610, tier: "T3", tags: ["211", "古都"], baoyanRate: 12, description: "关中名校，考古与地质顶尖。" },
  { name: "中国海洋大学", minScore: 620, tier: "T3", tags: ["985", "海洋"], baoyanRate: 18, description: "海洋科学的最高学府。" },
  { name: "哈尔滨工程大学", minScore: 630, tier: "T3", tags: ["211", "国防"], baoyanRate: 16, description: "三海一核特色鲜明。" },
  { name: "武汉理工大学", minScore: 625, tier: "T3", tags: ["211", "工科"], baoyanRate: 14, description: "材料、交通、汽车三大支柱。" },
  { name: "合肥工业大学", minScore: 615, tier: "T3", tags: ["211", "工科"], baoyanRate: 13, description: "汽车行业的黄埔军校。" },
  { name: "华北电力大学", minScore: 635, tier: "T3", tags: ["211", "电力"], baoyanRate: 15, description: "电力系统的国家队。" },
  { name: "中国地质大学（北京）", minScore: 610, tier: "T3", tags: ["211", "地质"], baoyanRate: 14, description: "地质科学的领军者。" },
  { name: "中国地质大学（武汉）", minScore: 608, tier: "T3", tags: ["211", "地质"], baoyanRate: 14, description: "地球科学领域世界闻名。" },
  { name: "中国石油大学（北京）", minScore: 612, tier: "T3", tags: ["211", "石油"], baoyanRate: 15, description: "石油工业的摇篮。" },
  { name: "中国石油大学（华东）", minScore: 605, tier: "T3", tags: ["211", "石油"], baoyanRate: 14, description: "能源领域的骨干院校。" },
  { name: "中国矿业大学", minScore: 600, tier: "T3", tags: ["211", "矿业"], baoyanRate: 13, description: "煤炭工业的领头羊。" },
  { name: "长安大学", minScore: 605, tier: "T3", tags: ["211", "交通"], baoyanRate: 12, description: "公路交通领域的黄埔军校。" },
  { name: "江南大学", minScore: 618, tier: "T3", tags: ["211", "轻工"], baoyanRate: 14, description: "食品科学全国第一。" },
  { name: "东华大学", minScore: 622, tier: "T3", tags: ["211", "纺织"], baoyanRate: 14, description: "纺织服装领域的最高学府。" },
  { name: "陕西师范大学", minScore: 612, tier: "T3", tags: ["211", "教育"], baoyanRate: 13, description: "西北教育之光。" },
  { name: "湖南师范大学", minScore: 608, tier: "T3", tags: ["211", "教育"], baoyanRate: 12, description: "潇湘名校，文理并重。" },
  { name: "福州大学", minScore: 615, tier: "T3", tags: ["211", "工科"], baoyanRate: 12, description: "福建省属工科领头羊。" },
  { name: "郑州大学", minScore: 610, tier: "T3", tags: ["211", "巨无霸"], baoyanRate: 10, description: "中原大地第一学府。" },
  { name: "南昌大学", minScore: 605, tier: "T3", tags: ["211", "综合"], baoyanRate: 10, description: "江西高等教育的旗帜。" },

  // T4 - 区域中心高校 / 强势地方院校
  { name: "深圳大学", minScore: 620, tier: "T4", tags: ["特区", "双非"], baoyanRate: 8, description: "特区大学，资源极其丰富，虽然保研率不高但机会多。" },
  { name: "南方科技大学", minScore: 650, tier: "T4", tags: ["特区", "创新"], baoyanRate: 25, description: "新型研究型大学，科研资源极佳。" },
  { name: "上海科技大学", minScore: 645, tier: "T4", tags: ["魔都", "精英"], baoyanRate: 30, description: "小而精的研究型大学。" },
  { name: "安徽大学", minScore: 595, tier: "T4", tags: ["211", "综合"], baoyanRate: 11, description: "江淮名校，学科齐全。" },
  { name: "云南大学", minScore: 590, tier: "T4", tags: ["211", "边疆"], baoyanRate: 12, description: "边疆民族地区的学术重镇。" },
  { name: "广西大学", minScore: 580, tier: "T4", tags: ["211", "综合"], baoyanRate: 10, description: "八桂大地最高学府。" },
  { name: "贵州大学", minScore: 575, tier: "T4", tags: ["211", "综合"], baoyanRate: 9, description: "黔中名校。" },
  { name: "海南大学", minScore: 578, tier: "T4", tags: ["211", "热带"], baoyanRate: 9, description: "自由贸易港建设的主力军。" },
  { name: "内蒙古大学", minScore: 570, tier: "T4", tags: ["211", "民族"], baoyanRate: 10, description: "塞外名校。" },
  { name: "辽宁大学", minScore: 585, tier: "T4", tags: ["211", "经管"], baoyanRate: 10, description: "辽沈名校，经管法见长。" },
  { name: "延边大学", minScore: 560, tier: "T4", tags: ["211", "特色"], baoyanRate: 9, description: "长白山下的多元文化殿堂。" },
  { name: "石河子大学", minScore: 550, tier: "T4", tags: ["211", "兵团"], baoyanRate: 10, description: "屯垦戍边，奉献西部。" },
  { name: "宁夏大学", minScore: 555, tier: "T4", tags: ["211", "综合"], baoyanRate: 9, description: "塞上名校。" },
  { name: "青海大学", minScore: 545, tier: "T4", tags: ["211", "高原"], baoyanRate: 9, description: "高原医学与盐湖化工领先。" },
  { name: "西藏大学", minScore: 530, tier: "T4", tags: ["211", "世界屋脊"], baoyanRate: 10, description: "雪域高原最高学府。" },
  { name: "新疆大学", minScore: 565, tier: "T4", tags: ["211", "边疆"], baoyanRate: 10, description: "丝绸之路经济带的核心学府。" },
  { name: "宁波大学", minScore: 600, tier: "T4", tags: ["双一流", "浙东"], baoyanRate: 8, description: "侨资创办，发展迅猛。" },
  { name: "河南大学", minScore: 590, tier: "T4", tags: ["双一流", "古都"], baoyanRate: 9, description: "百年名校，底蕴深厚。" },
  { name: "湘潭大学", minScore: 585, tier: "T4", tags: ["双一流", "数学"], baoyanRate: 10, description: "伟人故里，数学学科极强。" },
  { name: "扬州大学", minScore: 582, tier: "T4", tags: ["综合", "强势双非"], baoyanRate: 7, description: "江苏老牌名校，学科极其齐全。" },
  { name: "江苏大学", minScore: 588, tier: "T4", tags: ["工科", "强势双非"], baoyanRate: 8, description: "农机特色鲜明，工科实力雄厚。" },
  { name: "浙江工业大学", minScore: 610, tier: "T4", tags: ["工科", "强势双非"], baoyanRate: 8, description: "浙江省属工科第一。" },
  { name: "杭州电子科技大学", minScore: 615, tier: "T4", tags: ["IT", "强势双非"], baoyanRate: 7, description: "IT名校，华为等大厂青睐。" },
  { name: "南京邮电大学", minScore: 612, tier: "T4", tags: ["双一流", "通信"], baoyanRate: 9, description: "通信行业名校。" },
  { name: "南京信息工程大学", minScore: 605, tier: "T4", tags: ["双一流", "气象"], baoyanRate: 9, description: "大气科学世界顶尖。" },
  { name: "浙江理工大学", minScore: 585, tier: "T4", tags: ["特色", "杭州"], baoyanRate: 6, description: "丝绸文化特色，设计与工科见长。" },
  { name: "福建师范大学", minScore: 575, tier: "T4", tags: ["师范", "老牌"], baoyanRate: 7, description: "百年师范，文史见长。" },
  { name: "山东师范大学", minScore: 578, tier: "T4", tags: ["师范", "老牌"], baoyanRate: 8, description: "齐鲁名校，底蕴深厚。" },
  { name: "华侨大学", minScore: 572, tier: "T4", tags: ["华侨", "特色"], baoyanRate: 6, description: "面向海外，多元文化。" },
  { name: "江西师范大学", minScore: 568, tier: "T4", tags: ["师范", "老牌"], baoyanRate: 7, description: "赣鄱名校。" },
  { name: "河南师范大学", minScore: 565, tier: "T4", tags: ["师范", "老牌"], baoyanRate: 7, description: "中原教育骨干。" },
  { name: "河北大学", minScore: 570, tier: "T4", tags: ["综合", "老牌"], baoyanRate: 7, description: "燕赵名校，底蕴尚存。" },
  { name: "山西大学", minScore: 585, tier: "T4", tags: ["双一流", "老牌"], baoyanRate: 10, description: "百年名校，重现辉煌。" },
  { name: "西北师范大学", minScore: 555, tier: "T4", tags: ["师范", "西北"], baoyanRate: 8, description: "西迁精神传承者。" },
  { name: "哈尔滨师范大学", minScore: 550, tier: "T4", tags: ["师范", "东北"], baoyanRate: 7, description: "龙江教育摇篮。" },
  { name: "四川师范大学", minScore: 562, tier: "T4", tags: ["师范", "西南"], baoyanRate: 7, description: "蜀中名校。" },
  { name: "辽宁师范大学", minScore: 558, tier: "T4", tags: ["师范", "东北"], baoyanRate: 7, description: "大连名校。" },
  { name: "广西师范大学", minScore: 545, tier: "T4", tags: ["师范", "边疆"], baoyanRate: 7, description: "桂林名校。" },
  { name: "贵州师范大学", minScore: 540, tier: "T4", tags: ["师范", "特色"], baoyanRate: 6, description: "黔中教育重镇。" },

  // T5 - 地方骨干高校 / 行业特色院校
  { name: "广东工业大学", minScore: 580, tier: "T5", tags: ["大湾区", "工科"], baoyanRate: 5, description: "大湾区工科强校，就业极其出色。" },
  { name: "重庆邮电大学", minScore: 585, tier: "T5", tags: ["通信", "IT"], baoyanRate: 5, description: "邮电名校，计算机实力强劲。" },
  { name: "西安邮电大学", minScore: 575, tier: "T5", tags: ["通信", "IT"], baoyanRate: 4, description: "西北IT人才培养基地。" },
  { name: "青岛大学", minScore: 578, tier: "T5", tags: ["综合", "青岛"], baoyanRate: 5, description: "城市名片，医学与纺织见长。" },
  { name: "济南大学", minScore: 565, tier: "T5", tags: ["综合", "山东"], baoyanRate: 4, description: "山东省属名校。" },
  { name: "燕山大学", minScore: 582, tier: "T5", tags: ["工科", "重机"], baoyanRate: 6, description: "重型机械行业翘楚。" },
  { name: "黑龙江大学", minScore: 550, tier: "T5", tags: ["综合", "俄语"], baoyanRate: 6, description: "俄语全国第一。" },
  { name: "湖北大学", minScore: 560, tier: "T5", tags: ["综合", "武汉"], baoyanRate: 5, description: "武汉省属第一。" },
  { name: "湖南科技大学", minScore: 545, tier: "T5", tags: ["工科", "特色"], baoyanRate: 4, description: "矿业与机械特色。" },
  { name: "江西理工大学", minScore: 535, tier: "T5", tags: ["工科", "有色"], baoyanRate: 4, description: "有色冶金人才摇篮。" },
  { name: "桂林电子科技大学", minScore: 568, tier: "T5", tags: ["IT", "特色"], baoyanRate: 4, description: "华南IT人才基地。" },
  { name: "昆明理工大学", minScore: 562, tier: "T5", tags: ["工科", "特色"], baoyanRate: 5, description: "云南工科领头羊。" },
  { name: "西安理工大学", minScore: 570, tier: "T5", tags: ["工科", "特色"], baoyanRate: 5, description: "西北工科劲旅。" },
  { name: "西安建筑科技大学", minScore: 565, tier: "T5", tags: ["建筑", "老八校"], baoyanRate: 6, description: "建筑老八校之一。" },
  { name: "山东科技大学", minScore: 555, tier: "T5", tags: ["工科", "矿业"], baoyanRate: 4, description: "矿业特色名校。" },
  { name: "安徽工业大学", minScore: 540, tier: "T5", tags: ["工科", "冶金"], baoyanRate: 4, description: "冶金特色名校。" },
  { name: "安徽理工大学", minScore: 530, tier: "T5", tags: ["工科", "矿业"], baoyanRate: 4, description: "煤炭工业骨干。" },
  { name: "华东交通大学", minScore: 545, tier: "T5", tags: ["交通", "特色"], baoyanRate: 4, description: "轨道交通特色。" },
  { name: "华南农业大学", minScore: 575, tier: "T5", tags: ["双一流", "农业"], baoyanRate: 8, description: "大湾区农林名校。" },
  { name: "东北林业大学", minScore: 565, tier: "T5", tags: ["211", "林业"], baoyanRate: 10, description: "林业特色名校。" },
  { name: "南京林业大学", minScore: 570, tier: "T5", tags: ["双一流", "林业"], baoyanRate: 7, description: "林业与木工强校。" },
  { name: "西南林业大学", minScore: 510, tier: "T5", tags: ["林业", "西南"], baoyanRate: 3, description: "西南地区林业人才培养重要基地，林业特色鲜明。" },
  { name: "北京林业大学", minScore: 615, tier: "T5", tags: ["211", "园林"], baoyanRate: 15, description: "园林建筑全国第一。" },
  { name: "福建农林大学", minScore: 555, tier: "T5", tags: ["农业", "特色"], baoyanRate: 5, description: "海峡两岸农林合作名校。" },
  { name: "山东农业大学", minScore: 545, tier: "T5", tags: ["农业", "老牌"], baoyanRate: 6, description: "底蕴深厚的农林名校。" },
];

const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
  {
    id: 'intro',
    text: '请做一个简短的自我介绍。',
    options: [
      { text: '（从容大方）介绍自己的学业成绩、科研经历及对贵校的向往。', score: 20, feedback: '面试官微微点头，对你的综合素质留下了良好印象。' },
      { text: '（略显紧张）重点强调自己的GPA和排名。', score: 15, feedback: '面试官认为你是一个扎实的学生，但缺乏一些亮点。' },
      { text: '（过于冗长）事无巨细地讲述自己的成长经历。', score: 10, feedback: '面试官看了一下表，示意你抓重点。' }
    ]
  },
  {
    id: 'research',
    text: '谈谈你在本科期间参与最深入的一个科研项目，你承担了什么角色？',
    options: [
      { text: '详细描述技术路线、解决的问题及自己的贡献，展现独立思考能力。', score: 25, feedback: '面试官对你的科研潜力表示认可。' },
      { text: '简要介绍项目，强调获奖情况。', score: 18, feedback: '面试官更希望听到你的具体工作细节。' },
      { text: '承认自己只是参与，对具体核心细节了解不深。', score: 8, feedback: '面试官皱了皱眉，对你的参与度表示怀疑。' }
    ]
  },
  {
    id: 'professional',
    text: '如果你被录取，你打算如何规划你的研究生生涯？',
    options: [
      { text: '提出明确的研究方向，并表达了对某位导师课题组的强烈兴趣。', score: 20, feedback: '面试官认为你目标明确，匹配度高。' },
      { text: '表示会努力学习，按时毕业。', score: 12, feedback: '回答比较中规中矩，缺乏吸引力。' },
      { text: '还没想好，走一步看一步。', score: 5, feedback: '面试官对你的学术热情产生怀疑。' }
    ]
  },
  {
    id: 'challenge',
    text: '如果你在研究中遇到长期无法解决的困难，你会怎么办？',
    options: [
      { text: '分析原因，查阅文献，并积极与导师、学长讨论寻求突破。', score: 20, feedback: '展现了良好的抗压能力和解决问题的素质。' },
      { text: '自己死磕，相信勤能补拙。', score: 15, feedback: '精神可嘉，但可能效率不高。' },
      { text: '可能会考虑换个简单的课题。', score: 5, feedback: '学术韧性似乎有待加强。' }
    ]
  },
  {
    id: 'why_us',
    text: '你同时申请了多所学校，如果都录取的你，你会怎么选？',
    options: [
      { text: '表达对该校独特学术氛围和学科优势的极高认可，将其列为首选。', score: 15, feedback: '面试官感受到了你的诚意。' },
      { text: '如实告知还在权衡中。', score: 10, feedback: '诚实但可能让对方觉得你不够坚定。' },
      { text: '支支吾吾，没有明确态度。', score: 5, feedback: '面试官对你的意向度表示担忧。' }
    ]
  }
];

const ALL_COURSES: Course[] = [
  // --- 通识课 (各专业各学期通用) ---
  { id: 'gen1-1', name: '高等数学(上)', difficulty: 5, credit: 5, type: 'general', semester: 1, mastery: 0, description: '理工科的基础，微积分的入门。' },
  { id: 'gen1-2', name: '大学物理(上)', difficulty: 4, credit: 4, type: 'general', semester: 1, mastery: 0, description: '力学与热学基础。' },
  { id: 'gen1-3', name: '英语听说(一)', difficulty: 2, credit: 2, type: 'general', semester: 1, mastery: 0, description: '提升基础英语交流能力。' },
  
  { id: 'gen2-1', name: '高等数学(下)', difficulty: 5, credit: 5, type: 'general', semester: 2, mastery: 0, description: '多元微积分与无穷级数。' },
  { id: 'gen2-2', name: '大学物理(下)', difficulty: 4, credit: 4, type: 'general', semester: 2, mastery: 0, description: '电磁学与光学。' },
  { id: 'gen2-3', name: '线性代数', difficulty: 3, credit: 3, type: 'general', semester: 2, mastery: 0, description: '矩阵论与向量空间。' },

  { id: 'gen3-1', name: '概率论与数理统计', difficulty: 4, credit: 3, type: 'general', semester: 3, mastery: 0, description: '掌握随机性的规律。' },
  { id: 'gen3-2', name: '思政课(中特)', difficulty: 2, credit: 3, type: 'general', semester: 3, mastery: 0, description: '当代中国政治理论。' },
  { id: 'gen3-3', name: '英语听说(二)', difficulty: 3, credit: 2, type: 'general', semester: 3, mastery: 0, description: '进阶英语交流。' },
  
  { id: 'gen4-1', name: '学术英语写作', difficulty: 3, credit: 2, type: 'general', semester: 4, mastery: 0, description: '为发表论文打下基础。' },
  { id: 'gen4-2', name: '体育(三)', difficulty: 2, credit: 1, type: 'general', semester: 4, mastery: 0, description: '保持强健体魄。' },
  { id: 'gen4-3', name: '马克思主义基本原理', difficulty: 3, credit: 3, type: 'general', semester: 4, mastery: 0, description: '哲学思考的基石。' },

  { id: 'gen5-1', name: '毛概(上)', difficulty: 2, credit: 3, type: 'general', semester: 5, mastery: 0, description: '中国化马克思主义。' },
  { id: 'gen5-2', name: '创新创业导论', difficulty: 2, credit: 2, type: 'general', semester: 5, mastery: 0, description: '培养互联网思维与创业能力。' },

  { id: 'gen6-1', name: '毛概(下)', difficulty: 2, credit: 3, type: 'general', semester: 6, mastery: 0, description: '新时代中国特色社会主义思想。' },
  { id: 'gen6-2', name: '职业生涯规划', difficulty: 1, credit: 1, type: 'general', semester: 6, mastery: 0, description: '为毕业去向做最后准备。' },

  // --- 计算机专业 (CS) ---
  { id: 'cs1-1', name: '程序设计基础', difficulty: 3, credit: 4, type: 'compulsory', semester: 1, majorRestriction: ['cs'], mastery: 0, description: '编程世界的起点。' },
  { id: 'cs1-2', name: '离散数学', difficulty: 4, credit: 4, type: 'compulsory', semester: 1, majorRestriction: ['cs'], mastery: 0, description: '计算机科学的数学基石。' },
  { id: 'cs1-e1', name: '计算机导论', difficulty: 1, credit: 2, type: 'elective', semester: 1, majorRestriction: ['cs'], mastery: 0, description: '全景了解计算机科学。' },

  { id: 'cs2-1', name: '数据结构', difficulty: 4, credit: 4, type: 'compulsory', semester: 2, majorRestriction: ['cs'], mastery: 0, description: '算法的基石。' },
  { id: 'cs2-2', name: '面向对象程序设计', difficulty: 3, credit: 3, type: 'compulsory', semester: 2, majorRestriction: ['cs'], mastery: 0, description: '掌握C++/Java核心。' },
  { id: 'cs2-e1', name: 'Linux环境编程', difficulty: 3, credit: 2, type: 'elective', semester: 2, majorRestriction: ['cs'], mastery: 0, description: '玩转终端与系统调用。' },

  { id: 'cs3-1', name: '计算机组成原理', difficulty: 5, credit: 4, type: 'compulsory', semester: 3, majorRestriction: ['cs'], mastery: 0, description: '拆解计算机内部构造。' },
  { id: 'cs3-2', name: '算法分析与设计', difficulty: 5, credit: 4, type: 'compulsory', semester: 3, majorRestriction: ['cs'], mastery: 0, description: '挑战思维极限。' },
  { id: 'cs3-e1', name: '前端开发基础', difficulty: 2, credit: 2, type: 'elective', semester: 3, majorRestriction: ['cs'], mastery: 0, description: '构建美观的Web界面。' },

  { id: 'cs4-1', name: '操作系统', difficulty: 5, credit: 4, type: 'compulsory', semester: 4, majorRestriction: ['cs'], mastery: 0, description: '理解底层逻辑与资源管理。' },
  { id: 'cs4-2', name: '数据库系统', difficulty: 3, credit: 3, type: 'compulsory', semester: 4, majorRestriction: ['cs'], mastery: 0, description: '数据存储的艺术。' },
  { id: 'cs4-e1', name: '机器学习导论', difficulty: 4, credit: 3, type: 'elective', semester: 4, majorRestriction: ['cs'], mastery: 0, description: '让机器学会思考。' },

  { id: 'cs5-1', name: '计算机网络', difficulty: 3, credit: 3, type: 'compulsory', semester: 5, majorRestriction: ['cs'], mastery: 0, description: '连接世界的协议。' },
  { id: 'cs5-2', name: '编译原理', difficulty: 5, credit: 4, type: 'compulsory', semester: 5, majorRestriction: ['cs'], mastery: 0, description: '从代码到机器码。' },
  { id: 'cs5-e1', name: '深度学习', difficulty: 5, credit: 3, type: 'elective', semester: 5, majorRestriction: ['cs'], mastery: 0, description: '神经网络与AI前沿。' },

  { id: 'cs6-1', name: '软件工程', difficulty: 3, credit: 3, type: 'compulsory', semester: 6, majorRestriction: ['cs'], mastery: 0, description: '工程化开发与团队协作。' },
  { id: 'cs6-e1', name: '自然语言处理', difficulty: 5, credit: 3, type: 'elective', semester: 6, majorRestriction: ['cs'], mastery: 0, description: '探索语言模型的奥秘。' },
  { id: 'cs6-e2', name: '区块链技术', difficulty: 4, credit: 2, type: 'elective', semester: 6, majorRestriction: ['cs'], mastery: 0, description: '去中心化系统设计。' },

  // --- 生物专业 (Biology) ---
  { id: 'bio1-1', name: '普通生物学', difficulty: 3, credit: 4, type: 'compulsory', semester: 1, majorRestriction: ['biology'], mastery: 0, description: '生命科学的初探。' },
  { id: 'bio1-2', name: '基础化学', difficulty: 4, credit: 4, type: 'compulsory', semester: 1, majorRestriction: ['biology'], mastery: 0, description: '生物学的化学基础。' },
  { id: 'bio1-e1', name: '野外实习导论', difficulty: 1, credit: 2, type: 'elective', semester: 1, majorRestriction: ['biology'], mastery: 0, description: '走进自然的实验室。' },

  { id: 'bio2-1', name: '生物化学(一)', difficulty: 5, credit: 4, type: 'compulsory', semester: 2, majorRestriction: ['biology'], mastery: 0, description: '分子层面的生命逻辑。' },
  { id: 'bio2-2', name: '有机化学', difficulty: 4, credit: 4, type: 'compulsory', semester: 2, majorRestriction: ['biology'], mastery: 0, description: '碳基生命的奥秘。' },
  { id: 'bio2-e1', name: '生物摄影', difficulty: 1, credit: 2, type: 'elective', semester: 2, majorRestriction: ['biology'], mastery: 0, description: '记录生命之美。' },

  { id: 'bio3-1', name: '细胞生物学', difficulty: 4, credit: 4, type: 'compulsory', semester: 3, majorRestriction: ['biology'], mastery: 0, description: '探秘生命的基本单位。' },
  { id: 'bio3-2', name: '遗传学', difficulty: 5, credit: 4, type: 'compulsory', semester: 3, majorRestriction: ['biology'], mastery: 0, description: '破译生命的遗传密码。' },
  { id: 'bio3-e1', name: '生物统计学', difficulty: 3, credit: 2, type: 'elective', semester: 3, majorRestriction: ['biology'], mastery: 0, description: '实验数据的科学分析。' },

  { id: 'bio4-1', name: '分子生物学', difficulty: 5, credit: 4, type: 'compulsory', semester: 4, majorRestriction: ['biology'], mastery: 0, description: '从DNA到蛋白质。' },
  { id: 'bio4-2', name: '微生物学', difficulty: 3, credit: 3, type: 'compulsory', semester: 4, majorRestriction: ['biology'], mastery: 0, description: '微观世界的生命力。' },
  { id: 'bio4-e1', name: '生物信息学导论', difficulty: 4, credit: 3, type: 'elective', semester: 4, majorRestriction: ['biology'], mastery: 0, description: '用算法解读基因。' },

  { id: 'bio5-1', name: '生理学', difficulty: 4, credit: 4, type: 'compulsory', semester: 5, majorRestriction: ['biology'], mastery: 0, description: '人体与生命的运作机制。' },
  { id: 'bio5-2', name: '发育生物学', difficulty: 4, credit: 3, type: 'compulsory', semester: 5, majorRestriction: ['biology'], mastery: 0, description: '从受精卵到完整个体。' },
  { id: 'bio5-e1', name: '基因组学', difficulty: 5, credit: 3, type: 'elective', semester: 5, majorRestriction: ['biology'], mastery: 0, description: '海量数据的生命奥秘。' },

  { id: 'bio6-1', name: '免疫学', difficulty: 5, credit: 3, type: 'compulsory', semester: 6, majorRestriction: ['biology'], mastery: 0, description: '生命的防御盾牌。' },
  { id: 'bio6-e1', name: '合成生物学', difficulty: 5, credit: 3, type: 'elective', semester: 6, majorRestriction: ['biology'], mastery: 0, description: '重新设计生命。' },

  // --- 汉语言文学 (Humanities) ---
  { id: 'hum1-1', name: '现代汉语', difficulty: 3, credit: 4, type: 'compulsory', semester: 1, majorRestriction: ['humanities'], mastery: 0, description: '语言文字的规范与运用。' },
  { id: 'hum1-2', name: '文学概论', difficulty: 4, credit: 3, type: 'compulsory', semester: 1, majorRestriction: ['humanities'], mastery: 0, description: '构建文学审美的理论框架。' },
  { id: 'hum1-e1', name: '中国古典名著导读', difficulty: 1, credit: 2, type: 'elective', semester: 1, majorRestriction: ['humanities'], mastery: 0, description: '重读经典，感悟智慧。' },

  { id: 'hum2-1', name: '古代汉语(一)', difficulty: 4, credit: 4, type: 'compulsory', semester: 2, majorRestriction: ['humanities'], mastery: 0, description: '破译古籍的必备工具。' },
  { id: 'hum2-2', name: '中国古代文学史(一)', difficulty: 3, credit: 4, type: 'compulsory', semester: 2, majorRestriction: ['humanities'], mastery: 0, description: '纵览先秦两汉魏晋文学。' },
  { id: 'hum2-e1', name: '创意写作', difficulty: 2, credit: 2, type: 'elective', semester: 2, majorRestriction: ['humanities'], mastery: 0, description: '激发文字的无限可能。' },

  { id: 'hum3-1', name: '中国古代文学史(二)', difficulty: 3, credit: 4, type: 'compulsory', semester: 3, majorRestriction: ['humanities'], mastery: 0, description: '唐宋文学的辉煌篇章。' },
  { id: 'hum3-2', name: '古代汉语(二)', difficulty: 4, credit: 4, type: 'compulsory', semester: 3, majorRestriction: ['humanities'], mastery: 0, description: '深度解析古籍文献。' },
  { id: 'hum3-e1', name: '民俗学导论', difficulty: 2, credit: 2, type: 'elective', semester: 3, majorRestriction: ['humanities'], mastery: 0, description: '探索民间文化精髓。' },

  { id: 'hum4-1', name: '中国现代文学史', difficulty: 3, credit: 4, type: 'compulsory', semester: 4, majorRestriction: ['humanities'], mastery: 0, description: '五四以来的文学变革。' },
  { id: 'hum4-2', name: '外国文学史(一)', difficulty: 4, credit: 3, type: 'compulsory', semester: 4, majorRestriction: ['humanities'], mastery: 0, description: '西方古典与中世纪文学。' },
  { id: 'hum4-e1', name: '美学原理', difficulty: 4, credit: 2, type: 'elective', semester: 4, majorRestriction: ['humanities'], mastery: 0, description: '美的本质与艺术哲学。' },

  { id: 'hum5-1', name: '中国当代文学史', difficulty: 2, credit: 4, type: 'compulsory', semester: 5, majorRestriction: ['humanities'], mastery: 0, description: '当代文学的发展脉络。' },
  { id: 'hum5-2', name: '外国文学史(二)', difficulty: 4, credit: 3, type: 'compulsory', semester: 5, majorRestriction: ['humanities'], mastery: 0, description: '文艺复兴至近现代西方文学。' },
  { id: 'hum5-e1', name: '文学批评方法论', difficulty: 5, credit: 2, type: 'elective', semester: 5, majorRestriction: ['humanities'], mastery: 0, description: '掌握解析文本的钥匙。' },

  { id: 'hum6-1', name: '语言学纲要', difficulty: 5, credit: 3, type: 'compulsory', semester: 6, majorRestriction: ['humanities'], mastery: 0, description: '语言的科学理论。' },
  { id: 'hum6-e1', name: '非虚构写作', difficulty: 3, credit: 2, type: 'elective', semester: 6, majorRestriction: ['humanities'], mastery: 0, description: '记录真实的力量。' },

  // --- 电子工程 (EE) ---
  { id: 'ee1-1', name: '电路原理', difficulty: 4, credit: 4, type: 'compulsory', semester: 1, majorRestriction: ['ee'], mastery: 0, description: '电流与电压的舞步。' },
  { id: 'ee1-e1', name: '电子系统导论', difficulty: 2, credit: 2, type: 'elective', semester: 1, majorRestriction: ['ee'], mastery: 0, description: '初探硬件世界。' },
  
  { id: 'ee2-1', name: '模拟电子技术', difficulty: 5, credit: 4, type: 'compulsory', semester: 2, majorRestriction: ['ee'], mastery: 0, description: '晶体管的放大艺术。' },
  { id: 'ee2-2', name: '信号与系统', difficulty: 4, credit: 4, type: 'compulsory', semester: 2, majorRestriction: ['ee'], mastery: 0, description: '频域与时域的交织。' },
  { id: 'ee2-e1', name: '嵌入式基础', difficulty: 3, credit: 2, type: 'elective', semester: 2, majorRestriction: ['ee'], mastery: 0, description: '从单片机开始。' },

  { id: 'ee3-1', name: '数字电子技术', difficulty: 4, credit: 4, type: 'compulsory', semester: 3, majorRestriction: ['ee'], mastery: 0, description: '逻辑门与时序电路。' },
  { id: 'ee3-2', name: '电磁场与电磁波', difficulty: 5, credit: 4, type: 'compulsory', semester: 3, majorRestriction: ['ee'], mastery: 0, description: '麦克斯韦方程组的魅力。' },
  { id: 'ee3-e1', name: 'Python科学计算', difficulty: 2, credit: 2, type: 'elective', semester: 3, majorRestriction: ['ee'], mastery: 0, description: '硬件工程师的编程利器。' },

  { id: 'ee4-1', name: '通信原理', difficulty: 5, credit: 4, type: 'compulsory', semester: 4, majorRestriction: ['ee'], mastery: 0, description: '信息的调制与传输。' },
  { id: 'ee4-2', name: '微机原理', difficulty: 4, credit: 3, type: 'compulsory', semester: 4, majorRestriction: ['ee'], mastery: 0, description: '底层硬件的执行逻辑。' },
  { id: 'ee4-e1', name: 'FPGA开发实践', difficulty: 4, credit: 2, type: 'elective', semester: 4, majorRestriction: ['ee'], mastery: 0, description: '硬件描述语言Verilog应用。' },

  { id: 'ee5-1', name: '数字信号处理', difficulty: 5, credit: 4, type: 'compulsory', semester: 5, majorRestriction: ['ee'], mastery: 0, description: 'FFT与滤波器设计。' },
  { id: 'ee5-2', name: '微波技术', difficulty: 5, credit: 3, type: 'compulsory', semester: 5, majorRestriction: ['ee'], mastery: 0, description: '高频电路的特殊规律。' },
  { id: 'ee5-e1', name: '射频集成电路', difficulty: 5, credit: 3, type: 'elective', semester: 5, majorRestriction: ['ee'], mastery: 0, description: '芯片设计的顶峰。' },

  { id: 'ee6-1', name: '自动控制理论', difficulty: 4, credit: 3, type: 'compulsory', semester: 6, majorRestriction: ['ee'], mastery: 0, description: '系统的稳定性与控制。' },
  { id: 'ee6-e1', name: '物联网技术', difficulty: 3, credit: 2, type: 'elective', semester: 6, majorRestriction: ['ee'], mastery: 0, description: '万物互联的未来。' },

  // --- 临床医学 (Medicine) ---
  { id: 'med1-1', name: '人体解剖学', difficulty: 5, credit: 6, type: 'compulsory', semester: 1, majorRestriction: ['medicine'], mastery: 0, description: '医学生的入门礼，记忆力大考验。' },
  { id: 'med1-2', name: '医用化学', difficulty: 3, credit: 3, type: 'compulsory', semester: 1, majorRestriction: ['medicine'], mastery: 0, description: '医学的化学基础。' },
  { id: 'med1-e1', name: '医学导论', difficulty: 1, credit: 2, type: 'elective', semester: 1, majorRestriction: ['medicine'], mastery: 0, description: '了解医生的职业使命。' },

  { id: 'med2-1', name: '组织胚胎学', difficulty: 4, credit: 4, type: 'compulsory', semester: 2, majorRestriction: ['medicine'], mastery: 0, description: '微观结构与发育奥秘。' },
  { id: 'med2-2', name: '生理学(医)', difficulty: 5, credit: 5, type: 'compulsory', semester: 2, majorRestriction: ['medicine'], mastery: 0, description: '生命机能的运作原理。' },
  { id: 'med2-e1', name: '医学心理学', difficulty: 2, credit: 2, type: 'elective', semester: 2, majorRestriction: ['medicine'], mastery: 0, description: '医患沟通的艺术。' },

  { id: 'med3-1', name: '生物化学(医)', difficulty: 5, credit: 4, type: 'compulsory', semester: 3, majorRestriction: ['medicine'], mastery: 0, description: '代谢与分子基础。' },
  { id: 'med3-2', name: '医学免疫学', difficulty: 4, credit: 3, type: 'compulsory', semester: 3, majorRestriction: ['medicine'], mastery: 0, description: '身体的防御系统。' },
  { id: 'med3-e1', name: '医学寄生虫学', difficulty: 3, credit: 2, type: 'elective', semester: 3, majorRestriction: ['medicine'], mastery: 0, description: '各种虫子的生态与致病。' },

  { id: 'med4-1', name: '病理学', difficulty: 5, credit: 5, type: 'compulsory', semester: 4, majorRestriction: ['medicine'], mastery: 0, description: '疾病的本质与形态。' },
  { id: 'med4-2', name: '药理学', difficulty: 5, credit: 5, type: 'compulsory', semester: 4, majorRestriction: ['medicine'], mastery: 0, description: '药物的作用与机理。' },
  { id: 'med4-e1', name: '医学遗传学', difficulty: 3, credit: 2, type: 'elective', semester: 4, majorRestriction: ['medicine'], mastery: 0, description: '基因与遗传病。' },

  { id: 'med5-1', name: '诊断学', difficulty: 5, credit: 6, type: 'compulsory', semester: 5, majorRestriction: ['medicine'], mastery: 0, description: '临床医生的基本功。' },
  { id: 'med5-2', name: '内科学(一)', difficulty: 5, credit: 4, type: 'compulsory', semester: 5, majorRestriction: ['medicine'], mastery: 0, description: '内科基础与常见病。' },
  { id: 'med5-e1', name: '影像诊断学', difficulty: 4, credit: 3, type: 'elective', semester: 5, majorRestriction: ['medicine'], mastery: 0, description: '看懂CT与MRI。' },

  { id: 'med6-1', name: '外科学(一)', difficulty: 5, credit: 4, type: 'compulsory', semester: 6, majorRestriction: ['medicine'], mastery: 0, description: '外科手术基础与理论。' },
  { id: 'med6-e1', name: '急诊医学', difficulty: 4, credit: 2, type: 'elective', semester: 6, majorRestriction: ['medicine'], mastery: 0, description: '抢救室里的生死时速。' },

  // --- 法学 (Law) ---
  { id: 'law1-1', name: '法理学', difficulty: 4, credit: 4, type: 'compulsory', semester: 1, majorRestriction: ['law'], mastery: 0, description: '法律的灵魂与基础。' },
  { id: 'law1-2', name: '宪法学', difficulty: 3, credit: 3, type: 'compulsory', semester: 1, majorRestriction: ['law'], mastery: 0, description: '国家的根本大法。' },
  { id: 'law1-e1', name: '法学导论', difficulty: 1, credit: 2, type: 'elective', semester: 1, majorRestriction: ['law'], mastery: 0, description: '法律职业全景扫描。' },

  { id: 'law2-1', name: '民法总论', difficulty: 5, credit: 4, type: 'compulsory', semester: 2, majorRestriction: ['law'], mastery: 0, description: '私法之基，博大精深。' },
  { id: 'law2-2', name: '刑法总论', difficulty: 5, credit: 4, type: 'compulsory', semester: 2, majorRestriction: ['law'], mastery: 0, description: '犯罪与刑罚的理论。' },
  { id: 'law2-e1', name: '法律逻辑学', difficulty: 3, credit: 2, type: 'elective', semester: 2, majorRestriction: ['law'], mastery: 0, description: '法律人的思维训练。' },

  { id: 'law3-1', name: '民法分论(债权)', difficulty: 4, credit: 4, type: 'compulsory', semester: 3, majorRestriction: ['law'], mastery: 0, description: '契约与侵权的法则。' },
  { id: 'law3-2', name: '刑法分论', difficulty: 4, credit: 4, type: 'compulsory', semester: 3, majorRestriction: ['law'], mastery: 0, description: '各类犯罪的构成。' },
  { id: 'law3-e1', name: '法律职业道德', difficulty: 2, credit: 2, type: 'elective', semester: 3, majorRestriction: ['law'], mastery: 0, description: '守住法律人的底线。' },

  { id: 'law4-1', name: '民事诉讼法', difficulty: 4, credit: 4, type: 'compulsory', semester: 4, majorRestriction: ['law'], mastery: 0, description: '程序正义的体现。' },
  { id: 'law4-2', name: '行政法与行政诉讼法', difficulty: 4, credit: 4, type: 'compulsory', semester: 4, majorRestriction: ['law'], mastery: 0, description: '控权法之核心。' },
  { id: 'law4-e1', name: '婚姻家庭法', difficulty: 2, credit: 2, type: 'elective', semester: 4, majorRestriction: ['law'], mastery: 0, description: '家事纠纷的法律调节。' },

  { id: 'law5-1', name: '刑事诉讼法', difficulty: 4, credit: 4, type: 'compulsory', semester: 5, majorRestriction: ['law'], mastery: 0, description: '人权保障的最后屏障。' },
  { id: 'law5-2', name: '商法学', difficulty: 4, credit: 4, type: 'compulsory', semester: 5, majorRestriction: ['law'], mastery: 0, description: '公司、破产与票据。' },
  { id: 'law5-e1', name: '知识产权法', difficulty: 4, credit: 3, type: 'elective', semester: 5, majorRestriction: ['law'], mastery: 0, description: '保护创新的法律。' },

  { id: 'law6-1', name: '国际公法', difficulty: 4, credit: 3, type: 'compulsory', semester: 6, majorRestriction: ['law'], mastery: 0, description: '国家间的法律准则。' },
  { id: 'law6-e1', name: '法律诊所', difficulty: 3, credit: 3, type: 'elective', semester: 6, majorRestriction: ['law'], mastery: 0, description: '真实案例的模拟与实操。' },

  // --- 视觉传达设计 (Art) ---
  { id: 'art1-1', name: '平面构成', difficulty: 3, credit: 4, type: 'compulsory', semester: 1, majorRestriction: ['art'], mastery: 0, description: '点线面的艺术。' },
  { id: 'art1-2', name: '色彩基础', difficulty: 3, credit: 4, type: 'compulsory', semester: 1, majorRestriction: ['art'], mastery: 0, description: '掌握色彩的情感与运用。' },
  { id: 'art1-e1', name: '设计概论', difficulty: 1, credit: 2, type: 'elective', semester: 1, majorRestriction: ['art'], mastery: 0, description: '设计的历史与未来。' },

  { id: 'art2-1', name: '字体设计', difficulty: 4, credit: 3, type: 'compulsory', semester: 2, majorRestriction: ['art'], mastery: 0, description: '文字的造型与排版。' },
  { id: 'art2-2', name: '图形设计', difficulty: 4, credit: 3, type: 'compulsory', semester: 2, majorRestriction: ['art'], mastery: 0, description: '视觉符号的创作。' },
  { id: 'art2-e1', name: '摄影基础', difficulty: 2, credit: 2, type: 'elective', semester: 2, majorRestriction: ['art'], mastery: 0, description: '记录光影的瞬间。' },

  { id: 'art3-1', name: '标志设计', difficulty: 4, credit: 4, type: 'compulsory', semester: 3, majorRestriction: ['art'], mastery: 0, description: '品牌核心的视觉呈现。' },
  { id: 'art3-2', name: '编排设计', difficulty: 4, credit: 3, type: 'compulsory', semester: 3, majorRestriction: ['art'], mastery: 0, description: '信息的空间组织艺术。' },
  { id: 'art3-e1', name: 'UI设计基础', difficulty: 3, credit: 2, type: 'elective', semester: 3, majorRestriction: ['art'], mastery: 0, description: '移动端界面初步。' },

  { id: 'art4-1', name: '包装设计', difficulty: 5, credit: 4, type: 'compulsory', semester: 4, majorRestriction: ['art'], mastery: 0, description: '三维空间的视觉传达。' },
  { id: 'art4-2', name: '插画设计', difficulty: 3, credit: 3, type: 'compulsory', semester: 4, majorRestriction: ['art'], mastery: 0, description: '故事的视觉表达。' },
  { id: 'art4-e1', name: '动态图形(MG)', difficulty: 5, credit: 2, type: 'elective', semester: 4, majorRestriction: ['art'], mastery: 0, description: '让设计动起来。' },

  { id: 'art5-1', name: '品牌形象设计(VI)', difficulty: 5, credit: 5, type: 'compulsory', semester: 5, majorRestriction: ['art'], mastery: 0, description: '成套系的视觉识别系统。' },
  { id: 'art5-2', name: '广告设计', difficulty: 4, credit: 3, type: 'compulsory', semester: 5, majorRestriction: ['art'], mastery: 0, description: '创意的商业化表达。' },
  { id: 'art5-e1', name: '网页设计', difficulty: 4, credit: 2, type: 'elective', semester: 5, majorRestriction: ['art'], mastery: 0, description: '构建数字化体验。' },

  { id: 'art6-1', name: '综合设计实践', difficulty: 5, credit: 4, type: 'compulsory', semester: 6, majorRestriction: ['art'], mastery: 0, description: '大型真实项目的模拟实操。' },
  { id: 'art6-e1', name: '策展导论', difficulty: 3, credit: 2, type: 'elective', semester: 6, majorRestriction: ['art'], mastery: 0, description: '如何展示艺术作品。' },

  // --- 金融/会计/数学 (General/Math/Finance) ---
  { id: 'mth1-1', name: '高等代数(一)', difficulty: 5, credit: 5, type: 'compulsory', semester: 1, majorRestriction: ['general'], mastery: 0, description: '数学系的立身之本。' },
  { id: 'mth1-2', name: '数学分析(一)', difficulty: 5, credit: 6, type: 'compulsory', semester: 1, majorRestriction: ['general'], mastery: 0, description: '极限与连续的严谨定义。' },
  { id: 'mth1-e1', name: '初等数论', difficulty: 3, credit: 2, type: 'elective', semester: 1, majorRestriction: ['general'], mastery: 0, description: '整数的美妙性质。' },

  { id: 'mth2-1', name: '数学分析(二)', difficulty: 5, credit: 6, type: 'compulsory', semester: 2, majorRestriction: ['general'], mastery: 0, description: '级数与多元微积分。' },
  { id: 'mth2-2', name: '微观经济学', difficulty: 3, credit: 4, type: 'compulsory', semester: 2, majorRestriction: ['general'], mastery: 0, description: '经济学的微观基石。' },
  { id: 'mth2-e1', name: '博弈论', difficulty: 4, credit: 2, type: 'elective', semester: 2, majorRestriction: ['general'], mastery: 0, description: '策略博弈的艺术。' },

  { id: 'mth3-1', name: '数学分析(三)', difficulty: 5, credit: 4, type: 'compulsory', semester: 3, majorRestriction: ['general'], mastery: 0, description: '多元积分与场论。' },
  { id: 'mth3-2', name: '宏观经济学', difficulty: 3, credit: 4, type: 'compulsory', semester: 3, majorRestriction: ['general'], mastery: 0, description: '国家层面的经济运作。' },
  { id: 'mth3-e1', name: 'Python金融计算', difficulty: 3, credit: 2, type: 'elective', semester: 3, majorRestriction: ['general'], mastery: 0, description: '金融工程的入门利器。' },

  { id: 'mth4-1', name: '复变函数', difficulty: 5, credit: 4, type: 'compulsory', semester: 4, majorRestriction: ['general'], mastery: 0, description: '解析函数的奥秘。' },
  { id: 'mth4-2', name: '金融学原理', difficulty: 3, credit: 3, type: 'compulsory', semester: 4, majorRestriction: ['general'], mastery: 0, description: '资本市场的逻辑。' },
  { id: 'mth4-e1', name: '计量经济学', difficulty: 5, credit: 3, type: 'elective', semester: 4, majorRestriction: ['general'], mastery: 0, description: '经济数据的统计分析。' },

  { id: 'mth5-1', name: '泛函分析', difficulty: 5, credit: 4, type: 'compulsory', semester: 5, majorRestriction: ['general'], mastery: 0, description: '数学的最高峰之一。' },
  { id: 'mth5-2', name: '财务报表分析', difficulty: 4, credit: 3, type: 'compulsory', semester: 5, majorRestriction: ['general'], mastery: 0, description: '透视企业的财务状况。' },
  { id: 'mth5-e1', name: '投资学', difficulty: 4, credit: 3, type: 'elective', semester: 5, majorRestriction: ['general'], mastery: 0, description: '资产定价与风险管理。' },

  { id: 'mth6-1', name: '运筹学', difficulty: 4, credit: 4, type: 'compulsory', semester: 6, majorRestriction: ['general'], mastery: 0, description: '优化决策的科学。' },
  { id: 'mth6-e1', name: '行为金融学', difficulty: 3, credit: 2, type: 'elective', semester: 6, majorRestriction: ['general'], mastery: 0, description: '非理性的市场行为。' },

  // --- 默认兜底课程 (针对其他专业) ---
  { id: 'def1-1', name: '专业导论', difficulty: 2, credit: 3, type: 'compulsory', semester: 1, mastery: 0, description: '了解你所选专业的未来。' },
  { id: 'def1-2', name: '基础实验', difficulty: 3, credit: 3, type: 'compulsory', semester: 1, mastery: 0, description: '动手实践，掌握基础。' },
  { id: 'def1-e1', name: '学术交流技巧', difficulty: 2, credit: 2, type: 'elective', semester: 1, mastery: 0, description: '如何优雅地展示科研成果。' },
];

const INITIAL_MENTORS: Mentor[] = [
];

const MENTOR_DATA: Record<MajorType, { schools: string[], fields: string[] }> = {
  cs: {
    schools: ['计算机学院', '软件学院', '人工智能学院', '网络空间安全学院', '数据科学研究院', '交叉信息研究院', '软件研发中心', '云计算实验室', '图灵奖实验室', '多媒体研究所', '嵌入式系统国家重点实验室', '超算中心'],
    fields: ['大语言模型', '计算机视觉', '分布式系统', '形式化验证', '量子计算', '人机交互', '隐私计算', '编译器优化', '图神经网络', '强化学习', '操作系统内核', '数据库查询优化', '边缘计算', '三维重建', '自然语言处理', '软件测试']
  },
  biology: {
    schools: ['生命科学学院', '医学院', '生物医学工程系', '基础医学研究所', '生命科学联合中心', '脑科学研究院', '植物分子生物学中心', '结构生物学实验室', '冷冻电镜中心', '合成生物学重点实验室', '生物信息研究所', '海洋生物研究中心'],
    fields: ['基因编辑', '蛋白质结构预测', '神经生物学', '干细胞研究', '合成生物学', '生物信息学', '免疫学研究', '植物抗逆基因', '冷冻电镜技术', '代谢组学', '化学生物学', '神经退行性疾病', '单细胞测序', '药靶筛选', '表观遗传学', '生态多样性']
  },
  humanities: {
    schools: ['文学院', '历史学系', '哲学系', '社会学系', '艺术学理论研究院', '国际汉学研究中心', '出土文献保护中心', '非物质文化遗产研究所', '古籍整理研究所', '人类学系', '政治学研究中心', '跨文化传播研究院'],
    fields: ['数字人文', '明清史研究', '先秦哲学', '跨文化比较', '比较文学', '社会调查方法', '出土文献研究', '近代报刊史', '伦理学前沿', '古典文献学', '民俗文化遗产', '文学社会学', '媒介考古', '口述史', '应用伦理', '文化政策']
  },
  ee: {
    schools: ['电子工程系', '集成电路学院', '信息与通信工程学院', '自动化系', '微电子所', '光电子技术研究所', '空天信息研究院', '智能感知实验室', '毫米波国家重点实验室', '微机电系统(MEMS)研究中心', '光通信实验室', '电磁兼容研究室'],
    fields: ['射频电路', '光电信息', '5G/6G通信', '控制理论', '机器人学', '半导体材料', '模拟电路设计', '雷达信号处理', '柔性电子', '光纤通信', '电力电子', '微纳机电系统(NEMS)', '存算一体芯片', '光通信网络', '卫星互联网', '柔性显示']
  },
  medicine: {
    schools: ['基础医学院', '公共卫生学院', '药学院', '附属第一医院', '转化医学中心', '临床肿瘤研究所', '口腔医学院', '护理学院', '全科医学系', '法医学研究所', '医学影像中心', '生殖医学中心'],
    fields: ['肿瘤精准治疗', '流行病学', '药物筛选', '影像医学', '心血管病学', '再生医学', '临床解剖学', '靶向药物开发', '中西医结合', '老年医学', '罕见病基因治疗', '疫苗研发', '微创手术机器人', '神经外科学', '药动学', '公共卫生政策']
  },
  law: {
    schools: ['法学院', '知识产权学院', '国际法研究所', '人权研究院', '法律大数据中心', '司法案例研究中心', '环境法治研究院', '海商法研究中心', '金融法研究中心', '比较法研究院', '劳动法与社会保障研究所', '立法研究中心'],
    fields: ['民商法', '刑法学', '国际公法', '法理学', '环境法', '数字法学', '证据法学', '破产法', '数据安全立法', '法律人工智能', '金融监管法', '劳动法与社会保障', '涉外法治', '仲裁法', '财税法', '法律经济学']
  },
  art: {
    schools: ['美术学院', '设计学院', '电影电视学院', '音乐学院', '新媒体艺术系', '建筑设计研究院', '工艺美术研究所', '数字创意中心', '公共艺术研究中心', '时尚设计系', '文化遗产保护中心', '动画学院'],
    fields: ['视觉传达', '工业设计', '电影导演', '艺术史论', '数字媒体艺术', '交互设计', '当代艺术创作', '建筑遗产保护', '非遗文创开发', '虚拟现实艺术', '可持续设计', '声音艺术', '策展实践', '传统手工艺', '服装设计', '环境艺术']
  },
  general: {
    schools: ['理学院', '经管学院', '公共管理学院', '外语学院', '体育教研部', '数学科学中心', '理论物理研究所', '创新管理学院', '教育研究院', '国际关系学院', '心理学系', '新闻与传播学院'],
    fields: ['宏观经济学', '应用统计学', '量子物理', '高能物理', '运筹学', '国际关系', '认知心理学', '动力系统', '偏微分方程', '资产定价', '产业政策', '跨文化翻译', '行为金融学', '教育测量', '博弈论', '危机传播']
  }
};

const RESUME_DATA_POOL: { 
  research: { name: string, quality: ResumeQuality, scoreRange: [number, number] }[],
  competition: { name: string, quality: ResumeQuality, scoreRange: [number, number] }[] 
} = {
  research: [
    // Common (15 items)
    { name: "实验室日常打杂证明", quality: 'common', scoreRange: [5, 8] },
    { name: "文献综述作业优秀", quality: 'common', scoreRange: [5, 8] },
    { name: "学术讲座听课证", quality: 'common', scoreRange: [5, 8] },
    { name: "基础实验技能认证", quality: 'common', scoreRange: [5, 8] },
    { name: "参与问卷调查收集", quality: 'common', scoreRange: [5, 8] },
    { name: "实验室设备维护经历", quality: 'common', scoreRange: [5, 8] },
    { name: "学术会议志愿者", quality: 'common', scoreRange: [6, 9] },
    { name: "校内学术论坛参与", quality: 'common', scoreRange: [6, 9] },
    { name: "初级数据清洗实践", quality: 'common', scoreRange: [6, 9] },
    { name: "翻译学术短文", quality: 'common', scoreRange: [6, 9] },
    { name: "整理导师历史资料", quality: 'common', scoreRange: [6, 9] },
    { name: "参与实验室组会记录", quality: 'common', scoreRange: [7, 10] },
    { name: "完成科研诚信培训", quality: 'common', scoreRange: [7, 10] },
    { name: "学术海报初步设计", quality: 'common', scoreRange: [7, 10] },
    { name: "基础编程算法实现", quality: 'common', scoreRange: [7, 10] },
    // Rare (20 items)
    { name: "校级大创项目立项", quality: 'rare', scoreRange: [12, 16] },
    { name: "实验室课题助理", quality: 'rare', scoreRange: [12, 16] },
    { name: "校内期刊发表短评", quality: 'rare', scoreRange: [12, 16] },
    { name: "实用新型专利授权", quality: 'rare', scoreRange: [13, 17] },
    { name: "参与编写教材章节", quality: 'rare', scoreRange: [13, 17] },
    { name: "核心期刊二作文章", quality: 'rare', scoreRange: [14, 18] },
    { name: "省级大创项目结项", quality: 'rare', scoreRange: [14, 18] },
    { name: "独立完成学术报告", quality: 'rare', scoreRange: [14, 18] },
    { name: "掌握高级分析软件", quality: 'rare', scoreRange: [15, 19] },
    { name: "参与省部级课题", quality: 'rare', scoreRange: [15, 19] },
    { name: "发明专利公开", quality: 'rare', scoreRange: [15, 19] },
    { name: "学术会议分论坛发言", quality: 'rare', scoreRange: [16, 20] },
    { name: "参与跨校联合项目", quality: 'rare', scoreRange: [16, 20] },
    { name: "优秀毕业论文预选", quality: 'rare', scoreRange: [16, 20] },
    { name: "实验室骨干成员", quality: 'rare', scoreRange: [17, 21] },
    { name: "获得校级科研奖学金", quality: 'rare', scoreRange: [17, 21] },
    { name: "发表CSCD核心论文", quality: 'rare', scoreRange: [18, 22] },
    { name: "独立开发科研小工具", quality: 'rare', scoreRange: [18, 22] },
    { name: "软件著作权登记", quality: 'rare', scoreRange: [18, 22] },
    { name: "参与国际合作项目", quality: 'rare', scoreRange: [19, 23] },
    // Epic (15 items)
    { name: "国家级大创项目立项", quality: 'epic', scoreRange: [25, 32] },
    { name: "SCI/SSCI三区论文一作", quality: 'epic', scoreRange: [25, 32] },
    { name: "SCI/SSCI二区论文二作", quality: 'epic', scoreRange: [26, 33] },
    { name: "发明专利授权", quality: 'epic', scoreRange: [27, 34] },
    { name: "主持省级科研项目", quality: 'epic', scoreRange: [28, 35] },
    { name: "EI会议论文一作", quality: 'epic', scoreRange: [29, 36] },
    { name: "参与编写学术专著", quality: 'epic', scoreRange: [30, 37] },
    { name: "核心期刊封面文章", quality: 'epic', scoreRange: [31, 38] },
    { name: "国际学术会议受邀口头报告", quality: 'epic', scoreRange: [32, 39] },
    { name: "获得省级科研优秀成果奖", quality: 'epic', scoreRange: [33, 40] },
    { name: "实验室子课题负责人", quality: 'epic', scoreRange: [34, 41] },
    { name: "SCI/SSCI二区论文一作", quality: 'epic', scoreRange: [35, 42] },
    { name: "入选“拔尖人才”科研计划", quality: 'epic', scoreRange: [36, 43] },
    { name: "参与国家重点研发计划", quality: 'epic', scoreRange: [37, 44] },
    { name: "获得国家发明奖提名", quality: 'epic', scoreRange: [38, 45] },
    // Legendary (5 items)
    { name: "SCI一区Top期刊一作", quality: 'legendary', scoreRange: [50, 65] },
    { name: "获得国家级大学生科研奖特等奖", quality: 'legendary', scoreRange: [52, 67] },
    { name: "在顶尖国际会议发表长文(一作)", quality: 'legendary', scoreRange: [55, 70] },
    { name: "作为核心成员参与国家级重大课题", quality: 'legendary', scoreRange: [58, 73] },
    { name: "科研成果转化产生重大经济效益", quality: 'legendary', scoreRange: [60, 75] },
  ],
  competition: [
    // Common (15 items)
    { name: "校级比赛优秀奖", quality: 'common', scoreRange: [5, 8] },
    { name: "社团风采大赛参与", quality: 'common', scoreRange: [5, 8] },
    { name: "校内运动会参与证明", quality: 'common', scoreRange: [5, 8] },
    { name: "英语演讲比赛入围", quality: 'common', scoreRange: [5, 8] },
    { name: "辩论赛初赛获胜", quality: 'common', scoreRange: [5, 8] },
    { name: "校级征文比赛二等奖", quality: 'common', scoreRange: [6, 9] },
    { name: "摄影大赛入选作品", quality: 'common', scoreRange: [6, 9] },
    { name: "基础技能测试合格", quality: 'common', scoreRange: [6, 9] },
    { name: "校内歌手大赛参与", quality: 'common', scoreRange: [6, 9] },
    { name: "心理知识竞赛参与", quality: 'common', scoreRange: [6, 9] },
    { name: "校级社团活跃分子", quality: 'common', scoreRange: [7, 10] },
    { name: "参与公益支教活动", quality: 'common', scoreRange: [7, 10] },
    { name: "校内创新创业训练营结业", quality: 'common', scoreRange: [7, 10] },
    { name: "数学竞赛校内选拔赛通过", quality: 'common', scoreRange: [7, 10] },
    { name: "获得校级“三好学生”称号", quality: 'common', scoreRange: [7, 10] },
    // Rare (20 items)
    { name: "校级一等奖学金", quality: 'rare', scoreRange: [12, 16] },
    { name: "省级数学建模竞赛三等奖", quality: 'rare', scoreRange: [12, 16] },
    { name: "校级演讲比赛冠军", quality: 'rare', scoreRange: [12, 16] },
    { name: "省级英语竞赛二等奖", quality: 'rare', scoreRange: [13, 17] },
    { name: "校级创业计划大赛一等奖", quality: 'rare', scoreRange: [13, 17] },
    { name: "省级编程大赛优胜奖", quality: 'rare', scoreRange: [14, 18] },
    { name: "市级马拉松完赛证书", quality: 'rare', scoreRange: [14, 18] },
    { name: "校级优秀学生干部", quality: 'rare', scoreRange: [14, 18] },
    { name: "省级辩论赛八强", quality: 'rare', scoreRange: [15, 19] },
    { name: "区域性设计大赛二等奖", quality: 'rare', scoreRange: [15, 19] },
    { name: "省级体育赛事前六名", quality: 'rare', scoreRange: [15, 19] },
    { name: "校级“十佳大学生”", quality: 'rare', scoreRange: [16, 20] },
    { name: "获得省级社会实践优秀团队", quality: 'rare', scoreRange: [16, 20] },
    { name: "省级书法/绘画比赛一等奖", quality: 'rare', scoreRange: [16, 20] },
    { name: "校级技术创新奖", quality: 'rare', scoreRange: [17, 21] },
    { name: "获得行业协会颁发的技能证书", quality: 'rare', scoreRange: [17, 21] },
    { name: "省级大学生艺术展演奖项", quality: 'rare', scoreRange: [18, 22] },
    { name: "市级优秀志愿者称号", quality: 'rare', scoreRange: [18, 22] },
    { name: "校级“挑战杯”选拔赛一等奖", quality: 'rare', scoreRange: [18, 22] },
    { name: "省级物理/生物/化学竞赛三等奖", quality: 'rare', scoreRange: [19, 23] },
    // Epic (15 items)
    { name: "“挑战杯”省级一等奖", quality: 'epic', scoreRange: [25, 32] },
    { name: "“互联网+”大赛省级金奖", quality: 'epic', scoreRange: [25, 32] },
    { name: "全国数学建模竞赛二等奖", quality: 'epic', scoreRange: [26, 33] },
    { name: "美国数学建模竞赛M奖(一等奖)", quality: 'epic', scoreRange: [27, 34] },
    { name: "全国大学生英语竞赛特等奖", quality: 'epic', scoreRange: [28, 35] },
    { name: "ACM-ICPC区域赛银牌", quality: 'epic', scoreRange: [29, 36] },
    { name: "全国大学生电子设计竞赛二等奖", quality: 'epic', scoreRange: [30, 37] },
    { name: "国家奖学金", quality: 'epic', scoreRange: [31, 38] },
    { name: "省级优秀学生标兵", quality: 'epic', scoreRange: [32, 39] },
    { name: "全国大学生机器人大赛二等奖", quality: 'epic', scoreRange: [33, 40] },
    { name: "获得知名企业颁发的专项特等奖学金", quality: 'epic', scoreRange: [34, 41] },
    { name: "全国大学生演讲比赛前三名", quality: 'epic', scoreRange: [35, 42] },
    { name: "“创青春”全国大学生创业大赛银奖", quality: 'epic', scoreRange: [36, 43] },
    { name: "全国大学生辩论赛“最佳辩手”", quality: 'epic', scoreRange: [37, 44] },
    { name: "省级大学生年度人物", quality: 'epic', scoreRange: [38, 45] },
    // Legendary (5 items)
    { name: "“挑战杯”全国特等奖", quality: 'legendary', scoreRange: [50, 65] },
    { name: "“互联网+”全国金奖", quality: 'legendary', scoreRange: [52, 67] },
    { name: "ACM-ICPC区域赛金牌/总决赛奖项", quality: 'legendary', scoreRange: [55, 70] },
    { name: "全国大学生数学建模竞赛一等奖", quality: 'legendary', scoreRange: [58, 73] },
    { name: "获得“中国大学生年度人物”称号", quality: 'legendary', scoreRange: [60, 75] },
  ]
};

const generateRandomMentor = (majorType?: MajorType, university?: string): Mentor => {
  const lastNames = ['张', '王', '李', '赵', '刘', '陈', '杨', '周', '吴', '徐', '孙', '胡', '朱', '高', '林', '何', '郭', '马', '罗', '梁'];
  const firstNames = ['强', '伟', '芳', '娜', '敏', '静', '杰', '涛', '勇', '军', '明', '红', '磊', '洋', '艳', '勇', '斌', '霞', '平', '凡'];
  const titles = ['教授', '副教授', '助理教授', '博导', '杰青', '长江学者', '院士'];
  
  // 仅推荐玩家所选专业相关的导师
  const effectiveMajor = majorType || (Object.keys(MENTOR_DATA)[Math.floor(Math.random() * 8)] as MajorType);
  const data = MENTOR_DATA[effectiveMajor];
  
  return {
    id: Math.random().toString(36).substr(2, 9),
    name: lastNames[Math.floor(Math.random() * lastNames.length)] + firstNames[Math.floor(Math.random() * firstNames.length)],
    title: titles[Math.floor(Math.random() * titles.length)],
    reputation: Math.floor(Math.random() * 60) + 40,
    friendship: 0,
    university: university || UNIVERSITIES[Math.floor(Math.random() * UNIVERSITIES.length)].name,
    school: data.schools[Math.floor(Math.random() * data.schools.length)],
    researchField: data.fields[Math.floor(Math.random() * data.fields.length)],
    status: 'none'
  };
};

const generateNewMentorBatch = (count: number, majorType?: MajorType): Mentor[] => {
  return Array.from({ length: count }, () => generateRandomMentor(majorType));
};
const MAJORS: { name: string; type: MajorType; description: string; bonus: string }[] = [
  { 
    name: "计算机科学与技术", 
    type: "cs", 
    description: "卷王聚集地。竞赛和实习是重头戏，GPA压力极大。",
    bonus: "竞赛收益+25%，科研收益+10%" 
  },
  { 
    name: "人工智能", 
    type: "cs", 
    description: "时代的浪尖。数学要求极高，大模型和算法是核心。",
    bonus: "科研收益+20%，数学基础需求高" 
  },
  { 
    name: "生物科学", 
    type: "biology", 
    description: "实验室搬砖人。需要大量的科研投入和实验成果，英语要求高。",
    bonus: "科研收益+35%，英语需求高" 
  },
  { 
    name: "汉语言文学", 
    type: "humanities", 
    description: "人文气息浓厚。注重阅读积累和论文发表，社交属性强。",
    bonus: "GPA收益+20%，心态恢复快" 
  },
  { 
    name: "历史学", 
    type: "humanities", 
    description: "板凳甘坐十年冷。需要极强的文献阅读能力和逻辑推理。",
    bonus: "科研收益+20%，心态稳健" 
  },
  { 
    name: "金融学", 
    type: "general", 
    description: "精英主义。注重综合素质、英语和实习，对绩点要求苛刻。",
    bonus: "英语收益+20%，初始金钱+2000" 
  },
  { 
    name: "会计学", 
    type: "general", 
    description: "精打细算。考证狂人的首选，就业范围极广。",
    bonus: "GPA收益+15%，初始金钱+1000" 
  },
  { 
    name: "电子信息工程", 
    type: "ee", 
    description: "硬核工科。电路、信号、芯片，动手能力和数学基础缺一不可。",
    bonus: "竞赛收益+20%，体力消耗+10%" 
  },
  { 
    name: "临床医学", 
    type: "medicine", 
    description: "劝人学医... 课业极其繁重，需要极强的记忆力和体力。",
    bonus: "GPA收益+15%，体力需求极大" 
  },
  { 
    name: "法学", 
    type: "law", 
    description: "背诵之王。法律条文和案例分析，逻辑思维 and 表达能力是关键。",
    bonus: "英语收益+15%，心态抗压+15%" 
  },
  { 
    name: "视觉传达设计", 
    type: "art", 
    description: "熬夜画图。作品集是核心，需要审美天赋 and 软件熟练度。",
    bonus: "科研收益(作品集)+25%，经常熬夜" 
  },
  { 
    name: "数学与应用数学", 
    type: "general", 
    description: "一切科学的基础。抽象思维的极致，转保CS/金融的黄金跳板。",
    bonus: "GPA收益+25%，心态消耗大" 
  },
];

const INITIAL_STATS: PlayerStats = {
  gpa: 0.0,
  research: 0,
  competition: 0,
  english: 40,
  mental: 80,
  stamina: 100,
};

// --- App Component ---
export default function App() {
  const [activeTab, setActiveTab] = useState<'actions' | 'shop' | 'mentors' | 'academic' | 'social' | 'resume'>('actions');
  const [state, setState] = useState<GameState>({
    phase: 'start',
    semester: 0,
    week: 1,
    money: 1000,
    logs: ["欢迎来到保研模拟器。你的旅程将从高考分数公布的那一刻开始。"],
    stats: INITIAL_STATS,
    resume: [],
    masteryEfficiency: 1.0,
    researchEfficiency: 1.0,
    competitionEfficiency: 1.0,
    isGameOver: false,
    gameMessage: "",
    currentEvent: null,
    currentInterview: null,
    background: "",
    gaokaoScore: 0,
    university: "",
    major: "",
    majorType: "general",
    rejectionCount: 0,
    courses: [],
    mentors: INITIAL_MENTORS,
    potentialMentors: generateNewMentorBatch(3),
    social: { classmates: 0, seniors: 0 },
    applications: [],
    activeExam: null,
    showExamReport: false,
    examReport: null,
    selectedActions: [],
    weekSummary: { gains: {}, logs: [] },
    showWeeklySummary: false,
    purchaseCounts: {},
  });

  const BACKGROUNDS = [
    {
      name: "小镇做题家",
      description: "擅长考试，掌握度提升效率极高，但英语基础薄弱。",
      stats: { ...INITIAL_STATS, english: 20 },
      masteryEfficiency: 1.4
    },
    {
      name: "竞赛选手",
      description: "高中时期有竞赛经验，初始竞赛水平高，学习效率稳定。",
      stats: { ...INITIAL_STATS, competition: 30 },
      masteryEfficiency: 1.1
    },
    {
      name: "中产家庭",
      description: "资源丰富，初始英语和金钱较多，但抗压能力稍弱。",
      stats: { ...INITIAL_STATS, english: 60, mental: 70 },
      money: 5000,
      masteryEfficiency: 1.0
    },
    {
      name: "社恐学霸",
      description: "专注力极强，掌握度提升快，但心态容易受外界影响。",
      stats: { ...INITIAL_STATS, research: 15, mental: 60, stamina: 110 },
      masteryEfficiency: 1.3
    },
    {
      name: "文艺青年",
      description: "感性细腻，心态恢复极快，但在硬核工科上效率较低。",
      stats: { ...INITIAL_STATS, mental: 95, stamina: 80 },
      masteryEfficiency: 0.85
    },
    {
      name: "体育生转行",
      description: "身体素质爆表，精力充沛，但掌握度提升效率较低。",
      stats: { ...INITIAL_STATS, stamina: 150, mental: 90 },
      masteryEfficiency: 0.8
    },
    {
      name: "偏科怪才",
      description: "在特定领域有极高天赋，掌握度提升效率波动大。",
      stats: { ...INITIAL_STATS, research: 25, competition: 10 },
      masteryEfficiency: 1.15
    },
    {
      name: "斜杠青年",
      description: "兴趣广泛，社交达人，初始资源多，但难以专注。",
      stats: { ...INITIAL_STATS, english: 50, mental: 85 },
      money: 3000,
      masteryEfficiency: 0.9
    },
    {
      name: "二代移民",
      description: "英语接近母语水平，视野开阔，但学习效率一般。",
      stats: { ...INITIAL_STATS, english: 90, mental: 75 },
      masteryEfficiency: 1.0
    },
    {
      name: "退伍士兵",
      description: "意志如钢铁般坚强，学习踏实稳健，效率有保证。",
      stats: { ...INITIAL_STATS, mental: 100, stamina: 130 },
      masteryEfficiency: 1.2
    },
    {
      name: "自媒体达人",
      description: "擅长运营和表达，初始金钱多，但学习时间常被挤占。",
      stats: { ...INITIAL_STATS, english: 45, mental: 80 },
      money: 8000,
      masteryEfficiency: 0.75
    },
    {
      name: "大龄学生",
      description: "目标极其明确，学习极其刻苦，效率非常高。",
      stats: { ...INITIAL_STATS, stamina: 70, mental: 95, research: 10 },
      masteryEfficiency: 1.35
    },
    {
      name: "寒门贵子",
      description: "极其刻苦，掌握度提升效率极高，但初始资源匮乏。",
      stats: { ...INITIAL_STATS, stamina: 120, mental: 85 },
      money: 200,
      masteryEfficiency: 1.5
    },
    {
      name: "六边形战士",
      description: "各方面发展均衡，掌握度提升效率稳定。",
      stats: { ...INITIAL_STATS, research: 5, competition: 5, english: 50 },
      masteryEfficiency: 1.2
    }
  ];

  const startGaokao = () => {
    const score = 500 + Math.floor(Math.random() * 230); // 500-730
    setState(prev => ({
      ...prev,
      phase: 'gaokao',
      gaokaoScore: score,
      logs: [...prev.logs, `高考成绩公布：${score}分！`]
    }));
  };

  const selectUniversity = (uni: typeof UNIVERSITIES[0]) => {
    const isReach = state.gaokaoScore < uni.minScore;
    
    if (isReach) {
      const gap = uni.minScore - state.gaokaoScore;
      const successChance = Math.max(0.1, 1 - gap * 0.1); 
      
      if (Math.random() > successChance) {
        const score = 500 + Math.floor(Math.random() * 230); // 500-730
        setState(prev => ({
          ...prev,
          phase: 'university_failed',
          gaokaoScore: score,
          failedUniversity: uni.name,
          stats: { ...prev.stats, mental: Math.max(0, prev.stats.mental - 20) },
          rejectionCount: prev.rejectionCount + 1,
          logs: [...prev.logs, `由于高考分数不足，你尝试冲刺[${uni.name}]失败了。这对你的心态造成了打击。`]
        }));
        return;
      }
    }

    setState(prev => ({
      ...prev,
      phase: 'university_selection',
      university: uni.name,
      logs: [...prev.logs, `你选择了[${uni.name}]，即将选择专业。`]
    }));
  };

  const selectMajor = (major: typeof MAJORS[0]) => {
    // 初始学期的必修课自动加入
    const compulsoryCourses = ALL_COURSES.filter(c => 
      c.semester === 1 && 
      c.type === 'compulsory' && 
      (!c.majorRestriction || c.majorRestriction.includes(major.type))
    );
    
    // 如果没有专业必修课，尝试找通识必修课或兜底必修课
    if (compulsoryCourses.length === 0) {
      compulsoryCourses.push(...ALL_COURSES.filter(c => 
        c.semester === 1 && 
        c.type === 'compulsory' && 
        (c.id.startsWith('gen') || c.id.startsWith('def'))
      ));
    }
    
    setState(prev => ({
      ...prev,
      phase: 'course_selection',
      semester: 1,
      major: major.name,
      majorType: major.type,
      courses: compulsoryCourses,
      potentialMentors: generateNewMentorBatch(3, major.type),
      logs: [...prev.logs, `你选择了[${major.name}]专业。接下来请选择本学期的选修课与通识课。`]
    }));
  };

  const selectCourses = (selected: Course[]) => {
    setState(prev => ({
      ...prev,
      phase: 'main_game',
      courses: selected,
      logs: [...prev.logs, `选课完成，第 ${prev.semester} 学期开始了！`]
    }));
  };

  const startGame = (bg: any) => {
    setState(prev => ({
      ...prev,
      stats: bg.stats,
      background: bg.name,
      money: bg.money || 1000,
      masteryEfficiency: bg.masteryEfficiency || 1.0,
      logs: [...prev.logs, `你选择了[${bg.name}]背景。`]
    }));
    startGaokao();
  };

  const RANDOM_EVENTS: GameEvent[] = [
    {
      title: "学长学姐的内部消息",
      description: "一位相熟的学姐悄悄告诉你，某校的预推免面试形式发生了变化。",
      options: [
        {
          text: "虚心请教细节",
          effect: (s) => ({
            newStats: { ...s, mental: s.mental + 10 },
            log: "有了这份情报，你对即将到来的面试更有底气了。"
          })
        }
      ]
    },
    {
      title: "同窗的竞争与合作",
      description: "你的死党在期末复习时遇到了难题，想请你帮他讲解。",
      options: [
        {
          text: "耐心讲解，共同进步",
          effect: (s) => ({
            newStats: { ...s, mental: s.mental + 15, stamina: s.stamina - 10 },
            log: "赠人玫瑰，手有余香。你们的关系更近了一步。"
          })
        },
        {
          text: "婉言拒绝，专注自己",
          effect: (s) => ({
            newStats: { ...s, mental: s.mental - 5, research: s.research + 5 },
            log: "你争取到了更多的复习时间，但气氛变得有些微妙。"
          })
        }
      ]
    },
    {
      title: "校友返校分享会",
      description: "校友分享会上，你遇到了一位在目标院校读研的师兄。",
      options: [
        {
          text: "主动交换联系方式",
          effect: (s) => ({
            newStats: { ...s, research: s.research + 5 },
            log: "师兄非常热情，还答应帮你引荐他现在的导师！"
          })
        }
      ]
    },
    {
      title: "电脑故障",
      description: "你的笔记本电脑屏幕突然黑了，里面还有没保存的代码！",
      options: [
        {
          text: "花钱找人加急维修",
          effect: (s) => ({
            newStats: { ...s, mental: s.mental - 5 },
            moneyChange: -500,
            log: "虽然修好了，但你钱包缩水了500元，心情也有点郁闷。"
          })
        },
        {
          text: "自己查教程折腾半天",
          effect: (s) => ({
            newStats: { ...s, stamina: s.stamina - 20, research: s.research - 2 },
            log: "折腾了一整晚终于修好了，但你累瘫了，还丢了一点进度。"
          })
        }
      ]
    },
    {
      title: "奖学金评选",
      description: "系里开始评选年度奖学金，你的成绩似乎很有竞争力。",
      options: [
        {
          text: "申请并准备材料",
          effect: (s) => ({
            newStats: { ...s, mental: s.mental + 10 },
            moneyChange: s.gpa > 3.8 ? 2000 : 1000,
            log: s.gpa > 3.8 ? "恭喜！你拿到了国奖，零钱+2000！" : "你拿到了二等奖学金，零钱+1000。"
          })
        }
      ]
    },
    {
      title: "推研面试",
      description: "你参加了一场模拟面试，面试官问了一个你完全没听过的概念。",
      options: [
        {
          text: "诚实回答：我还没学习到这部分",
          effect: (s) => ({
            newStats: { ...s, mental: s.mental - 5, english: s.english + 2 },
            log: "面试官赞赏你的诚实，并给你指出了学习方向。"
          })
        },
        {
          text: "强行解释：我认为这个概念是...",
          effect: (s) => ({
            newStats: { ...s, mental: s.mental - 15 },
            log: "你解释得一塌糊涂，面试官皱起了眉头。心态大崩。"
          })
        }
      ]
    },
    {
      title: "恋爱危机",
      description: "你的另一半抱怨你整天待在实验室，不陪他/她。",
      options: [
        {
          text: "陪对方出去玩一天",
          effect: (s) => ({
            newStats: { ...s, mental: s.mental + 25, stamina: s.stamina - 15 },
            log: "感情升温，心情大好。这比拿个高分更让你开心。"
          })
        },
        {
          text: "冷战：保研重要还是你重要？",
          effect: (s) => ({
            newStats: { ...s, mental: s.mental - 20, research: s.research + 5 },
            log: "你赢赢得时间，但失去了心情。效率低下。"
          })
        }
      ]
    },
    {
      title: "推研名额变动",
      description: "学院突然调整推免名额比例，竞争变得更加激烈。",
      options: [
        {
          text: "加倍努力，卷死他们",
          effect: (s) => ({
            newStats: { ...s, stamina: s.stamina - 30, mental: s.mental - 15, research: s.research + 10 },
            log: "你开启了狂暴模式，科研背景大幅提升，但身心俱疲。"
          })
        },
        {
          text: "平常心对待，随缘吧",
          effect: (s) => ({
            newStats: { ...s, mental: s.mental + 10 },
            log: "心态稳住了，毕竟尽力就好。"
          })
        }
      ]
    },
    {
      title: "突击检查",
      description: "辅导员突然查寝，发现你在寝室打游戏。",
      options: [
        {
          text: "认错并保证以后不打了",
          effect: (s) => ({
            newStats: { ...s, mental: s.mental - 5 },
            log: "辅导员教育了你一顿，心态略微受挫。"
          })
        },
        {
          text: "据理力争：这是我的自由时间",
          effect: (s) => ({
            newStats: { ...s, mental: s.mental - 15 },
            log: "辅导员很生气，后果很严重。心态大崩。"
          })
        }
      ]
    },
    {
      title: "科研灵感",
      description: "你在洗澡时突然想到了一个绝妙的算法方案。",
      options: [
        {
          text: "赶紧记录下来并写成代码",
          effect: (s) => ({
            newStats: { ...s, research: s.research + 10, stamina: s.stamina - 10 },
            log: "科研进度大涨！但你累得够呛。"
          })
        },
        {
          text: "等明天再说",
          effect: (s) => ({
            newStats: s,
            log: "第二天你就忘了。错失良机。"
          })
        }
      ]
    },
    {
      title: "选修课点名",
      description: "你正打算翘掉那门无聊的思政课，结果群里说点名了。",
      options: [
        {
          text: "狂奔去教室",
          effect: (s) => ({
            newStats: { ...s, stamina: s.stamina - 15, mental: s.mental + 5 },
            log: "赶上了点名，顺便复习了下功课。"
          })
        },
        {
          text: "继续睡觉",
          effect: (s) => ({
            newStats: { ...s, mental: s.mental - 10, stamina: s.stamina + 20 },
            log: "旷课被记名，辅导员在群里点名批评。但睡得很香。"
          })
        }
      ]
    },
    {
      title: "夏令营入营",
      description: "你收到了梦寐以求的夏令营入营通知，但面试时间和你最重要的期末考试冲突了。",
      options: [
        {
          text: "去参加夏令营面试（风险大）",
          effect: (s) => ({
            newStats: { ...s, research: s.research + 30, mental: s.mental - 10 },
            log: "面试表现优异，拿到了优秀营员！但这学期的课程你只能靠自学补回来了。"
          })
        },
        {
          text: "稳妥起见，参加期末考试",
          effect: (s) => ({
            newStats: { ...s, mental: s.mental + 10, research: s.research + 5 },
            log: "你保住了这学期的成绩，但错过了这次宝贵的保研机会。"
          })
        }
      ]
    },
    {
      title: "学长建议",
      description: "一位保研成功的学长告诉你，英语六级分数非常重要。",
      options: [
        {
          text: "报个英语冲刺班",
          effect: (s) => ({
            newStats: { ...s, english: s.english + 15, stamina: s.stamina - 10 },
            log: "英语水平大幅提升，保研竞争力加强。"
          })
        },
        {
          text: "自己佛系复习",
          effect: (s) => ({
            newStats: { ...s, english: s.english + 2, mental: s.mental + 5 },
            log: "心态稳如老狗，但英语提升寥寥。"
          })
        }
      ]
    },
    {
      title: "编译器报错",
      description: "你的项目代码在演示前突然报了一个诡异的段错误（Segmentation Fault）。",
      majorRestriction: ["cs"],
      options: [
        {
          text: "通宵Debug",
          effect: (s) => ({
            newStats: { ...s, stamina: s.stamina - 30, research: s.research + 10 },
            log: "你找到了那个该死的指针错误！科研水平提升了。"
          })
        },
        {
          text: "求助大牛学长",
          effect: (s) => ({
            newStats: { ...s, mental: s.mental + 5 },
            moneyChange: -200,
            log: "学长三分钟帮你修好了，但你付出了两顿外卖的代价。"
          })
        }
      ]
    },
    {
      title: "显微镜下的发现",
      description: "在观察样本时，你发现了一个不符合预期的实验现象。",
      majorRestriction: ["biology"],
      options: [
        {
          text: "深入探究原因",
          effect: (s) => ({
            newStats: { ...s, research: s.research + 15, mental: s.mental - 10 },
            log: "这可能是一个潜在的新发现！科研产出大增。"
          })
        },
        {
          text: "当做实验误差忽略",
          effect: (s) => ({
            newStats: { ...s, mental: s.mental + 5 },
            log: "实验继续进行，你节省了时间但错失了可能的突破。"
          })
        }
      ]
    },
    {
      title: "古籍修复机会",
      description: "系里提供了一个参与国家级古籍修复项目的名额。",
      majorRestriction: ["humanities"],
      options: [
        {
          text: "积极申请加入",
          effect: (s) => ({
            newStats: { ...s, research: s.research + 20, stamina: s.stamina - 15 },
            log: "你在修补书页的过程中感受到了历史的厚重。背景大增！"
          })
        },
        {
          text: "太累了，不想去",
          effect: (s) => ({
            newStats: { ...s, mental: s.mental + 10 },
            log: "你选择躺平，享受了一个悠闲的周末。"
          })
        }
      ]
    },
    {
      title: "投行暑期实习面试",
      description: "你获得了一个顶级投行的暑期实习面试机会，但面试官非常严厉。",
      majorRestriction: ["general"],
      options: [
        {
          text: "展现专业深度：深入讨论估值模型",
          effect: (s) => ({
            newStats: { ...s, competition: s.competition + 15, mental: s.mental - 10 },
            log: "面试官对你的专业知识印象深刻！你拿到了实习 Offer。"
          })
        },
        {
          text: "展现综合素质：谈论你的领导力经验",
          effect: (s) => ({
            newStats: { ...s, mental: s.mental + 5, competition: s.competition + 5 },
            log: "面试氛围很愉快，面试官认为你很有潜力。"
          })
        }
      ]
    },
    {
      title: "大厂系统崩溃",
      description: "你正在实习，突然公司核心服务挂了，导师叫你一起排查。",
      majorRestriction: ["cs"],
      options: [
        {
          text: "冷静排查日志，定位 Bug",
          effect: (s) => ({
            newStats: { ...s, research: s.research + 12, stamina: s.stamina - 15 },
            log: "你立了大功！导师在你的实习评语里写下了极高的评价。"
          })
        }
      ]
    },
    {
      title: "实验室经费缩减",
      description: "由于经费问题，你的实验项目可能要暂停。",
      majorRestriction: ["biology"],
      options: [
        {
          text: "熬夜抢在停工前完成关键数据",
          effect: (s) => ({
            newStats: { ...s, research: s.research + 15, stamina: s.stamina - 25 },
            log: "你在最后一刻拿到了数据！虽然累得半死，但保住了进度。"
          })
        },
        {
          text: "撰写申请书，争取额外经费",
          effect: (s) => ({
            newStats: { ...s, mental: s.mental - 10, research: s.research + 5 },
            log: "你学会了如何写申请书，虽然慢了点，但项目得以延续。"
          })
        }
      ]
    },
    {
      title: "芯片流片成功",
      description: "你参与设计的芯片流片回来了，测试结果非常理想！",
      majorRestriction: ["ee"],
      options: [
        {
          text: "申请专利",
          effect: (s) => ({
            newStats: { ...s, research: s.research + 20, mental: s.mental + 10 },
            log: "你拥有了自己的第一项专利，这在保研面试中极具分量。"
          })
        }
      ]
    },
    {
      title: "规培名额争夺",
      description: "顶尖附属医院的规培名额非常有限，你需要证明自己的临床能力。",
      majorRestriction: ["medicine"],
      options: [
        {
          text: "主动请缨参加高难度手术助理",
          effect: (s) => ({
            newStats: { ...s, stamina: s.stamina - 30, competition: s.competition + 15 },
            log: "虽然手术台下你腿都站软了，但你的表现得到了大外科主任的认可。"
          })
        }
      ]
    },
    {
      title: "法律援助中心志愿者",
      description: "学校法律援助中心招募志愿者，处理真实的法律咨询。",
      majorRestriction: ["law"],
      options: [
        {
          text: "积极参与咨询服务",
          effect: (s) => ({
            newStats: { ...s, mental: s.mental + 10, research: s.research + 5 },
            log: "在帮助弱势群体的过程中，你对法律的尊严有了更深的理解。"
          })
        }
      ]
    },
    {
      title: "深夜灵感迸发",
      description: "你在洗手间镜子上画出了那个困扰你半个月的视觉设计方案。",
      majorRestriction: ["art"],
      options: [
        {
          text: "立刻回工作室开机开工",
          effect: (s) => ({
            newStats: { ...s, research: s.research + 25, stamina: s.stamina - 20 },
            log: "这套设计方案最终为你赢得了省级金奖。"
          })
        }
      ]
    },
    {
      title: "学术会议旁听",
      description: "本市有一场顶尖的国际学术会议，但票价昂贵。",
      options: [
        {
          text: "自费买票去开眼界",
          effect: (s) => ({
            newStats: { ...s, research: s.research + 10, mental: s.mental + 5 },
            moneyChange: -800,
            log: "你在茶歇时间鼓起勇气向领域内的大佬请教了一个问题，大佬对你印象很深。"
          })
        },
        {
          text: "在 B 站看直播录像",
          effect: (s) => ({
            newStats: { ...s, research: s.research + 2 },
            log: "白嫖真香，但也错失了线下 Networking 的机会。"
          })
        }
      ]
    },
    {
      title: "深夜外卖中毒",
      description: "为了赶 DDl，你点了一份来路不明的小烧烤，结果凌晨上吐下泻。",
      options: [
        {
          text: "硬扛着继续做",
          effect: (s) => ({
            newStats: { ...s, stamina: s.stamina - 40, mental: s.mental - 10 },
            log: "DDl 赶上了，但你整个人虚脱了，在医院挂了三天水。"
          })
        },
        {
          text: "去校医院，身体第一",
          effect: (s) => ({
            newStats: { ...s, stamina: s.stamina - 15, research: s.research - 5 },
            log: "虽然进度落后了，但你保住了小命。健康才是保研的本钱。"
          })
        }
      ]
    },
    {
      title: "大语言模型热潮",
      description: "LLM 火遍全球，你的导师问你是否愿意转向 AI 方向。",
      majorRestriction: ["cs"],
      options: [
        {
          text: "紧跟潮流，转向 AI",
          effect: (s) => ({
            newStats: { ...s, research: s.research + 15, mental: s.mental - 10 },
            log: "虽然要从头学很多数学，但你站在了风口上。"
          })
        },
        {
          text: "坚守底层，钻研架构",
          effect: (s) => ({
            newStats: { ...s, research: s.research + 20, mental: s.mental + 5 },
            log: "底层技术永远是基石，你的坚持得到了认可，科研深度大幅增加。"
          })
        }
      ]
    },
    {
      title: "实验室炸了（物理）",
      description: "由于学弟的操作失误，实验室的一个仪器轻微爆炸了。",
      majorRestriction: ["biology", "ee"],
      options: [
        {
          text: "冷静处理并灭火",
          effect: (s) => ({
            newStats: { ...s, mental: s.mental + 10, stamina: s.stamina - 15 },
            log: "你的临危不乱让导师非常欣赏，虽然累但值得。"
          })
        },
        {
          text: "吓得赶紧跑路",
          effect: (s) => ({
            newStats: { ...s, mental: s.mental - 20 },
            log: "幸好人没事，但实验室的氛围变得有些尴尬。"
          })
        }
      ]
    },
    {
      title: "深夜食堂的哲学讨论",
      description: "深夜在大排档，你和几个跨专业的哥们聊起了人生。",
      options: [
        {
          text: "痛快畅谈",
          effect: (s) => ({
            newStats: { ...s, mental: s.mental + 20, stamina: s.stamina - 10 },
            log: "思想的火花在酒杯间碰撞，你感觉自己又充满了动力。"
          })
        }
      ]
    },
    {
      title: "名企开放日",
      description: "一所知名企业邀请你去总部参观，但那天正好是你的生日。",
      options: [
        {
          text: "去参观，职业规划重要",
          effect: (s) => ({
            newStats: { ...s, research: s.research + 5, competition: s.competition + 5, stamina: s.stamina - 10 },
            log: "虽然没过成生日，但你拿到了 HR 的直通卡联系方式。"
          })
        },
        {
          text: "拒绝邀请，给自己放假",
          effect: (s) => ({
            newStats: { ...s, mental: s.mental + 30, stamina: s.stamina + 20 },
            log: "这一天你过得非常开心，彻底放松了身心。"
          })
        }
      ]
    },
    {
      title: "考公 vs 保研",
      description: "家里人一直劝你放弃保研去准备考公，理由是稳当。",
      options: [
        {
          text: "坚持自己的科研梦",
          effect: (s) => ({
            newStats: { ...s, research: s.research + 10, mental: s.mental - 15 },
            log: "顶着压力前进，你的信念更加坚定了。"
          })
        },
        {
          text: "两手都要抓",
          effect: (s) => ({
            newStats: { ...s, stamina: s.stamina - 35, mental: s.mental - 25, research: s.research + 5, competition: s.competition + 5 },
            log: "太累了，你几乎没有睡眠时间，但你的履历变得异常丰富。"
          })
        }
      ]
    },
    {
      title: "跨学科项目邀请",
      description: "一个设计专业的学妹邀请 you 加入她们的跨学科项目组，开发一个艺术 AI。",
      majorRestriction: ["cs", "art"],
      options: [
        {
          text: "欣然接受，跨界融合",
          effect: (s) => ({
            newStats: { ...s, research: s.research + 15, mental: s.mental + 10 },
            log: "跨学科的视角让你对专业有了全新的理解，还收获了一段友谊。"
          })
        }
      ]
    },
    {
      title: "开源项目贡献",
      description: "你发现一个知名开源项目有个明显的 Bug，打算提交一个 PR。",
      majorRestriction: ["cs"],
      options: [
        {
          text: "仔细分析，提交修复",
          effect: (s) => ({
            newStats: { ...s, research: s.research + 12, mental: s.mental + 5 },
            log: "你的 PR 被合并了！简历上的开源贡献亮眼了不少。"
          })
        },
        {
          text: "太复杂了，放弃",
          effect: (s) => ({
            newStats: s,
            log: "你决定还是先专注自己的项目。"
          })
        }
      ]
    },
    {
      title: "社团招新季",
      description: "作为社团骨干，你需要负责招新宣传工作，这非常占用时间。",
      options: [
        {
          text: "全力投入，锻炼能力",
          effect: (s) => ({
            newStats: { ...s, mental: s.mental + 15, stamina: s.stamina - 20, competition: s.competition + 5 },
            log: "招新很成功，你提升了组织能力，但也感到精疲力竭。"
          })
        },
        {
          text: "划水应付，专注学习",
          effect: (s) => ({
            newStats: { ...s, stamina: s.stamina + 5, mental: s.mental - 5 },
            log: "你保住了体力，但社团同伴对你的评价变差了。"
          })
        }
      ]
    },
    {
      title: "食堂偶遇导师",
      description: "在食堂排队时，你刚好排在导师后面。",
      options: [
        {
          text: "上前打招呼并聊聊进度",
          effect: (s) => ({
            newStats: { ...s, research: s.research + 8, mental: s.mental + 5 },
            log: "导师对你的主动和进度非常满意，给了你一些关键建议。"
          })
        },
        {
          text: "假装没看见，换个窗口",
          effect: (s) => ({
            newStats: { ...s, stamina: s.stamina - 5 },
            log: "你避开了尴尬，但错失了一个非正式交流的机会。"
          })
        }
      ]
    },
    {
      title: "期刊审稿邀请",
      description: "你之前发表的论文引起了关注，某二区期刊邀请你担任审稿人。",
      majorRestriction: ["cs", "biology", "ee"],
      options: [
        {
          text: "认真审稿，提升眼界",
          effect: (s) => ({
            newStats: { ...s, research: s.research + 15, stamina: s.stamina - 15 },
            log: "通过审视别人的工作，你对科研严谨性有了更深的理解。"
          })
        }
      ]
    },
    {
      title: "校内黑客松",
      description: "学校举办 24 小时黑客松比赛，主题是‘科技改变校园’。",
      options: [
        {
          text: "组队参加，通宵奋战",
          effect: (s) => ({
            newStats: { ...s, competition: s.competition + 20, stamina: s.stamina - 35, mental: s.mental + 10 },
            log: "你们的作品获得了二等奖！虽然累坏了，但成就感满满。"
          })
        },
        {
          text: "作为观众去看看",
          effect: (s) => ({
            newStats: { ...s, mental: s.mental + 5 },
            log: "你看到很多有趣的想法，拓宽了思路。"
          })
        }
      ]
    },
    {
      title: "英语演讲比赛",
      description: "‘外研社杯’英语演讲比赛开始报名了，这对提升英语背景很有利。",
      options: [
        {
          text: "报名参加并认真准备",
          effect: (s) => ({
            newStats: { ...s, english: s.english + 15, mental: s.mental - 10, stamina: s.stamina - 10 },
            log: "你进入了决赛，英语水平和自信心都得到了极大提升。"
          })
        }
      ]
    },
    {
      title: "突然的停电",
      description: "宿舍突然停电了，你的台式机强制关机，且不知道什么时候恢复。",
      options: [
        {
          text: "去图书馆抢带插座的位置",
          effect: (s) => ({
            newStats: { ...s, stamina: s.stamina - 10, research: s.research + 2 },
            log: "虽然折腾，但你保住了学习节奏。"
          })
        },
        {
          text: "直接上床睡觉",
          effect: (s) => ({
            newStats: { ...s, stamina: s.stamina + 20, mental: s.mental + 5 },
            log: "这波是天意，你难得享受了一个早睡的夜晚。"
          })
        }
      ]
    },
    {
      title: "健身房偶遇",
      description: "你在健身房遇到了系里的学霸，他正在卧推。",
      options: [
        {
          text: "一起锻炼并交流心得",
          effect: (s) => ({
            newStats: { ...s, stamina: s.stamina + 10, mental: s.mental + 10, research: s.research + 2 },
            log: "健康的体魄是保研的本钱，你们还聊了一些专业话题。"
          })
        }
      ]
    },
    {
      title: "论文被拒",
      description: "你满怀期待提交的论文被顶会拒了，审稿意见非常刻薄。",
      options: [
        {
          text: "痛定思痛，认真修改",
          effect: (s) => ({
            newStats: { ...s, research: s.research + 10, mental: s.mental - 15 },
            log: "科研之路从来不是一帆风顺的，你学会了从失败中吸取教训。"
          })
        },
        {
          text: "借酒消愁，怀疑人生",
          effect: (s) => ({
            newStats: { ...s, mental: s.mental - 30, stamina: s.stamina - 10 },
            log: "你沉沦了几天，感觉保研之路变得迷茫了。"
          })
        }
      ]
    },
    {
      title: "实验室开放日志愿者",
      description: "学院举办实验室开放日，导师希望你能去做志愿者讲解员。",
      options: [
        {
          text: "热情讲解",
          effect: (s) => ({
            newStats: { ...s, research: s.research + 5, mental: s.mental + 10, stamina: s.stamina - 10 },
            log: "你的表现得到了导师和参观者的共同称赞，人际关系提升。"
          })
        }
      ]
    },
    {
      title: "参与编写教材",
      description: "你的专业课老师正在编写一本新教材，邀请你负责其中一个章节的资料整理。",
      options: [
        {
          text: "协助编写，严谨治学",
          effect: (s) => ({
            newStats: { ...s, research: s.research + 10, mental: s.mental + 5, stamina: s.stamina - 15 },
            log: "虽然工作量很大，但你的名字出现在了教材的致谢名单里。"
          })
        }
      ]
    },
    {
      title: "专业课补考传闻",
      description: "听说某门极难的专业课有一半人没及格，大家都在人心惶惶。",
      options: [
        {
          text: "帮同学复习，缓解焦虑",
          effect: (s) => ({
            newStats: { ...s, mental: s.mental + 15, stamina: s.stamina - 10 },
            log: "你不仅巩固了知识，还成了班里的‘救世主’。"
          })
        },
        {
          text: "庆幸自己考得还不错",
          effect: (s) => ({
            newStats: { ...s, mental: s.mental + 5 },
            log: "你松了一口气，继续投入到下一步计划中。"
          })
        }
      ]
    },
    {
      title: "目标院校宣讲会",
      description: "你心仪的院校来校开宣讲会，现场座无虚席。",
      options: [
        {
          text: "挤进前排提问",
          effect: (s) => ({
            newStats: { ...s, mental: s.mental + 10, research: s.research + 3 },
            log: "招生老师记住了你的名字，并给了你一份详细的申请指南。"
          })
        }
      ]
    },
    {
      title: "收到导师的回信",
      description: "你之前试探性发出的联系邮件，竟然收到了大牛导师的亲笔回信！",
      options: [
        {
          text: "激动地反复研读",
          effect: (s) => ({
            newStats: { ...s, mental: s.mental + 20 },
            log: "导师表示对你的简历很感兴趣，这让你信心倍增。"
          })
        }
      ]
    },
    {
      title: "学术圈的大瓜",
      description: "领域内某位‘大牛’被曝论文造假，引起了学术界的震动。",
      options: [
        {
          text: "引以为戒，端正态度",
          effect: (s) => ({
            newStats: { ...s, mental: s.mental + 5, research: s.research + 2 },
            log: "你深刻认识到学术诚信的重要性，研究态度更加严谨了。"
          })
        }
      ]
    },
    {
      title: "实验室年终聚餐",
      description: "实验室组织大家吃火锅，氛围非常轻松。",
      options: [
        {
          text: "与师兄师姐交流心得",
          effect: (s) => ({
            newStats: { ...s, mental: s.mental + 15, research: s.research + 5 },
            log: "在酒足饭饱之余，你学到了很多实验室的‘生存法则’。"
          })
        }
      ]
    },
    {
      title: "发现论文被引用",
      description: "你在刷 Google Scholar 时，惊讶地发现自己的论文被一篇顶刊引用了！",
      options: [
        {
          text: "发个朋友圈庆祝一下",
          effect: (s) => ({
            newStats: { ...s, research: s.research + 10, mental: s.mental + 10 },
            log: "你的学术影响力正在慢慢扩大，这种感觉太棒了。"
          })
        }
      ]
    },
    {
      title: "暑期社会实践",
      description: "你带队前往偏远地区进行教育调研。",
      options: [
        {
          text: "深入基层，撰写报告",
          effect: (s) => ({
            newStats: { ...s, competition: s.competition + 10, stamina: s.stamina - 20, mental: s.mental + 15 },
            log: "这段经历丰富了你的社会阅历，调研报告还获得了校级表彰。"
          })
        }
      ]
    },
    {
      title: "校园网炸了",
      description: "正要在截止日期前提交申请材料，校园网突然崩溃了。",
      options: [
        {
          text: "用手机热点强行上传",
          effect: (s) => ({
            newStats: { ...s, mental: s.mental - 10, moneyChange: -50 },
            log: "虽然多花了几十块流量费，但总算在最后一刻交上了。"
          })
        }
      ]
    },
  ];

  const SHOP_ITEMS = [
    { name: "红牛", description: "补充体力，熬夜神器。", cost: 20, limit: 7, effect: (prev: GameState) => ({ ...prev, stats: { ...prev.stats, stamina: Math.min(100, prev.stats.stamina + 20) } }) },
    { name: "心理咨询", description: "缓解压力，重拾信心。", cost: 200, limit: 2, effect: (prev: GameState) => ({ ...prev, stats: { ...prev.stats, mental: Math.min(100, prev.stats.mental + 40) } }) },
    { name: "AI助手", description: "显著提高本周获取科研、竞赛、掌握度的效率。", cost: 140, limit: 1, effect: (prev: GameState) => ({ ...prev, masteryEfficiency: prev.masteryEfficiency + 0.5, researchEfficiency: prev.researchEfficiency + 0.5, competitionEfficiency: prev.competitionEfficiency + 0.5 }) },
    { name: "闲鱼卖家", description: "花费重金获取随机一项科研或竞赛简历内容。", cost: 3000, effect: (prev: GameState) => {
      const isResearch = Math.random() > 0.5;
      const projectNames = ["闲鱼淘来的科研项目", "代写的实验室课题", "购买的学术论文", "二手发明专利", "外包科研项目", "挂名的大创项目", "买来的校企合作"];
      const compNames = ["闲鱼代打竞赛奖项", "买来的省级荣誉", "挂名的行业赛奖", "购买的校级一等奖", "代办的国际奖项", "付费获得的黑客马拉松优胜", "代写的数学建模二等奖"];
      
      const newItem: ResumeItem = {
        id: Math.random().toString(36).substr(2, 9),
        type: isResearch ? 'research' : 'competition',
        name: isResearch ? projectNames[Math.floor(Math.random() * projectNames.length)] : compNames[Math.floor(Math.random() * compNames.length)],
        score: 10 + Math.floor(Math.random() * 10), // 闲鱼买来的分数稍低一些
        quality: 'common' // 添加quality属性
      };
      
      return {
        ...prev,
        resume: [...prev.resume, newItem]
      };
    } },
  ];

  const buyItem = (item: any) => {
    const currentCount = state.purchaseCounts?.[item.name] || 0;
    
    if (item.limit && currentCount >= item.limit) {
      addLog(`${item.name}本周限购${item.limit}次，下周再来吧。`);
      return;
    }
    
    if (state.money < item.cost) {
      addLog(`钱不够了，买不起${item.name}。`);
      return;
    }
    
    setState(prev => {
      const newState = item.effect(prev);
      const newCounts = { ...prev.purchaseCounts };
      newCounts[item.name] = (newCounts[item.name] || 0) + 1;
      
      return {
        ...newState,
        money: prev.money - item.cost,
        purchaseCounts: newCounts,
        logs: [...prev.logs, `购买了[${item.name}]。${item.description}`]
      };
    });
  };

  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.logs]);

  const addLog = (msg: string) => {
    setState(prev => ({
      ...prev,
      logs: [...prev.logs, msg]
    }));
  };

  const refreshPotentialMentors = () => {
    if (state.stats.stamina < 5) {
      addLog("体力不足，无法刷新导师名单（需要 5 点体力）。");
      return;
    }
    setState(prev => ({
      ...prev,
      stats: { ...prev.stats, stamina: prev.stats.stamina - 5 },
      potentialMentors: generateNewMentorBatch(3, prev.majorType),
      logs: [...prev.logs, "你花费了 5 点体力，四处打听，联系了一些新的导师。"]
    }));
  };

  const startContactingMentor = (mentor: Mentor) => {
    if (state.stats.stamina < 20) {
      addLog("体力不足，无法开始套磁（需要 20 体力）。");
      return;
    }
    setState(prev => ({
      ...prev,
      stats: { ...prev.stats, stamina: prev.stats.stamina - 20 },
      potentialMentors: prev.potentialMentors.filter(m => m.id !== mentor.id),
      mentors: [...prev.mentors, { ...mentor, status: 'contacting' }],
      logs: [...prev.logs, `你开始尝试联系 ${mentor.university} ${mentor.school} 的 ${mentor.name} 教授（研究方向：${mentor.researchField}）。`]
    }));
  };

  const handleTaoci = (mentorId: string) => {
    setState(prev => {
      const mentor = prev.mentors.find(m => m.id === mentorId);
      if (!mentor || (mentor.status !== 'contacting' && mentor.status !== 'fish_pond')) return prev;
      
      if (prev.stats.stamina < 15) {
        addLog("体力不足，无法进行套磁（需要 15 体力）。");
        return prev;
      }

      // 基础成功率由 绩点、简历分 决定
      // 绩点权重：4.0 GPA ≈ 80% 贡献
      // 简历权重：100 简历分 ≈ 20% 贡献
      const resumeScore = prev.resume.reduce((sum, item) => sum + item.score, 0);
      const baseStatsPower = (prev.stats.gpa * 20) + (resumeScore * 0.2);
      
      // 难度系数：声望越高，门槛越高
      // 50声望 -> 系数 1.2
      // 100声望 -> 系数 0.6
      const difficultyFactor = Math.max(0.5, 1.5 - (mentor.reputation / 100));
      
      let successChance = baseStatsPower * difficultyFactor;
      
      // 限制在 5% - 95% 之间
      successChance = Math.min(95, Math.max(5, successChance));

      const roll = Math.random() * 100;
      
      let newStatus: MentorStatus = 'rejected';
      let message = "";
      
      // 铁 offer 概率为成功概率的 15%
      if (roll < successChance * 0.15) {
        newStatus = 'hard_offer';
        message = `${mentor.name}教授对你的表现非常满意，明确表示：“只要你拿到推免资格，我这边的名额一定给你。”这就是传说中的铁Offer！`;
      } else if (roll < successChance) {
        newStatus = 'verbal_offer';
        message = `${mentor.name}教授给了你口头承诺，但提醒你：“今年优秀的学生很多，你还需要在夏令营/预推免中证明自己。”（拿到口头Offer，但有被放鸽子的风险）`;
      } else if (roll < successChance + 25) {
        newStatus = 'fish_pond';
        message = `${mentor.name}教授回复了你的邮件，表示：“欢迎报考我的研究生，请关注后续的夏令营通知。”（典型的客套话，你被放入了“鱼塘”）`;
      } else {
        newStatus = 'rejected';
        message = `${mentor.name}教授婉拒了你，理由是：“今年课题组名额已满，建议你联系其他优秀的老师。”`;
      }
      
      return {
        ...prev,
        stats: { ...prev.stats, stamina: prev.stats.stamina - 15 },
        mentors: prev.mentors.map(m => m.id === mentorId ? { ...m, status: newStatus } : m),
        logs: [...prev.logs, `套磁结果: ${message}`]
      };
    });
  };

  const handleMentorInteraction = (mentorId: string) => {
    setState(prev => {
      const mentor = prev.mentors.find(m => m.id === mentorId);
      if (!mentor) return prev;
      
      const friendshipGain = Math.floor(Math.random() * 5) + 5;
      const researchGain = Math.floor(mentor.reputation / 20);
      
      return {
        ...prev,
        mentors: prev.mentors.map(m => m.id === mentorId ? { ...m, friendship: Math.min(100, m.friendship + friendshipGain) } : m),
        stats: { ...prev.stats, research: Math.min(100, prev.stats.research + researchGain), stamina: Math.max(0, prev.stats.stamina - 10) },
        logs: [...prev.logs, `你与${mentor.name}进行了深度交流。亲密度+${friendshipGain}，科研能力+${researchGain}。`]
      };
    });
  };
  const handleAction = (action: Action) => {
    if (state.isGameOver) return;
    
    setState(prev => {
      const isSelected = prev.selectedActions.some(a => a.name === action.name);
      if (isSelected) {
        return {
          ...prev,
          selectedActions: prev.selectedActions.filter(a => a.name !== action.name)
        };
      } else {
        // 限制最多选择 3 个行动，避免数值爆炸
        if (prev.selectedActions.length >= 3) {
          addLog("每周最多只能安排 3 项重点计划。");
          return prev;
        }
        return {
          ...prev,
          selectedActions: [...prev.selectedActions, action]
        };
      }
    });
  };

  const handleNextWeek = () => {
    if (state.isGameOver) return;

    setState(prev => {
      let newStats = { ...prev.stats };
      let newSocial = { ...prev.social };
      let newMoney = prev.money;
      let weeklyLogs: string[] = [];
      let weeklyGains: any = {};

      // 检查总消耗是否超出
      let totalStaminaCost = 0;
      let totalMentalCost = 0;
      let totalMoneyCost = 0;

      prev.selectedActions.forEach(action => {
        if (action.cost.stamina) totalStaminaCost += Math.abs(action.cost.stamina);
        if (action.cost.mental) totalMentalCost += Math.abs(action.cost.mental);
        if (action.cost.money) totalMoneyCost += action.cost.money;
      });

      if (newStats.stamina < totalStaminaCost) {
        return { ...prev, logs: [...prev.logs, "总体力不足以支持本周的所有计划，请重新安排。"] };
      }
      if (newStats.mental < totalMentalCost) {
        return { ...prev, logs: [...prev.logs, "心态过差，无法支撑本周的所有计划，请重新安排。"] };
      }
      if (newMoney < totalMoneyCost) {
        return { ...prev, logs: [...prev.logs, "金钱不足以支持本周的所有计划，请重新安排。"] };
      }

      // 结算各项行动
      let updatedCourses = [...prev.courses];
      prev.selectedActions.forEach(action => {
        // Apply gains
        Object.entries(action.gain).forEach(([key, val]) => {
          if (key === 'mastery') {
            const baseGain = (val || 0) * prev.masteryEfficiency * 1.5;
            // 心态影响效率：心态越高，学习效率越高。范围约 0.6x - 1.4x
            const mentalEfficiency = (newStats.mental / 100) * 0.8 + 0.6;
            const totalGain = baseGain * mentalEfficiency;
            
            const coursesToLearn = updatedCourses.filter(c => c.mastery < 100);
            if (coursesToLearn.length > 0) {
              // 根据课程难度调配：难度越高的课程，分配到的学习增益比例越高
              const totalDifficulty = coursesToLearn.reduce((sum, c) => sum + (c.difficulty || 3), 0);
              
              updatedCourses = updatedCourses.map(c => {
                if (c.mastery >= 100) return c;
                
                const difficultyWeight = (c.difficulty || 3) / totalDifficulty;
                // 增加一点随机性，但整体趋势随难度增加
                const randomFactor = 0.8 + Math.random() * 0.4; 
                const currentGain = totalGain * difficultyWeight * randomFactor;
                
                return {
                  ...c,
                  mastery: Math.min(100, c.mastery + currentGain)
                };
              });
            }
            weeklyGains.mastery = (weeklyGains.mastery || 0) + totalGain;
            return;
          }
          if (key === 'money') {
            newMoney += (val || 0);
            weeklyGains.money = (weeklyGains.money || 0) + (val || 0);
            return;
          }
          const k = key as keyof PlayerStats;
          let gainVal = val || 0;
          
          // 应用 AI 助手的效率加成
          if (k === 'research') gainVal *= prev.researchEfficiency;
          if (k === 'competition') gainVal *= prev.competitionEfficiency;

          if (gainVal > 0) {
            weeklyGains[k] = (weeklyGains[k] || 0) + gainVal;
          }
          newStats[k] = Math.min(k === 'gpa' ? 4.5 : 100, Math.max(0, newStats[k] + gainVal));
        });

        // Apply costs
        Object.entries(action.cost).forEach(([key, val]) => {
          if (key === 'money') {
            newMoney -= (val || 0);
            return;
          }
          const k = key as keyof PlayerStats;
          newStats[k] = Math.min(k === 'gpa' ? 4.5 : 100, Math.max(0, newStats[k] - Math.abs(val || 0)));
        });

        // Apply social gains
        if (action.socialGain) {
          Object.entries(action.socialGain).forEach(([key, val]) => {
            const k = key as keyof typeof prev.social;
            const gainVal = val || 0;
            if (gainVal > 0) {
              weeklyGains[k] = (weeklyGains[k] || 0) + gainVal;
            }
            newSocial[k] = Math.min(100, newSocial[k] + gainVal);
          });
        }

        // Special logic for "做兼职" (额外随机收益)
        if (action.name === "做兼职") {
          const extraGain = Math.floor(Math.random() * 300);
          newMoney += extraGain;
          weeklyGains.money = (weeklyGains.money || 0) + extraGain;
          weeklyLogs.push(`做兼职表现出色，额外赚到了 ${extraGain} 元。`);
        }

        weeklyLogs.push(`${action.name}: ${action.description}`);
      });

      // --- 生活费逻辑 ---
      // 每周常规支出 (300元)
      const weeklyExpense = 300;
      newMoney -= weeklyExpense;
      weeklyLogs.push(`本周生活费支出：${weeklyExpense}元。`);

      // 每月生活费到账 (第1、5、9、13、17周视为月初，发放1500元)
      if ([1, 5, 9, 13, 17].includes(prev.week)) {
        const allowance = 1500;
        newMoney += allowance;
        weeklyLogs.push(`月初了，家里寄来的生活费 ${allowance} 元已到账。`);
      }

      // --- 个人简历系统：科研/竞赛值满后转化为简历项 ---
      let newResume = [...prev.resume];
      if (newStats.research >= 100) {
        newStats.research = 0;
        const roll = Math.random() * 100;
        let quality: ResumeQuality = 'common';
        if (roll < 3) quality = 'legendary';
        else if (roll < 15) quality = 'epic';
        else if (roll < 50) quality = 'rare';
        
        const possibleItems = RESUME_DATA_POOL.research.filter(i => i.quality === quality);
        const item = possibleItems[Math.floor(Math.random() * possibleItems.length)];
        const score = item.scoreRange[0] + Math.floor(Math.random() * (item.scoreRange[1] - item.scoreRange[0] + 1));

        newResume.push({
          id: Math.random().toString(36).substr(2, 9),
          type: 'research',
          name: item.name,
          quality: item.quality,
          score: score
        });
        weeklyLogs.push(`🎉 你的科研积累达到了顶峰，完成了一项【${quality}】品质的科研成果：${item.name}！`);
      }
      if (newStats.competition >= 100) {
        newStats.competition = 0;
        const roll = Math.random() * 100;
        let quality: ResumeQuality = 'common';
        if (roll < 3) quality = 'legendary';
        else if (roll < 15) quality = 'epic';
        else if (roll < 50) quality = 'rare';
        
        const possibleItems = RESUME_DATA_POOL.competition.filter(i => i.quality === quality);
        const item = possibleItems[Math.floor(Math.random() * possibleItems.length)];
        const score = item.scoreRange[0] + Math.floor(Math.random() * (item.scoreRange[1] - item.scoreRange[0] + 1));

        newResume.push({
          id: Math.random().toString(36).substr(2, 9),
          type: 'competition',
          name: item.name,
          quality: item.quality,
          score: score
        });
        weeklyLogs.push(`🎉 你的竞赛积累达到了顶峰，获得了一项【${quality}】品质的竞赛荣誉：${item.name}！`);
      }

      const nextWeek = prev.week + 1;
      let nextSemester = prev.semester;
      let week = nextWeek;
      let phase = prev.phase;
      let activeExam = null;
      let updatedMentors = [...prev.mentors];
      let showExamReport = false;
      let examReport = null;

      // Exam triggering & GPA calculation
      if (week === 9 || week === 18) {
        // 考试周
        const type = week === 9 ? 'midterm' : 'final';
        
        // 生成成绩单
        const results = updatedCourses.map(course => {
          const mentalFactor = 0.8 + (newStats.mental / 100) * 0.4; // 提升下限 0.8 to 1.2
          const randomFactor = 0.9 + Math.random() * 0.2; // 提升下限 0.9 to 1.1
          
          // 期中考试优化：对课程掌握度的要求减半
          const effectiveMastery = type === 'midterm' ? Math.min(100, course.mastery * 2) : course.mastery;
          
          // 基础分 40 + 掌握度折算，让及格更容易
          let score = 40 + (effectiveMastery * 0.6) * mentalFactor * randomFactor;
          
          // 难度影响降低
          score -= (course.difficulty - 3) * 3;
          score = Math.min(100, Math.max(0, score));
          
          let grade = 'F';
          let gradePoint = 0;
          if (score >= 95) { grade = 'A+'; gradePoint = 4.3; }
          else if (score >= 90) { grade = 'A'; gradePoint = 4.0; }
          else if (score >= 85) { grade = 'A-'; gradePoint = 3.7; }
          else if (score >= 80) { grade = 'B+'; gradePoint = 3.3; }
          else if (score >= 75) { grade = 'B'; gradePoint = 3.0; }
          else if (score >= 70) { grade = 'B-'; gradePoint = 2.7; }
          else if (score >= 65) { grade = 'C+'; gradePoint = 2.3; }
          else if (score >= 60) { grade = 'C'; gradePoint = 2.0; }
          else if (score >= 50) { grade = 'D'; gradePoint = 1.0; } // 增加 D 等级，防止直接 0 绩点
          
          return {
            courseName: course.name,
            score: Math.round(score),
            grade,
            credit: course.credit,
            gradePoint
          };
        });

        if (type === 'final') {
          const totalCredits = results.length > 0 ? results.reduce((sum, r) => sum + r.credit, 0) : 1;
          const weightedGP = results.reduce((sum, r) => sum + r.gradePoint * r.credit, 0);
          const semesterGpa = weightedGP / totalCredits;
          
          const oldGpa = newStats.gpa;
          // 累计绩点计算：确保分母不为 0
          const updatedGpa = (oldGpa === 0 || nextSemester === 1) ? semesterGpa : (oldGpa * (nextSemester - 1) + semesterGpa) / nextSemester;
          
          examReport = {
            results,
            prevGpa: oldGpa,
            newGpa: updatedGpa,
            semesterName: SEMESTER_NAMES[nextSemester - 1]
          };
          newStats.gpa = Number(updatedGpa.toFixed(2));
          showExamReport = true;
          weeklyLogs.push(`期末考试结束！你的绩点变动为: ${oldGpa.toFixed(2)} -> ${updatedGpa.toFixed(2)}`);
        } else {
          // 期中考试不计入总绩点，只给反馈
          examReport = {
            results,
            prevGpa: newStats.gpa,
            newGpa: newStats.gpa,
            semesterName: SEMESTER_NAMES[nextSemester - 1] + " (期中)"
          };
          showExamReport = true;
          weeklyLogs.push(`期中考试结束，快去看看你的成绩单吧。`);
        }
      }

      // Semester transition
      if (nextWeek > 18) {
        week = 1;
        nextSemester += 1;
        
        // 新学期：自动加入必修课
        const nextCompulsory = ALL_COURSES.filter(c => 
          c.semester === nextSemester && 
          c.type === 'compulsory' && 
          (!c.majorRestriction || c.majorRestriction.includes(prev.majorType))
        );
        
        // 如果没有专业必修课，尝试找通识必修课或兜底必修课
        if (nextCompulsory.length === 0) {
          nextCompulsory.push(...ALL_COURSES.filter(c => 
            c.semester === nextSemester && 
            c.type === 'compulsory' && 
            (c.id.startsWith('gen') || c.id.startsWith('def'))
          ));
        }
        
        updatedCourses = nextCompulsory; 
        
        // --- 导师系统更新：处理“放鸽子”逻辑 ---
        updatedMentors = prev.mentors.map(m => {
          if (m.status === 'verbal_offer' && Math.random() < 0.2) {
            return { ...m, status: 'fish_pond' as MentorStatus };
          }
          return m;
        });
        
        const revokedMentors = updatedMentors.filter((m, i) => m.status === 'fish_pond' && prev.mentors[i].status === 'verbal_offer');
        revokedMentors.forEach(m => {
          weeklyLogs.push(`糟糕！${m.university || '本校'}的${m.name}似乎反悔了之前的口头承诺，把你放入了候补名单（养鱼）。`);
        });

        if (nextSemester === 6) {
          phase = 'summer_camp';
          weeklyLogs.push(`--- 进入大三下学期，保研夏令营申请开启！ ---`);
        } else if (nextSemester === 7) {
          phase = 'pre_recommendation';
          weeklyLogs.push(`--- 预推免阶段开启，最后的冲刺！ ---`);
        } else {
          phase = 'course_selection';
          weeklyLogs.push(`--- ${SEMESTER_NAMES[nextSemester - 2]} 结束，进入新学期 ---`);
        }
      }

      let isGameOver = nextSemester > 7;
      let gameMessage = "";
      let endingStats = prev.endingStats;

      if (newStats.stamina <= 0) {
        isGameOver = true;
        gameMessage = "你因为体力过度透支，生了一场大病，遗憾错过了保研季。";
      } else if (newStats.mental <= 0) {
        isGameOver = true;
        gameMessage = "你因为压力过大导致心态崩溃，决定放弃保研，回家修养。";
      } else if (isGameOver) {
        const outcome = calculateOutcome(newStats);
        endingStats = outcome;
        gameMessage = outcome.title + "\n" + outcome.detail;
      }

      // Random Event Check (15% chance)
      let currentEvent = null;
      if (!isGameOver && Math.random() < 0.15 && !showExamReport) {
        const eligibleEvents = RANDOM_EVENTS.filter(e => 
          !e.majorRestriction || e.majorRestriction.includes(prev.majorType)
        );
        currentEvent = eligibleEvents[Math.floor(Math.random() * eligibleEvents.length)];
      }

      return {
        ...prev,
        week,
        semester: nextSemester,
        phase,
        stats: newStats,
        social: newSocial,
        money: newMoney,
        resume: newResume,
        courses: updatedCourses,
        activeExam,
        showExamReport,
        examReport,
        mentors: updatedMentors,
        isGameOver,
        gameMessage,
        endingStats,
        currentEvent,
        masteryEfficiency: 1.0,   // 重置效率倍率
        researchEfficiency: 1.0,
        competitionEfficiency: 1.0,
        selectedActions: [], // 清空已选行动
        weekSummary: {
          gains: weeklyGains,
          logs: weeklyLogs
        },
        showWeeklySummary: !showExamReport,
        purchaseCounts: {},
        logs: [...prev.logs, `第 ${prev.week} 周结算完成。`, ...weeklyLogs]
      };
    });
  };

  const handleSkipToSummerCamp = () => {
    // 获取大三下学期（第6学期）的必修课
    const semester6Compulsory = ALL_COURSES.filter(c => 
      c.semester === 6 && 
      c.type === 'compulsory' && 
      (!c.majorRestriction || c.majorRestriction.includes(state.majorType))
    );

    setState(prev => ({
      ...prev,
      semester: 6,
      week: 1,
      phase: 'summer_camp',
      courses: semester6Compulsory,
      stats: {
        ...prev.stats,
        gpa: Math.max(prev.stats.gpa, 3.8 + Math.random() * 0.4),
        english: Math.max(prev.stats.english, 85),
        stamina: 100,
        mental: 100
      },
      money: Math.max(prev.money, 3000),
      social: {
        ...prev.social,
        seniors: Math.max(prev.social.seniors, 80)
      },
      resume: [
        ...prev.resume,
        { id: 'skip-1', type: 'research' as const, name: '大三实验室科研项目', score: 40, quality: 'rare' as const },
        { id: 'skip-2', type: 'competition' as const, name: '全国大学生数学建模竞赛二等奖', score: 50, quality: 'epic' as const }
      ].slice(0, 10), // 避免重复添加
      logs: [...prev.logs, "--- 已使用调试功能跳过至夏令营阶段 ---", "你的各项属性已根据大三学霸的标准进行了同步提升。"]
    }));
  };

  const handleSkipToPreRecommendation = () => {
    // 获取大四上学期（第7学期）的必修课
    const semester7Compulsory = ALL_COURSES.filter(c => 
      c.semester === 7 && 
      c.type === 'compulsory' && 
      (!c.majorRestriction || c.majorRestriction.includes(state.majorType))
    );

    setState(prev => ({
      ...prev,
      semester: 7,
      week: 1,
      phase: 'pre_recommendation',
      courses: semester7Compulsory,
      stats: {
        ...prev.stats,
        gpa: Math.max(prev.stats.gpa, 4.0 + Math.random() * 0.3),
        english: Math.max(prev.stats.english, 90),
        stamina: 100,
        mental: 100
      },
      money: Math.max(prev.money, 4000),
      social: {
        ...prev.social,
        seniors: Math.max(prev.social.seniors, 90)
      },
      resume: [
        ...prev.resume,
        { id: 'skip-3', type: 'research' as const, name: 'SCI/EI 核心期刊论文发表', score: 80, quality: 'epic' as const },
        { id: 'skip-4', type: 'competition' as const, name: '全国大学生计算机设计大赛一等奖', score: 70, quality: 'epic' as const }
      ].slice(0, 15),
      logs: [...prev.logs, "--- 已使用调试功能跳过至预推免阶段 ---", "你的各项属性已根据保研大佬的标准进行了同步提升。"]
    }));
  };

  const handleSkipToGameOver = () => {
    setState(prev => {
      const finalStats = {
        ...prev.stats,
        gpa: Math.max(prev.stats.gpa, 4.1),
        research: Math.max(prev.stats.research, 80),
        competition: Math.max(prev.stats.competition, 80)
      };
      
      const outcome = calculateOutcome(finalStats);
      
      return {
        ...prev,
        semester: 8,
        isGameOver: true,
        endingStats: outcome,
        gameMessage: outcome.title + "\n" + outcome.detail,
        logs: [...prev.logs, "--- 已使用调试功能跳过至游戏结局 ---"]
      };
    });
  };

  const getTierValue = (tier: string) => {
    switch (tier) {
      case 'T0': return 6;
      case 'T1': return 5;
      case 'T2': return 4;
      case 'T3': return 3;
      case 'T4': return 2;
      case 'T5': return 1;
      default: return 1;
    }
  };

  const handleApplication = (uni: University, phase: 'summer_camp' | 'pre_recommendation') => {
    // 简历分计算
    const resumeScore = state.resume.reduce((sum, item) => sum + item.score, 0);
    
    // 院校背景评估
    const playerUni = UNIVERSITIES.find(u => u.name === state.university);
    const playerTier = getTierValue(playerUni?.tier || 'T4');
    const targetTier = getTierValue(uni.tier);
    
    // 背景得分：如果本校等级 >= 目标等级，得分高；否则根据差距扣分
    // 基础背景分 100，每差一级扣 15 分
    const backgroundScoreBase = Math.max(0, 100 - Math.max(0, targetTier - playerTier) * 15);
    
    // 本人综合成功率影响（作为心态和整体竞争力的体现）
    const estimatedChance = calculateSuccessChance();
    
    // 重新分配权重（用于初筛）：
    // GPA (25%), 简历 (25%), 院校背景 (20%), 英语 (10%), 人脉 (10%), 综合成功率预估 (10%)
    let successChance = 
      (state.stats.gpa / 4.5) * 0.25 + 
      (resumeScore / 200) * 0.25 + 
      (backgroundScoreBase / 100) * 0.20 + 
      (state.stats.english / 100) * 0.10 + 
      (state.social.seniors / 100) * 0.10 +
      (estimatedChance / 100) * 0.10;
    
    // 导师套磁状态影响 (显著提升)
    const uniMentors = state.mentors.filter(m => m.university === uni.name);
    uniMentors.forEach(m => {
      if (m.status === 'hard_offer') successChance += 0.4;
      else if (m.status === 'verbal_offer') successChance += 0.2;
      else if (m.status === 'fish_pond') successChance += 0.05;
      else if (m.status === 'rejected') successChance -= 0.15;
    });

    // 目标院校保研率修正（反映该校录取的慷慨程度）
    const baoyanRateFactor = (uni.baoyanRate / 30); // 30% 是一个基准
    successChance *= (0.7 + baoyanRateFactor * 0.3);

    const isInvited = Math.random() < successChance;
    
    setState(prev => {
      if (isInvited) {
        // 计算背景基准分（用于面试后的综合评估，满分 60）
        const backgroundScore = 
          (prev.stats.gpa / 4.5) * 25 + 
          (resumeScore / 200) * 20 + 
          (backgroundScoreBase / 100) * 10 + 
          (prev.stats.english / 100) * 5;

        const newInterview: CurrentInterview = {
          university: uni.name,
          major: prev.major,
          phase,
          questions: [...INTERVIEW_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 3),
          currentQuestionIndex: 0,
          totalScore: 0,
          backgroundScore: backgroundScore
        };

        const newApplications = [...prev.applications, { 
          university: uni.name, 
          major: prev.major, 
          status: 'interviewing' as const, 
          phase 
        }];

        return {
          ...prev,
          applications: newApplications,
          currentInterview: newInterview,
          logs: [...prev.logs, `${phase === 'summer_camp' ? '夏令营' : '预推免'}: 你通过了 ${uni.name} 的初筛，进入面试环节！`]
        };
      } else {
        const newApplications = [...prev.applications, { 
          university: uni.name, 
          major: prev.major, 
          status: 'rejected' as const, 
          phase 
        }];
        return {
          ...prev,
          applications: newApplications,
          logs: [...prev.logs, `${phase === 'summer_camp' ? '夏令营' : '预推免'}: 很遗憾，你被 ${uni.name} 拒绝了。`]
        };
      }
    });
  };

  const handleInterviewAnswer = (optionIndex: number) => {
    if (!state.currentInterview) return;

    const currentInterview = state.currentInterview;
    const question = currentInterview.questions[currentInterview.currentQuestionIndex];
    const option = question.options[optionIndex];
    const newTotalScore = currentInterview.totalScore + option.score;
    const isLastQuestion = currentInterview.currentQuestionIndex === currentInterview.questions.length - 1;

    if (isLastQuestion) {
      // 最终评估：面试分 (40%) + 背景分 (60%)
      // 面试满分 3题 * 20 = 60，换算成 40分制
      const interviewFinalScore = (newTotalScore / 60) * 40;
      const finalScore = interviewFinalScore + currentInterview.backgroundScore;
      
      // 录取阈值：根据学校档次动态调整
      const targetUni = UNIVERSITIES.find(u => u.name === currentInterview.university);
      const targetTier = getTierValue(targetUni?.tier || 'T4');
      const threshold = 60 + (targetTier * 4); // T0 需要 84分, T1 需要 80分, T2 需要 76分...

      const isAccepted = finalScore >= threshold;

      setState(prev => {
        const newApplications = prev.applications.map(app => 
          (app.university === currentInterview.university && app.phase === currentInterview.phase)
          ? { ...app, status: (isAccepted ? 'accepted' : 'rejected') as any }
          : app
        );

        let isGameOver = prev.isGameOver;
        let gameMessage = prev.gameMessage;
        let endingStats = prev.endingStats;

        if (currentInterview.phase === 'pre_recommendation' && isAccepted) {
          isGameOver = true;
          const outcome = calculateOutcome(prev.stats, { university: currentInterview.university, major: currentInterview.major });
          endingStats = outcome;
          gameMessage = outcome.title + "\n" + outcome.detail;
        }

        const logMsg = `面试反馈 (${currentInterview.university}): ${option.feedback} 最终综合评分: ${finalScore.toFixed(1)}。${isAccepted ? '恭喜你被拟录取！' : '很遗憾，未通过最终考核。'}`;

        return {
          ...prev,
          applications: newApplications,
          currentInterview: null,
          isGameOver,
          gameMessage,
          endingStats,
          logs: [...prev.logs, logMsg]
        };
      });
    } else {
      setState(prev => ({
        ...prev,
        currentInterview: {
          ...currentInterview,
          currentQuestionIndex: currentInterview.currentQuestionIndex + 1,
          totalScore: newTotalScore
        },
        logs: [...prev.logs, `面试中: ${option.feedback}`]
      }));
    }
  };
  const handleEventChoice = (choiceIndex: number) => {
    if (!state.currentEvent) return;
    const choice = state.currentEvent.options[choiceIndex];
    const { newStats, log, moneyChange } = choice.effect(state.stats);

    setState(prev => ({
      ...prev,
      stats: newStats,
      money: prev.money + (moneyChange || 0),
      currentEvent: null,
      logs: [...prev.logs, `事件结果: ${log}`]
    }));
  };

  const calculateOutcome = (stats: PlayerStats, successApp?: { university: string; major: string }) => {
    // If no explicit successApp, look for any accepted applications in state
    const finalSuccess = successApp || state.applications.find(a => a.status === 'accepted');
    
    let title = "";
    let detail = "";
    let fancyQuote = "";

    const fancyQuotes = [
      "保研不是终点，而是通往更广阔世界的入场券。",
      "在无数个寂静的深夜里，你种下的每一颗汗水，都在此刻开出了花。",
      "所谓天才，不过是选择了那条最孤独、也最坚定的道路。",
      "学术的巅峰固然迷人，但攀登的过程本身就是一种意义。",
      "有些路，只能一个人走；有些光，注定要照亮前行的方向。",
      "生活从不亏待每一个清醒地努力着的人。",
      "乾坤未定，你我皆是黑马；尘埃落定，你已身在巅峰。"
    ];

    fancyQuote = fancyQuotes[Math.floor(Math.random() * fancyQuotes.length)];

    if (finalSuccess) {
      const targetUni = UNIVERSITIES.find(u => u.name === finalSuccess.university);
      title = "【最终结局：保研成功】";
      
      if (targetUni?.tier === 'T0') {
        detail = `你在 ${state.university} 的四年努力终于迎来了最高光的时刻。作为 ${state.major} 专业的佼佼者，你成功保研至 ${finalSuccess.university} ${finalSuccess.major} 专业。这是国内最顶尖的学术殿堂，未来不可限量。`;
        fancyQuote = "这世上只有一种真正的英雄主义，那就是在看清学术的真相后，依然热爱它。";
      } else if (targetUni?.tier === 'T1') {
        detail = `你凭借出色的综合素质，成功保研至 ${finalSuccess.university} ${finalSuccess.major} 专业。华五名校的科研氛围将助你在学术道路上更进一步。`;
      } else if (finalSuccess.university === state.university) {
        detail = `你选择留在本校 ${finalSuccess.university} 继续攻读 ${finalSuccess.major} 专业。在熟悉的实验室和敬爱的导师指导下，你将开启稳健的研究生涯。`;
      } else {
        detail = `你成功通过夏令营和预推免的层层选拔，保研至 ${finalSuccess.university} ${finalSuccess.major} 专业。新的环境意味着新的开始，祝你在学术之路上越走越远。`;
      }
    } else {
      // --- 失败结局细化 ---
      if (stats.english > 85 && state.money > 15000) {
        title = "【最终结局：出国深造】";
        detail = "虽然国内保研之路未能如愿，但你凭借优异的英语成绩和充足的资金储备，成功申请到了海外名校的 Master 项目。换个赛道，你依然是赢家。";
        fancyQuote = "世界的边界，就是你认知的边界。星辰大海，才是你的归宿。";
      } else if (state.social.seniors > 85 && stats.gpa > 3.2) {
        title = "【最终结局：支教保研】";
        detail = "你虽然没有在学术赛道上拿到满意的 Offer，但凭借极高的人脉评分和丰富的学生工作经验，成功申请到了“支教保研”名额。在西部的三尺讲台上，你将书写另一种青春。";
        fancyQuote = "用一年不长的时间，做一件终生难忘的事。";
      } else if (stats.gpa > 4.0 && stats.mental > 60) {
        title = "【最终结局：考研战神】";
        detail = "保研名额的遗憾错失并没有击垮你。你迅速调整心态投入考研，凭借四年积累的深厚功底，在随后的全国研究生统一考试中发挥神勇，最终以初试第一的成绩考入了最初的目标院校。";
        fancyQuote = "杀不死我的，终将使我更强大。";
      } else if (stats.competition > 80 && state.social.classmates > 70) {
        title = "【最终结局：职场精英】";
        detail = "保研失败后，你凭借手里沉甸甸的竞赛奖牌和优秀的社交能力，成功拿到了某大厂的校招高薪 Offer。你发现，比起科研，你似乎更适合在快节奏的职场中发光发热。";
        fancyQuote = "在象牙塔外，你依然可以定义自己的规则。";
      } else if (stats.mental < 40) {
        title = "【最终结局：遗憾二战】";
        detail = "保研过程中的巨大压力和最终的落榜让你感到精疲力竭。你决定给自己放一个长假，回家在父母的陪伴下修整一段时间，准备来年再战。这一次，你会更加从容。";
        fancyQuote = "暂时的退后，是为了下一次更有力的跳跃。";
      } else {
        title = "【最终结局：职场新人】";
        detail = "保研未能如愿，你略显仓促地进入了就业市场。虽然起步阶段略有坎坷，但凭借大学四年打下的专业基础，你相信只要脚踏实地，未来依然可期。";
      }
    }

    const summerCampApps = state.applications.filter(a => a.phase === 'summer_camp');
    const preRecApps = state.applications.filter(a => a.phase === 'pre_recommendation');

    const outcome = {
      title,
      detail,
      fancyQuote,
      careerStats: {
        finalGpa: stats.gpa,
        totalResumeScore: state.resume.reduce((sum, item) => sum + item.score, 0),
        finalEnglish: stats.english,
        finalSocial: (state.social.classmates + state.social.seniors) / 2,
        finalMoney: state.money
      },
      applicationStats: {
        summerCamp: {
          applied: summerCampApps.length,
          interviews: summerCampApps.filter(a => a.status !== 'rejected' && a.status !== 'pending').length,
          offers: summerCampApps.filter(a => a.status === 'accepted').length
        },
        preRec: {
          applied: preRecApps.length,
          interviews: preRecApps.filter(a => a.status !== 'rejected' && a.status !== 'pending').length,
          offers: preRecApps.filter(a => a.status === 'accepted').length
        }
      }
    };

    return outcome;
  };

  const calculateSuccessChance = () => {
    const stats = state.stats;
    const resumeScore = state.resume.reduce((sum, item) => sum + item.score, 0);
    
    // 院校背景评估 (预估时以一个平均难度的 T1 院校为参考)
    const playerUni = UNIVERSITIES.find(u => u.name === state.university);
    const playerTier = getTierValue(playerUni?.tier || 'T4');
    const refTargetTier = 4; // T1 院校
    const backgroundScore = Math.max(0, 100 - Math.max(0, refTargetTier - playerTier) * 15);

    // 基础分由 绩点(30%)、简历分(30%)、背景(20%)、英语(10%) 和 人脉(10%) 决定
    let baseScore = 
      (stats.gpa / 4.5) * 30 + 
      (resumeScore / 200) * 30 + 
      (backgroundScore / 100) * 20 +
      (stats.english / 100) * 10 + 
      (state.social.seniors / 100) * 10;
    
    // 导师状态对预估成功率的影响
    let mentorEffect = 0;
    state.mentors.forEach(m => {
      if (m.status === 'hard_offer') mentorEffect += 25;
      else if (m.status === 'verbal_offer') mentorEffect += 12;
      else if (m.status === 'fish_pond') mentorEffect += 3;
      else if (m.status === 'rejected') mentorEffect -= 8;
    });

    const uni = UNIVERSITIES.find(u => u.name === state.university);
    const baoyanRate = uni?.baoyanRate || 5;
    
    // 这是一个综合预估，不代表最终结果
    const estimatedChance = baseScore + (baoyanRate / 4) + mentorEffect;
    return Math.min(100, Math.max(0, Math.floor(estimatedChance)));
  };

  const getActions = (): Action[] => {
    const baseActions: Action[] = [
      { 
        name: "上课", 
        description: "认真听讲，完成作业。", 
        icon: <Book className="w-5 h-5" />, 
        cost: { stamina: -10, mental: -5 }, 
        gain: { mastery: 20 } 
      },
      { 
        name: "英语学习", 
        description: "背单词，练听力。", 
        icon: <TrendingUp className="w-5 h-5" />, 
        cost: { stamina: -10, mental: -5 }, 
        gain: { english: 6 } 
      },
      { 
        name: "休息", 
        description: "睡个好觉，恢复精神。", 
        icon: <Coffee className="w-5 h-5" />, 
        cost: {}, 
        gain: { stamina: 30, mental: 10 } 
      },
      { 
        name: "社交", 
        description: "和同学聚餐，参加社团。", 
        icon: <History className="w-5 h-5" />, 
        cost: { stamina: -15, money: 100 }, 
        gain: { mental: 20 },
        socialGain: { classmates: 10 }
      },
      { 
        name: "请教直系学长", 
        description: "获取保研一手信息和经验。", 
        icon: <GraduationCap className="w-5 h-5" />, 
        cost: { stamina: -10, money: 50 }, 
        gain: { research: 1 },
        socialGain: { seniors: 15 }
      },
      { 
        name: "做兼职", 
        description: "勤工俭学，赚点生活费。", 
        icon: <Zap className="w-5 h-5" />, 
        cost: { stamina: -20, mental: -5 }, 
        gain: { money: 500 } 
      },
      { 
        name: "图书馆自习", 
        description: "沉浸在知识的海洋里。", 
        icon: <Book className="w-5 h-5" />, 
        cost: { stamina: -15, mental: -10 }, 
        gain: { mastery: 30, mental: -2 } 
      },
      { 
        name: "健身锻炼", 
        description: "身体是革命的本钱。", 
        icon: <Zap className="w-5 h-5" />, 
        cost: { stamina: -10, mental: 5 }, 
        gain: { stamina: 40 } 
      },
      { 
        name: "慕课学习", 
        description: "在线学习顶尖名校课程。", 
        icon: <Brain className="w-5 h-5" />, 
        cost: { stamina: -12, mental: -8 }, 
        gain: { research: 4, mastery: 15 } 
      },
      { 
        name: "参加讲座", 
        description: "听大佬分享学术前沿。", 
        icon: <Lightbulb className="w-5 h-5" />, 
        cost: { stamina: -8, mental: 5 }, 
        gain: { research: 6, mental: 10 } 
      },
      { 
        name: "学生会工作", 
        description: "锻炼组织协调能力。", 
        icon: <Award className="w-5 h-5" />, 
        cost: { stamina: -10, mental: -10 }, 
        gain: { mental: 20, competition: 5 } 
      },
      { 
        name: "刷绩点神器", 
        description: "疯狂刷往年题和课后作业。", 
        icon: <Book className="w-5 h-5" />, 
        cost: { stamina: -40, mental: -5 }, 
        gain: { mastery: 50 } 
      },
    ];

    const majorActions: Record<MajorType, Action[]> = {
      cs: [
        { 
          name: "刷算法题", 
          description: "LeetCode, Codeforces...", 
          icon: <Cpu className="w-5 h-5" />, 
          cost: { stamina: -20, mental: -10 }, 
          gain: { competition: 15, mastery: 10 } 
        },
        { 
          name: "开发个人项目", 
          description: "写个有趣的开源工具。", 
          icon: <Lightbulb className="w-5 h-5" />, 
          cost: { stamina: -20, mental: -5 }, 
          gain: { research: 1, competition: 20, mastery: 12 } 
        },
        { 
          name: "参加黑客马拉松", 
          description: "48小时不眠不休极限编程。", 
          icon: <Zap className="w-5 h-5" />, 
          cost: { stamina: -40, mental: -30 }, 
          gain: { competition: 30, research: 1, mastery: 8 } 
        },
        { 
          name: "深度钻研OS/内核", 
          description: "硬核底层技术钻研。", 
          icon: <Cpu className="w-5 h-5" />, 
          cost: { stamina: -25, mental: -25 }, 
          gain: { research: 15, mastery: 30 } 
        },
        { 
          name: "大厂实习", 
          description: "提前感受996的洗礼。", 
          icon: <TrendingUp className="w-5 h-5" />, 
          cost: { stamina: -50, mental: -30 }, 
          gain: { research: 10, money: 2000, mastery: 8 } 
        },
        { 
          name: "论文复现", 
          description: "复现顶会 SOTA 模型。", 
          icon: <Book className="w-5 h-5" />, 
          cost: { stamina: -20, mental: -40 }, 
          gain: { research: 25, mastery: 10 } 
        },
      ],
      ee: [
        { 
          name: "焊电路板", 
          description: "闻着松香的味道，连接每一个焊点。", 
          icon: <Zap className="w-5 h-5" />, 
          cost: { stamina: -20, mental: -5 }, 
          gain: { research: 10, competition: 5, mastery: 8 } 
        },
        { 
          name: "电赛备赛", 
          description: "为了全国大学生电子设计竞赛努力。", 
          icon: <Award className="w-5 h-5" />, 
          cost: { stamina: -30, mental: -15 }, 
          gain: { competition: 20, mastery: 6 } 
        },
        { 
          name: "MATLAB 仿真", 
          description: "复杂的信号处理与算法模拟。", 
          icon: <Cpu className="w-5 h-5" />, 
          cost: { stamina: -15, mental: -15 }, 
          gain: { research: 15, mastery: 12 } 
        },
        { 
          name: "芯片流片", 
          description: "参与学院的流片项目。", 
          icon: <Cpu className="w-5 h-5" />, 
          cost: { stamina: -40, mental: -20, money: 500 }, 
          gain: { research: 35, mastery: 15 } 
        },
        { 
          name: "参加机器人大赛", 
          description: "调试你的战斗机器人。", 
          icon: <Zap className="w-5 h-5" />, 
          cost: { stamina: -25, mental: -10 }, 
          gain: { competition: 18, research: 8, mastery: 8 } 
        },
        { 
          name: "智能硬件开发", 
          description: "从电路设计到外壳 3D 打印。", 
          icon: <Cpu className="w-5 h-5" />, 
          cost: { stamina: -30, mental: -10, money: 300 }, 
          gain: { research: 20, competition: 8, mastery: 10 } 
        },
      ],
      medicine: [
        { 
          name: "背诵系统解剖学", 
          description: "全身几百块骨头，几千个结构...", 
          icon: <Brain className="w-5 h-5" />, 
          cost: { stamina: -30, mental: -25 }, 
          gain: { mastery: 60 } 
        },
        { 
          name: "医院见习", 
          description: "跟随导师巡视病房。", 
          icon: <Heart className="w-5 h-5" />, 
          cost: { stamina: -25, mental: -10 }, 
          gain: { research: 12, mental: 8, mastery: 12 } 
        },
        { 
          name: "医学技能操作", 
          description: "练习缝合、插管等临床技能。", 
          icon: <Award className="w-5 h-5" />, 
          cost: { stamina: -20, mental: -5 }, 
          gain: { competition: 15, mastery: 18 } 
        },
        { 
          name: "生理实验", 
          description: "观察兔子的心脏搏动。", 
          icon: <Brain className="w-5 h-5" />, 
          cost: { stamina: -20, mental: -10 }, 
          gain: { research: 15, mastery: 22 } 
        },
        { 
          name: "义诊活动", 
          description: "走进社区，服务大众。", 
          icon: <Heart className="w-5 h-5" />, 
          cost: { stamina: -15, mental: 15 }, 
          gain: { mental: 25, competition: 8, mastery: 8 } 
        },
        { 
          name: "参加医学竞赛", 
          description: "在全国大学生医学技术技能大赛中露脸。", 
          icon: <Award className="w-5 h-5" />, 
          cost: { stamina: -35, mental: -20 }, 
          gain: { competition: 35, mastery: 25 } 
        },
      ],
      law: [
        { 
          name: "模拟法庭", 
          description: "披上法袍，在法庭上据理力争。", 
          icon: <Award className="w-5 h-5" />, 
          cost: { stamina: -20, mental: -15 }, 
          gain: { competition: 25, mental: 15, mastery: 30 } 
        },
        { 
          name: "法律文书写作", 
          description: "严谨的措辞，缜密的逻辑。", 
          icon: <Book className="w-5 h-5" />, 
          cost: { stamina: -15, mental: -10 }, 
          gain: { mastery: 40, research: 12 } 
        },
        { 
          name: "律所实习", 
          description: "体验法律人的真实生活。", 
          icon: <TrendingUp className="w-5 h-5" />, 
          cost: { stamina: -30, mental: -10 }, 
          gain: { research: 18, english: 6, mastery: 15 } 
        },
        { 
          name: "法考备战", 
          description: "虽然还早，但基础要打牢。", 
          icon: <Book className="w-5 h-5" />, 
          cost: { stamina: -25, mental: -20 }, 
          gain: { mastery: 50, competition: 8 } 
        },
        { 
          name: "参加辩论赛", 
          description: "唇枪舌剑，逻辑巅峰。", 
          icon: <Award className="w-5 h-5" />, 
          cost: { stamina: -15, mental: -10 }, 
          gain: { competition: 30, mental: 12, mastery: 18 } 
        },
        { 
          name: "旁听法院庭审", 
          description: "现场感受法律的威严与复杂。", 
          icon: <History className="w-5 h-5" />, 
          cost: { stamina: -10, mental: 10 }, 
          gain: { research: 12, mental: 22 } 
        },
      ],
      art: [
        { 
          name: "深夜画图/建模", 
          description: "灵感总是在午夜降临。", 
          icon: <Lightbulb className="w-5 h-5" />, 
          cost: { stamina: -35, mental: -10 }, 
          gain: { research: 28, mastery: 35 } 
        },
        { 
          name: "参加国际设计赛", 
          description: "投稿 Red Dot 或 iF 设计奖。", 
          icon: <Award className="w-5 h-5" />, 
          cost: { stamina: -25, mental: -20, money: 500 }, 
          gain: { competition: 38, mastery: 22 } 
        },
        { 
          name: "参观艺术展", 
          description: "寻找灵感，提升审美。", 
          icon: <Heart className="w-5 h-5" />, 
          cost: { stamina: -10, money: 100 }, 
          gain: { mental: 45, research: 8, mastery: 12 } 
        },
        { 
          name: "作品集打磨", 
          description: "每一个像素都要完美。", 
          icon: <Lightbulb className="w-5 h-5" />, 
          cost: { stamina: -20, mental: -15 }, 
          gain: { research: 25, mastery: 45 } 
        },
        { 
          name: "艺术采风", 
          description: "去山川湖海寻找美。", 
          icon: <History className="w-5 h-5" />, 
          cost: { stamina: -30, mental: 20, money: 800 }, 
          gain: { research: 28, mental: 50 } 
        },
        { 
          name: "参加艺术工作坊", 
          description: "与名家面对面交流技法。", 
          icon: <Zap className="w-5 h-5" />, 
          cost: { stamina: -20, mental: 5, money: 200 }, 
          gain: { research: 22, mental: 35 } 
        },
      ],
      biology: [
        { 
          name: "进实验室", 
          description: "洗试管，看电泳结果。", 
          icon: <Brain className="w-5 h-5" />, 
          cost: { stamina: -25, mental: -10 }, 
          gain: { research: 22, mastery: 30 } 
        },
        { 
          name: "读前沿论文", 
          description: "紧跟 Nature/Science 动态。", 
          icon: <Book className="w-5 h-5" />, 
          cost: { stamina: -10, mental: -10 }, 
          gain: { research: 10, english: 6, mastery: 15 } 
        },
        { 
          name: "野外考察", 
          description: "深入大自然采集标本。", 
          icon: <History className="w-5 h-5" />, 
          cost: { stamina: -35, mental: 5 }, 
          gain: { research: 28, mastery: 18 } 
        },
        { 
          name: "培养皿接种", 
          description: "小心翼翼地培养你的菌群。", 
          icon: <Brain className="w-5 h-5" />, 
          cost: { stamina: -15, mental: -5 }, 
          gain: { research: 18, mastery: 25 } 
        },
        { 
          name: "参加生科竞赛", 
          description: "展示你的实验设计才华。", 
          icon: <Award className="w-5 h-5" />, 
          cost: { stamina: -25, mental: -15 }, 
          gain: { competition: 38, mastery: 30 } 
        },
        { 
          name: "撰写综述论文", 
          description: "对某一领域进行深度总结。", 
          icon: <Book className="w-5 h-5" />, 
          cost: { stamina: -40, mental: -20 }, 
          gain: { research: 40, mastery: 45 } 
        },
      ],
      humanities: [
        { 
          name: "田野调查", 
          description: "深入社会，收集一手资料。", 
          icon: <History className="w-5 h-5" />, 
          cost: { stamina: -30, mental: -5 }, 
          gain: { research: 25, mastery: 35 } 
        },
        { 
          name: "学术沙龙", 
          description: "和导师、同门谈笑风生。", 
          icon: <History className="w-5 h-5" />, 
          cost: { stamina: -10, mental: 10 }, 
          gain: { mastery: 22, research: 8 } 
        },
        { 
          name: "撰写文学评论", 
          description: "在核心期刊发表见解。", 
          icon: <Book className="w-5 h-5" />, 
          cost: { stamina: -20, mental: -15 }, 
          gain: { research: 22, mastery: 50 } 
        },
        { 
          name: "古籍修复", 
          description: "穿越时空的对话。", 
          icon: <History className="w-5 h-5" />, 
          cost: { stamina: -15, mental: 10 }, 
          gain: { research: 28, mastery: 35 } 
        },
        { 
          name: "翻译外文学术著作", 
          description: "跨越语言的鸿沟。", 
          icon: <TrendingUp className="w-5 h-5" />, 
          cost: { stamina: -25, mental: -15 }, 
          gain: { english: 28, research: 12, mastery: 22 } 
        },
        { 
          name: "参加读书会", 
          description: "思想的碰撞与交融。", 
          icon: <History className="w-5 h-5" />, 
          cost: { stamina: -10, mental: 15 }, 
          gain: { mental: 40, research: 12, mastery: 18 } 
        },
      ],
      general: [
        { 
          name: "投行实习", 
          description: "穿上西装，体验精英生活。", 
          icon: <TrendingUp className="w-5 h-5" />, 
          cost: { stamina: -30, mental: -15 }, 
          gain: { competition: 22, english: 12, mastery: 15 } 
        },
        { 
          name: "考证", 
          description: "CFA, CPA... 证书不嫌多。", 
          icon: <Award className="w-5 h-5" />, 
          cost: { stamina: -20, mental: -20 }, 
          gain: { competition: 12, mastery: 30 } 
        },
        { 
          name: "模拟炒股", 
          description: "在模拟盘中练习 market sense。", 
          icon: <TrendingUp className="w-5 h-5" />, 
          cost: { stamina: -10, mental: -10 }, 
          gain: { research: 12, competition: 8, mastery: 10 } 
        },
        { 
          name: "数学建模", 
          description: "把世界抽象成公式。", 
          icon: <Cpu className="w-5 h-5" />, 
          cost: { stamina: -35, mental: -25 }, 
          gain: { competition: 45, research: 22, mastery: 28 } 
        },
        { 
          name: "练习 Case Interview", 
          description: "咨询公司的敲门砖。", 
          icon: <Brain className="w-5 h-5" />, 
          cost: { stamina: -15, mental: -10 }, 
          gain: { competition: 25, mental: 15, mastery: 18 } 
        },
        { 
          name: "备战商赛", 
          description: "策划、分析、汇报，全方位磨炼。", 
          icon: <Award className="w-5 h-5" />, 
          cost: { stamina: -25, mental: -15 }, 
          gain: { competition: 38, research: 12, mastery: 22 } 
        },
      ]
    };

    return [...baseActions, ...(majorActions[state.majorType] || [])];
  };



  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center">
      {state.phase === 'start' && (
        <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-700">
          <div className="space-y-4 mb-8">
            <h1 className="text-5xl font-extrabold tracking-tight text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
              保研模拟器
            </h1>
            <p className="text-xl text-slate-400 text-center italic">"人生是一场马拉松，而保研是其中最卷的一段。"</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {BACKGROUNDS.map((bg, i) => (
              <button
                key={i}
                onClick={() => startGame(bg)}
                className="p-6 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-left transition-all hover:scale-[1.02] active:scale-[0.98] group"
              >
                <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">{bg.name}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{bg.description}</p>
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-500 text-center">
            首先选择你的初始身份，这将影响你的学习天赋。
          </div>
        </div>
      )}

      {state.phase === 'gaokao' && (
        <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl animate-in zoom-in duration-1000">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-6">高考成绩查询</h2>
            <div className="relative">
              <div className="text-8xl font-black text-blue-400 tabular-nums">{state.gaokaoScore}</div>
              <p className="text-slate-500 mt-4">满分 750 分</p>
            </div>
          </div>

          <div className="bg-blue-900/20 p-6 rounded-2xl border border-blue-800/50 mb-8">
            <p className="text-blue-300 leading-relaxed text-center">
              {state.gaokaoScore > 680 ? "这分数，清北在向你招手！" : 
               state.gaokaoScore > 650 ? "华五名校基本稳了，好好挑选吧。" :
               state.gaokaoScore > 600 ? "不错的成绩，能上一所非常好的211。" :
               "虽然没能去顶尖名校，但大学的上限由你决定。"}
            </p>
          </div>

          <div className="text-center">
            <button
              onClick={() => setState(prev => ({ ...prev, phase: 'university_selection' }))}
              className="px-8 py-4 bg-blue-600 text-white rounded-full font-bold text-lg hover:bg-blue-700 shadow-lg shadow-blue-900/20 transition-all"
            >
              进入志愿填报
            </button>
          </div>
        </div>
      )}

      {state.phase === 'university_failed' && (
        <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl animate-in zoom-in duration-300">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="p-4 bg-red-900/30 rounded-full">
                <AlertCircle className="w-16 h-16 text-red-500" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-red-400">滑档/冲刺失败！</h2>
            <p className="text-slate-300 leading-relaxed">
              非常遗憾，由于今年报考人数激增或你的分数未达到投档要求，你对 <span className="font-bold text-white">[{state.failedUniversity}]</span> 的冲刺失败了。
            </p>
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
              <p className="text-sm text-slate-400">后果：</p>
              <ul className="text-sm text-red-400 mt-2 space-y-1">
                <li>• 心态严重受挫 (心态 -20)</li>
                <li>• 档案已被退回，你只能选择更稳妥的学校</li>
                <li>• 此段经历将磨炼你的意志，但也让你的保研之路起步更艰难</li>
              </ul>
            </div>
            <button
              onClick={() => setState(prev => ({ ...prev, phase: 'university_selection' }))}
              className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-full font-bold transition-all"
            >
              返回重新填报
            </button>
          </div>
        </div>
      )}

      {state.phase === 'university_selection' && !state.university && (
        <div className="max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl animate-in slide-in-from-bottom duration-500">
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-3xl font-bold">志愿填报 (第一批次)</h2>
            <p className="text-slate-400">你的分数: <span className="font-bold text-blue-400">{state.gaokaoScore}</span></p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {UNIVERSITIES.filter(u => state.gaokaoScore >= u.minScore - 10).map((uni, i) => {
              const isReach = state.gaokaoScore < uni.minScore;
              return (
                <button
                  key={i}
                  onClick={() => selectUniversity(uni)}
                  className={cn(
                    "p-5 text-left border-2 rounded-xl transition-all flex flex-col md:flex-row md:items-center md:justify-between gap-4",
                    isReach ? "border-amber-900/50 bg-amber-900/10 hover:border-amber-500" : "border-slate-800 bg-slate-800/50 hover:border-blue-500 hover:bg-slate-800"
                  )}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-slate-100">{uni.name}</span>
                      {uni.tags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-slate-700 text-slate-300 text-[10px] rounded uppercase font-bold tracking-wider">
                          {tag}
                        </span>
                      ))}
                      {isReach && <span className="text-xs font-bold text-amber-400 flex items-center gap-1"><AlertCircle size={12}/> 冲刺风险</span>}
                    </div>
                    <p className="text-sm text-slate-400">{uni.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                     <div className="text-xs text-slate-500">保研率: <span className="text-blue-400 font-bold">{uni.baoyanRate}%</span></div>
                     <div className="text-xs text-slate-500 mt-1">往年最低投档线</div>
                     <div className="text-xl font-black text-slate-500">{uni.minScore}</div>
                   </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {state.phase === 'university_selection' && state.university && (
        <div className="max-w-3xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl animate-in slide-in-from-bottom duration-500 mt-8">
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-3xl font-bold">专业选择</h2>
            <p className="text-slate-400">你已被 <span className="font-bold text-blue-400">{state.university}</span> 预录取</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {MAJORS.map((major, i) => (
              <button
                key={i}
                onClick={() => selectMajor(major)}
                className="p-6 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-left transition-all group"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-slate-100 group-hover:text-blue-400 transition-colors">{major.name}</h3>
                    <p className="mt-2 text-sm text-slate-400 leading-relaxed">{major.description}</p>
                  </div>
                  <div className="px-3 py-1 bg-emerald-900/30 text-emerald-400 text-xs font-bold rounded-full shrink-0 border border-emerald-800">
                    {major.bonus}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {state.phase === 'course_selection' && (
        <div className="max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl animate-in fade-in duration-500">
          <div className="flex items-center gap-3 mb-6">
            <Book className="w-8 h-8 text-blue-400" />
            <div>
              <h2 className="text-2xl font-bold">选课系统 - {SEMESTER_NAMES[state.semester - 1]}</h2>
              <p className="text-slate-400">选择本学期要修读的课程，注意学分负载和难度。</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {ALL_COURSES.filter(c => 
              c.semester === state.semester && 
              (!c.majorRestriction || c.majorRestriction.includes(state.majorType))
            ).map(course => {
              const isSelected = state.courses.some(c => c.id === course.id);
              const isCompulsory = course.type === 'compulsory';
              
              return (
                <button
                  key={course.id}
                  disabled={isCompulsory}
                  onClick={() => {
                    if (isSelected) {
                      setState(prev => ({ ...prev, courses: prev.courses.filter(c => c.id !== course.id) }));
                    } else {
                      if (state.courses.length >= 6) {
                        addLog("本学期课程负载已达上限（最多 6 门）。");
                        return;
                      }
                      setState(prev => ({ ...prev, courses: [...prev.courses, course] }));
                    }
                  }}
                  className={cn(
                    "p-4 rounded-xl border transition-all text-left group relative",
                    isSelected
                      ? "bg-blue-900/40 border-blue-500 shadow-lg shadow-blue-500/20"
                      : "bg-slate-800/50 border-slate-700 hover:border-slate-500",
                    isCompulsory && "opacity-90 cursor-default border-indigo-500/50 bg-indigo-900/20"
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg group-hover:text-blue-400 transition-colors">
                      {course.name}
                      {isCompulsory && <span className="ml-2 text-xs text-indigo-400 font-normal">(必修)</span>}
                    </h3>
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full font-bold",
                      course.type === 'compulsory' ? "bg-indigo-900/50 text-indigo-400" :
                      course.type === 'general' ? "bg-green-900/30 text-green-400" : "bg-purple-900/30 text-purple-400"
                    )}>
                      {course.type === 'compulsory' ? '必修' : course.type === 'general' ? '通识' : '选修'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    <span className="flex items-center gap-1"><Book className="w-4 h-4" /> {course.credit} 学分</span>
                    <span className="flex items-center gap-1">
                      难度: 
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className={cn("w-2 h-2 rounded-full", i < course.difficulty ? "bg-amber-500" : "bg-slate-700")} />
                        ))}
                      </div>
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-800/80 rounded-xl border border-slate-700">
            <div className="text-sm text-slate-300">
              已选课程: <span className="font-bold text-blue-400">{state.courses.length} / 6</span>
            </div>
            <button
              disabled={state.courses.length === 0}
              onClick={() => selectCourses(state.courses)}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white rounded-full font-bold transition-all shadow-lg shadow-blue-600/20"
            >
              确定选课并开始学期
            </button>
          </div>
         </div>
       )}

      {state.currentInterview && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl animate-in zoom-in duration-300">
            <div className="text-center mb-8">
              <div className="inline-block px-3 py-1 bg-purple-900/50 text-purple-400 rounded-full text-xs font-bold mb-4 border border-purple-800">
                面试环节: {state.currentInterview.university} ({state.currentInterview.phase === 'summer_camp' ? '夏令营' : '预推免'})
              </div>
              <h2 className="text-2xl font-bold mb-2">{state.currentInterview.questions[state.currentInterview.currentQuestionIndex].text}</h2>
              <div className="flex justify-center gap-2 mt-4">
                {state.currentInterview.questions.map((_, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "w-12 h-1.5 rounded-full transition-all",
                      i === state.currentInterview!.currentQuestionIndex ? "bg-purple-500" : 
                      i < state.currentInterview!.currentQuestionIndex ? "bg-purple-900" : "bg-slate-800"
                    )} 
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {state.currentInterview.questions[state.currentInterview.currentQuestionIndex].options.map((option, i) => (
                <button
                  key={i}
                  onClick={() => handleInterviewAnswer(i)}
                  className="p-5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-left transition-all hover:scale-[1.02] active:scale-[0.98] group"
                >
                  <p className="text-lg font-medium group-hover:text-purple-400 transition-colors">{option.text}</p>
                </button>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800 text-center">
              <p className="text-xs text-slate-500">
                提示：面试表现将与你的本科背景、GPA、科研经历等综合计算最终录取分数。
              </p>
            </div>
          </div>
        </div>
      )}

      {(state.phase === 'summer_camp' || state.phase === 'pre_recommendation') && (
        <div className="max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl animate-in fade-in duration-500 overflow-hidden flex flex-col max-h-[90vh]">
          <div className="flex items-center gap-3 mb-6 shrink-0">
            <Award className="w-8 h-8 text-purple-400" />
            <div>
              <h2 className="text-2xl font-bold">{state.phase === 'summer_camp' ? '夏令营申请' : '预推免申请'}</h2>
              <p className="text-slate-400 text-sm">选择心仪的学校提交申请。每个阶段录取成功即锁定名额。</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 overflow-y-auto pr-2 custom-scrollbar">
            {UNIVERSITIES.map(uni => {
              const app = state.applications.find(a => a.university === uni.name && a.phase === state.phase);
              const playerUni = UNIVERSITIES.find(u => u.name === state.university);
              const playerTier = getTierValue(playerUni?.tier || 'T4');
              const targetTier = getTierValue(uni.tier);
              const isChallenge = targetTier > playerTier + 1;
              const isLowerTier = targetTier < playerTier;

              return (
                <div key={uni.name} className={cn(
                  "p-4 bg-slate-800/50 border rounded-xl flex justify-between items-center transition-all",
                  isChallenge ? "border-amber-900/30" : isLowerTier ? "border-slate-800/30 opacity-60" : "border-slate-700"
                )}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold">{uni.name}</h3>
                      <span className="text-[10px] px-1.5 py-0.5 bg-slate-700 text-slate-300 rounded uppercase">{uni.tier}</span>
                      {isLowerTier && <span className="text-[10px] text-red-500">级别过低</span>}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{uni.description}</p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-[10px] text-purple-400">保研率: {uni.baoyanRate}%</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    {app ? (
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap",
                        app.status === 'accepted' ? "bg-green-900/30 text-green-400" : 
                        app.status === 'interviewing' ? "bg-purple-900/30 text-purple-400" : "bg-red-900/30 text-red-400"
                      )}>
                        {app.status === 'accepted' ? '拟录取' : 
                         app.status === 'interviewing' ? '面试中' : '未通过'}
                      </span>
                    ) : isLowerTier ? (
                      <button
                        onClick={() => handleApplication(uni, state.phase as 'summer_camp' | 'pre_recommendation')}
                        className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-full text-sm font-bold transition-all whitespace-nowrap"
                      >
                        提交申请
                      </button>
                    ) : (
                      <button
                        onClick={() => handleApplication(uni, state.phase as 'summer_camp' | 'pre_recommendation')}
                        className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-full text-sm font-bold transition-all whitespace-nowrap"
                      >
                        提交申请
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center pt-4 border-t border-slate-800 shrink-0">
            <button
              onClick={() => setState(prev => ({ ...prev, phase: 'main_game' }))}
              className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-full font-bold transition-all"
            >
              返回主界面继续提升
            </button>
          </div>
        </div>
      )}

      {state.phase === 'main_game' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-7xl">
          <div className="md:col-span-1 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-2">
              <GraduationCap className="text-blue-400" />
              <div>
                <h2 className="text-xl font-bold">{state.university}</h2>
                <div className="flex items-center gap-1">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">{state.major} · {state.background}</p>
                  {state.rejectionCount > 0 && (
                    <span className="text-[8px] bg-amber-900/50 text-amber-400 px-1 rounded font-bold border border-amber-800">多次高考</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <StatBar label="GPA" value={state.stats.gpa} max={4.5} icon={<Book size={16} />} color="bg-blue-500" />
              <StatBar label="科研" value={state.stats.research} max={100} icon={<Cpu size={16} />} color="bg-purple-500" />
              <StatBar label="竞赛" value={state.stats.competition} max={100} icon={<Award size={16} />} color="bg-yellow-500" />
              <StatBar label="英语" value={state.stats.english} max={100} icon={<History size={16} />} color="bg-green-500" />
              <StatBar label="体力" value={state.stats.stamina} max={100} icon={<Zap size={16} />} color="bg-orange-500" />
              <StatBar label="心态" value={state.stats.mental} max={100} icon={<Heart size={16} />} color="bg-red-500" />
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">本校保研率</span>
                <span className="font-mono text-blue-400 font-bold">{UNIVERSITIES.find(u => u.name === state.university)?.baoyanRate}%</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">预估保研成功率</span>
                <span className={cn(
                  "font-mono font-bold",
                  calculateSuccessChance() > 80 ? "text-emerald-400" : 
                  calculateSuccessChance() > 50 ? "text-yellow-400" : "text-red-400"
                )}>
                  {calculateSuccessChance()}%
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">零花钱</span>
                <span className="font-mono text-green-400 font-bold">￥{state.money}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">当前学期</span>
                <span className="font-mono text-blue-400 font-bold">{SEMESTER_NAMES[state.semester - 1]}</span>
              </div>
              <div className="flex justify-between items-center text-sm mt-1">
                <span className="text-slate-400">当前周</span>
                <span className="font-mono text-blue-400 font-bold">Week {state.week}/18</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <AlertCircle size={18} className="text-amber-400" />
              阶段目标
            </h3>
            <p className="text-sm text-slate-400">
              {state.semester < 2 && "打好基础，保持高GPA。"}
              {state.semester >= 2 && state.semester < 4 && "开始寻找实验室，参加数学建模。"}
              {state.semester >= 4 && "准备夏令营，冲刺英语和论文。"}
            </p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 border-dashed rounded-xl p-5">
            <h3 className="font-bold mb-3 flex items-center gap-2 text-slate-500">
              <Zap size={18} />
              开发者工具
            </h3>
            <div className="space-y-2">
              <button
                onClick={handleSkipToSummerCamp}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors border border-slate-700"
              >
                跳过至夏令营 (大三下)
              </button>
              <button
                onClick={handleSkipToPreRecommendation}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors border border-slate-700"
              >
                跳过至预推免 (大四上)
              </button>
              <button
                onClick={handleSkipToGameOver}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors border border-slate-700"
              >
                跳过至结局 (结算)
              </button>
            </div>
          </div>
        </div>

        {/* Center/Right: Game Area */}
        <div className="md:col-span-2 flex flex-col gap-6">
          
          {/* Logs Area */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex-grow overflow-hidden flex flex-col h-[300px]">
            <h3 className="font-bold mb-3 flex items-center gap-2 border-b border-slate-800 pb-2">
              <History size={18} className="text-slate-400" />
              成长日志
            </h3>
            <div className="flex-grow overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {state.logs.map((log, i) => (
                <div key={i} className="text-sm border-l-2 border-slate-700 pl-3 py-1 animate-in fade-in slide-in-from-left-2">
                  {log}
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
          </div>

          {/* Next Week Controller */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h4 className="text-sm font-bold text-slate-400">本周计划: {state.selectedActions.length}/3</h4>
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "w-8 h-1.5 rounded-full transition-all",
                      i < state.selectedActions.length ? "bg-blue-500" : "bg-slate-800"
                    )} 
                  />
                ))}
              </div>
            </div>
            
            <div className="flex-1 flex gap-2 overflow-x-auto no-scrollbar">
              {state.selectedActions.map((action, i) => (
                <div key={i} className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs flex items-center gap-2 whitespace-nowrap animate-in slide-in-from-bottom-2">
                  <span className="text-blue-400">{action.icon}</span>
                  <span className="font-bold">{action.name}</span>
                </div>
              ))}
              {state.selectedActions.length === 0 && (
                <p className="text-xs text-slate-500 italic">请在上方选择本周要执行的计划...</p>
              )}
            </div>

            <button
              onClick={handleNextWeek}
              disabled={state.selectedActions.length === 0}
              className={cn(
                "px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg",
                state.selectedActions.length > 0 
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-900/40" 
                  : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
              )}
            >
              进入下一周 <ChevronRight size={18} />
            </button>
          </div>


          {/* Action Tabs Area */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col min-h-[500px]">
            <div className="flex bg-slate-800 p-1 rounded-xl mb-6">
              <button
                onClick={() => setActiveTab('actions')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold transition-all",
                  activeTab === 'actions' ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:bg-slate-700"
                )}
              >
                <Zap size={18} /> 行动
              </button>
              <button
                onClick={() => setActiveTab('mentors')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold transition-all",
                  activeTab === 'mentors' ? "bg-purple-600 text-white shadow-lg" : "text-slate-400 hover:bg-slate-700"
                )}
              >
                <History size={18} /> 导师
              </button>
              <button
                onClick={() => setActiveTab('academic')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold transition-all",
                  activeTab === 'academic' ? "bg-amber-600 text-white shadow-lg" : "text-slate-400 hover:bg-slate-700"
                )}
              >
                <Book size={18} /> 学业
              </button>
              <button
                onClick={() => setActiveTab('shop')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold transition-all",
                  activeTab === 'shop' ? "bg-green-600 text-white shadow-lg" : "text-slate-400 hover:bg-slate-700"
                )}
              >
                <Coffee size={18} /> 超市
              </button>
              <button
                onClick={() => setActiveTab('social')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold transition-all",
                  activeTab === 'social' ? "bg-cyan-600 text-white shadow-lg" : "text-slate-400 hover:bg-slate-700"
                )}
              >
                <Users size={18} /> 人脉
              </button>
              <button
                onClick={() => setActiveTab('resume')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold transition-all",
                  activeTab === 'resume' ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:bg-slate-700"
                )}
              >
                <Award size={18} /> 简历
              </button>
            </div>
            
            {state.isGameOver ? (
              <div className="py-6 space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="text-center space-y-2">
                  <div className="inline-block p-3 bg-blue-500/20 rounded-2xl mb-2">
                    <Trophy className="w-12 h-12 text-blue-400" />
                  </div>
                  <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500">
                    模拟结束
                  </h2>
                  <p className="text-2xl font-bold text-slate-100 mt-4">{state.endingStats?.title || "保研之旅告一段落"}</p>
                </div>

                <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <GraduationCap size={80} />
                  </div>
                  <p className="text-slate-300 leading-relaxed relative z-10 text-lg">
                    {state.endingStats?.detail || state.gameMessage}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 夏令营统计 */}
                  <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
                    <h3 className="text-sm font-bold text-blue-400 mb-4 flex items-center gap-2">
                      <Target size={16} /> 夏令营战报
                    </h3>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-xl font-black text-slate-100">{state.endingStats?.applicationStats.summerCamp.applied || 0}</div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider">投递</div>
                      </div>
                      <div>
                        <div className="text-xl font-black text-slate-100">{state.endingStats?.applicationStats.summerCamp.interviews || 0}</div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider">入营</div>
                      </div>
                      <div>
                        <div className="text-xl font-black text-green-400">{state.endingStats?.applicationStats.summerCamp.offers || 0}</div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider">优秀营员</div>
                      </div>
                    </div>
                  </div>

                  {/* 预推免统计 */}
                  <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
                    <h3 className="text-sm font-bold text-purple-400 mb-4 flex items-center gap-2">
                      <Zap size={16} /> 预推免战报
                    </h3>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-xl font-black text-slate-100">{state.endingStats?.applicationStats.preRec.applied || 0}</div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider">投递</div>
                      </div>
                      <div>
                        <div className="text-xl font-black text-slate-100">{state.endingStats?.applicationStats.preRec.interviews || 0}</div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider">面试</div>
                      </div>
                      <div>
                        <div className="text-xl font-black text-green-400">{state.endingStats?.applicationStats.preRec.offers || 0}</div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider">拟录取</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 生涯统计 */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                  <h3 className="text-sm font-bold text-slate-400 mb-6 flex items-center gap-2">
                    <BarChart3 size={16} /> 四年生涯统计
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
                        <Award size={12} /> 最终绩点
                      </div>
                      <div className="text-2xl font-black text-indigo-400">
                        {state.endingStats?.careerStats.finalGpa.toFixed(2) || state.stats.gpa.toFixed(2)}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
                        <Briefcase size={12} /> 简历分
                      </div>
                      <div className="text-2xl font-black text-cyan-400">
                        {state.endingStats?.careerStats.totalResumeScore || 0}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
                        <Users size={12} /> 社交评分
                      </div>
                      <div className="text-2xl font-black text-pink-400">
                        {Math.floor(state.endingStats?.careerStats.finalSocial || 0)}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
                        <DollarSign size={12} /> 结余金钱
                      </div>
                      <div className="text-2xl font-black text-amber-400">
                        ￥{state.endingStats?.careerStats.finalMoney || state.money}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center space-y-6 pt-4">
                  <div className="relative inline-block">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg blur opacity-20"></div>
                    <p className="relative italic text-slate-400 text-lg px-8 py-4 bg-slate-900/80 rounded-lg border border-slate-800">
                      " {state.endingStats?.fancyQuote || "保研之路，始于足下。"} "
                    </p>
                  </div>
                  
                  <div className="flex justify-center gap-4">
                    <button 
                      onClick={() => window.location.reload()}
                      className="px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl transition-all font-bold shadow-lg shadow-blue-900/20 flex items-center gap-2 group"
                    >
                      重新开启新人生
                      <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            ) : activeTab === 'actions' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto pr-1 custom-scrollbar">
                {getActions().map((action, i) => {
                  const canAfford = 
                    (action.cost.stamina || 0) + state.stats.stamina >= 0 &&
                    (action.cost.money || 0) <= state.money;
                  
                  return (
                    <button
                      key={i}
                      onClick={() => handleAction(action)}
                      disabled={!canAfford && !state.selectedActions.some(a => a.name === action.name)}
                      className={cn(
                        "flex flex-col p-4 bg-slate-800 hover:bg-slate-700 border rounded-xl transition-all text-left group relative",
                        state.selectedActions.some(a => a.name === action.name) ? "border-blue-500 bg-blue-900/20" : "border-slate-700",
                        !canAfford && !state.selectedActions.some(a => a.name === action.name) && "opacity-50 grayscale cursor-not-allowed"
                      )}
                    >
                      {state.selectedActions.some(a => a.name === action.name) && (
                        <div className="absolute top-2 right-2 text-blue-400">
                          <Zap size={16} fill="currentColor" />
                        </div>
                      )}
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-slate-700 group-hover:bg-blue-900/50 rounded-lg transition-colors">
                            {action.icon}
                          </div>
                          <span className="font-bold text-slate-100">{action.name}</span>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {action.cost.stamina && <span className="text-[10px] text-red-400 font-bold">-{action.cost.stamina} 体力</span>}
                          {action.cost.money && <span className="text-[10px] text-amber-400 font-bold">￥{action.cost.money}</span>}
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2 mb-2">{action.description}</p>
                      <div className="mt-auto flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                        {Object.entries(action.gain).map(([k, v]) => (
                          <span key={k} className="text-[9px] px-1.5 py-0.5 bg-green-900/30 text-green-400 rounded border border-green-800/30 whitespace-nowrap">
                            +{k}{v}
                          </span>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : activeTab === 'mentors' ? (
              <div className="space-y-6 overflow-y-auto pr-1 custom-scrollbar">
                {/* 正在套磁的导师 */}
                <section>
                  <h4 className="text-sm font-bold text-slate-400 mb-3 flex items-center gap-2">
                    <History size={14} className="text-purple-400" />
                    正在联系的导师
                  </h4>
                  <div className="space-y-4">
                    {state.mentors.map(mentor => (
                      <div key={mentor.id} className="p-5 bg-slate-800/50 border border-slate-700 rounded-xl">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-3 bg-purple-900/30 rounded-full">
                              <History className="w-6 h-6 text-purple-400" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-lg text-slate-100">{mentor.name}</h4>
                                {mentor.status === 'hard_offer' && (
                                  <span className="text-[10px] px-1.5 py-0.5 bg-green-900/50 text-green-400 rounded border border-green-800 font-bold">铁Offer</span>
                                )}
                                {mentor.status === 'verbal_offer' && (
                                  <span className="text-[10px] px-1.5 py-0.5 bg-yellow-900/50 text-yellow-400 rounded border border-yellow-800 font-bold">口头Offer</span>
                                )}
                                {mentor.status === 'fish_pond' && (
                                  <span className="text-[10px] px-1.5 py-0.5 bg-blue-900/50 text-blue-400 rounded border border-blue-800 font-bold">养鱼中</span>
                                )}
                                {mentor.status === 'rejected' && (
                                  <span className="text-[10px] px-1.5 py-0.5 bg-red-900/50 text-red-400 rounded border border-red-800 font-bold">已拒绝</span>
                                )}
                              </div>
                              <span className="text-xs px-2 py-0.5 bg-slate-700 text-slate-300 rounded-full">
                                {mentor.university} · {mentor.school} · {mentor.researchField}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest">学术声望</p>
                            <p className="text-xl font-bold text-purple-400">{mentor.reputation}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2 mb-5">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-400">亲密度 (Friendship)</span>
                            <span className="text-purple-400 font-bold">{mentor.friendship}%</span>
                          </div>
                          <div className="h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
                            <div 
                              className="h-full bg-gradient-to-r from-purple-600 to-pink-500 transition-all duration-1000"
                              style={{ width: `${mentor.friendship}%` }}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => handleMentorInteraction(mentor.id)}
                            disabled={state.stats.stamina < 15}
                            className="py-2.5 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-purple-900/20 flex items-center justify-center gap-2 text-sm"
                          >
                            <History size={16} />
                            深度交流 (-15)
                          </button>
                          <button
                            onClick={() => handleTaoci(mentor.id)}
                            disabled={state.stats.stamina < 15 || mentor.status === 'hard_offer' || mentor.status === 'rejected'}
                            className={cn(
                              "py-2.5 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 text-sm",
                              mentor.status === 'fish_pond' 
                                ? "bg-amber-600 hover:bg-amber-500 shadow-amber-900/20" 
                                : "bg-pink-600 hover:bg-pink-500 shadow-pink-900/20"
                            )}
                          >
                            <Zap size={16} />
                            {mentor.status === 'fish_pond' ? '尝试转正 (-15)' : '尝试套磁 (-15)'}
                          </button>
                        </div>
                      </div>
                    ))}
                    {state.mentors.length === 0 && (
                      <div className="text-center py-10 border-2 border-dashed border-slate-800 rounded-2xl">
                        <p className="text-slate-500 text-sm">目前还没有建立导师联系</p>
                      </div>
                    )}
                  </div>
                </section>

                {/* 新的导师选单 */}
                <section className="pt-4 border-t border-slate-800">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-bold text-slate-400 flex items-center gap-2">
                      <Users size={14} className="text-blue-400" />
                      潜在导师
                    </h4>
                    <button 
                      onClick={refreshPotentialMentors}
                      disabled={state.money < 200}
                      className="text-[10px] px-3 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-blue-400 border border-blue-900/30 rounded-full flex items-center gap-1 transition-all"
                    >
                      <History size={10} /> 刷新名单
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {state.potentialMentors.map(mentor => (
                      <div key={mentor.id} className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="font-bold text-slate-200">{mentor.name}</h5>
                            <span className="text-[10px] text-purple-400 font-mono">声望 {mentor.reputation}</span>
                          </div>
                          <p className="text-[10px] text-slate-500">{mentor.university} · {mentor.school} · {mentor.researchField}</p>
                        </div>
                        <button
                          onClick={() => startContactingMentor(mentor)}
                          disabled={state.stats.stamina < 20}
                          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-full text-[10px] font-bold transition-all"
                        >
                          开始联系 (-20)
                        </button>
                      </div>
                    ))}
                    {state.potentialMentors.length === 0 && (
                      <div className="text-center py-6">
                        <p className="text-slate-600 text-[10px]">点击刷新按钮获取新的导师名单</p>
                      </div>
                    )}
                  </div>
                </section>
              </div>
            ) : activeTab === 'academic' ? (
              <div className="space-y-6 overflow-y-auto pr-1 custom-scrollbar">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {state.courses.map(course => (
                    <div key={course.id} className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Book size={48} />
                      </div>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-bold text-slate-100">{course.name}</h4>
                          <p className="text-[10px] text-slate-500">
                            {course.credit} 学分 · {
                              course.type === 'compulsory' ? '必修课' : 
                              course.type === 'elective' ? '选修课' : '通识课'
                            }
                          </p>
                        </div>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <div key={i} className={cn("w-1.5 h-1.5 rounded-full", i < course.difficulty ? "bg-amber-500" : "bg-slate-700")} />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed mb-4">{course.description}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-grow h-1 bg-slate-900 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-amber-500 transition-all duration-1000" 
                            style={{ width: `${course.mastery}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-500">掌握度: {Math.round(course.mastery)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
                {state.courses.length === 0 && (
                  <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-2xl">
                    <p className="text-slate-500">本学期尚未选课</p>
                  </div>
                )}
              </div>
            ) : activeTab === 'social' ? (
              <div className="space-y-6 overflow-y-auto pr-1 custom-scrollbar">
                <div className="grid grid-cols-1 gap-4">
                  {[
                    { label: '同窗好友', value: state.social.classmates, icon: <Users className="text-blue-400" />, desc: '影响日常事件触发和心态恢复速度' },
                    { label: '直系学长', value: state.social.seniors, icon: <GraduationCap className="text-purple-400" />, desc: '增加夏令营和预推免的成功率' },
                  ].map((item, idx) => (
                    <div key={idx} className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          {item.icon}
                          <span className="font-bold">{item.label}</span>
                        </div>
                        <span className="text-lg font-mono text-blue-400">{item.value}/100</span>
                      </div>
                      <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-blue-500 h-full transition-all duration-500" 
                          style={{ width: `${item.value}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 mt-2">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : activeTab === 'resume' ? (
              <div className="space-y-6 overflow-y-auto pr-1 custom-scrollbar">
                <div className="bg-indigo-900/20 border border-indigo-500/30 p-4 rounded-xl mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-indigo-400 flex items-center gap-2">
                      <Award size={18} />
                      简历评分 (Resume Score)
                    </h4>
                    <span className="text-2xl font-black text-indigo-400">
                      {state.resume.reduce((sum, item) => sum + item.score, 0)}
                    </span>
                  </div>
                  <p className="text-xs text-indigo-300/70">
                    简历分由科研项目和竞赛奖项组成，是申请名校夏令营和套磁导师的核心竞争力。
                  </p>
                </div>

                <div className="space-y-3">
                  {state.resume.map((item) => {
                    const qualityStyles = {
                      common: { text: "text-slate-400", border: "border-slate-700", bg: "bg-slate-800/50", label: "普通", glow: "" },
                      rare: { text: "text-blue-400", border: "border-blue-700/50", bg: "bg-blue-900/20", label: "稀有", glow: "" },
                      epic: { text: "text-purple-400", border: "border-purple-700/50", bg: "bg-purple-900/20", label: "史诗", glow: "shadow-[0_0_15px_rgba(168,85,247,0.15)]" },
                      legendary: { text: "text-amber-400", border: "border-amber-500/50", bg: "bg-amber-900/30", label: "传说", glow: "shadow-[0_0_20px_rgba(245,158,11,0.25)]" }
                    }[item.quality || 'common'];

                    return (
                      <div key={item.id} className={cn(
                        "p-4 border rounded-xl flex justify-between items-center group transition-all",
                        qualityStyles.bg,
                        qualityStyles.border,
                        qualityStyles.glow,
                        "hover:scale-[1.01]"
                      )}>
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "p-2 rounded-lg",
                            item.type === 'research' ? "bg-purple-900/30 text-purple-400" : "bg-blue-900/30 text-blue-400"
                          )}>
                            {item.type === 'research' ? <Lightbulb size={20} /> : <Award size={20} />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="font-bold text-slate-200 group-hover:text-white transition-colors">{item.name}</h5>
                              <span className={cn("text-[8px] px-1.5 py-0.5 rounded font-bold uppercase", qualityStyles.bg, qualityStyles.text, qualityStyles.border, "border")}>
                                {qualityStyles.label}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 uppercase tracking-tighter">
                              {item.type === 'research' ? '科研项目' : '竞赛奖项'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={cn("text-lg font-bold", qualityStyles.text)}>+{item.score}</span>
                          <p className="text-[9px] text-slate-600 font-mono uppercase">Value</p>
                        </div>
                      </div>
                    );
                  })}
                  {state.resume.length === 0 && (
                    <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-2xl">
                      <p className="text-slate-500 text-sm italic">简历空空如也... 快去积累科研和竞赛经验吧！</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto pr-1 custom-scrollbar">
                {SHOP_ITEMS.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => buyItem(item)}
                    className="flex flex-col p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all text-left group"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-100">{item.name}</span>
                      <span className="text-sm font-mono text-green-400 font-bold">￥{item.cost}</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed mb-4">{item.description}</p>
                    <div className="mt-auto py-1.5 bg-slate-900/50 text-center rounded text-[10px] text-blue-400 font-bold group-hover:bg-blue-600 group-hover:text-white transition-all">
                      立即购买
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          
        </div>
      </div>
    )}

      <footer className="mt-8 text-slate-500 text-sm">
        保研模拟器 © 2026 - 祝你顺利上岸
      </footer>

      {/* Exam Report Modal */}
      {state.showExamReport && state.examReport && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-[60]">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-2xl w-full shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="text-center mb-8">
              <div className="inline-flex p-4 bg-amber-900/20 rounded-full mb-4">
                <Award className="w-12 h-12 text-amber-500" />
              </div>
              <h2 className="text-3xl font-bold text-slate-100">{state.examReport.semesterName} 成绩单</h2>
              <p className="text-slate-400">“努力不一定有回报，但考试一定会给你分数。”</p>
            </div>

            <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar mb-8">
              {state.examReport.results.map((result, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700 rounded-xl">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-200">{result.courseName}</span>
                    <span className="text-xs text-slate-500">{result.credit} 学分</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-xs text-slate-500 uppercase">得分</div>
                      <div className="text-xl font-bold text-blue-400">{result.score}</div>
                    </div>
                    <div className="w-12 h-12 flex items-center justify-center bg-slate-700 rounded-lg border border-slate-600">
                      <span className={cn(
                        "text-lg font-black",
                        result.grade.startsWith('A') ? "text-emerald-400" :
                        result.grade.startsWith('B') ? "text-blue-400" :
                        result.grade.startsWith('C') ? "text-amber-400" : "text-red-400"
                      )}>
                        {result.grade}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 p-6 bg-blue-900/10 border border-blue-800/30 rounded-2xl mb-8">
              <div className="text-center border-r border-blue-800/30">
                <div className="text-xs text-blue-400 uppercase font-bold mb-1">此前累计 GPA</div>
                <div className="text-3xl font-black text-slate-300">{state.examReport.prevGpa.toFixed(2)}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-blue-400 uppercase font-bold mb-1">更新后累计 GPA</div>
                <div className="text-3xl font-black text-blue-400">{state.examReport.newGpa.toFixed(2)}</div>
              </div>
            </div>

            <button
                  onClick={() => setState(prev => ({ ...prev, showExamReport: false, showWeeklySummary: true }))}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-blue-900/20"
                >
                  收起成绩单
                </button>
          </div>
        </div>
      )}

      {/* Event Modal */}
      {state.currentEvent && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4 text-amber-400">
              <AlertCircle size={24} />
              <h2 className="text-xl font-bold">{state.currentEvent.title}</h2>
            </div>
            <p className="text-slate-300 mb-6 leading-relaxed">
              {state.currentEvent.description}
            </p>
            <div className="space-y-3">
              {state.currentEvent.options.map((option, i) => (
                <button
                  key={i}
                  onClick={() => handleEventChoice(i)}
                  className="w-full text-left p-4 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors group"
                >
                  <span className="font-medium group-hover:text-blue-400 transition-colors">
                    {option.text}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Weekly Summary Modal */}
      {state.showWeeklySummary && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
            <div className="flex items-center gap-3 mb-4 text-green-400 border-b border-slate-800 pb-4">
              <Zap size={24} />
              <h2 className="text-xl font-bold">本周结算摘要</h2>
            </div>
            
            <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar space-y-4">
              {/* Gains Section */}
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(state.weekSummary.gains).map(([key, val]) => {
                  if (!val) return null;
                  const labels: Record<string, string> = {
                    gpa: 'GPA',
                    research: '科研',
                    competition: '竞赛',
                    english: '英语',
                    mental: '心态',
                    stamina: '体力',
                    money: '金钱',
                    classmates: '同窗',
                    seniors: '学长',
                    mastery: '掌握度'
                  };
                  return (
                    <div key={key} className="flex justify-between items-center p-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
                      <span className="text-xs text-slate-400">{labels[key] || key}</span>
                      <span className="text-sm font-bold text-green-400">+{val.toFixed(key === 'gpa' ? 2 : 0)}</span>
                    </div>
                  );
                })}
              </div>

              {/* Logs Section */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">本周事件</h3>
                <div className="space-y-1.5">
                  {state.weekSummary.logs.map((log, i) => (
                    <div key={i} className="text-sm text-slate-300 flex gap-2">
                      <span className="text-slate-600">•</span>
                      <span>{log}</span>
                    </div>
                  ))}
                  {state.weekSummary.logs.length === 0 && <p className="text-sm text-slate-500 italic">本周没有特别的事情发生。</p>}
                </div>
              </div>
            </div>

            <button
              onClick={() => setState(prev => ({ ...prev, showWeeklySummary: false }))}
              className="mt-6 w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20"
            >
              继续下周
            </button>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}

function StatBar({ label, value, max, icon, color }: { label: string, value: number, max: number, icon: React.ReactNode, color: string }) {
  const percentage = Math.min(100, (value / max) * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-xs">
        <div className="flex items-center gap-1 text-slate-300">
          {icon}
          <span>{label}</span>
        </div>
        <span className="font-mono">{value.toFixed(label === 'GPA' ? 2 : 0)} / {max}</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div 
          className={cn("h-full transition-all duration-500 ease-out", color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
