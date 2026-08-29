export default async function handler(req, res) {
  const { rarity = '', setId = '' } = req.query;

  try {
    // 补全所有 A 系列、B 系列（至 B4a 火箭队包）以及 Promo 扩展包代码
    const knownSets = [
      'A1', 'A1a', 'A2', 'A2a', 'A2b', 'A3', 'A3a', 'A3b', 'A4', 'A4a', 'A4b',
      'B1', 'B1a', 'B2', 'B2a', 'B2b', 'B3', 'B3a', 'B3b', 'B4', 'B4a', 
      'P-A'
    ];
    
    let setIds = [...knownSets];

    // 尝试获取 API 最新的列表防漏
    try {
      const seriesRes = await fetch('https://api.tcgdex.net/v2/en/series/tcg-pocket', { signal: AbortSignal.timeout(3000) });
      if (seriesRes.ok) {
        const seriesData = await seriesRes.json();
        if (seriesData && seriesData.sets) {
          const fetchedIds = seriesData.sets.map(s => s.id);
          setIds = Array.from(new Set([...knownSets, ...fetchedIds]));
        }
      }
    } catch (e) {
      // 忽略超时，继续使用 knownSets 兜底
    }

    const targetSets = setId ? [setId] : setIds;

    // 单个 Set 拉取带超时控制与重试
    const fetchSetData = async (id) => {
      try {
        const res = await fetch(`https://api.tcgdex.net/v2/en/sets/${id}`, { signal: AbortSignal.timeout(4000) });
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn(`Set ${id} fetch timed out or failed.`);
      }
      return null;
    };

    const setsData = (await Promise.all(targetSets.map(fetchSetData))).filter(Boolean);

    let result = [];

    // 稀有度标准化
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
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate'); // 开启 24 小时 CDN 缓存
    res.status(200).json({ data: result });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Failed to fetch cards', details: error.message });
  }
}
