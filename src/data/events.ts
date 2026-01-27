import { GameEvent, PlayerStats } from '../App';

const csEvents: GameEvent[] = [
  {
    title: "GitHub Star 破百",
    description: "你开源的一个小工具突然在 GitHub 上火了，Star 数迅速破百。",
    majorRestriction: ["cs"],
    options: [{
      text: "认真维护 Issue",
      effect: (s) => ({
        newStats: { ...s, research: s.research + 15, mental: s.mental + 10 },
        log: "你不仅提升了名气，还学到了如何维护大型项目。"
      })
    }]
  },
  {
    title: "配置深度学习环境",
    description: "你买了一块二手的 RTX 3090，试图配置 CUDA 环境，但遇到了无尽的报错。",
    majorRestriction: ["cs"],
    options: [
      {
        text: "死磕到底",
        effect: (s) => ({
          newStats: { ...s, stamina: s.stamina - 20, research: s.research + 5 },
          log: "熬了一个通宵，你终于看到了 nvidia-smi 的正确输出。"
        })
      },
      {
        text: "找学长帮弄",
        effect: (s) => ({
          newStats: { ...s, mental: s.mental - 5 },
          moneyChange: -200,
          log: "学长收了你两顿饭钱，分分钟搞定。这就是经验的价值吗？"
        })
      }
    ]
  },
  {
    title: "算法竞赛失利",
    description: "你在一场重要的算法竞赛中因为一个小 bug 导致排名垫底。",
    majorRestriction: ["cs"],
    options: [{
      text: "复盘总结",
      effect: (s) => ({
        newStats: { ...s, mental: s.mental - 10, competition: s.competition + 8 },
        log: "虽然很难受，但你学到了一个极其隐蔽的边界情况处理。"
      })
    }]
  },
  {
    title: "发现内核漏洞",
    description: "你在写操作系统实验时，无意中发现了一个 Linux 内核的潜在安全风险。",
    majorRestriction: ["cs"],
    options: [{
      text: "提交 CVE 报告",
      effect: (s) => ({
        newStats: { ...s, research: s.research + 25, mental: s.mental + 15 },
        log: "报告被采纳了！你的名字出现在了贡献者名单中，简历厚度暴增。"
      })
    }]
  },
  {
    title: "深夜灵感：分布式共识",
    description: "你突然想到了一种改进 Raft 协议的方法，可以显著降低延迟。",
    majorRestriction: ["cs"],
    options: [{
      text: "写成论文草稿",
      effect: (s) => ({
        newStats: { ...s, research: s.research + 12, stamina: s.stamina - 15 },
        log: "虽然还没验证，但这绝对是个天才的想法。"
      })
    }]
  },
  {
    title: "参与大厂 Hackathon",
    description: "某大厂举办了为期 48 小时的黑客马拉松。",
    majorRestriction: ["cs"],
    options: [
      {
        text: "疯狂 Coding",
        effect: (s) => ({
          newStats: { ...s, competition: s.competition + 20, stamina: s.stamina - 40 },
          log: "你们的项目拿到了二等奖，但你感觉自己要飞升了。"
        }
      },
      {
        text: "划水 Networking",
        effect: (s) => ({
          newStats: { ...s, mental: s.mental + 10, competition: s.competition + 5 },
          log: "你认识了很多业界大佬，拿到了几个内推码。"
        })
      }
    ]
  },
  {
    title: "显卡过热报警",
    description: "你的服务器在训练模型时风扇突然停转，温度飙升。",
    majorRestriction: ["cs"],
    options: [{
      text: "赶紧停机检查",
      effect: (s) => ({
        newStats: { ...s, research: s.research - 2, stamina: s.stamina - 10 },
        log: "虚惊一场，只是灰尘太多了。你花了一下午清理机器。"
      })
    }]
  },
  {
    title: "LeetCode 每日一题连签 100 天",
    description: "你坚持完成了 100 天的每日一题。",
    majorRestriction: ["cs"],
    options: [{
      text: "奖励自己一顿火锅",
      effect: (s) => ({
        newStats: { ...s, competition: s.competition + 10, mental: s.mental + 10 },
        moneyChange: -150,
        log: "手感火热，现在你看到链表反转都能闭眼写出来。"
      })
    }]
  },
  {
    title: "ChatGPT 崩了",
    description: "OpenAI 宕机了，你发现自己居然不会写代码了。",
    majorRestriction: ["cs"],
    options: [{
      text: "硬着头皮查官方文档",
      effect: (s) => ({
        newStats: { ...s, research: s.research + 5, mental: s.mental - 5 },
        log: "你重新找回了作为程序员的尊严（和记忆）。"
      })
    }]
  },
  {
    title: "开源社区的谩骂",
    description: "你在一个知名项目中提交的 PR 被维护者狠狠地批了一顿，说你的代码风格太烂。",
    majorRestriction: ["cs"],
    options: [
      {
        text: "虚心接受并重构",
        effect: (s) => ({
          newStats: { ...s, research: s.research + 10, mental: s.mental - 15 },
          log: "虽然心碎，但你的工程能力确实得到了质的提升。"
        }
      },
      {
        text: "回喷并关闭 PR",
        effect: (s) => ({
          newStats: { ...s, mental: s.mental - 5 },
          log: "你感觉爽多了，但这个项目的门向你永久关闭了。"
        })
      }
    ]
  },
  {
    title: "实验室学长的内推",
    description: "学长告诉你，他所在的字节跳动组正在招暑期实习生，可以直接送简历。",
    majorRestriction: ["cs"],
    options: [{
      text: "熬夜修改简历",
      effect: (s) => ({
        newStats: { ...s, competition: s.competition + 5, stamina: s.stamina - 10 },
        log: "希望这份精美的简历能打动 HR。"
      })
    }]
  },
  {
    title: "配置 Arch Linux",
    description: "你决定挑战自我，在自己的主力机上安装 Arch Linux。",
    majorRestriction: ["cs"],
    options: [{
      text: "折腾了一整天",
      effect: (s) => ({
        newStats: { ...s, research: s.research + 8, stamina: s.stamina - 20 },
        log: "你现在是一个真正的 Linux 高手了（至少你会安装它）。"
      })
    }]
  },
  {
    title: "编译器前端作业",
    description: "你需要写一个解析 C 语言子集的编译器前端，递归下降让你头大。",
    majorRestriction: ["cs"],
    options: [{
      text: "通宵画语法树",
      effect: (s) => ({
        newStats: { ...s, research: s.research + 10, stamina: s.stamina - 15 },
        log: "看到代码被正确解析的那一刻，你感觉自己就是上帝。"
      })
    }]
  },
  {
    title: "数据库课程设计",
    description: "你设计的数据库范式不达标，导致插入数据时出现了大量的冗余。",
    majorRestriction: ["cs"],
    options: [{
      text: "重构数据库表结构",
      effect: (s) => ({
        newStats: { ...s, research: s.research + 6, mental: s.mental - 5 },
        log: "你深刻理解了第三范式的重要性。"
      })
    }]
  },
  {
    title: "发现冷门库的 Bug",
    description: "你在使用一个冷门的数据可视化库时发现了一个明显的逻辑错误。",
    majorRestriction: ["cs"],
    options: [{
      text: "提交修复代码",
      effect: (s) => ({
        newStats: { ...s, research: s.research + 7 },
        log: "作者非常感谢你，并在 README 中特别提到了你的贡献。"
      })
    }]
  },
  {
    title: "被邀请参加开发者大会",
    description: "因为你在某个领域的贡献，你收到了一张免费的开发者大会门票。",
    majorRestriction: ["cs"],
    options: [{
      text: "去现场听大佬吹牛",
      effect: (s) => ({
        newStats: { ...s, research: s.research + 5, mental: s.mental + 10 },
        log: "你对未来的技术趋势有了更清晰的认识。"
      })
    }]
  },
  {
    title: "服务器被挖矿",
    description: "你发现实验室的服务器 CPU 占用率一直是 100%，排查发现被植入了挖矿木马。",
    majorRestriction: ["cs"],
    options: [{
      text: "紧急修补安全漏洞",
      effect: (s) => ({
        newStats: { ...s, research: s.research + 10, mental: s.mental - 10 },
        log: "你学会了如何配置更严格的防火墙规则。"
      })
    }]
  },
  {
    title: "深度学习模型不收敛",
    description: "你跑了一周的模型，Loss 曲线居然是一条直线。",
    majorRestriction: ["cs"],
    options: [
      {
        text: "检查学习率和初始化",
        effect: (s) => ({
          newStats: { ...s, research: s.research + 8, stamina: s.stamina - 10 },
          log: "原来是学习率设得太大了，调小后 Loss 终于降了。"
        }
      },
      {
        text: "放弃这个方案",
        effect: (s) => ({
          newStats: { ...s, mental: s.mental - 10 },
          log: "这一周的算力都白费了，心痛。"
        })
      }
    ]
  },
  {
    title: "参加 CTF 比赛",
    description: "你被室友拉去参加了一场 CTF（夺旗赛）。",
    majorRestriction: ["cs"],
    options: [{
      text: "主攻 Web 安全",
      effect: (s) => ({
        newStats: { ...s, competition: s.competition + 12, mental: s.mental + 5 },
        log: "你成功破解了一个 SQL 注入题目，感觉自己像个黑客。"
      })
    }]
  },
  {
    title: "外包项目诱惑",
    description: "有个学弟找你写个简单的商城系统，开价 3000 元。",
    majorRestriction: ["cs"],
    options: [
      {
        text: "接单赚点零花钱",
        effect: (s) => ({
          newStats: { ...s, stamina: s.stamina - 20, research: s.research + 2 },
          moneyChange: 3000,
          log: "钱是赚到了，但你这一周都没时间复习期末考。"
        }
      },
      {
        text: "拒绝，专注科研",
        effect: (s) => ({
          newStats: { ...s, research: s.research + 5 },
          log: "你抵御住了诱惑，科研进度稳步推进。"
        })
      }
    ]
  },
  {
    title: "实验室的快乐水",
    description: "导师今天心情好，给实验室每个人都点了一杯奶茶。",
    majorRestriction: ["cs", "biology", "ee"],
    options: [{
      text: "开心地喝掉",
      effect: (s) => ({
        newStats: { ...s, mental: s.mental + 15, stamina: s.stamina + 10 },
        log: "多巴胺的分泌让你干劲十足。"
      })
    }]
  },
  {
    title: "论文一作被抢",
    description: "你辛辛苦苦做的实验，最后导师要把一作给他的关系户学弟。",
    majorRestriction: ["cs", "biology", "ee", "medicine"],
    options: [
      {
        text: "据理力争",
        effect: (s) => ({
          newStats: { ...s, mental: s.mental - 30, research: s.research + 10 },
          log: "虽然争取回了一作，但你和导师的关系彻底闹僵了。"
        }
      },
      {
        text: "默默忍受",
        effect: (s) => ({
          newStats: { ...s, mental: s.mental - 50, research: s.research + 5 },
          log: "你感觉自己的科研热情被浇了一盆冷水。"
        })
      }
    ]
  },
  {
    title: "显微镜下的‘惊喜’",
    description: "你在观察细胞时，发现了一株极具研究价值的变异株。",
    majorRestriction: ["biology"],
    options: [{
      text: "立即进行序列分析",
      effect: (s) => ({
        newStats: { ...s, research: s.research + 20, stamina: s.stamina - 10 },
        log: "这可能是你未来的研究方向！"
      })
    }]
  },
  {
    title: "培养皿污染",
    description: "因为你昨晚忘记关无菌操作台的风机，所有的培养皿都长满了杂菌。",
    majorRestriction: ["biology"],
    options: [{
      text: "含泪清理实验室",
      effect: (s) => ({
        newStats: { ...s, research: s.research - 10, mental: s.mental - 15 },
        log: "一周的努力全部归零，你深刻记住了操作规范。"
      })
    }]
  },
  {
    title: "野外采样遭遇大雨",
    description: "你在山里采集植物标本时，突然天降暴雨，你被困在了山洞里。",
    majorRestriction: ["biology"],
    options: [{
      text: "保护好标本",
      effect: (s) => ({
        newStats: { ...s, stamina: s.stamina - 30, research: s.research + 12 },
        log: "虽然你感冒了，但珍贵的标本完好无损。"
      })
    }]
  },
  {
    title: "生信分析软件报错",
    description: "你运行的分析脚本在处理 500GB 的数据时，运行到 99% 突然内存溢出崩溃了。",
    majorRestriction: ["biology"],
    options: [{
      text: "优化脚本逻辑",
      effect: (s) => ({
        newStats: { ...s, research: s.research + 8, mental: s.mental - 10 },
        log: "你学会了如何更高效地处理大规模生物信息数据。"
      })
    }]
  },
  {
    title: "参加全国生物学竞赛",
    description: "你代表学校参加了全国大学生生物学竞赛。",
    majorRestriction: ["biology"],
    options: [
      {
        text: "拼尽全力准备",
        effect: (s) => ({
          newStats: { ...s, competition: s.competition + 25, stamina: s.stamina - 20 },
          log: "你拿到了金奖，全院通报表扬！"
        }
      }
    ]
  },
  {
    title: "实验室的小白鼠逃跑了",
    description: "一只极其珍贵的基因敲除小鼠趁你不注意溜出了笼子。",
    majorRestriction: ["biology"],
    options: [{
      text: "全实验室大搜寻",
      effect: (s) => ({
        newStats: { ...s, stamina: s.stamina - 20, mental: s.mental - 10 },
        log: "折腾了半宿终于在冰箱后面抓住了它，你的心脏都要停了。"
      })
    }]
  },
  {
    title: "CRISPR 实验成功",
    description: "你成功利用 CRISPR 技术精准编辑了目标基因。",
    majorRestriction: ["biology"],
    options: [{
      text: "向导师汇报结果",
      effect: (s) => ({
        newStats: { ...s, research: s.research + 18, mental: s.mental + 15 },
        log: "导师对你的动手能力大加赞赏。"
      })
    }]
  },
  {
    title: "文献综述获得好评",
    description: "你写的关于合成生物学的文献综述被教授评价为‘达到了研究生水平’。",
    majorRestriction: ["biology", "humanities", "medicine"],
    options: [{
      text: "尝试投给校刊",
      effect: (s) => ({
        newStats: { ...s, research: s.research + 10, mental: s.mental + 10 },
        log: "你的学术写作能力得到了显著提升。"
      })
    }]
  },
  {
    title: "冷冻电镜预约成功",
    description: "你终于排到了那个排队半年的冷冻电镜使用名额。",
    majorRestriction: ["biology"],
    options: [{
      text: "通宵采集图像",
      effect: (s) => ({
        newStats: { ...s, research: s.research + 22, stamina: s.stamina - 25 },
        log: "这些高质量的图像足以让你发一篇 Top 期刊。"
      })
    }]
  },
  {
    title: "生态保护区的实习",
    description: "你获得了一个去热带雨林自然保护区实习的机会。",
    majorRestriction: ["biology"],
    options: [{
      text: "出发！拥抱大自然",
      effect: (s) => ({
        newStats: { ...s, research: s.research + 15, mental: s.mental + 20, stamina: s.stamina - 15 },
        log: "虽然蚊虫叮咬很多，但野外观察的经验是无价的。"
      })
    }]
  },
  {
    title: "古籍修复的成就感",
    description: "你花了一个月时间，终于修复了一页破损严重的明代孤本。",
    majorRestriction: ["humanities"],
    options: [{
      text: "记录修复心得",
      effect: (s) => ({
        newStats: { ...s, research: s.research + 15, mental: s.mental + 15 },
        log: "这种跨越时空的对话让你感到无比平静。"
      })
    }]
  },
  {
    title: "田野调查的阻碍",
    description: "你去偏远村落进行方言调查，但村民们对你非常警惕，不愿开口。",
    majorRestriction: ["humanities"],
    options: [
      {
        text: "住在村里，慢慢磨合",
        effect: (s) => ({
          newStats: { ...s, research: s.research + 12, mental: s.mental - 5, stamina: s.stamina - 15 },
          log: "通过帮大妈收庄稼，你终于获得了他们的信任。"
        }
      },
      {
        text: "放弃这个点，换一个地方",
        effect: (s) => ({
          newStats: { ...s, mental: s.mental - 10 },
          log: "时间紧迫，你只能无奈离开。"
        })
      }
    ]
  },
  {
    title: "历史剧的专业咨询",
    description: "一个剧组找你给他们的历史剧做学术顾问，纠正服装错误。",
    majorRestriction: ["humanities", "art"],
    options: [{
      text: "指出他们的低级错误",
      effect: (s) => ({
        newStats: { ...s, research: s.research + 5, mental: s.mental + 10 },
        moneyChange: 2000,
        log: "你拿到了丰厚的报酬，还为学术严谨性做出了贡献。"
      })
    }]
  },
  {
    title: "哲学辩论赛",
    description: "你在校际哲学辩论赛上，用精妙的逻辑驳倒了对方的论点。",
    majorRestriction: ["humanities"],
    options: [{
      text: "深藏功与名",
      effect: (s) => ({
        newStats: { ...s, competition: s.competition + 15, mental: s.mental + 10 },
        log: "你现在的逻辑思维能力已经登峰造极。"
      })
    }]
  },
  {
    title: "发现新的出土简牍",
    description: "你的导师带你去考古现场，你亲手清理出了一枚带有文字的简牍。",
    majorRestriction: ["humanities"],
    options: [{
      text: "兴奋得睡不着觉",
      effect: (s) => ({
        newStats: { ...s, research: s.research + 25, mental: s.mental + 20 },
        log: "这种亲手触摸历史的感觉，是任何课本都给不了的。"
      })
    }]
  },
  {
    title: "文献翻译工作",
    description: "出版社找你翻译一本德语哲学著作，工作量巨大。",
    majorRestriction: ["humanities"],
    options: [{
      text: "逐字逐句推敲",
      effect: (s) => ({
        newStats: { ...s, research: s.research + 18, stamina: s.stamina - 30, english: s.english + 10 },
        log: "翻译的过程也是深度学习的过程，你对该作者的理解提升了一个层次。"
      })
    }]
  },
  {
    title: "社会学问卷被拒",
    description: "你发出的 1000 份问卷，回收率居然不到 5%，且大部分是乱填的。",
    majorRestriction: ["humanities", "general"],
    options: [{
      text: "重新设计问卷并线下发放",
      effect: (s) => ({
        newStats: { ...s, research: s.research + 10, stamina: s.stamina - 20, mental: s.mental - 10 },
        log: "虽然辛苦，但你拿到了第一手真实可靠的数据。"
      })
    }]
  },
  {
    title: "博物馆志愿讲解员",
    description: "你利用周末时间在省博物馆做义务讲解员。",
    majorRestriction: ["humanities", "art"],
    options: [{
      text: "耐心地为游客讲解",
      effect: (s) => ({
        newStats: { ...s, mental: s.mental + 15, research: s.research + 5 },
        log: "在输出知识的同时，你对知识的掌握也更牢固了。"
      })
    }]
  }
];

const eeEvents: GameEvent[] = [
  {
    title: "焊台烫到手",
    description: "你在焊接 PCB 时，不小心碰到了烙铁头。",
    majorRestriction: ["ee"],
    options: [{
      text: "冲冷水并贴上创可贴",
      effect: (s) => ({
        newStats: { ...s, stamina: s.stamina - 5, mental: s.mental - 5 },
        log: "每一个硬件工程师的成长都伴随着烫伤。"
      })
    }]
  },
  {
    title: "示波器捕捉到完美波形",
    description: "调试了一整天，你终于在示波器上看到了那个纯净的正弦波。",
    majorRestriction: ["ee"],
    options: [{
      text: "截图并保存数据",
      effect: (s) => ({
        newStats: { ...s, research: s.research + 12, mental: s.mental + 15 },
        log: "那一刻，你觉得电子工程是世界上最美的学科。"
      })
    }]
  },
  {
    title: "FPGA 编译报错",
    description: "你的 Verilog 代码报了 100 多个语法错误，大多是拼写问题。",
    majorRestriction: ["ee"],
    options: [{
      text: "逐行检查分号和括号",
      effect: (s) => ({
        newStats: { ...s, research: s.research + 6, stamina: s.stamina - 15 },
        log: "你深刻体会到了硬件描述语言的严谨性。"
      })
    }]
  },
  {
    title: "芯片流片成功",
    description: "你参与设计的射频芯片流片结果出来了，各项指标均达标。",
    majorRestriction: ["ee"],
    options: [{
      text: "去实验室庆祝",
      effect: (s) => ({
        newStats: { ...s, research: s.research + 30, mental: s.mental + 20 },
        log: "这是你简历上最闪亮的一笔。"
      })
    }]
  },
  {
    title: "PCB 布线竞赛",
    description: "学校举办了 PCB 布线速度大赛。",
    majorRestriction: ["ee"],
    options: [{
      text: "挑战高难度 6 层板",
      effect: (s) => ({
        newStats: { ...s, competition: s.competition + 18, stamina: s.stamina - 15 },
        log: "你的走线极具艺术感，拿到了最佳设计奖。"
      })
    }]
  },
  {
    title: "信号干扰问题",
    description: "你的电路板在靠近手机时会产生严重的电磁干扰。",
    majorRestriction: ["ee"],
    options: [{
      text: "添加屏蔽罩和滤波电容",
      effect: (s) => ({
        newStats: { ...s, research: s.research + 10, stamina: s.stamina - 10 },
        log: "你对 EMC（电磁兼容性）有了更深的认识。"
      })
    }]
  },
  {
    title: "嵌入式系统开发",
    description: "你试图在 STM32 上移植一个实时操作系统（RTOS）。",
    majorRestriction: ["ee", "cs"],
    options: [{
      text: "手写调度器逻辑",
      effect: (s) => ({
        newStats: { ...s, research: s.research + 15, stamina: s.stamina - 20 },
        log: "你现在对 CPU 的上下文切换了如指掌。"
      })
    }]
  },
  {
    title: "天线设计实测",
    description: "你在楼顶实测自己设计的天线增益。",
    majorRestriction: ["ee"],
    options: [{
      text: "在寒风中记录数据",
      effect: (s) => ({
        newStats: { ...s, research: s.research + 12, stamina: s.stamina - 15, mental: s.mental + 5 },
        log: "虽然冷，但实测结果证明了你的理论模型是正确的。"
      })
    }]
  },
  {
    title: "购买昂贵的示波器",
    description: "你攒钱买了一台高带宽的数字示波器。",
    majorRestriction: ["ee"],
    options: [{
      text: "从此告别实验室排队",
      effect: (s) => ({
        newStats: { ...s, mental: s.mental + 20 },
        moneyChange: -5000,
        log: "虽然钱包空了，但效率翻倍了。"
      })
    }]
  },
  {
    title: "参加电子设计竞赛",
    description: "全国大学生电子设计竞赛开始了，四天三夜不睡觉。",
    majorRestriction: ["ee"],
    options: [{
      text: "硬扛到底",
      effect: (s) => ({
        newStats: { ...s, competition: s.competition + 30, stamina: s.stamina - 60 },
        log: "你们的作品拿到了国一！这几天的辛苦完全值得。"
      })
    }]
  }
];

const medicineEvents: GameEvent[] = [
  {
    title: "第一次临床见习",
    description: "你第一次穿上白大褂，走进了医院的科室。",
    majorRestriction: ["medicine"],
    options: [{
      text: "紧张地记录病例",
      effect: (s) => ({
        newStats: { ...s, research: s.research + 10, mental: s.mental + 10 },
        log: "你感受到了医生的责任与压力。"
      })
    }]
  },
  {
    title: "解剖实验的震撼",
    description: "在解剖课上，你对大体老师（遗体捐献者）产生了深深的敬意。",
    majorRestriction: ["medicine"],
    options: [{
      text: "肃穆地完成实验",
      effect: (s) => ({
        newStats: { ...s, research: s.research + 15, stamina: s.stamina - 20 },
        log: "医学的严谨与人性的光辉在你心中交织。"
      })
    }]
  },
  {
    title: "背诵《药理学》",
    description: "《药理学》的各种药物名称和副作用让你感到头大。",
    majorRestriction: ["medicine"],
    options: [{
      text: "死记硬背",
      effect: (s) => ({
        newStats: { ...s, gpa: s.gpa + 0.1, mental: s.mental - 15 },
        log: "你现在闭上眼都是阿托品的副作用。"
      })
    }]
  },
  {
    title: "缝合练习",
    description: "你在猪皮上练习了一晚上的外科缝合。",
    majorRestriction: ["medicine"],
    options: [{
      text: "追求极致的整齐",
      effect: (s) => ({
        newStats: { ...s, research: s.research + 8, stamina: s.stamina - 15 },
        log: "你的手感越来越稳，缝合口非常漂亮。"
      })
    }]
  },
  {
    title: "急诊室的突发状况",
    description: "你在急诊科见习时，遇到了一名大出血的病人。",
    majorRestriction: ["medicine"],
    options: [
      {
        text: "协助学长进行紧急处理",
        effect: (s) => ({
          newStats: { ...s, research: s.research + 12, mental: s.mental - 10, stamina: s.stamina - 20 },
          log: "虽然手心冒汗，但你成功完成了学长交代的止血任务。"
        }
      }
    ]
  },
  {
    title: "医学技能大赛",
    description: "学校举办了临床操作技能大赛。",
    majorRestriction: ["medicine"],
    options: [{
      text: "展示标准的心肺复苏",
      effect: (s) => ({
        newStats: { ...s, competition: s.competition + 20, mental: s.mental + 5 },
        log: "你的动作非常标准，获得了评委的一致好评。"
      })
    }]
  },
  {
    title: "撰写 SCI 论文",
    description: "你试图将实验室的临床数据整理成一篇 SCI 论文。",
    majorRestriction: ["medicine", "biology"],
    options: [{
      text: "反复修改讨论部分",
      effect: (s) => ({
        newStats: { ...s, research: s.research + 25, stamina: s.stamina - 25 },
        log: "经过半年打磨，论文终于被一区期刊录用了！"
      })
    }]
  },
  {
    title: "医患沟通模拟",
    description: "课程要求你模拟向家属交代病情。",
    majorRestriction: ["medicine"],
    options: [{
      text: "充满人文关怀的沟通",
      effect: (s) => ({
        newStats: { ...s, mental: s.mental + 15 },
        log: "你不仅掌握了医学知识，还学会了如何给予安慰。"
      })
    }]
  },
  {
    title: "参加学术会议旁听",
    description: "本市有一场顶尖的国际学术会议，但票价昂贵。",
    majorRestriction: ["medicine"],
    options: [{
      text: "自费买票去开眼界",
      effect: (s) => ({
        newStats: { ...s, research: s.research + 10, mental: s.mental + 5 },
        moneyChange: -800,
        log: "你在茶歇时间鼓起勇气向领域内的大佬请教了一个问题，大佬对你印象很深。"
      })
    }]
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
        }
      }
    ]
  }
];

const lawEvents: GameEvent[] = [
  {
    title: "模拟法庭大赛",
    description: "你代表学校参加了全国性的模拟法庭比赛。",
    majorRestriction: ["law"],
    options: [{
      text: "作为主辩律师发言",
      effect: (s) => ({
        newStats: { ...s, competition: s.competition + 25, mental: s.mental + 10 },
        log: "你在法庭上的雄辩让对方律师哑口无言。"
      })
    }]
  },
  {
    title: "背诵《民法典》",
    description: "为了期末考，你开始疯狂背诵《民法典》的条文。",
    majorRestriction: ["law"],
    options: [{
      text: "理解背后的法理",
      effect: (s) => ({
        newStats: { ...s, gpa: s.gpa + 0.12, mental: s.mental - 10 },
        log: "你不仅背下了条文，还理解了它们在现实中的适用场景。"
      })
    }]
  },
  {
    title: "法律援助中心实习",
    description: "你在法律援助中心接到了一个复杂的劳务纠纷咨询。",
    majorRestriction: ["law"],
    options: [{
      text: "查阅大量案例库",
      effect: (s) => ({
        newStats: { ...s, research: s.research + 15, stamina: s.stamina - 15 },
        log: "你帮当事人找到了关键的法律依据，挽回了损失。"
      })
    }]
  },
  {
    title: "参加律所开放日",
    description: "红圈所举办了校园开放日，门槛极高。",
    majorRestriction: ["law"],
    options: [{
      text: "准备全英文面试",
      effect: (s) => ({
        newStats: { ...s, competition: s.competition + 10, english: s.english + 5 },
        log: "合伙人对你的法律逻辑和语言能力赞不绝口。"
      })
    }]
  },
  {
    title: "发现法律漏洞",
    description: "你在写学年论文时，发现现行法律在某个新兴领域的滞后性。",
    majorRestriction: ["law"],
    options: [{
      text: "撰写修法建议稿",
      effect: (s) => ({
        newStats: { ...s, research: s.research + 20, mental: s.mental + 10 },
        log: "虽然还很稚嫩，但你的论文获得了省优秀学年论文奖。"
      })
    }]
  },
  {
    title: "辩论社的激辩",
    description: "在辩论社，大家就死刑的废存问题展开了激烈的讨论。",
    majorRestriction: ["law", "humanities"],
    options: [{
      text: "用宪法原则进行反击",
      effect: (s) => ({
        newStats: { ...s, mental: s.mental + 15 },
        log: "思辨的过程让你对公平正义有了更深的体悟。"
      })
    }]
  },
  {
    title: "整理导师的判例集",
    description: "导师交给你 100 份判例，让你总结其中的裁判规则。",
    majorRestriction: ["law"],
    options: [{
      text: "埋头在卷宗堆里",
      effect: (s) => ({
        newStats: { ...s, research: s.research + 12, stamina: s.stamina - 20 },
        log: "这种扎实的基本功训练让你受益匪浅。"
      })
    }]
  },
  {
    title: "通过法律职业资格考试",
    description: "你提前准备并参加了法考，查分时刻到了。",
    majorRestriction: ["law"],
    options: [{
      text: "屏住呼吸点开页面",
      effect: (s) => ({
        newStats: { ...s, competition: s.competition + 35, mental: s.mental + 20 },
        log: "高分通过！你拿到了进入法律界的‘金钥匙’。"
      })
    }]
  },
  {
    title: "深夜灵感迸发",
    description: "你在洗手间镜子上画出了那个困扰你半个月的法律关系图。",
    majorRestriction: ["law"],
    options: [
      {
        text: "立刻回寝室记下来",
        effect: (s) => ({
          newStats: { ...s, research: s.research + 15, mental: s.mental + 10 },
          log: "这个逻辑点将成为你保研论文的核心论据。"
        }
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
        }
      }
    ]}
 ];
 
 const artEvents: GameEvent[] = [
  {
    title: "艺术展策展邀请",
    description: "本地一家画廊邀请你参与策划一个青年艺术家联展。",
    majorRestriction: ["art"],
    options: [{
      text: "投入策划工作",
      effect: (s) => ({
        newStats: { ...s, research: s.research + 20, mental: s.mental + 10, stamina: s.stamina - 20 },
        log: "展览非常成功，你的策展能力得到了圈内认可。"
      })
    }]
  },
  {
    title: "写生课的意外发现",
    description: "你在野外写生时，发现了一种从未见过的光影表现手法。",
    majorRestriction: ["art"],
    options: [{
      text: "立刻画下来",
      effect: (s) => ({
        newStats: { ...s, research: s.research + 12, mental: s.mental + 15 },
        log: "这种独特的风格成为了你作品集的亮点。"
      })
    }]
  },
  {
    title: "作品集被大牛批评",
    description: "你满怀信心地把作品集给一位业内大牛看，结果被批得一无是处。",
    majorRestriction: ["art"],
    options: [{
      text: "推倒重来",
      effect: (s) => ({
        newStats: { ...s, research: s.research + 25, mental: s.mental - 30, stamina: s.stamina - 40 },
        log: "虽然极其痛苦，但重构后的作品集确实有了质的飞跃。"
      })
    }]
  },
  {
    title: "数位板坏了",
    description: "在赶 DDl 的关键时刻，你的数位板压感突然消失了。",
    majorRestriction: ["art"],
    options: [
      {
        text: "用鼠标硬画",
        effect: (s) => ({
          newStats: { ...s, stamina: s.stamina - 30, mental: s.mental - 10 },
          log: "你练就了惊人的鼠标绘图能力，但手快断了。"
        }
      },
      {
        text: "找人借一个",
        effect: (s) => ({
          newStats: { ...s, mental: s.mental + 5 },
          moneyChange: -100,
          log: "你请学妹喝了杯奶茶，借到了板子。"
        }
      }
    ]
  },
  {
    title: "参加国际插画大赛",
    description: "你投递的作品入围了某知名国际插画奖。",
    majorRestriction: ["art"],
    options: [{
      text: "前往现场参加颁奖礼",
      effect: (s) => ({
        newStats: { ...s, competition: s.competition + 30, mental: s.mental + 20 },
        log: "你拿到了银奖！这是你保研路上最有力的敲门砖。"
      })
    }]
  },
  {
    title: "艺术史期末考",
    description: "你需要在一周内背下 500 个艺术家的流派和代表作。",
    majorRestriction: ["art"],
    options: [{
      text: "疯狂背诵",
      effect: (s) => ({
        newStats: { ...s, gpa: s.gpa + 0.1, stamina: s.stamina - 20 },
        log: "你现在看谁都像印象派。"
      })
    }]
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
        }
      }
    ]
  },
  {
    title: "发现冷门艺术形式",
    description: "你在旧货市场发现了一种古老的民间艺术，决定将其融入现代设计。",
    majorRestriction: ["art"],
    options: [{
      text: "深入研究并创作",
      effect: (s) => ({
        newStats: { ...s, research: s.research + 15, mental: s.mental + 10 },
        log: "这种‘新中式’风格让你的作品脱颖而出。"
      })
    }]
  },
  {
    title: "艺术批评讲座",
    description: "一位著名的艺术评论家来校讲座，观点非常激进。",
    majorRestriction: ["art", "humanities"],
    options: [{
      text: "在提问环节与其辩论",
      effect: (s) => ({
        newStats: { ...s, research: s.research + 10, mental: s.mental + 5 },
        log: "你的见解引起了评论家的注意，他主动留了你的联系方式。"
      })
    }]
  },
  {
    title: "设计外包被甲方放鸽子",
    description: "你辛苦改了十稿的设计，甲方突然说不需要了，还不给尾款。",
    majorRestriction: ["art"],
    options: [{
      text: "投诉并维权",
      effect: (s) => ({
        newStats: { ...s, mental: s.mental - 20 },
        log: "虽然没拿回钱，但你学会了如何保护自己的知识产权。"
      })
    }]
  }
];

const generalEvents: GameEvent[] = [
  {
    title: "宏观经济模型模拟",
    description: "你在计算机上模拟了一个复杂的宏观经济模型，预测非常准确。",
    majorRestriction: ["general"],
    options: [{
      text: "整理成学术报告",
      effect: (s) => ({
        newStats: { ...s, research: s.research + 15, mental: s.mental + 10 },
        log: "教授对你的数据敏感度感到吃惊。"
      })
    }]
  },
  {
    title: "统计学作业报错",
    description: "你的 R 语言脚本在处理几百万行数据时报错了，因为有一个缺失值未处理。",
    majorRestriction: ["general"],
    options: [{
      text: "耐心地进行数据清洗",
      effect: (s) => ({
        newStats: { ...s, research: s.research + 10, stamina: s.stamina - 15 },
        log: "数据清洗虽然枯燥，但却是科研的基石。"
      })
    }]
  },
  {
    title: "参加投行暑期实习面试",
    description: "你获得了一个顶级投行的暑期实习面试机会，但面试官非常严厉。",
    majorRestriction: ["general"],
    options: [
      {
        text: "展现专业深度：深入讨论估值模型",
        effect: (s) => ({
          newStats: { ...s, competition: s.competition + 15, mental: s.mental - 10 },
          log: "面试官对你的专业知识印象深刻！你拿到了实习 Offer。"
        }
      },
      {
        text: "展现综合素质：谈论你的领导力经验",
        effect: (s) => ({
          newStats: { ...s, mental: s.mental + 5, competition: s.competition + 5 },
          log: "面试氛围很愉快，面试官认为你很有潜力。"
        }
      }
    ]
  },
  {
    title: "参加数学建模大赛",
    description: "美国大学生数学建模竞赛（MCM/ICM）开始了。",
    majorRestriction: ["general", "cs", "ee"],
    options: [{
      text: "通宵建模、编程和写论文",
      effect: (s) => ({
        newStats: { ...s, competition: s.competition + 25, stamina: s.stamina - 45 },
        log: "你们拿到了 O 奖（特等奖）！这是最高荣誉。"
      })
    }]
  },
  {
    title: "发现经典理论的局限性",
    description: "你在阅读文献时，发现某个经典经济理论在当前互联网环境下不再适用。",
    majorRestriction: ["general"],
    options: [{
      text: "撰写挑战论文",
      effect: (s) => ({
        newStats: { ...s, research: s.research + 20, mental: s.mental + 15 },
        log: "这种批判性思维正是顶尖院校最看重的特质。"
      })
    }]
  },
  {
    title: "社团财务审计",
    description: "作为学生会财务部成员，你发现社团账目有 500 元的对不上。",
    majorRestriction: ["general"],
    options: [{
      text: "通宵核对每一笔流水",
      effect: (s) => ({
        newStats: { ...s, stamina: s.stamina - 15, mental: s.mental + 10 },
        log: "你找到了那个被漏记的小额支出，职业道德得到了提升。"
      })
    }]
  },
  {
    title: "跨国企业调研",
    description: "你获得了一个去某知名外企实地调研的机会。",
    majorRestriction: ["general"],
    options: [{
      text: "准备详细的访谈提纲",
      effect: (s) => ({
        newStats: { ...s, research: s.research + 12, mental: s.mental + 10 },
        log: "实地调研让你对企业的运作有了直观的认识。"
      })
    }]
  },
  {
    title: "雅思/托福首战告捷",
    description: "你收到了语言考试的成绩单。",
    majorRestriction: ["general", "humanities"],
    options: [{
      text: "高分通过",
      effect: (s) => ({
        newStats: { ...s, english: s.english + 25, mental: s.mental + 20 },
        log: "英语大关已过，你可以全身心投入科研了。"
      })
    }]
  },
  {
    title: "管理案例大赛",
    description: "你带队参加了全国大学生管理案例大赛。",
    majorRestriction: ["general"],
    options: [{
      text: "在台上自信地进行 Pre",
      effect: (s) => ({
        newStats: { ...s, competition: s.competition + 20, mental: s.mental + 15 },
        log: "你的领导力和演讲水平折服了全场。"
      })
    }]
  },
  {
    title: "发现冷门统计方法",
    description: "你在图书馆的一本旧书里发现了一种非常适合处理你手头数据的统计方法。",
    majorRestriction: ["general"],
    options: [{
      text: "立即尝试并验证",
      effect: (s) => ({
        newStats: { ...s, research: s.research + 15, mental: s.mental + 10 },
        log: "数据结果变得非常漂亮且具有说服力。"
      })
    }]
  }
];

export const ALL_PERSONALIZED_EVENTS = [
  ...csEvents,
  ...biologyEvents,
  ...humanitiesEvents,
  ...eeEvents,
  ...medicineEvents,
  ...lawEvents,
  ...artEvents,
  ...generalEvents,
];