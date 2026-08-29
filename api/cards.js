export default async function handler(req, res) {
  const { search = '', page = 1, limit = 30 } = req.query;

  try {
    // 涵盖 Pocket 目前发行的核心及补充扩展包列表
    const setIds = ['A1', 'A1a', 'P-A']; 
    
    // 并发获取所有 Set 的卡牌数据
    const setPromises = setIds.map(setId => 
      fetch(`https://api.tcgdex.net/v2/en/sets/${setId}`)
        .then(r => r.ok ? r.json() : { cards: [] })
        .catch(() => ({ cards: [] }))
    );

    const setsData = await Promise.all(setPromises);

    // 扁平化整合全量卡牌
    let allCards = [];
    setsData.forEach(setData => {
      if (setData && setData.cards) {
        const setCards = setData.cards.map(card => ({
          id: card.id,
          name: card.name,
          pack: setData.name || 'TCG Pocket',
          rarity: card.rarity || 'Standard',
          // 使用 low.webp 做低延迟预览，点开大图再载入 high.webp
          image: card.image ? `${card.image}/low.webp` : '',
          highImage: card.image ? `${card.image}/high.webp` : ''
        }));
        allCards = allCards.concat(setCards);
      }
    });

    // 关键字检索（支持按卡名或编号）
    if (search) {
      const kw = search.toLowerCase();
      allCards = allCards.filter(c => 
        c.name.toLowerCase().includes(kw) || 
        c.id.toLowerCase().includes(kw)
      );
    }

    // 分页截取，防止前端卡顿
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const paginatedCards = allCards.slice(startIndex, startIndex + parseInt(limit));

    res.status(200).json({ 
      data: paginatedCards, 
      total: allCards.length 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch cards' });
  }
}
