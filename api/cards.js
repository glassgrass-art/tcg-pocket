module.exports = async function handler(req, res) {
  // 设置 CORS 跨域头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { rarity = '', setId = '' } = req.query || {};

  try {
    // 使用社区标准数据库源
    const DATA_URL = '[https://raw.githubusercontent.com/hugoburguete/pokemon-tcg-pocket-card-database/main/cards/en/all.json](https://raw.githubusercontent.com/hugoburguete/pokemon-tcg-pocket-card-database/main/cards/en/all.json)';
    
    const response = await fetch(DATA_URL, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    if (!response.ok) {
      throw new Error(`Data Fetch Failed: ${response.status}`);
    }

    const allCards = await response.json();

    // 严密的稀有度归一化函数
    function normalizeRarity(card) {
      const rawRarity = (card.rarity || card.rarity_name || '').toString().trim();
      const s = rawRarity.toLowerCase().replace(/[^a-z0-9]/g, '');
      const isShinyCard = card.shiny || card.is_shiny || s.includes('shiny');

      // 1. 彩星拆分 (Shiny 1-Star & 2-Star)
      if (isShinyCard || s.includes('shiny') || rawRarity.startsWith('S')) {
        if (s.includes('super') || s.includes('2') || s.includes('two') || rawRarity === 'SSR' || rawRarity === 'SS') {
          return 'shinystar2';
        }
        return 'shinystar1';
      }

      // 2. 菱形精准判定 (1 ~ 4 菱形)
      if (s === 'common' || s === 'c' || rawRarity === '◇' || rawRarity === '◆' || s === '1' || s.includes('onediamond')) {
        return '1diamond';
      }
      if (s === 'uncommon' || s === 'u' || rawRarity === '◇◇' || rawRarity === '◆◆' || s === '2' || s.includes('twodiamond')) {
        return '2diamond';
      }
      if (s === 'rare' || s === 'r' || rawRarity === '◇◇◇' || rawRarity === '◆◆◆' || s === '3' || s.includes('threediamond')) {
        return '3diamond';
      }
      if (s === 'doublerare' || s === 'rr' || rawRarity === '◇◇◇◇' || rawRarity === '◆◆◆◆' || s === '4' || s.includes('fourdiamond')) {
        return '4diamond';
      }

      // 3. 星级判定 (1 ~ 3 星级)
      if (s === 'artrare' || s === 'ar' || rawRarity === '☆' || rawRarity === '★' || s.includes('onestar')) {
        return '1star';
      }
      if (s === 'superrare' || s === 'sr' || s === 'specialartrare' || s === 'sar' || rawRarity === '☆☆' || rawRarity === '★★' || s.includes('twostar')) {
        return '2star';
      }
      if (s === 'immersiverare' || s === 'im' || rawRarity === '☆☆☆' || rawRarity === '★★★' || s.includes('threestar')) {
        return '3star';
      }

      // 4. 皇冠
      if (s === 'crownrare' || s === 'ur' || rawRarity === '♛' || rawRarity === '👑' || s.includes('crown')) {
        return 'crown';
      }

      return '1diamond';
    }

    const targetNormRarity = rarity ? rarity.toLowerCase() : '';
    const setsMap = {};

    allCards.forEach(card => {
      const setObj = card.set || {};
      const currentSetId = (card.set_id || setObj.id || (card.id ? card.id.split('-')[0] : 'OTHER')).toUpperCase();
      const rawSetName = card.set_name || setObj.name || currentSetId;
      const currentSetName = `${rawSetName} (${currentSetId})`;

      const normRarity = normalizeRarity(card);

      if (targetNormRarity && normRarity !== targetNormRarity) return;
      if (setId && currentSetId.toLowerCase() !== setId.toLowerCase()) return;

      if (!setsMap[currentSetId]) {
        setsMap[currentSetId] = {
          setId: currentSetId,
          setName: currentSetName,
          cards: []
        };
      }

      const imgUrl = card.image || card.image_url || card.art || 
        `[https://assets.tcgdex.net/en/tcgp/$](https://assets.tcgdex.net/en/tcgp/$){currentSetId}/${card.local_id || card.number || (card.id ? card.id.split('-')[1] : '')}/low.webp`;

      setsMap[currentSetId].cards.push({
        id: card.id || `${currentSetId}-${card.number || Math.random()}`,
        name: card.name,
        setId: currentSetId,
        setName: currentSetName,
        rarity: card.rarity || normRarity,
        normRarity: normRarity,
        image: imgUrl
      });
    });

    const result = Object.values(setsMap).map(set => ({
      ...set,
      totalCards: set.cards.length
    }));

    return res.status(200).json({ data: result });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Failed to fetch cards database', details: error.message });
  }
};
