export default async function handler(req, res) {
  const { rarity = '', setId = '' } = req.query;

  try {
    const knownSets = [
      'A1', 'A1a', 'A2', 'A2a', 'A2b', 'A3', 'A3a', 'A3b', 'A4', 'A4a', 'A4b',
      'B1', 'B1a', 'B2', 'B2a', 'B2b', 'B3', 'B3a', 'B3b', 'B4', 'B4a', 
      'P-A'
    ];
    
    const targetSets = setId ? [setId] : knownSets;

    // 拉取 Set 数据
    const fetchSetData = async (id) => {
      try {
        const res = await fetch(`https://api.tcgdex.net/v2/en/sets/${id}`, { signal: AbortSignal.timeout(5000) });
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn(`Set ${id} fetch failed.`);
      }
      return null;
    };

    const setsData = (await Promise.all(targetSets.map(fetchSetData))).filter(Boolean);

    // 稀有度归一化函数
    function normalizeRarity(str) {
      if (!str) return '';
      const s = str.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (s.includes('1diamond') || s === 'onediamond' || s === 'common' || s === 'c') return '1diamond';
      if (s.includes('2diamond') || s === 'twodiamond' || s === 'uncommon' || s === 'uc') return '2diamond';
      if (s.includes('3diamond') || s === 'threediamond' || s === 'rare' || s === 'r') return '3diamond';
      if (s.includes('4diamond') || s === 'fourdiamond' || s === 'doublerare' || s === 'rr') return '4diamond';
      if (s.includes('1star') || s === 'onestar' || s === 'ar' || s === 'illustrationrare') return '1star';
      if (s.includes('2star') || s === 'twostar' || s === 'sar' || s === 'sr' || s === 'specialillustrationrare') return '2star';
      if (s.includes('3star') || s === 'threestar' || s === 'ur' || s === 'immersive') return '3star';
      if (s.includes('crown') || s === 'crownrare') return 'crown';
      return s;
    }

    const targetNormRarity = rarity ? normalizeRarity(rarity) : '';

    let result = [];

    for (const setData of setsData) {
      if (!setData || !setData.cards) continue;

      // 1. 整理基本卡牌数据
      let formattedCards = setData.cards.map(card => {
        const rawRarity = card.rarity || '';
        return {
          id: card.id,
          localId: card.localId || card.id.split('-').pop(),
          name: card.name,
          setId: setData.id,
          setName: setData.name || setData.id,
          rarity: rawRarity,
          normRarity: normalizeRarity(rawRarity),
          image: card.image ? `${card.image}/low.webp` : '',
          highImage: card.image ? `${card.image}/high.webp` : ''
        };
      });

      // 2. 如果卡牌缺少 rarity 属性，通过 Pocket 的序号结构做算法智能推定（避免全变成 1diamond）
      // 在 Pocket 中：一般前段为 1-4 菱形，后段/超发编号为 星级 与 Crown 皇冠
      formattedCards = formattedCards.map(c => {
        if (c.normRarity) return c;
        
        // 基于 localId 结构的兜底规则（如果 API 没给 rarity）
        const num = parseInt(c.localId, 10);
        let guessed = '1diamond';
        if (!isNaN(num)) {
          if (c.name.toLowerCase().includes('ex')) guessed = '4diamond';
          else if (num > 200) guessed = '1star';
        }
        return { ...c, normRarity: guessed };
      });

      // 3. 严格按稀有度进行过滤（删除了强制降级为全显示的逻辑）
      let filteredCards = targetNormRarity
        ? formattedCards.filter(c => c.normRarity === targetNormRarity)
        : formattedCards;

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
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.status(200).json({ data: result });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Failed to fetch cards' });
  }
}
