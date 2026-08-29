export default async function handler(req, res) {
  const { rarity = '', setId = '' } = req.query;

  try {
    const DATA_URL = 'https://raw.githubusercontent.com/chase-mew/pokemon-tcg-pocket-cards/main/data/v4/cards.json';
    
    const response = await fetch(DATA_URL, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(8000)
    });

    if (!response.ok) {
      throw new Error(`GitHub Data Fetch Failed: ${response.status}`);
    }

    const allCards = await response.json();

    // 全全面兼容的稀有度归一化函数
    function normalizeRarity(str) {
      if (!str) return '';
      const s = str.toString().toLowerCase().replace(/[^a-z0-9]/g, '');
      
      // 1 菱形 (1, common, one diamond, one diamonds, 1diamond)
      if (s === '1' || s.includes('1diamond') || s.includes('onediamond') || s === 'common' || s.includes('diamond1')) return '1diamond';
      
      // 2 菱形 (2, uncommon, two diamond, two diamonds, 2diamond)
      if (s === '2' || s.includes('2diamond') || s.includes('twodiamond') || s === 'uncommon' || s.includes('diamond2')) return '2diamond';
      
      // 3 菱形 (3, rare, three diamond, three diamonds, 3diamond)
      if (s === '3' || s.includes('3diamond') || s.includes('threediamond') || s === 'rare' || s.includes('diamond3')) return '3diamond';
      
      // 4 菱形 (4, double rare, four diamond, four diamonds, 4diamond, rr)
      if (s === '4' || s.includes('4diamond') || s.includes('fourdiamond') || s.includes('doublerare') || s === 'rr' || s.includes('diamond4')) return '4diamond';
      
      // 1 星 (5, one star, one stars, 1star, ar, illustration rare)
      if (s === '5' || s.includes('1star') || s.includes('onestar') || s === 'ar' || s.includes('star1')) return '1star';
      
      // 2 星 (6, two star, two stars, 2star, sar, sr, special illustration rare)
      if (s === '6' || s.includes('2star') || s.includes('twostar') || s === 'sar' || s === 'sr' || s.includes('star2')) return '2star';
      
      // 3 星 (7, three star, three stars, 3star, ur, immersive)
      if (s === '7' || s.includes('3star') || s.includes('threestar') || s === 'ur' || s.includes('star3')) return '3star';
      
      // 皇冠 (8, crown, crown rare)
      if (s === '8' || s.includes('crown')) return 'crown';
      
      return s;
    }

    const targetNormRarity = rarity ? normalizeRarity(rarity) : '';

    const setsMap = {};

    allCards.forEach(card => {
      const currentSetId = card.set_id || card.setId || (card.id ? card.id.split('-')[0] : 'Other');
      const currentSetName = card.set_name || card.setName || currentSetId;
      
      // 兼容 json 各种可能存在的 rarity 字段名
      const rawRarity = card.rarity || card.rarity_name || card.rarityName || '';
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
