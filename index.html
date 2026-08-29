<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pokémon TCG Pocket Trade Matcher</title>
  <style>
    :root {
      --bg-dark: #0b0e14;
      --card-bg: #151d2a;
      --border-color: #243044;
      --accent-yellow: #f59e0b;
      --accent-yellow-hover: #fbbf24;
      --text-main: #f1f5f9;
      --text-muted: #94a3b8;
      --want-color: #ef4444;
      --have-color: #10b981;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: var(--bg-dark);
      color: var(--text-main);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      padding: 24px;
      min-height: 100vh;
    }

    /* Header */
    .header {
      text-align: center;
      margin-bottom: 28px;
    }

    .header h1 {
      font-size: 26px;
      color: var(--accent-yellow);
      letter-spacing: 0.5px;
      margin-bottom: 6px;
    }

    .header p {
      font-size: 13px;
      color: var(--text-muted);
    }

    /* Layout Grid */
    .container {
      max-width: 1300px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1fr 340px;
      gap: 24px;
    }

    @media (max-width: 900px) {
      .container {
        grid-template-columns: 1fr;
      }
    }

    /* Step Card Panel */
    .panel {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
    }

    .panel-title {
      font-size: 15px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
    }

    .step-badge {
      background: var(--accent-yellow);
      color: #000;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
    }

    /* Rarity Grid Buttons */
    .rarity-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
      gap: 10px;
    }

    .rarity-btn {
      background: #1c2738;
      border: 1px solid #2e3e58;
      color: var(--text-muted);
      border-radius: 8px;
      padding: 10px 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      text-align: center;
    }

    .rarity-btn:hover {
      border-color: var(--accent-yellow);
      color: #fff;
    }

    .rarity-btn.active {
      background: var(--accent-yellow);
      color: #000;
      border-color: var(--accent-yellow-hover);
      box-shadow: 0 0 12px rgba(245, 158, 11, 0.35);
      font-weight: bold;
    }

    /* Set Accordion */
    .set-accordion {
      background: #162030;
      border: 1px solid #23334c;
      border-radius: 8px;
      margin-bottom: 12px;
      overflow: hidden;
    }

    .set-header {
      padding: 14px 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      font-weight: 600;
      font-size: 14px;
      user-select: none;
      transition: background 0.2s;
    }

    .set-header:hover {
      background: #1d2b40;
    }

    .card-badge {
      background: #24344d;
      color: #38bdf8;
      padding: 3px 10px;
      border-radius: 12px;
      font-size: 12px;
    }

    /* Card Items Grid */
    .card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
      gap: 12px;
      padding: 16px;
      background: #0f1622;
      border-top: 1px solid #23334c;
    }

    .card-item {
      background: #182232;
      border: 1px solid #283952;
      border-radius: 8px;
      padding: 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      transition: transform 0.15s ease;
    }

    .card-item:hover {
      transform: translateY(-2px);
      border-color: #3b82f6;
    }

    .card-img {
      width: 100%;
      height: 160px;
      object-fit: contain;
      border-radius: 4px;
      background: #0b0e14;
      margin-bottom: 8px;
    }

    .card-name {
      font-size: 12px;
      font-weight: 600;
      color: #e2e8f0;
      margin-bottom: 8px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      width: 100%;
    }

    .action-btns {
      display: flex;
      gap: 4px;
      width: 100%;
    }

    .btn-tag {
      flex: 1;
      padding: 5px 0;
      font-size: 11px;
      font-weight: bold;
      border-radius: 4px;
      border: none;
      cursor: pointer;
      transition: opacity 0.2s;
    }

    .btn-want {
      background: rgba(239, 68, 68, 0.2);
      color: #fca5a5;
      border: 1px solid #ef4444;
    }

    .btn-want:hover, .btn-want.active {
      background: #ef4444;
      color: #fff;
    }

    .btn-have {
      background: rgba(16, 185, 129, 0.2);
      color: #6ee7b7;
      border: 1px solid #10b981;
    }

    .btn-have:hover, .btn-have.active {
      background: #10b981;
      color: #fff;
    }

    /* Right Sidebar (Cart & Export) */
    .sidebar {
      position: sticky;
      top: 24px;
      height: fit-content;
    }

    .cart-box {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 18px;
    }

    .cart-section {
      margin-bottom: 16px;
    }

    .cart-section-title {
      font-size: 13px;
      font-weight: bold;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .cart-section-title.want { color: var(--want-color); }
    .cart-section-title.have { color: var(--have-color); }

    .cart-list {
      background: #0f1622;
      border: 1px solid #1e293b;
      border-radius: 8px;
      min-height: 80px;
      max-height: 200px;
      overflow-y: auto;
      padding: 8px;
    }

    .cart-item-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #1c2738;
      border: 1px solid #334155;
      color: #e2e8f0;
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 11px;
      margin: 3px;
    }

    .remove-chip {
      cursor: pointer;
      color: #94a3b8;
      font-weight: bold;
    }

    .remove-chip:hover {
      color: #ef4444;
    }

    .export-btn {
      width: 100%;
      background: var(--accent-yellow);
      color: #000;
      border: none;
      padding: 12px;
      border-radius: 8px;
      font-weight: bold;
      font-size: 14px;
      cursor: pointer;
      margin-top: 12px;
      transition: background 0.2s;
    }

    .export-btn:hover {
      background: var(--accent-yellow-hover);
    }

    .loading-spinner {
      text-align: center;
      padding: 20px;
      color: var(--text-muted);
      font-size: 13px;
    }
  </style>
