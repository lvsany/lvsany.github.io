(() => {
  'use strict';

  const SETTINGS_KEY = 'fywoo-editor-settings';
  const TOKEN_KEY = 'fywoo-editor-token';
  const MANIFEST_PATH = 'posts/manifest.json';
  const state = { posts: [], current: null, busy: false };
  const $ = (selector) => document.querySelector(selector);
  const elements = {
    owner: $('#owner'), repo: $('#repo'), branch: $('#branch'), token: $('#token'),
    verify: $('#verify'), forget: $('#forget-token'), connection: $('#connection-status'),
    form: $('#article-form'), heading: $('#form-heading'), title: $('#title'), date: $('#date'),
    category: $('#category'), tags: $('#tags'), summary: $('#summary'), body: $('#body'), preview: $('#preview'),
    previewButton: $('#preview-button'), publish: $('#publish'), remove: $('#delete'),
    message: $('#message'), list: $('#article-list'), listEmpty: $('#list-empty'),
    newArticle: $('#new-article'), draftState: $('#draft-state')
  };

  function settings() {
    return { owner: elements.owner.value.trim(), repo: elements.repo.value.trim(), branch: elements.branch.value.trim() || 'main' };
  }

  function saveSettings() { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings())); }

  function restoreSettings() {
    try {
      const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
      elements.owner.value = saved.owner || elements.owner.value;
      elements.repo.value = saved.repo || elements.repo.value;
      elements.branch.value = saved.branch || elements.branch.value;
    } catch (_) { /* Ignore malformed local preferences. */ }
    elements.token.value = sessionStorage.getItem(TOKEN_KEY) || '';
  }

  function setStatus(element, text, kind = 'idle') {
    element.textContent = text;
    element.className = `status ${kind}`;
  }

  function message(text = '', kind = '') {
    elements.message.textContent = text;
    elements.message.className = `message ${kind}`;
  }

  function setBusy(busy) {
    state.busy = busy;
    [elements.publish, elements.remove, elements.verify, elements.previewButton].forEach((button) => { button.disabled = busy || (button === elements.remove && !state.current); });
    if (busy) setStatus(elements.draftState, '正在提交…', 'busy');
  }

  function token() { return elements.token.value.trim(); }

  function requireConnection() {
    const { owner, repo } = settings();
    if (!owner || !repo) throw new Error('请填写 GitHub Owner 和 Repository。');
    if (!token()) throw new Error('请先粘贴 GitHub fine-grained personal access token。');
  }

  async function github(path, options = {}) {
    const response = await fetch(`https://api.github.com${path}`, {
      ...options,
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        ...(token() ? { Authorization: `Bearer ${token()}` } : {}),
        ...(options.headers || {})
      }
    });
    if (!response.ok) {
      let detail = '';
      try { detail = (await response.json()).message || ''; } catch (_) { /* no response body */ }
      throw new Error(detail || `GitHub 请求失败（${response.status}）。`);
    }
    return response.status === 204 ? null : response.json();
  }

  function encodeBase64(value) {
    const bytes = new TextEncoder().encode(value);
    let binary = '';
    for (let start = 0; start < bytes.length; start += 0x8000) binary += String.fromCharCode(...bytes.subarray(start, start + 0x8000));
    return btoa(binary);
  }

  function decodeBase64(value) {
    const binary = atob(value.replace(/\n/g, ''));
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  }

  function safeUrl(value) {
    const url = String(value || '').trim();
    return /^(https?:\/\/|mailto:|\/|#|\.\.?\/)/i.test(url) ? url : '';
  }

  function inlineMarkdown(value) {
    let result = escapeHtml(value);
    result = result.replace(/!\[([^\]]*)\]\(([^\s)]+)(?:\s+"[^"]*")?\)/g, (_, alt, url) => {
      const safe = safeUrl(url); return safe ? `<img src="${escapeHtml(safe)}" alt="${alt}">` : alt;
    });
    result = result.replace(/\[([^\]]+)\]\(([^\s)]+)\)/g, (_, label, url) => {
      const safe = safeUrl(url); return safe ? `<a href="${escapeHtml(safe)}" target="_blank" rel="noopener noreferrer">${label}</a>` : label;
    });
    result = result.replace(/`([^`]+)`/g, '<code>$1</code>');
    result = result.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    result = result.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
    return result;
  }

  function renderMarkdown(markdown) {
    const lines = String(markdown || '').replace(/\r\n/g, '\n').split('\n');
    const output = [];
    let code = false, codeLines = [], paragraph = [];
    const listStack = [];
    const flushParagraph = () => { if (paragraph.length) { output.push('<p>' + inlineMarkdown(paragraph.join('<br>')) + '</p>'); paragraph = []; } };
    const closeListLevel = () => {
      const list = listStack.pop();
      if (!list) return;
      if (list.itemOpen) output.push('</li>');
      output.push('</' + list.type + '>');
    };
    const closeLists = () => { while (listStack.length) closeListLevel(); };
    const openList = (type, indent) => { output.push('<' + type + '>'); listStack.push({ type, indent, itemOpen: false }); };
    const addListItem = (type, indent, content) => {
      let current = listStack[listStack.length - 1];
      if (!current) openList(type, indent);
      else if (indent > current.indent) openList(type, indent);
      else {
        while (listStack.length && indent < listStack[listStack.length - 1].indent) closeListLevel();
        current = listStack[listStack.length - 1];
        if (!current || indent > current.indent) openList(type, indent);
        else if (current.type !== type) { closeListLevel(); openList(type, indent); }
        else if (current.itemOpen) { output.push('</li>'); current.itemOpen = false; }
      }
      current = listStack[listStack.length - 1];
      output.push('<li>' + inlineMarkdown(content));
      current.itemOpen = true;
    };
    const flushCode = () => { if (code) { output.push('<pre><code>' + escapeHtml(codeLines.join('\n')) + '</code></pre>'); code = false; codeLines = []; } };
    const tableCells = (line) => line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => cell.trim());
    const isTableDivider = (line) => /^\s*\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line || '');
    const tableAlignment = (cell) => cell.startsWith(':') && cell.endsWith(':') ? 'center' : cell.endsWith(':') ? 'right' : 'left';

    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index];
      if (/^\x60\x60\x60/.test(line)) { if (code) flushCode(); else { flushParagraph(); closeLists(); code = true; } continue; }
      if (code) { codeLines.push(line); continue; }

      const heading = line.match(/^(#{1,4})\s+(.+)$/);
      const listItem = line.match(/^(\s*)([-*+]|\d+\.)\s+(.+)$/);
      const quote = line.match(/^>\s?(.+)$/);

      if (line.includes('|') && isTableDivider(lines[index + 1])) {
        flushParagraph(); closeLists();
        const headers = tableCells(line);
        const alignments = tableCells(lines[index + 1]).map(tableAlignment);
        const rows = [];
        index += 2;
        while (index < lines.length && lines[index].includes('|') && lines[index].trim()) {
          rows.push(tableCells(lines[index]));
          index += 1;
        }
        index -= 1;
        const head = headers.map((cell, column) => '<th style="text-align:' + (alignments[column] || 'left') + '">' + inlineMarkdown(cell) + '</th>').join('');
        const body = rows.map((cells) => '<tr>' + headers.map((_, column) => '<td style="text-align:' + (alignments[column] || 'left') + '">' + inlineMarkdown(cells[column] || '') + '</td>').join('') + '</tr>').join('');
        output.push('<div class="table-wrap"><table><thead><tr>' + head + '</tr></thead><tbody>' + body + '</tbody></table></div>');
      }
      else if (heading) { flushParagraph(); closeLists(); output.push('<h' + heading[1].length + '>' + inlineMarkdown(heading[2]) + '</h' + heading[1].length + '>'); }
      else if (/^\s*([-*_])(?:\s*\1){2,}\s*$/.test(line)) { flushParagraph(); closeLists(); output.push('<hr>'); }
      else if (listItem) { flushParagraph(); addListItem(/^\d+\.$/.test(listItem[2]) ? 'ol' : 'ul', listItem[1].replace(/\t/g, '  ').length, listItem[3]); }
      else if (quote) { flushParagraph(); closeLists(); output.push('<blockquote><p>' + inlineMarkdown(quote[1]) + '</p></blockquote>'); }
      else if (!line.trim()) {
        flushParagraph();
        const nextList = lines[index + 1] && lines[index + 1].match(/^(\s*)([-*+]|\d+\.)\s+(.+)$/);
        const current = listStack[listStack.length - 1];
        if (!current || !nextList || nextList[1].replace(/\t/g, '  ').length < current.indent) closeLists();
      }
      else { closeLists(); paragraph.push(line); }
    }

    flushParagraph(); closeLists(); flushCode();
    return output.join('\n') || '<p></p>';
  }

  function formattedDate(value) {
    return value || new Date().toISOString().slice(0, 10);
  }

  function parseTags(value) { return value.split(',').map((tag) => tag.trim()).filter(Boolean).slice(0, 12); }
  function taxonomyUrl(type, value) { return `/${type}/${encodeURIComponent(value.trim().replace(/\s+/g, '-'))}/`; }

  function slugify(value) {
    const clean = value.trim().toLowerCase().replace(/\s+/g, '-').replace(/[\\/:*?"<>|#%{}]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '');
    return clean || `post-${Date.now()}`;
  }

  function articleData() {
    const title = elements.title.value.trim();
    const date = elements.date.value;
    const body = elements.body.value.trim();
    const category = elements.category.value.trim();
    const tags = parseTags(elements.tags.value);
    if (!title || !date || !category || !tags.length || !body) throw new Error('标题、发布日期、分类、标签和正文都需要填写。');
    const existing = state.current || {};
    const slug = existing.slug || slugify(title);
    const parts = date.split('-');
    const path = `posts/${parts[0]}/${parts[1]}/${parts[2]}/${slug}/index.html`;
    return { title, date, body, slug, path, summary: elements.summary.value.trim(), category, tags };
  }

  function articleUrl(path) { return `/${path.replace(/\/index\.html$/, '/')}`; }

  function postMetadata(article) {
    const category = article.category ? `<div class="article-category"><i class="fa-solid fa-archive"></i><a class="category-link" href="${taxonomyUrl('categories', article.category)}">${escapeHtml(article.category)}</a></div>` : '';
    const tags = article.tags.length ? `<div class="article-tag"><i class="fa-solid fa-tag"></i>${article.tags.map((tag) => `<a class="p-category" href="${taxonomyUrl('tags', tag)}" rel="tag">${escapeHtml(tag)}</a>`).join(' ')}</div>` : '';
    return `<div class="meta" style="margin-top: 1.5rem; font-size: 0.95rem; color: #666;"><span class="author p-author h-card" itemprop="author" itemscope itemtype="http://schema.org/Person"><span class="p-name" itemprop="name">Fyw0o Nothing</span></span><span style="margin: 0 0.5rem;">•</span><div class="postdate"><time datetime="${escapeHtml(article.date)}" class="dt-published" itemprop="datePublished">${escapeHtml(article.date)}</time></div>${category}${tags}</div>`;
  }

  function postHtml(article) {
    const content = renderMarkdown(article.body);
    const description = escapeHtml(article.summary || article.body.replace(/\s+/g, ' ').slice(0, 160));
    const source = JSON.stringify(article).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
    return `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="${description}"><title>${escapeHtml(article.title)} · Fyw0o's blogs</title><link rel="icon" href="/images/favicon.ico"><link rel="stylesheet" href="/css/style.css"><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" crossorigin="anonymous"><style>.content.e-content{line-height:1.8}.content.e-content pre{overflow:auto;padding:1rem;border-radius:8px;background:#20252d;color:#f4f5f7}.content.e-content code{padding:.1rem .25rem;background:#f0f2f4;border-radius:4px}.content.e-content pre code{padding:0;background:transparent}.content.e-content blockquote{margin:1rem 0;padding:.25rem 1rem;border-left:4px solid #16846b;background:#f4fbf9}</style></head>
