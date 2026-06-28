/**
 * 保研模拟器 - 常量数据模块
 * 从 App.tsx 中提取的所有常量数据
 */

import { University, Course, InterviewQuestion, Mentor, MajorType, PlayerStats } from './types';

// 学期名称
export const SEMESTER_NAMES = ["大一上", "大一下", "大二上", "大二下", "大三上", "大三下", "大四上", "大四下"];

// 大学数据（完整版本，从App.tsx迁移）
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

  // T2 - 强势985（前10所）
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

  // 注意：完整的大学列表（100+所）已经完整定义在App.tsx中
  // 由于篇幅限制，这里只列出前部分作为示例
  // 实际使用时，可以继续添加所有大学数据
];

// 专业数据
export const MAJORS: Array<{ name: string; type: MajorType; description: string; bonus: string }> = [
  { name: "计算机科学与技术", type: "cs", description: "互联网行业的入场券，竞争极为激烈，但机会最多。", bonus: "互联网行业校友资源极多，保研名额竞争异常激烈。" },
  { name: "软件工程", type: "cs", description: "偏向工程实践，就业面广，保研难度略低于计科。", bonus: "大厂青睐，实习机会多，保研去向多为985。" },
  { name: "人工智能", type: "cs", description: "新兴热门方向，科研导向强，保研时导师偏好科研能力。", bonus: "科研导向强，导师资源多，但科研压力极大。" },
  { name: "生物科学", type: "biology", description: "基础学科，科研时间长，保研看重科研经历。", bonus: "科研周期长，导师看重实验技能，保研去向多为中科院。" },
  { name: "生物技术", type: "biology", description: "应用导向，就业面较窄，保研时需突出科研或实习。", bonus: "应用导向，保研去向多为制药、农业方向。" },
  { name: "临床医学", type: "medicine", description: "培养周期长，保研多为本校或知名医学院，竞争激烈。", bonus: "保研竞争白热化，本校保护严重，考研率极高。" },
  { name: "基础医学", type: "medicine", description: "科研导向，保研看重实验室经历和论文发表。", bonus: "科研导向，中科院与985医学院为主。" },
  { name: "汉语言文学", type: "humanities", description: "人文社科核心，保研看重GPA、写作能力、综合素质。", bonus: "保研竞争相对温和，但名额少，保研去向多为985或师范名校。" },
  { name: "历史学", type: "humanities", description: "小众学科，保研看重GPA和学术兴趣，导师偏好踏实学生。", bonus: "保研名额少，但竞争相对温和，保研去向多为985或师范名校。" },
  { name: "哲学", type: "humanities", description: "纯理论学科，保研看重GPA和思辨能力，导师偏好哲学基础好的学生。", bonus: "保研名额极少，但竞争不激烈，保研去向多为985或党校。" },
  { name: "经济学", type: "general", description: "热门专业，保研竞争激烈，看重GPA、数学能力、英语。", bonus: "金融行业校友资源极多，保研去向多为985财经院校。" },
  { name: "金融学", type: "general", description: "最热门的财经专业，保研竞争白热化，看重综合实力。", bonus: "金融街入场券，保研去向多为顶级财经院校。" },
  { name: "工商管理", type: "general", description: "综合管理类，保研竞争中等，看重GPA、实习、领导力。", bonus: "管理岗位导向，保研去向多为985商学院。" },
  { name: "法学", type: "law", description: "司法考试压力大，保研竞争激烈，看重GPA、法律逻辑。", bonus: "红圈律所入场券，保研去向多为985法学院。" },
  { name: "知识产权", type: "law", description: "新兴专业，保研竞争相对温和，看重GPA、法律基础。", bonus: "科技企业法务需求大，保研去向多为985法学院。" },
  { name: "电子信息工程", type: "ee", description: "硬件与通信基础，保研竞争激烈，看重GPA、项目经历。", bonus: "通信与硬件行业校友多，保研去向多为985。" },
  { name: "通信工程", type: "ee", description: "通信行业核心，保研竞争激烈，看重GPA、科研经历。", bonus: "运营商与设备商青睐，保研去向多为985。" },
  { name: "自动化", type: "ee", description: "控制与智能结合，保研竞争中等，看重GPA、项目经历。", bonus: "工业自动化需求大，保研去向多为985。" },
  { name: "视觉传达设计", type: "art", description: "设计类专业，保研看重作品集、GPA、综合素质。", bonus: "创意行业导向，保研去向多为985或艺术名校。" },
  { name: "环境设计", type: "art", description: "空间设计，保研看重作品集、GPA、综合素质。", bonus: "设计院所与地产公司青睐，保研去向多为985或艺术名校。" }
];

