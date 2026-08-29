export default async function handler(req, res) {
  const { rarity = '', setId = '' } = req.query;

  try {
    // 升级为最新的 v5 数据源，涵盖所有最新卡包 (包含 B4a 火箭队)
    const DATA_URL = 'https://raw.githubusercontent.com/chase-mew/pokemon-tcg-pocket-cards/main/data/v5/cards.json';
    
    const response = await fetch(DATA_URL, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      throw new Error(`GitHub Data Fetch Failed: ${response.status}`);
    }

    const allCards = await response.json();

    // v5 标准稀有度归一化函数
    function normalizeRarity(str) {
      if (!str) return '1diamond'; // 兜底
      const s = str.toString().toLowerCase().replace(/[^a-z0-9]/g, '');
      
      if (s.includes('1diamond') || s.includes('onediamond') || s === 'common') return '1diamond';
      if (s.includes('2diamond') || s.includes('twodiamond') || s === 'uncommon') return '2diamond';
      if (s.includes('3diamond') || s.includes('threediamond') || s === 'rare') return '3diamond';
      if (s.includes('4diamond') || s.includes('fourdiamond') || s.includes('doublerare') || s === 'rr') return '4diamond';
      
      if (s.includes('1star') || s.includes('onestar') || s === 'ar') return '1star';
      if (s.includes('2star') || s.includes('twostar') || s === 'sar' || s === 'sr') return '2star';
      if (s.includes('3star') || s.includes('threestar') || s === 'ur' || s.includes('immersive')) return '3star';
      if (s.includes('crown')) return 'crown';
      
      return '1diamond';
    }

    const targetNormRarity = rarity ? normalizeRarity(rarity) : '';

    const setsMap = {};

    allCards.forEach(card => {
      // v5 中支持提取 setId 与 setName
      const currentSetId = card.set_id || card.set?.id || (card.id ? card.id.split('-')[0] : 'Other');
      const currentSetName = card.set_name || card.set?.name || currentSetId;
      
      const rawRarity = card.rarity || '';
      const normRarity = normalizeRarity(rawRarity);

      // 按筛选过滤
      if (targetNormRarity && normRarity !== targetNormRarity) {
        return;
      }

      if (setId && currentSetId.toLowerCase() !== setId.toLowerCase()) {
        return;
      }

      if (!setsMap[currentSetId]) {
        setsMap[currentSetId] = {
          setId: currentSetId,
          setName: currentSetName,
          cards: []
        };
      }

      // v5 版本的图片结构支持 webp
      let imgUrl = card.image || card.image_url || card.art || '';
      if (!imgUrl && card.id) {
        imgUrl = `https://assets.tcgdex.net/en/tcgp/${currentSetId}/${card.local_id || card.id.split('-')[1]}/low.webp`;
      }

      setsMap[currentSetId].cards.push({
        id: card.id,
        name: card.name,
        setId: currentSetId,
        setName: currentSetName,
        rarity: rawRarity || 'One Diamond',
        normRarity: normRarity,
        image: imgUrl,
        highImage: imgUrl
      });
    });

    const result = Object.values(setsMap).map(set => ({
      ...set,
      totalCards: set.cards.length
    }));

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
    res.status(200).json({ data: result });

  } catch (error) {
    console.error('API Router Error:', error);
    res.status(500).json({ error: 'Failed to fetch cards database', details: error.message });
  }
}
