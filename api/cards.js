export default async function handler(req, res) {
  const { rarity = '', setId = '' } = req.query;

  try {
    // 采用最新包含 A1-B4 等全扩展包的源 (含彩星/全图/最新火箭队)
    const DATA_URL = 'https://raw.githubusercontent.com/chase-mew/pokemon-tcg-pocket-cards/main/data/v5/cards.json';
    
    const response = await fetch(DATA_URL, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(8000)
    });

    if (!response.ok) {
      throw new Error(`Data Fetch Failed: ${response.status}`);
    }

    const allCards = await response.json();

    // 绝对精准的稀有度归一化映射 (全涵盖 9 级)
    function normalizeRarity(rawRarity, isShiny = false) {
      if (isShiny) return 'shinystar';
      if (!rawRarity) return '1diamond';
      
      const r = rawRarity.toString().trim();
      const s = r.toLowerCase().replace(/[^a-z0-9]/g, '');

      // 1. 原生符号匹配 (◇ / ☆ / ♛)
      if (r === '◇' || r === '◆' || s === 'onediamond' || s === '1diamond') return '1diamond';
      if (r === '◇◇' || r === '◆◆' || s === 'twodiamond' || s === '2diamond') return '2diamond';
      if (r === '◇◇◇' || r === '◆◆◆' || s === 'threediamond' || s === '3diamond') return '3diamond';
      if (r === '◇◇◇◇' || r === '◆◆◆◆' || s === 'fourdiamond' || s === '4diamond') return '4diamond';

      if (r === '☆' || r === '★' || s === 'onestar' || s === '1star') return '1star';
      if (r === '☆☆' || r === '★★' || s === 'twostar' || s === '2star') return '2star';
      if (r === '☆☆☆' || r === '★★★' || s === 'threestar' || s === '3star') return '3star';
      
      if (s.includes('shiny') || s.includes('colorstar') || s.includes('shinystar') || r.includes('S')) return 'shinystar';
      if (r === '♛' || r === '👑' || s.includes('crown')) return 'crown';

      return '1diamond';
    }

    const targetNormRarity = rarity ? rarity.toLowerCase() : '';
    const setsMap = {};

    allCards.forEach(card => {
      // 安全提取 Set 代码与 Set 名称，防止前端出现 UNDEFINED
      const setObj = card.set || {};
      const currentSetId = card.set_id || setObj.id || (card.id ? card.id.split('-')[0].toUpperCase() : 'OTHER');
      
      const rawSetName = card.set_name || setObj.name || currentSetId;
      const currentSetName = `${rawSetName} (${currentSetId})`;

      const rawRarity = card.rarity || '';
      const normRarity = normalizeRarity(rawRarity, card.shiny || card.is_shiny);

      // 按选定稀有度精确筛选
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

      const imgUrl = card.image || card.image_url || card.art || 
        `https://assets.tcgdex.net/en/tcgp/${currentSetId}/${card.local_id || (card.id ? card.id.split('-')[1] : '')}/low.webp`;

      setsMap[currentSetId].cards.push({
        id: card.id,
        name: card.name,
        setId: currentSetId,
        setName: currentSetName,
        rarity: rawRarity || normRarity,
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
    console.error('API Error:', error);
    res.status(500).json({ error: 'Failed to fetch cards database', details: error.message });
  }
}
