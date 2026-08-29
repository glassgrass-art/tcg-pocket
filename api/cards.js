export default async function handler(req, res) {
  const { rarity = '', setId = '' } = req.query;

  try {
    // 直接调取 GitHub 上开源社区维持的手游原生 JSON 数据库 (包含准确 rarity)
    const DATA_URL = 'https://raw.githubusercontent.com/chase-mew/pokemon-tcg-pocket-cards/main/data/v4/cards.json';
    
    const response = await fetch(DATA_URL, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(8000)
    });

    if (!response.ok) {
      throw new Error(`GitHub Data Fetch Failed: ${response.status}`);
    }

    const allCards = await response.json();

    // 稀有度归一化函数 (精准匹配客户端原生的稀有度字符串)
    function normalizeRarity(str) {
      if (!str) return '';
      const s = str.toString().toLowerCase().replace(/[^a-z0-9]/g, '');
      
      if (s.includes('1diamond') || s.includes('onediamond') || s === 'common' || s === '♦') return '1diamond';
      if (s.includes('2diamond') || s.includes('twodiamond') || s === 'uncommon' || s === '♦♦') return '2diamond';
      if (s.includes('3diamond') || s.includes('threediamond') || s === 'rare' || s === '♦♦♦') return '3diamond';
      if (s.includes('4diamond') || s.includes('fourdiamond') || s.includes('doublerare') || s === '♦♦♦♦') return '4diamond';
      
      if (s.includes('1star') || s.includes('onestar') || s === '★') return '1star';
      if (s.includes('2star') || s.includes('twostar') || s === '★★') return '2star';
      if (s.includes('3star') || s.includes('threestar') || s === '★★★') return '3star';
      if (s.includes('crown') || s.includes('👑')) return 'crown';
      
      return s;
    }

    const targetNormRarity = rarity ? normalizeRarity(rarity) : '';

    // 按扩展包分组
    const setsMap = {};

    allCards.forEach(card => {
      // 获取卡片所属扩展包 ID (如 A1, A1a, B4a 等)
      const currentSetId = card.set_id || card.setId || (card.id ? card.id.split('-')[0] : 'Other');
      const currentSetName = card.set_name || card.setName || currentSetId;
      const rawRarity = card.rarity || card.rarity_name || '';
      const normRarity = normalizeRarity(rawRarity);

      // 如果有筛选稀有度，且当前卡牌稀有度不符，直接跳过
      if (targetNormRarity && normRarity !== targetNormRarity) {
        return;
      }

      // 指定了 setId 时，跳过其他包
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

      // 图片路径兜底
      let imgUrl = card.image || card.image_url || '';
      if (!imgUrl && card.id) {
        imgUrl = `https://assets.tcgdex.net/en/tcgp/${currentSetId}/${card.local_id || card.id.split('-')[1]}/low.webp`;
      }

      setsMap[currentSetId].cards.push({
        id: card.id,
        name: card.name,
        setId: currentSetId,
        setName: currentSetName,
        rarity: rawRarity,
        normRarity: normRarity,
        image: imgUrl,
        highImage: imgUrl.replace('/low.webp', '/high.webp')
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