</head>
<body>

  <div class="header">
    <h1>Pokémon TCG Pocket Trade Matcher</h1>
    <p>按稀有度筛选 ➔ 展开扩展包 ➔ 快速匹配等价卡牌</p>
  </div>

  <div class="container">
    <!-- Left Column: Step 1 & 2 -->
    <div>
      <!-- Step 1 -->
      <div class="panel">
        <div class="panel-title">
          <span class="step-badge">1</span>
          <span>第一步：选择交易稀有度 (RARITY)</span>
        </div>
        <div class="rarity-grid">
          <button class="rarity-btn" data-rarity="1diamond">◇ 1 菱形</button>
          <button class="rarity-btn" data-rarity="2diamond">◇◇ 2 菱形</button>
          <button class="rarity-btn" data-rarity="3diamond">◇◇◇ 3 菱形</button>
          <button class="rarity-btn" data-rarity="4diamond">◇◇◇◇ 4 菱形</button>
          <button class="rarity-btn" data-rarity="1star">★ 1 星级</button>
          <button class="rarity-btn" data-rarity="2star">★★ 2 星级</button>
          <button class="rarity-btn" data-rarity="3star">★★★ 3 星级</button>
          <button class="rarity-btn" data-rarity="shinystar">✨ 彩星</button>
          <button class="rarity-btn" data-rarity="crown">♛ 皇冠 Crown</button>
        </div>
      </div>

      <!-- Step 2 -->
      <div class="panel">
        <div class="panel-title">
          <span class="step-badge">2</span>
          <span>第二步：选择扩展包展开卡牌 (<span id="selected-rarity-label" style="color: var(--accent-yellow);">请先选择稀有度</span>)</span>
        </div>
        <div id="sets-container">
          <div class="loading-spinner">请选择上方的稀有度分类加载卡牌...</div>
        </div>
      </div>
    </div>

    <!-- Right Sidebar: Cart & Template Generator -->
    <div class="sidebar">
      <div class="cart-box">
        <div class="cart-section">
          <div class="cart-section-title want">🟡 我想要的 (Want)</div>
          <div class="cart-list" id="want-list">
            <span style="color: #475569; font-size: 12px;">点击卡牌的 "+想要" 添加</span>
          </div>
        </div>

        <div class="cart-section">
          <div class="cart-section-title have">🟢 我有的 (Have)</div>
          <div class="cart-list" id="have-list">
            <span style="color: #475569; font-size: 12px;">点击卡牌的 "+我有" 添加</span>
          </div>
        </div>

        <button class="export-btn" id="export-btn">复制交易贴 (Post Template)</button>
      </div>
    </div>
  </div>

  <script>
    let currentRarity = '';
    let wantCards = [];
    let haveCards = [];

    // 初始化稀有度选择事件
    document.querySelectorAll('.rarity-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.rarity-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        currentRarity = btn.dataset.rarity;
        document.getElementById('selected-rarity-label').innerText = btn.innerText;
        fetchCardsByRarity(currentRarity);
      });
    });

    // 从 API 获取指定稀有度的卡牌
    async function fetchCardsByRarity(rarity) {
      const container = document.getElementById('sets-container');
      container.innerHTML = '<div class="loading-spinner">正在获取最新卡牌数据...</div>';

      try {
        const res = await fetch(`/api/cards?rarity=${rarity}`);
        const result = await res.json();

        if (!result.data || result.data.length === 0) {
          container.innerHTML = '<div class="loading-spinner">该稀有度暂无相关卡牌</div>';
          return;
        }

        renderSets(result.data, container);
      } catch (err) {
        console.error(err);
        container.innerHTML = '<div class="loading-spinner" style="color:#ef4444;">数据加载失败，请重试</div>';
      }
    }

    // 渲染卡包 Accordion
    function renderSets(sets, container) {
      container.innerHTML = '';

      sets.forEach((set, index) => {
        const setAcc = document.createElement('div');
        setAcc.className = 'set-accordion';

        const setNameText = set.setName || set.setId || '未知卡包';

        setAcc.innerHTML = `
          <div class="set-header" onclick="toggleSet('${set.setId}')">
            <span>▶ ${setNameText}</span>
            <span class="card-badge">${set.totalCards} 张</span>
          </div>
          <div class="card-grid" id="grid-${set.setId}" style="display: ${index === 0 ? 'grid' : 'none'};">
            ${set.cards.map(card => `
              <div class="card-item">
                <img class="card-img" src="${card.image}" alt="${card.name}" loading="lazy" />
                <div class="card-name" title="${card.name}">${card.name}</div>
                <div class="action-btns">
                  <button class="btn-tag btn-want ${isAdded(card.id, 'want') ? 'active' : ''}" onclick="toggleCard('${card.id}', '${escapeQuotes(card.name)}', 'want')">+想要</button>
                  <button class="btn-tag btn-have ${isAdded(card.id, 'have') ? 'active' : ''}" onclick="toggleCard('${card.id}', '${escapeQuotes(card.name)}', 'have')">+我有</button>
                </div>
              </div>
            `).join('')}
          </div>
        `;

        container.appendChild(setAcc);
      });
    }

    function toggleSet(setId) {
      const grid = document.getElementById(`grid-${setId}`);
      if (grid) {
        grid.style.display = grid.style.display === 'none' ? 'grid' : 'none';
      }
    }

    function escapeQuotes(str) {
      return str.replace(/'/g, "\\'");
    }

    function isAdded(cardId, type) {
      const list = type === 'want' ? wantCards : haveCards;
      return list.some(c => c.id === cardId);
    }

    // 添加/删除选卡
    function toggleCard(id, name, type) {
      let list = type === 'want' ? wantCards : haveCards;
      const index = list.findIndex(c => c.id === id);

      if (index > -1) {
        list.splice(index, 1);
      } else {
        list.push({ id, name });
      }

      updateCartUI();
      // 重新刷新当前视图内的按钮高亮状态
      if (currentRarity) {
        const activeBtn = document.querySelector(`.btn-${type}[onclick*="${id}"]`);
        if (activeBtn) activeBtn.classList.toggle('active');
      }
    }

    function removeCard(id, type) {
      if (type === 'want') {
        wantCards = wantCards.filter(c => c.id !== id);
      } else {
        haveCards = haveCards.filter(c => c.id !== id);
      }
      updateCartUI();
    }

    // 更新右侧选卡汇总 UI
    function updateCartUI() {
      const wantContainer = document.getElementById('want-list');
      const haveContainer = document.getElementById('have-list');

      wantContainer.innerHTML = wantCards.length === 0 
        ? '<span style="color: #475569; font-size: 12px;">点击卡牌的 "+想要" 添加</span>'
        : wantCards.map(c => `
            <span class="cart-item-chip">
              ${c.name}
              <span class="remove-chip" onclick="removeCard('${c.id}', 'want')">×</span>
            </span>
          `).join('');

      haveContainer.innerHTML = haveCards.length === 0 
        ? '<span style="color: #475569; font-size: 12px;">点击卡牌的 "+我有" 添加</span>'
        : haveCards.map(c => `
            <span class="cart-item-chip">
              ${c.name}
              <span class="remove-chip" onclick="removeCard('${c.id}', 'have')">×</span>
            </span>
          `).join('');
    }

    // 复制模板功能
    document.getElementById('export-btn').addEventListener('click', () => {
      if (wantCards.length === 0 && haveCards.length === 0) {
        alert('请先选择想要或拥有的卡牌！');
        return;
      }

      let text = `【Pokémon TCG Pocket 换卡】\n\n`;
      text += `🟡 我想要的 (Want):\n` + (wantCards.length ? wantCards.map(c => `- ${c.name}`).join('\n') : '无') + `\n\n`;
      text += `🟢 我有的 (Have):\n` + (haveCards.length ? haveCards.map(c => `- ${c.name}`).join('\n') : '无') + `\n\n`;
      text += `#PokemonTCGPocket #TCGPocket换卡`;

      navigator.clipboard.writeText(text).then(() => {
        alert('交易贴文本已成功复制到剪贴板！');
      });
    });
  </script>
</body>
</html>
