export default async function handler(req, res) {
  const { rarity = '', setId = '' } = req.query;

  try {
    const DATA_URL = 'https://raw.githubusercontent.com/chase-mew/pokemon-tcg-pocket-cards/main/data/v5/cards.json';
    
    const response = await fetch(DATA_URL, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(8000)
    });

    if (!response.ok) {
      throw new Error(`Data Fetch Failed: ${response.status}`);
    }

    const allCards = await response.json();

    // 严密的稀有度归一化函数
    function normalizeRarity(rawRarity, isShiny = false) {
      const r = (rawRarity || '').toString().trim();
      const s = r.toLowerCase().replace(/[^a-z0-9]/g, '');

      // --- 彩星拆分 (Shiny 1-Star & 2-Star) ---
      if (isShiny || s.includes('shiny') || r.startsWith('S')) {
        if (s.includes('2') || s.includes('two') || r === 'SS' || r === '☆☆' || r === '★★') {
          return 'shinystar2'; // 2 彩星
        }
        return 'shinystar1'; // 1 彩星
      }

      // --- 菱形精准判定 (◇ 1~4) ---
      // 1 菱形
      if (r === '◇' || r === '◆' || s === '1' || s.includes('onediamond') || s.includes('1diamond') || s === 'common') {
        return '1diamond';
      }
      // 2 菱形
      if (r === '◇◇' || r === '◆◆' || s === '2' || s.includes('twodiamonds') || s.includes('twodiamond') || s.includes('2diamond') || s === 'uncommon') {
        return '2diamond';
      }
      // 3 菱形
      if (r === '◇◇◇' || r === '◆◆◆' || s === '3' || s.includes('threediamonds') || s.includes('threediamond') || s.includes('3diamond') || s === 'rare') {
        return '3diamond';
      }
      // 4 菱形
      if (r === '◇◇◇◇' || r === '◆◆◆◆' || s === '4' || s.includes('fourdiamonds') || s.includes('fourdiamond') || s.includes('4diamond') || s.includes('doublerare') || s === 'rr') {
        return '4diamond';
      }

      // --- 星级判定 (★ 1~3) ---
      if (r === '☆' || r === '★' || s.includes('onestar') || s.includes('1star') || s === 'ar') return '1star';
      if (r === '☆☆' || r === '★★' || s.includes('twostars') || s.includes('twostar') || s.includes('2star') || s === 'sar' || s === 'sr') return '2star';
      if (r === '☆☆☆' || r === '★★★' || s.includes('threestars') || s.includes('threestar') || s.includes('3star') || s === 'ur' || s.includes('immersive')) return '3star';
      
      // 皇冠
      if (r === '♛' || r === '👑' || s.includes('crown')) return 'crown';

      return '1diamond';
    }

    const targetNormRarity = rarity ? rarity.toLowerCase() : '';
    const setsMap = {};

    allCards.forEach(card => {
      const setObj = card.set || {};
      const currentSetId = card.set_id || setObj.id || (card.id ? card.id.split('-')[0].toUpperCase() : 'OTHER');
      const rawSetName = card.set_name || setObj.name || currentSetId;
      const currentSetName = `${rawSetName} (${currentSetId})`;

      const rawRarity = card.rarity || '';
      const normRarity = normalizeRarity(rawRarity, card.shiny || card.is_shiny);

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
        image: imgUrl
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
