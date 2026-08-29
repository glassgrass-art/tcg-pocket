export default async function handler(req, res) {
  const { search = '' } = req.query;

  try {
    // 1. 从开源 TCG Pocket 数据源拉取全量 A1 (最强的基因) 卡牌列表
    // 支持全量卡图、编号、稀有度
    const response = await fetch('https://api.tcgdex.net/v2/en/series/tcgp');
    const seriesData = await response.json();

    // 2. 拿到所有 Pocket 扩展包 (如 A1, A1a 等)
    let allCards = [];
    
    // 如果获取成功，遍历数据（这里默认拉取核心扩展包卡池）
    const setRes = await fetch('https://api.tcgdex.net/v2/en/sets/A1');
    const setData = await setRes.json();
    
    if (setData && setData.cards) {
      allCards = setData.cards.map(card => ({
        id: card.id.replace('A1-', 'A1-'),
        name: card.name,
        pack: 'Genetic Apex (最强的基因)',
        rarity: card.rarity || 'Standard',
        image: card.image ? `${card.image}/high.webp` : 'https://via.placeholder.com/300x420'
      }));
    }

    // 3. 过滤搜索关键字
    if (search) {
      const keyword = search.toLowerCase();
      allCards = allCards.filter(c => 
        c.name.toLowerCase().includes(keyword) || 
        c.id.toLowerCase().includes(keyword)
      );
    }

    res.status(200).json({ data: allCards });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch full card database' });
  }
}
