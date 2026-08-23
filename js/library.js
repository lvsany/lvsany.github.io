(() => {
  const groups = [
    {
      id: 'compiler-theory',
      name: '编译原理',
      eyebrow: 'SYSTEMS FOUNDATION',
      description: '从文法到目标代码，按编译器的工作流程建立整体理解。',
      category: '/categories/Compiler/',
      start: ['从概论开始', '/2025/11/09/编译-概论/'],
      latest: ['最近更新：目标代码生成和优化', '/2025/11/11/编译-第十五章-目标代码生成和优化/'],
      stages: ['语言与文法', '词法与语法分析', '中间代码与优化'],
      posts: [
        ['编译-第01章-概论', '2025-11-09', '/2025/11/09/编译-概论/'],
        ['编译-第02章-文法和语言的概念和表示', '2025-11-09', '/2025/11/09/编译-文法和语言的概念和表示/'],
        ['编译-第03章-词法分析', '2025-11-22', '/2025/11/22/编译-第3章-词法分析-1763810151172/'],
        ['编译-第04章-语法分析（一）', '2025-11-20', '/2025/11/20/编译-第二阶段-语法分析-1763607465971/'],
        ['编译-第05章-符号表管理技术', '2025-11-22', '/2025/11/22/编译-第5章-符号表管理技术-1763810263042/'],
        ['编译-第06章-运行时的存储组织及管理', '2025-11-22', '/2025/11/22/编译-第6章-运行时的存储组织及管理-1763810315046/'],
        ['编译-第07章-生成中间代码', '2025-11-20', '/2025/11/20/编译-第七章-生成中间代码-1763573220537/'],
        ['编译-第08章-错误处理', '2025-11-22', '/2025/11/22/编译-第8章-错误处理-1763810587076/'],
        ['编译-第09章-语法制导翻译技术', '2025-11-22', '/2025/11/22/编译-第9章-语法制导翻译技术-1763810649654/'],
        ['编译-第11章-词法分析程序的自动生成技术', '2025-11-18', '/2025/11/18/编译-第十一章-词法分析程序的自动生成技术-1763424149748/'],
        ['编译-第12章-语法分析（二）', '2025-11-20', '/2025/11/20/编译-第十二章-语法分析（二）-1763607138715/'],
        ['编译-第14章-代码优化', '2025-11-03', '/2025/11/03/编译-第十四章-代码优化/'],
        ['编译-第15章-目标代码生成和优化', '2025-11-11', '/2025/11/11/编译-第十五章-目标代码生成和优化/']
      ]
    },
    {
      id: 'compiler-lab',
      name: '编译实践',
      eyebrow: 'HANDS-ON NOTES',
      description: '把编译原理落到实现细节中，记录实验、取舍与踩坑。',
      category: '/categories/Compiler/',
      start: ['查看实验日志', '/2025/10/01/编译-实验/'],
      latest: ['从课程实验切入', '/2025/10/01/编译-实验/'],
      stages: ['读懂任务', '动手实现', '复盘与迭代'],
      posts: [['编译-实验日志', '2025-10-01', '/2025/10/01/编译-实验/']]
    },
    {
      id: 'network',
      name: '计算机网络',
      eyebrow: 'NETWORK BASICS',
      description: '以分层模型为主线，逐步理解链路、网络与协议设计。',
      category: '/categories/C-Net/',
      start: ['从物理层开始', '/2025/09/09/计网-第二章-物理层/'],
      latest: ['最近更新：网络层', '/2025/11/08/计网-第四章-网络层/'],
      stages: ['物理连接', '可靠传输', '网络互联'],
      posts: [
        ['计网-第二章-物理层', '2025-09-09', '/2025/09/09/计网-第二章-物理层/'],
        ['计网-第三章-数据链路层', '2025-10-09', '/2025/10/09/计网-第三章-数据链路层/'],
        ['计网-第四章-网络层', '2025-11-08', '/2025/11/08/计网-第四章-网络层/']
      ]
    },
    {
      id: 'ai4se',
      name: 'AI × 软件工程',
      eyebrow: 'RESEARCH NOTES',
      description: '围绕 AI 编程、系统研究与论文阅读持续收集问题和答案。',
      category: '/categories/AI4SE/',
      start: ['从 Vibe Coding 论文开始', '/2025/11/18/vibe-coding-papers-1763466396078/'],
      latest: ['最近更新：CUDA Agent', '/posts/2026/08/17/cuda-agent-large-scale-agentic-rl-for-high-performance-cuda-kernel-generation/'],
      stages: ['问题与趋势', '论文与框架', '系统与实践'],
      posts: [
        ['bench papers', '2025-11-18', '/2025/11/18/vibe-coding-papers-1763466396078/'],
        ['frame papers', '2025-11-20', '/2025/11/20/frame-papers-1763576800308/'],
        ['CUDA Agent: Large-Scale Agentic RL for High-Performance CUDA Kernel Generation', '2026-08-17', '/posts/2026/08/17/cuda-agent-large-scale-agentic-rl-for-high-performance-cuda-kernel-generation/']
      ]
    }
  ];

  const root = document.querySelector('#library-groups');
  const total = groups.reduce((count, group) => count + group.posts.length, 0);
  document.querySelector('#library-total').textContent = total;
  document.querySelector('#library-topic-count').textContent = groups.length;

  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const render = () => {
    root.innerHTML = groups.map((group, index) => `<section class="library-group library-group--${group.id}" id="${group.id}">
      <header class="library-group-header">
        <p class="library-route-number">0${index + 1}</p>
        <p class="library-route-eyebrow">${escapeHtml(group.eyebrow)}</p>
        <span class="library-count">${group.posts.length} 篇笔记</span>
      </header>
      <div class="library-group-body">
        <h3>${escapeHtml(group.name)}</h3>
        <p>${escapeHtml(group.description)}</p>
        <ol class="library-stages">${group.stages.map((stage) => `<li>${escapeHtml(stage)}</li>`).join('')}</ol>
      </div>
      <footer class="library-group-footer">
        <a class="library-start" href="${encodeURI(group.start[1])}">${escapeHtml(group.start[0])} <span aria-hidden="true">→</span></a>
        <a class="library-latest" href="${encodeURI(group.latest[1])}">${escapeHtml(group.latest[0])}</a>
        <a class="library-all" href="${encodeURI(group.category)}">查看本主题文章 <span aria-hidden="true">↗</span></a>
      </footer>
    </section>`).join('');
  };
  render();
})();