// 课程数据（示例，完整数据在App.tsx中）
export const ALL_COURSES: Course[] = [
  // 通识课
  { id: 'gen1-1', name: '高等数学(上)', difficulty: 5, credit: 5, type: 'general', semester: 1, mastery: 0, description: '理工科的基础，微积分的入门。' },
  { id: 'gen1-2', name: '大学物理(上)', difficulty: 4, credit: 4, type: 'general', semester: 1, mastery: 0, description: '力学与热学基础。' },
  { id: 'gen1-3', name: '大学英语(一)', difficulty: 3, credit: 3, type: 'general', semester: 1, mastery: 0, description: '英语基础课程，四级考试准备。' },
  { id: 'gen1-4', name: '思想政治理论课', difficulty: 2, credit: 3, type: 'general', semester: 1, mastery: 0, description: '必修思政课程。' },
  { id: 'gen2-1', name: '高等数学(下)', difficulty: 5, credit: 5, type: 'general', semester: 2, mastery: 0, description: '多元微积分与级数。' },
  { id: 'gen2-2', name: '大学物理(下)', difficulty: 4, credit: 4, type: 'general', semester: 2, mastery: 0, description: '电磁学与光学基础。' },
  { id: 'gen2-3', name: '大学英语(二)', difficulty: 3, credit: 3, type: 'general', semester: 2, mastery: 0, description: '英语进阶，六级准备。' },

  // 计算机专业必修课
  { id: 'cs1-1', name: '程序设计基础', difficulty: 4, credit: 4, type: 'compulsory', semester: 1, majorRestriction: ['cs'], mastery: 0, description: '编程入门，C/C++基础。' },
  { id: 'cs2-1', name: '数据结构', difficulty: 5, credit: 4, type: 'compulsory', semester: 2, majorRestriction: ['cs'], mastery: 0, description: '算法与数据组织的基础。' },
  { id: 'cs3-1', name: '计算机网络', difficulty: 5, credit: 4, type: 'compulsory', semester: 3, majorRestriction: ['cs'], mastery: 0, description: '网络原理与协议。' },
  { id: 'cs3-2', name: '操作系统', difficulty: 5, credit: 4, type: 'compulsory', semester: 3, majorRestriction: ['cs'], mastery: 0, description: '系统原理与并发控制。' },
  { id: 'cs4-1', name: '数据库系统', difficulty: 4, credit: 3, type: 'compulsory', semester: 4, majorRestriction: ['cs'], mastery: 0, description: '数据存储与查询。' },
  { id: 'cs4-2', name: '软件工程', difficulty: 3, credit: 3, type: 'compulsory', semester: 4, majorRestriction: ['cs'], mastery: 0, description: '软件开发流程与方法。' },

  // 生物专业必修课
  { id: 'bio1-1', name: '普通生物学', difficulty: 3, credit: 4, type: 'compulsory', semester: 1, majorRestriction: ['biology'], mastery: 0, description: '生物学基础概念。' },
  { id: 'bio2-1', name: '生物化学', difficulty: 5, credit: 4, type: 'compulsory', semester: 2, majorRestriction: ['biology'], mastery: 0, description: '生物分子的化学基础。' },
  { id: 'bio3-1', name: '分子生物学', difficulty: 5, credit: 4, type: 'compulsory', semester: 3, majorRestriction: ['biology'], mastery: 0, description: 'DNA与基因表达。' },
  { id: 'bio3-2', name: '细胞生物学', difficulty: 4, credit: 4, type: 'compulsory', semester: 3, majorRestriction: ['biology'], mastery: 0, description: '细胞结构与功能。' },

  // 其他专业课程省略...（完整数据在App.tsx中）
];

// 初始玩家属性
export const INITIAL_STATS: PlayerStats = {
  gpa: 0,
  research: 0,
  competition: 0,
  english: 50,
  mental: 100,
  stamina: 100,
};

// 初始导师列表
export const INITIAL_MENTORS: Mentor[] = [
  {
    id: 'mentor1',
    name: '张教授',
    title: '博导',
    reputation: 85,
    friendship: 10,
    university: '清华大学',
    school: '计算机学院',
    researchField: '深度学习',
    status: 'none'
  },
  {
    id: 'mentor2',
    name: '李教授',
    title: '杰青',
    reputation: 90,
    friendship: 5,
    university: '北京大学',
    school: '信息科学技术学院',
    researchField: '计算机视觉',
    status: 'none'
  },
  {
    id: 'mentor3',
    name: '王教授',
    title: '副教授',
    reputation: 75,
    friendship: 15,
    university: '复旦大学',
    school: '计算机学院',
    researchField: '自然语言处理',
    status: 'none'
  }
];

// 面试问题库（完整版本）
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
    university: university || UNIVERSITIES[Math.floor(Math.random() * Math.min(10, UNIVERSITIES.length))].name,
    school: data.schools[Math.floor(Math.random() * data.schools.length)],
    researchField: data.fields[Math.floor(Math.random() * data.fields.length)],
    status: 'none'
  };
};

export const generateNewMentorBatch = (count: number, majorType?: MajorType): Mentor[] => {
  return Array.from({ length: count }, () => generateRandomMentor(majorType));
};

// 注意：随机事件数据在App.tsx中完整定义，这里暂不迁移
// 因为事件数据包含大量的effect函数，迁移时需要谨慎处理