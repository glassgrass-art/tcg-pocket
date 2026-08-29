export default async function handler(req, res) {
  const { rarity = '', setId = '' } = req.query;

  try {
    const DATA_URL = 'https://raw.githubusercontent.com/chase-mew/pokemon-tcg-pocket-cards/main/data/v5/cards.json';
    
    const response = await fetch(DATA_URL, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      throw new Error(`GitHub Data Fetch Failed: ${response.status}`);
    }

    const allCards = await response.json();

    // 严密的稀有度标准化函数（支持 ◇/☆/♛ 符号、英文单词、数字全匹配）
    function normalizeRarity(rawRarity) {
      if (!rawRarity) return '1diamond';
      const r = rawRarity.toString().trim();
      const s = r.toLowerCase().replace(/[^a-z0-9]/g, '');

      // 1. 优先使用符号判断（解决 v5 数据原生的 ◇ 和 ☆ 存储格式）
      if (r === '◇' || r === '◆') return '1diamond';
      if (r === '◇◇' || r === '◆◆') return '2diamond';
      if (r === '◇◇◇' || r === '◆◆◆') return '3diamond';
      if (r === '◇◇◇◇' || r === '◆◆◆◆') return '4diamond';
      
      if (r === '☆' || r === '★') return '1star';
      if (r === '☆☆' || r === '★★') return '2star';
      if (r === '☆☆☆' || r === '★★★') return '3star';
      if (r === '♛' || r === '👑') return 'crown';

      // 2. 字符串与数字退化匹配
      if (s === '1' || s.includes('1diamond') || s.includes('onediamond') || s === 'common') return '1diamond';
      if (s === '2' || s.includes('2diamond') || s.includes('twodiamond') || s === 'uncommon') return '2diamond';
      if (s === '3' || s.includes('3diamond') || s.includes('threediamond') || s === 'rare') return '3diamond';
      if (s === '4' || s.includes('4diamond') || s.includes('fourdiamond') || s.includes('doublerare') || s === 'rr') return '4diamond';

      if (s === '5' || s.includes('1star') || s.includes('onestar') || s === 'ar') return '1star';
      if (s === '6' || s.includes('2star') || s.includes('twostar') || s === 'sar' || s === 'sr') return '2star';
      if (s === '7' || s.includes('3star') || s.includes('threestar') || s === 'ur' || s.includes('immersive')) return '3star';
      if (s === '8' || s.includes('crown')) return 'crown';

      return '1diamond';
    }

    const targetNormRarity = rarity ? normalizeRarity(rarity) : '';

    const setsMap = {};

    allCards.forEach(card => {
      // 兼容获取 Set 代码（如 A1, A1a, B4a 等）
      const currentSetId = card.set_id || card.set?.id || (card.id ? card.id.split('-')[0] : 'Other');
      const currentSetName = card.set_name || card.set?.name || currentSetId;
      
      const rawRarity = card.rarity || card.rarity_name || '';
      const normRarity = normalizeRarity(rawRarity);

      // 根据目标稀有度准确过滤
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

      let imgUrl = card.image || card.image_url || card.art || '';
      if (!imgUrl && card.id) {
        imgUrl = `https://assets.tcgdex.net/en/tcgp/${currentSetId}/${card.local_id || card.id.split('-')[1]}/low.webp`;
      }

      setsMap[currentSetId].cards.push({
        id: card.id,
        name: card.name,
        setId: currentSetId,
        setName: currentSetName,
        rarity: rawRarity || '◇',
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
