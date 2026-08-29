export default async function handler(req, res) {
  const { rarity = '', setId = '' } = req.query;

  try {
    // 1. 动态拉取 TCGDex 上 Pocket 系列的所有扩展包列表
    let setIds = [];
    const seriesRes = await fetch('https://api.tcgdex.net/v2/en/series/tcg-pocket').catch(() => null);
    
    if (seriesRes && seriesRes.ok) {
      const seriesData = await seriesRes.json();
      if (seriesData && seriesData.sets) {
        setIds = seriesData.sets.map(s => s.id);
      }
    }

    // 如果动态获取失败，使用全量兜底列表 (涵盖目前已知的所有卡包)
    if (!setIds.length) {
      setIds = ['A1', 'A1a', 'A2', 'A2a', 'P-A'];
    }

    const targetSets = setId ? [setId] : setIds;

    // 2. 并行获取各个卡包的详细数据
    const setPromises = targetSets.map(id =>
      fetch(`https://api.tcgdex.net/v2/en/sets/${id}`)
        .then(r => (r.ok ? r.json() : null))
        .catch(() => null)
    );

    const setsData = (await Promise.all(setPromises)).filter(Boolean);

    let result = [];

    // 稀有度归一化映射
    function normalizeRarity(str) {
      if (!str) return '1diamond';
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

      let filteredCards = targetNormRarity
        ? formattedCards.filter(c => c.normRarity === targetNormRarity)
        : formattedCards;

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

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json({ data: result });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Failed to fetch cards', details: error.message });
  }
}
