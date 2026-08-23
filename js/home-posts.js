(() => {
  const posts = [
    ["2026-08-17T00:00:00.000Z", "2026-08-17", "CUDA Agent: Large-Scale Agentic RL for High-Performance CUDA Kernel Generation", "/posts/2026/08/17/cuda-agent-large-scale-agentic-rl-for-high-performance-cuda-kernel-generation/", "operator"],
    ["2025-11-21T04:19:22.142Z", "2025-11-18", "bench papers", "/2025/11/18/vibe-coding-papers-1763466396078/", "Vibe Coding"],
    ["2025-11-21T04:16:29.415Z", "2025-11-20", "frame papers", "/2025/11/20/frame-papers-1763576800308/", "Vibe Coding"],
    ["2025-11-22T03:27:17.611Z", "2025-11-22", "编译-第03章-词法分析", "/2025/11/22/%E7%BC%96%E8%AF%91-%E7%AC%AC3%E7%AB%A0-%E8%AF%8D%E6%B3%95%E5%88%86%E6%9E%90-1763810151172/", "编译原理"],
    ["2025-11-26T19:11:16.875Z", "2025-11-20", "编译-第04章-语法分析（一）", "/2025/11/20/%E7%BC%96%E8%AF%91-%E7%AC%AC%E4%BA%8C%E9%98%B6%E6%AE%B5-%E8%AF%AD%E6%B3%95%E5%88%86%E6%9E%90-1763607465971/", "编译原理"],
    ["2025-11-22T03:26:43.353Z", "2025-11-22", "编译-第05章-符号表管理技术", "/2025/11/22/%E7%BC%96%E8%AF%91-%E7%AC%AC5%E7%AB%A0-%E7%AC%A6%E5%8F%B7%E8%A1%A8%E7%AE%A1%E7%90%86%E6%8A%80%E6%9C%AF-1763810263042/", "编译原理"],
    ["2025-11-22T03:26:46.954Z", "2025-11-22", "编译-第06章-运行时的存储组织及管理", "/2025/11/22/%E7%BC%96%E8%AF%91-%E7%AC%AC6%E7%AB%A0-%E8%BF%90%E8%A1%8C%E6%97%B6%E7%9A%84%E5%AD%98%E5%82%A8%E7%BB%84%E7%BB%87%E5%8F%8A%E7%AE%A1%E7%90%86-1763810315046/", "编译原理"],
    ["2025-11-22T03:26:51.641Z", "2025-11-20", "编译-第07章-生成中间代码", "/2025/11/20/%E7%BC%96%E8%AF%91-%E7%AC%AC%E4%B8%83%E7%AB%A0-%E7%94%9F%E6%88%90%E4%B8%AD%E9%97%B4%E4%BB%A3%E7%A0%81-1763573220537/", "编译原理"],
    ["2025-11-22T03:26:39.734Z", "2025-11-22", "编译-第08章-错误处理", "/2025/11/22/%E7%BC%96%E8%AF%91-%E7%AC%AC8%E7%AB%A0-%E9%94%99%E8%AF%AF%E5%A4%84%E7%90%86-1763810587076/", "编译原理"],
    ["2025-11-22T03:26:26.059Z", "2025-11-22", "编译-第09章-语法制导翻译技术", "/2025/11/22/%E7%BC%96%E8%AF%91-%E7%AC%AC9%E7%AB%A0-%E8%AF%AD%E6%B3%95%E5%88%B6%E5%AF%BC%E7%BF%BB%E8%AF%91%E6%8A%80%E6%9C%AF-1763810649654/", "编译原理"],
    ["2025-11-27T07:06:57.857Z", "2025-11-20", "编译-第12章-语法分析（二）（重要）", "/2025/11/20/%E7%BC%96%E8%AF%91-%E7%AC%AC%E5%8D%81%E4%BA%8C%E7%AB%A0-%E8%AF%AD%E6%B3%95%E5%88%86%E6%9E%90%EF%BC%88%E4%BA%8C%EF%BC%89-1763607138715/", "编译原理"],
    ["2025-11-20T11:15:47.567Z", "2025-10-01", "编译-实验日志", "/2025/10/01/%E7%BC%96%E8%AF%91-%E5%AE%9E%E9%AA%8C/", "编译原理"],
    ["2025-11-22T03:26:14.169Z", "2025-11-09", "编译-第01章-概论", "/2025/11/09/%E7%BC%96%E8%AF%91-%E6%A6%82%E8%AE%BA/", "编译原理"],
    ["2025-11-22T03:26:35.031Z", "2025-11-09", "编译-第02章-文法和语言的概念和表示", "/2025/11/09/%E7%BC%96%E8%AF%91-%E6%96%87%E6%B3%95%E5%92%8C%E8%AF%AD%E8%A8%80%E7%9A%84%E6%A6%82%E5%BF%B5%E5%92%8C%E8%A1%A8%E7%A4%BA/", "编译原理"],
    ["2025-11-24T15:58:53.987Z", "2025-11-18", "编译-第11章-词法分析程序的自动生成技术(重要)", "/2025/11/18/%E7%BC%96%E8%AF%91-%E7%AC%AC%E5%8D%81%E4%B8%80%E7%AB%A0-%E8%AF%8D%E6%B3%95%E5%88%86%E6%9E%90%E7%A8%8B%E5%BA%8F%E7%9A%84%E8%87%AA%E5%8A%A8%E7%94%9F%E6%88%90%E6%8A%80%E6%9C%AF-1763424149748/", "编译原理"],
    ["2025-11-24T15:58:47.435Z", "2025-11-03", "编译-第14章-代码优化", "/2025/11/03/%E7%BC%96%E8%AF%91-%E7%AC%AC%E5%8D%81%E5%9B%9B%E7%AB%A0-%E4%BB%A3%E7%A0%81%E4%BC%98%E5%8C%96/", "编译原理"],
    ["2025-11-24T15:58:50.297Z", "2025-11-11", "编译-第15章-目标代码生成和优化", "/2025/11/11/%E7%BC%96%E8%AF%91-%E7%AC%AC%E5%8D%81%E4%BA%94%E7%AB%A0-%E7%9B%AE%E6%A0%87%E4%BB%A3%E7%A0%81%E7%94%9F%E6%88%90%E5%92%8C%E4%BC%98%E5%8C%96/", "编译原理"],
    ["2025-11-20T11:27:08.204Z", "2025-10-09", "计网-第三章-数据链路层", "/2025/10/09/%E8%AE%A1%E7%BD%91-%E7%AC%AC%E4%B8%89%E7%AB%A0-%E6%95%B0%E6%8D%AE%E9%93%BE%E8%B7%AF%E5%B1%82/", "计算机网络"],
    ["2025-11-22T03:12:53.144Z", "2025-09-09", "计网-第二章-物理层", "/2025/09/09/%E8%AE%A1%E7%BD%91-%E7%AC%AC%E4%BA%8C%E7%AB%A0-%E7%89%A9%E7%90%86%E5%B1%82/", "计算机网络"],
    ["2025-11-21T01:24:59.469Z", "2025-11-08", "计网-第四章-网络层", "/2025/11/08/%E8%AE%A1%E7%BD%91-%E7%AC%AC%E5%9B%9B%E7%AB%A0-%E7%BD%91%E7%BB%9C%E5%B1%82/", "计算机网络"]
  ];
  const tagsByCategory = {
    "operator": ["papers"],
    "Vibe Coding": ["Papers"],
    "编译原理": ["Compiler Theory"],
    "计算机网络": ["C-Net Theory"]
  };
  const records = posts.map(([updated, published, title, href, category]) => ({
    updated, published, title, href, category, tags: tagsByCategory[category] || []
  }));
  const list = document.getElementById("home-post-list");
  const sort = document.getElementById("home-post-sort");
  const categoryFilters = document.getElementById("home-category-filters");
  const tagFilters = document.getElementById("home-tag-filters");
  const count = document.getElementById("home-post-count");
  if (!list || !sort || !categoryFilters || !tagFilters || !count) return;

  const collator = new Intl.Collator("zh-Hans-CN", { numeric: true, sensitivity: "base" });
  const categories = [...new Set(records.map((post) => post.category))];
  const tags = [...new Set(records.flatMap((post) => post.tags))];
  const activeFilter = { type: "all", value: "" };
  const matchesFilter = (post) => activeFilter.type === "all"
    || (activeFilter.type === "category" && post.category === activeFilter.value)
    || (activeFilter.type === "tag" && post.tags.includes(activeFilter.value));
  const filteredPosts = () => records.filter(matchesFilter);
  const countPosts = (type, value) => records.filter((post) => type === "all"
    || (type === "category" && post.category === value)
    || (type === "tag" && post.tags.includes(value))).length;

  function filterButton(label, type, value) {
    const button = document.createElement("button");
    const labelNode = document.createElement("span");
    const countNode = document.createElement("span");
    button.type = "button";
    button.className = "home-filter-button";
    button.classList.toggle("is-active", activeFilter.type === type && activeFilter.value === value);
    labelNode.textContent = label;
    countNode.className = "filter-count";
    countNode.textContent = String(countPosts(type, value));
    button.append(labelNode, countNode);
    button.addEventListener("click", () => {
      activeFilter.type = type;
      activeFilter.value = value;
      renderFilters();
      render(sort.value);
    });
    return button;
  }

  function renderFilters() {
    categoryFilters.replaceChildren(
      filterButton("全部文章", "all", ""),
      ...categories.map((category) => filterButton(category, "category", category))
    );
    tagFilters.replaceChildren(...tags.map((tag) => filterButton(tag, "tag", tag)));
  }

  function postChip(label, type) {
    const chip = document.createElement("span");
    chip.className = `home-post-chip ${type}`;
    chip.textContent = label;
    return chip;
  }

  function render(mode) {
    const field = mode === "updated" ? "updated" : mode === "published" ? "published" : "title";
    const ordered = filteredPosts().sort((a, b) => mode === "title"
      ? collator.compare(a.title, b.title)
      : b[field].localeCompare(a[field]));
    count.textContent = `${ordered.length} 篇`;

    list.replaceChildren(...ordered.map((post) => {
      const item = document.createElement("li");
      const meta = document.createElement("div");
      const time = document.createElement("time");
      const main = document.createElement("div");
      const link = document.createElement("a");
      const taxonomy = document.createElement("div");

      item.className = "post-item";
      meta.className = "meta";
      time.dateTime = post.updated;
      time.textContent = post.updated.slice(0, 10);
      main.className = "home-post-main";
      link.className = "home-post-title";
      link.href = window.location.protocol === "file:" ? post.href.slice(1) : post.href;
      link.textContent = post.title;
      taxonomy.className = "home-post-taxonomy";
      taxonomy.append(postChip(post.category, "category"), ...post.tags.map((tag) => postChip(tag, "tag")));
      meta.append(time);
      main.append(link, taxonomy);
      item.append(meta, main);
      return item;
    }));
  }

  sort.addEventListener("change", () => render(sort.value));
  renderFilters();
  render(sort.value);
})();
