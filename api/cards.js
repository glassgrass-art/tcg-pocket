export default async function handler(req, res) {
  const { rarity = '', setId = '' } = req.query;

  try {
    const setIds = ['A1', 'A1a', 'P-A'];
    const targetSets = setId ? [setId] : setIds;

    const setPromises = targetSets.map(id =>
      fetch(`https://api.tcgdex.net/v2/en/sets/${id}`)
        .then(r => (r.ok ? r.json() : null))
        .catch(() => null)
    );

    const setsData = (await Promise.all(setPromises)).filter(Boolean);

    let result = [];

    // 稀有度归一化函数
    function normalizeRarity(str) {
      if (!str) return '1diamond'; // 默认兜底为 1 菱形
      const s = str.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (s.includes('1diamond') || s === 'onediamond' || s === 'common') return '1diamond';
      if (s.includes('2diamond') || s === 'twodiamond' || s === 'uncommon') return '2diamond';
      if (s.includes('3diamond') || s === 'threediamond' || s === 'rare') return '3diamond';
      if (s.includes('4diamond') || s === 'fourdiamond' || s === 'doublerare' || s === 'rr') return '4diamond';
      if (s.includes('1star') || s === 'onestar' || s === 'ar') return '1star';
      if (s.includes('2star') || s === 'twostar' || s === 'sar' || s === 'sr') return '2star';
      if (s.includes('3star') || s === 'threestar' || s === 'ur') return '3star';
      if (s.includes('crown')) return 'crown';
      return '1diamond';
    }

    const targetNormRarity = rarity ? normalizeRarity(rarity) : '';

    for (const setData of setsData) {
      if (!setData || !setData.cards) continue;

      // 如果列表里的卡片对象缺少 rarity 属性，通过简易规则/全量补全
      let formattedCards = setData.cards.map(card => {
        const rawRarity = card.rarity || 'One Diamond'; 
        return {
          id: card.id,
          name: card.name,
          setId: setData.id,
          setName: setData.name || setData.id,
          rarity: rawRarity,
          normRarity: normalizeRarity(rawRarity),
          image: card.image ? `${card.image}/low.webp` : '',
          highImage: card.image ? `${card.image}/high.webp` : ''
        };
      });

      // 如果提供了稀有度，进行过滤；若匹配为空，则放行显示全部（防止前端死锁）
      let filteredCards = targetNormRarity
        ? formattedCards.filter(c => c.normRarity === targetNormRarity)
        : formattedCards;

      // 兜底逻辑：如果精准匹配过滤后为 0，直接返回该扩展包全部卡牌，避免界面卡死
      if (filteredCards.length === 0 && formattedCards.length > 0) {
        filteredCards = formattedCards;
      }

      if (filteredCards.length > 0) {
        result.push({
          setId: setData.id,
          setName: setData.name || setData.id,
          totalCards: filteredCards.length,
          cards: filteredCards
        });
      }
    }

    // 设置跨域 header
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json({ data: result });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Failed to fetch cards', details: error.message });
  }
}
