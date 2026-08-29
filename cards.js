export default async function handler(req, res) {
  const { rarity = '', setId = '' } = req.query;

  try {
    // 切换为社区最全、数据最规范的开源 TCG Pocket 数据库源
    const DATA_URL = 'https://raw.githubusercontent.com/hugoburguete/pokemon-tcg-pocket-card-database/main/cards/en/all.json';
    
    // 备用降级源（如果主源请求超时）
    const BACKUP_URL = 'https://raw.githubusercontent.com/flibustier/pokemon-tcg-pocket-database/main/data/cards.json';

    let response = await fetch(DATA_URL, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(6000)
    }).catch(() => null);

    if (!response || !response.ok) {
      response = await fetch(BACKUP_URL, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(8000)
      });
    }

    if (!response.ok) {
      throw new Error(`Data Fetch Failed: ${response.status}`);
    }

    const allCards = await response.json();

    // 严密精准的稀有度归一化匹配引擎
    function normalizeRarity(card) {
      const rawRarity = (card.rarity || card.rarity_name || '').toString().trim();
      const s = rawRarity.toLowerCase().replace(/[^a-z0-9]/g, '');
      const isShinyCard = card.shiny || card.is_shiny || s.includes('shiny');

      // 1. 彩星拆分 (Shiny 1-Star & 2-Star)
      if (isShinyCard || s.includes('shiny') || rawRarity.startsWith('S')) {
        if (s.includes('super') || s.includes('2') || s.includes('two') || rawRarity === 'SSR' || rawRarity === 'SS') {
          return 'shinystar2'; // 2 彩星 (Shiny Super Rare / Shiny ex)
        }
        return 'shinystar1'; // 1 彩星 (Shiny / S)
      }

      // 2. 菱形精准判定 (1 ~ 4 菱形)
      // 1 菱形: Common, C, ◇, One Diamond
      if (s === 'common' || s === 'c' || rawRarity === '◇' || rawRarity === '◆' || s === '1' || s.includes('onediamond')) {
        return '1diamond';
      }
      // 2 菱形: Uncommon, U, ◇◇, Two Diamonds
      if (s === 'uncommon' || s === 'u' || rawRarity === '◇◇' || rawRarity === '◆◆' || s === '2' || s.includes('twodiamond')) {
        return '2diamond';
      }
      // 3 菱形: Rare, R, ◇◇◇, Three Diamonds
      if (s === 'rare' || s === 'r' || rawRarity === '◇◇◇' || rawRarity === '◆◆◆' || s === '3' || s.includes('threediamond')) {
        return '3diamond';
      }
      // 4 菱形: Double Rare, RR, ◇◇◇◇, Four Diamonds (ex卡)
      if (s === 'doublerare' || s === 'rr' || rawRarity === '◇◇◇◇' || rawRarity === '◆◆◆◆' || s === '4' || s.includes('fourdiamond')) {
        return '4diamond';
      }

      // 3. 星级判定 (1 ~ 3 星级)
      // 1 星级: Art Rare, AR, 1 Star, ☆, ★
      if (s === 'artrare' || s === 'ar' || rawRarity === '☆' || rawRarity === '★' || s.includes('onestar')) {
        return '1star';
      }
      // 2 星级: Super Rare, Special Art Rare, SR, SAR, 2 Stars, ☆☆, ★★
      if (s === 'superrare' || s === 'sr' || s === 'specialartrare' || s === 'sar' || rawRarity === '☆☆' || rawRarity === '★★' || s.includes('twostar')) {
        return '2star';
      }
      // 3 星级: Immersive Rare, IM, 3 Stars, ☆☆☆, ★★★
      if (s === 'immersiverare' || s === 'im' || rawRarity === '☆☆☆' || rawRarity === '★★★' || s.includes('threestar')) {
        return '3star';
      }

      // 4. 皇冠 (Crown Rare / UR / ♛)
      if (s === 'crownrare' || s === 'ur' || rawRarity === '♛' || rawRarity === '👑' || s.includes('crown')) {
        return 'crown';
      }

      // 兜底退回机制：防止未知卡牌漏掉
      return '1diamond';
    }

    const targetNormRarity = rarity ? rarity.toLowerCase() : '';
    const setsMap = {};

    allCards.forEach(card => {
      // Set ID 与 Set Name 提取
      const setObj = card.set || {};
      const currentSetId = (card.set_id || setObj.id || (card.id ? card.id.split('-')[0] : 'OTHER')).toUpperCase();
      const rawSetName = card.set_name || setObj.name || currentSetId;
      const currentSetName = `${rawSetName} (${currentSetId})`;

      // 计算卡牌归一化稀有度
      const normRarity = normalizeRarity(card);

      // 稀有度过滤
      if (targetNormRarity && normRarity !== targetNormRarity) {
        return;
      }

      // 扩展包过滤
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

      // 兼容多数据源图片地址
      const imgUrl = card.image || card.image_url || card.art || 
        `https://assets.tcgdex.net/en/tcgp/${currentSetId}/${card.local_id || card.number || (card.id ? card.id.split('-')[1] : '')}/low.webp`;

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

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
    res.status(200).json({ data: result });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Failed to fetch cards database', details: error.message });
  }
}
