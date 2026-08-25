(async () => {
  const syncedPosts = await (window.BLOG_POSTS_READY || Promise.resolve(window.BLOG_POSTS));
  const posts = Array.isArray(syncedPosts) ? syncedPosts : [];
  const yearSelect = document.getElementById('blog-activity-year');
  const summary = document.getElementById('blog-activity-summary');
  const total = document.getElementById('blog-activity-total');
  const months = document.getElementById('blog-activity-months');
  const grid = document.getElementById('blog-activity-grid');
  if (!yearSelect || !summary || !total || !months || !grid || !posts.length) return;

  const dateKey = (date) => [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
  const parseDate = (value) => new Date(`${value}T00:00:00`);
  const startOfWeek = (date) => {
    const result = new Date(date);
    result.setDate(result.getDate() - result.getDay());
    return result;
  };
  const endOfWeek = (date) => {
    const result = startOfWeek(date);
    result.setDate(result.getDate() + 6);
    return result;
  };
  const dateCounts = posts.reduce((counts, post) => {
    const key = post.published;
    counts.set(key, (counts.get(key) || 0) + 1);
    return counts;
  }, new Map());
  const postDates = [...dateCounts.keys()].map(parseDate);
  const firstYear = Math.min(...postDates.map((date) => date.getFullYear()));
  const latestPost = new Date(Math.max(...postDates));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastVisibleDate = latestPost > today ? latestPost : today;
  const lastYear = lastVisibleDate.getFullYear();

  function fillYearOptions() {
    const options = [{ value: 'all', label: 'All time' }];
    for (let year = lastYear; year >= firstYear; year -= 1) options.push({ value: String(year), label: String(year) });
    yearSelect.replaceChildren(...options.map(({ value, label }) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = label;
      return option;
    }));
  }

  function rangeFor(value) {
    if (value === 'all') {
      return {
        start: startOfWeek(new Date(firstYear, 0, 1)),
        end: endOfWeek(lastVisibleDate),
        label: '全部时间'
      };
    }
    const year = Number(value);
    const end = year === lastYear ? endOfWeek(lastVisibleDate) : endOfWeek(new Date(year, 11, 31));
    return { start: startOfWeek(new Date(year, 0, 1)), end, label: `${year} 年` };
  }

  function levelFor(count) {
    if (!count) return 0;
    if (count === 1) return 1;
    if (count <= 3) return 2;
    if (count <= 5) return 3;
    return 4;
  }

  function render(value) {
    const { start, end, label } = rangeFor(value);
    const activePosts = posts.filter((post) => {
      const date = parseDate(post.published);
      return date >= start && date <= end;
    });
    const weekCount = Math.floor((end - start) / 604800000) + 1;
    const fragment = document.createDocumentFragment();
    const monthFragment = document.createDocumentFragment();
    const seenMonths = new Set();

    for (let week = 0; week < weekCount; week += 1) {
      const weekColumn = document.createElement('div');
      weekColumn.className = 'blog-activity-week';
      for (let day = 0; day < 7; day += 1) {
        const date = new Date(start);
        date.setDate(start.getDate() + week * 7 + day);
        const key = dateKey(date);
        const count = dateCounts.get(key) || 0;
        const cell = document.createElement('span');
        cell.className = `blog-activity-day level-${levelFor(count)}`;
        cell.setAttribute('role', 'gridcell');
        cell.tabIndex = 0;
        cell.setAttribute('aria-label', `${key}: ${count} 篇文章`);
        cell.title = `${key}: ${count} 篇文章`;
        weekColumn.append(cell);

        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        if (date.getDate() === 1 && !seenMonths.has(monthKey)) {
          seenMonths.add(monthKey);
          const month = document.createElement('span');
          month.textContent = String(date.getMonth() + 1);
          month.style.gridColumn = String(week + 1);
          monthFragment.append(month);
        }
      }
      fragment.append(weekColumn);
    }

    grid.style.setProperty('--week-count', String(weekCount));
    months.style.setProperty('--week-count', String(weekCount));
    grid.replaceChildren(fragment);
    months.replaceChildren(monthFragment);
    const activeDays = new Set(activePosts.map((post) => post.published)).size;
    summary.textContent = `${label} · ${activeDays} 个写作日`;
    total.textContent = `${activePosts.length} 篇文章`;
  }

  fillYearOptions();
  yearSelect.addEventListener('change', () => render(yearSelect.value));
  yearSelect.value = String(lastYear);
  render(yearSelect.value);
})();
