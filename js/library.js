(() => {
  const groups = [
    {
      id: 'compiler-theory', name: '编译原理', description: '从文法到代码生成的系统化笔记',
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
    { id: 'compiler-lab', name: '编译实践', description: '课程实验与实现过程记录', posts: [['编译-实验日志', '2025-10-01', '/2025/10/01/编译-实验/']] },
    {
      id: 'network', name: '计算机网络', description: '网络分层与协议学习笔记',
      posts: [
        ['计网-第二章-物理层', '2025-09-09', '/2025/09/09/计网-第二章-物理层/'],
        ['计网-第三章-数据链路层', '2025-10-09', '/2025/10/09/计网-第三章-数据链路层/'],
        ['计网-第四章-网络层', '2025-11-08', '/2025/11/08/计网-第四章-网络层/']
      ]
    },
    {
      id: 'ai4se', name: 'AI × 软件工程', description: 'Vibe coding、论文调研与 AI 系统研究',
      posts: [
        ['bench papers', '2025-11-18', '/2025/11/18/vibe-coding-papers-1763466396078/'],
        ['frame papers', '2025-11-20', '/2025/11/20/frame-papers-1763576800308/'],
        ['CUDA Agent: Large-Scale Agentic RL for High-Performance CUDA Kernel Generation', '2026-08-17', '/posts/2026/08/17/cuda-agent-large-scale-agentic-rl-for-high-performance-cuda-kernel-generation/']
      ]
    }
  ];

  const root = document.querySelector('#library-groups');
  const search = document.querySelector('#library-search');
  const total = groups.reduce((count, group) => count + group.posts.length, 0);
  document.querySelector('#library-total').textContent = total;
  document.querySelector('#library-topic-count').textContent = groups.length;

  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const render = (query = '') => {
    const keyword = query.trim().toLowerCase();
    const cards = groups.map((group) => ({ ...group, posts: group.posts.filter(([title]) => !keyword || `${group.name} ${group.description} ${title}`.toLowerCase().includes(keyword)) })).filter((group) => group.posts.length);
    root.innerHTML = cards.length ? cards.map((group) => `<section class="library-group" id="${group.id}"><header class="library-group-header"><div><h3>${escapeHtml(group.name)}</h3><p>${escapeHtml(group.description)}</p></div><span class="library-count">${group.posts.length} 篇</span></header><ul class="library-posts">${group.posts.map(([title, date, href]) => `<li class="library-post"><a href="${encodeURI(href)}"><span class="library-title">${escapeHtml(title)}</span><time class="library-date">${date}</time></a></li>`).join('')}</ul></section>`).join('') : '<p class="library-empty">没有找到匹配的文章，换个关键词试试。</p>';
  };
  search.addEventListener('input', (event) => render(event.target.value));
  render();
})();
