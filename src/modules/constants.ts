/**
 * 保研模拟器 - 常量数据模块
 * 从 App.tsx 中提取的所有常量数据
 */

import { University, Course, GameEvent, InterviewQuestion, Mentor, MajorType } from './types';

// 学期名称
export const SEMESTER_NAMES = ["大一上", "大一下", "大二上", "大二下", "大三上", "大三下", "大四上", "大四下"];

// 大学数据 - 已在 App.tsx 中完整定义，这里仅作为示例
export const UNIVERSITIES: University[] = [
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
  
  // ... 更多大学数据将在后续补充
  // 注意：完整的大学数据已经在 App.tsx 中定义，这里只是示例
  // 实际重构时需要将所有100+所大学数据迁移过来
];

// 面试问题库
export const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
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

// 课程数据 - 示例（完整数据在 App.tsx 中）
export const ALL_COURSES: Course[] = [
  // 通识课
  { id: 'gen1-1', name: '高等数学(上)', difficulty: 5, credit: 5, type: 'general', semester: 1, mastery: 0, description: '理工科的基础，微积分的入门。' },
  { id: 'gen1-2', name: '大学物理(上)', difficulty: 4, credit: 4, type: 'general', semester: 1, mastery: 0, description: '力学与热学基础。' },
  // ... 更多课程数据将在后续补充
];

// 导师数据生成辅助信息
export const MENTOR_DATA = {
  cs: {
    schools: ['计算机学院', '软件学院', '人工智能学院', '信息科学技术学院'],
    fields: ['深度学习', '计算机视觉', '自然语言处理', '分布式系统', '网络安全', '软件工程', '算法理论', '数据挖掘']
  },
  biology: {
    schools: ['生命科学学院', '医学院', '生物医学工程学院', '药学院'],
    fields: ['分子生物学', '细胞生物学', '遗传学', '生物化学', '神经科学', '免疫学', '微生物学', '生态学']
  },
  humanities: {
    schools: ['文学院', '历史学院', '哲学系', '新闻传播学院'],
    fields: ['中国古代文学', '现当代文学', '比较文学', '文艺学', '语言学', '历史学', '哲学', '传播学']
  },
  general: {
    schools: ['经济管理学院', '金融学院', '统计学院', '会计学院'],
    fields: ['宏观经济', '微观经济', '金融工程', '统计学', '会计学', '企业管理', '市场营销', '国际贸易']
  },
  ee: {
    schools: ['电子工程学院', '信息工程学院', '自动化学院', '电气工程学院'],
    fields: ['通信工程', '信号处理', '集成电路', '嵌入式系统', '电力系统', '控制理论', '电磁场', '微电子']
  },
  medicine: {
    schools: ['医学院', '临床医学院', '公共卫生学院', '护理学院'],
    fields: ['内科学', '外科学', '妇产科学', '儿科学', '神经病学', '精神病学', '公共卫生', '流行病学']
  },
  law: {
    schools: ['法学院', '知识产权学院', '国际法学院', '政治学与行政学系'],
    fields: ['民法', '刑法', '行政法', '商法', '知识产权法', '国际法', '宪法', '法理学']
  },
  art: {
    schools: ['美术学院', '设计学院', '艺术学院', '传媒学院'],
    fields: ['视觉传达', '环境设计', '产品设计', '数字媒体艺术', '动画', '绘画', '雕塑', '艺术理论']
  }
};

// 简历项目模板
export const RESUME_TEMPLATES = {
  research: [
    { name: "参与实验室日常项目", quality: 'common', scoreRange: [5, 12] },
    { name: "课程设计小项目", quality: 'common', scoreRange: [6, 10] },
    { name: "校级科研项目参与", quality: 'rare', scoreRange: [15, 25] },
    { name: "省部级科研项目骨干", quality: 'rare', scoreRange: [20, 30] },
    { name: "国家级科研项目核心成员", quality: 'epic', scoreRange: [35, 50] },
    { name: "主持国家级大学生创新项目", quality: 'epic', scoreRange: [40, 55] },
    { name: "SCI/EI 一区论文发表(第一作者)", quality: 'legendary', scoreRange: [60, 80] },
    { name: "Nature/Science子刊论文发表", quality: 'legendary', scoreRange: [75, 95] },
  ],
  competition: [
    // ... 竞赛模板数据
  ]
};

// 随机事件 - 示例（完整数据在 App.tsx 中）
export const RANDOM_EVENTS: GameEvent[] = [
  // 事件数据将在后续补充
];

// 导师生成函数
export const generateRandomMentor = (majorType?: MajorType, university?: string): Mentor => {
  const lastNames = ['张', '王', '李', '赵', '刘', '陈', '杨', '周', '吴', '徐', '孙', '胡', '朱', '高', '林', '何', '郭', '马', '罗', '梁'];
  const firstNames = ['强', '伟', '芳', '娜', '敏', '静', '杰', '涛', '勇', '军', '明', '红', '磊', '洋', '艳', '勇', '斌', '霞', '平', '凡'];
  const titles = ['教授', '副教授', '助理教授', '博导', '杰青', '长江学者', '院士'];
  
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

export const generateNewMentorBatch = (count: number, majorType?: MajorType): Mentor[] => {
  return Array.from({ length: count }, () => generateRandomMentor(majorType));
};

// 注意：完整的常量数据（100+所大学、100+门课程、30+个随机事件等）
// 都已经在 App.tsx 中完整定义
// 本文件作为模块化重构的第一步，后续需要将所有数据迁移过来
// 为了不影响现有功能，建议采用渐进式迁移策略：
// 1. 先创建此文件定义数据结构
// 2. 在 App.tsx 中import并使用
// 3. 逐步将数据从 App.tsx 移动到此文件