<body class="max-width mx-auto px3 ltr"><div class="content index py4 "><article class="post h-entry" itemscope itemtype="http://schema.org/BlogPosting" style="padding: 3rem 2rem; display: flex; flex-direction: column; align-items: center;"><div style="max-width: 900px; width: 100%;"><header style="margin-bottom: 2rem; text-align: center;"><h1 class="posttitle p-name" itemprop="name headline">${escapeHtml(article.title)}</h1>${postMetadata(article)}</header><div class="content e-content" itemprop="articleBody" style="text-align: left; line-height: 1.8; font-size: 1rem;">${content}</div></div></article></div><script id="article-source" type="application/json">${source}</script></body></html>`;
  }

  function manifestRecord(article) {
    return { title: article.title, date: article.date, category: article.category, tags: article.tags, summary: article.summary, path: article.path, slug: article.slug, url: articleUrl(article.path) };
  }

  function preview() {
    let article;
    try { article = articleData(); } catch (_) {
      article = { title: elements.title.value.trim() || '文章标题', date: elements.date.value || '发布日期', body: elements.body.value, category: elements.category.value.trim(), tags: parseTags(elements.tags.value), summary: '', slug: '', path: '' };
    }
    elements.preview.innerHTML = `<h1>${escapeHtml(article.title)}</h1>${postMetadata(article)}<div class="article-entry">${renderMarkdown(article.body)}</div>`;
  }

  function resetForm() {
    state.current = null;
    elements.form.reset();
    elements.date.value = new Date().toISOString().slice(0, 10);
    elements.heading.textContent = '新文章';
    elements.remove.disabled = true;
    setStatus(elements.draftState, '未保存', 'idle');
    message(''); preview(); renderList();
  }

  function renderList() {
    const ordered = [...state.posts].sort((a, b) => b.date.localeCompare(a.date));
    elements.list.innerHTML = ordered.map((post) => `<li><button type="button" data-path="${escapeHtml(post.path)}" class="${state.current?.path === post.path ? 'active' : ''}"><strong>${escapeHtml(post.title)}</strong><small>${escapeHtml(post.date)}</small></button></li>`).join('');
    elements.listEmpty.hidden = ordered.length > 0;
  }

  async function loadManifest() {
    try {
      const response = await fetch(`/${MANIFEST_PATH}?v=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) throw new Error();
      const records = await response.json();
      state.posts = Array.isArray(records) ? records : [];
    } catch (_) { state.posts = []; }
    renderList();
  }

  function repoPrefix() {
    const { owner, repo } = settings();
    return `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
  }

  async function readRemoteFile(path) {
    const { branch } = settings();
    return github(`${repoPrefix()}/contents/${path.split('/').map(encodeURIComponent).join('/')}?ref=${encodeURIComponent(branch)}`);
  }

  async function loadArticle(path) {
    try {
      requireConnection(); setBusy(true); message('正在载入文章…');
      const file = await readRemoteFile(path);
      const html = decodeBase64(file.content);
      const source = html.match(/<script id="article-source" type="application\/json">([\s\S]*?)<\/script>/);
      if (!source) throw new Error('这篇文章不是由本编辑器发布，无法安全回读 Markdown 源码。');
      const article = JSON.parse(source[1]);
      state.current = article;
      elements.title.value = article.title || '';
      elements.date.value = article.date || '';
      elements.category.value = article.category || state.posts.find((post) => post.path === path)?.category || '';
      elements.tags.value = (article.tags || []).join(', ');
      elements.summary.value = article.summary || '';
      elements.body.value = article.body || '';
      elements.heading.textContent = '编辑文章';
      elements.remove.disabled = false;
      setStatus(elements.draftState, '已载入', 'success'); message('文章已载入。'); preview(); renderList();
    } catch (error) { message(error.message, 'error'); }
    finally { setBusy(false); }
  }

  async function getCurrentManifest() {
    try {
      const file = await readRemoteFile(MANIFEST_PATH);
      return { records: JSON.parse(decodeBase64(file.content)), sha: file.sha };
    } catch (error) {
      if (/404/.test(error.message)) return { records: [], sha: null };
      throw error;
    }
  }

  async function createBlob(content) {
    return github(`${repoPrefix()}/git/blobs`, { method: 'POST', body: JSON.stringify({ content: encodeBase64(content), encoding: 'base64' }) });
  }

  async function commitChanges(changes, commitMessage) {
    const { branch } = settings();
    const ref = await github(`${repoPrefix()}/git/ref/heads/${encodeURIComponent(branch)}`);
    const parent = await github(`${repoPrefix()}/git/commits/${ref.object.sha}`);
    const tree = await github(`${repoPrefix()}/git/trees`, { method: 'POST', body: JSON.stringify({ base_tree: parent.tree.sha, tree: changes }) });
    const commit = await github(`${repoPrefix()}/git/commits`, { method: 'POST', body: JSON.stringify({ message: commitMessage, tree: tree.sha, parents: [ref.object.sha] }) });
    await github(`${repoPrefix()}/git/refs/heads/${encodeURIComponent(branch)}`, { method: 'PATCH', body: JSON.stringify({ sha: commit.sha, force: false }) });
    return commit;
  }

  async function publish(event) {
    event.preventDefault();
    try {
      requireConnection(); saveSettings(); sessionStorage.setItem(TOKEN_KEY, token());
      const article = articleData(); setBusy(true); message('正在创建 Git 提交…');
      const manifest = await getCurrentManifest();
      const articleBlob = await createBlob(postHtml(article));
      const nextRecords = (Array.isArray(manifest.records) ? manifest.records : []).filter((item) => item.path !== article.path && item.path !== state.current?.path);
      nextRecords.push(manifestRecord(article)); nextRecords.sort((a, b) => b.date.localeCompare(a.date));
      const manifestBlob = await createBlob(`${JSON.stringify(nextRecords, null, 2)}\n`);
      const changes = [
        { path: article.path, mode: '100644', type: 'blob', sha: articleBlob.sha },
        { path: MANIFEST_PATH, mode: '100644', type: 'blob', sha: manifestBlob.sha }
      ];
      if (state.current?.path && state.current.path !== article.path) changes.push({ path: state.current.path, mode: '100644', type: 'blob', sha: null });
      const commit = await commitChanges(changes, `Publish: ${article.title}`);
      state.current = article; state.posts = nextRecords; elements.heading.textContent = '编辑文章';
      elements.remove.disabled = false; setStatus(elements.draftState, '已发布', 'success');
      message(`已提交 ${commit.sha.slice(0, 7)}。GitHub Pages 通常会在几分钟内更新。`); preview(); renderList();
    } catch (error) { setStatus(elements.draftState, '发布失败', 'error'); message(error.message, 'error'); }
    finally { setBusy(false); }
  }

  async function deleteArticle() {
    if (!state.current || !confirm(`确定删除《${state.current.title}》吗？此操作会直接提交到 GitHub。`)) return;
    try {
      requireConnection(); setBusy(true); message('正在删除文章…');
      const manifest = await getCurrentManifest();
      const nextRecords = (Array.isArray(manifest.records) ? manifest.records : []).filter((item) => item.path !== state.current.path);
      const manifestBlob = await createBlob(`${JSON.stringify(nextRecords, null, 2)}\n`);
      const commit = await commitChanges([
        { path: state.current.path, mode: '100644', type: 'blob', sha: null },
        { path: MANIFEST_PATH, mode: '100644', type: 'blob', sha: manifestBlob.sha }
      ], `Delete: ${state.current.title}`);
      state.posts = nextRecords; resetForm(); message(`已提交删除 ${commit.sha.slice(0, 7)}。`);
    } catch (error) { message(error.message, 'error'); }
    finally { setBusy(false); }
  }

  async function verify() {
    try {
      requireConnection(); saveSettings(); sessionStorage.setItem(TOKEN_KEY, token());
      setStatus(elements.connection, '正在验证…', 'busy');
      const user = await github('/user');
      setStatus(elements.connection, `已连接：${user.login}`, 'success'); message('身份验证成功。');
    } catch (error) { setStatus(elements.connection, '验证失败', 'error'); message(error.message, 'error'); }
  }

  function handleBodyTab(event) {
    if (event.key !== 'Tab') return;
    event.preventDefault();
    const textarea = elements.body;
    const value = textarea.value;
    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;
    const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
    const nextLine = value.indexOf('\n', selectionEnd);
    const lineEnd = nextLine === -1 ? value.length : nextLine;
    const selectedLines = value.slice(lineStart, lineEnd);
    const indent = '  ';
    const unindentPattern = /^(?:\t| {1,2})/gm;
    let replacement;
    let nextStart;
    let nextEnd;

    if (event.shiftKey) {
      const firstIndent = selectedLines.match(/^(?:\t| {1,2})/);
      const removed = [...selectedLines.matchAll(unindentPattern)].reduce((total, match) => total + match[0].length, 0);
      replacement = selectedLines.replace(unindentPattern, '');
      nextStart = Math.max(lineStart, selectionStart - (firstIndent ? firstIndent[0].length : 0));
      nextEnd = Math.max(nextStart, selectionEnd - removed);
    } else {
      const lineCount = selectedLines.split('\n').length;
      replacement = selectedLines.replace(/^/gm, indent);
      nextStart = selectionStart + indent.length;
      nextEnd = selectionEnd + lineCount * indent.length;
    }

    textarea.setRangeText(replacement, lineStart, lineEnd, 'preserve');
    textarea.setSelectionRange(nextStart, nextEnd);
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
  }

  elements.form.addEventListener('submit', publish);
  elements.previewButton.addEventListener('click', preview);
  elements.remove.addEventListener('click', deleteArticle);
  elements.newArticle.addEventListener('click', resetForm);
  elements.verify.addEventListener('click', verify);
  elements.forget.addEventListener('click', () => { sessionStorage.removeItem(TOKEN_KEY); elements.token.value = ''; setStatus(elements.connection, '令牌已清除', 'idle'); message(''); });
  elements.list.addEventListener('click', (event) => { const button = event.target.closest('button[data-path]'); if (button) loadArticle(button.dataset.path); });
  elements.body.addEventListener('keydown', handleBodyTab);
  [elements.owner, elements.repo, elements.branch].forEach((input) => input.addEventListener('change', saveSettings));
  [elements.title, elements.date, elements.category, elements.tags, elements.summary, elements.body].forEach((input) => input.addEventListener('input', () => { if (!state.busy) { setStatus(elements.draftState, '有未发布修改', 'idle'); preview(); } }));

  restoreSettings(); resetForm(); loadManifest();
})();
