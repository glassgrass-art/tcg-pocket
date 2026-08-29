module.exports = async function handler(req, res) {
  // 1. 设置跨域与缓存
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { rarity = '', setId = '' } = req.query || {};

  try {
    // 全量 Pocket 拓展包 ID 映射
    const knownSets = [
      { id: 'A1', name: 'Genetic Apex (最强的基因)' },
      { id: 'A1a', name: 'Mythical Island (幻之岛)' },
      { id: 'A2', name: 'Space-Time Smackdown (时空激斗)' },
      { id: 'A2a', name: 'Triumphant Light (胜者之光)' },
      { id: 'A2b', name: 'Shining Revelry (璀璨狂欢)' },
      { id: 'A3', name: 'Celestial Guardians (星宿守护者)' },
      { id: 'A3a', name: 'Extradimensional Crisis (异次元危机)' },
      { id: 'A3b', name: 'Eevee Grove (伊布之森)' },
      { id: 'A4', name: 'Wisdom of Sea and Sky (海空智者)' },
      { id: 'A4a', name: 'Secluded Springs (幽翠之泉)' },
      { id: 'A4b', name: 'Deluxe Pack ex (豪华 EX 包)' },
      { id: 'B1', name: 'Mega Rising (巨兽崛起)' },
      { id: 'B1a', name: 'Crimson Blaze (绯红烈焰)' },
      { id: 'B2', name: 'Fantastical Parade (梦幻巡游)' },
      { id: 'B2a', name: 'Paldean Wonders (帕底亚奇迹)' },
      { id: 'B2b', name: 'Mega Shine (巨力闪耀)' },
      { id: 'B3', name: 'Pulsing Aura (脉动气场)' },
      { id: 'B3a', name: 'Paradox Drive (悖论驱动)' },
      { id: 'B3b', name: 'Everyday Wonders (日常奇迹)' },
      { id: 'B4', name: 'Ruler of Skies (天空主宰)' },
      { id: 'B4a', name: "Team Rocket's Ambition (火箭队的野心)" },
      { id: 'P-A', name: 'Promos-A (活动特典包)' }
    ];

    const targetSets = setId ? knownSets.filter(s => s.id.toLowerCase() === setId.toLowerCase()) : knownSets;

    // 稀有度归一化函数
    function normalizeRarity(rawRarity, name, localId) {
      if (!rawRarity && !name) return '1diamond';
      
      const r = (rawRarity || '').toString().trim();
      const s = r.toLowerCase().replace(/[^a-z0-9]/g, '');

      if (r === '◇' || r === '◆' || s.includes('1diamond') || s === 'common') return '1diamond';
      if (r === '◇◇' || r === '◆◆' || s.includes('2diamond') || s === 'uncommon') return '2diamond';
      if (r === '◇◇◇' || r === '◆◆◆' || s.includes('3diamond') || s === 'rare') return '3diamond';
      if (r === '◇◇◇◇' || r === '◆◆◆◆' || s.includes('4diamond') || s.includes('doublerare') || s === 'rr') return '4diamond';

      if (r === '☆' || r === '★' || s.includes('1star') || s.includes('onestar') || s === 'ar') return '1star';
      if (r === '☆☆' || r === '★★' || s.includes('2star') || s.includes('twostar') || s === 'sar' || s === 'sr') return '2star';
      if (r === '☆☆☆' || r === '★★★' || s.includes('3star') || s.includes('threestar') || s === 'ur' || s.includes('immersive')) return '3star';
      if (r === '♛' || r === '👑' || s.includes('crown')) return 'crown';

      const cleanName = (name || '').toLowerCase();
      const num = parseInt(localId, 10);

      if (cleanName.includes(' ex') || cleanName.endsWith('ex')) {
        return '4diamond';
      }
      
      if (!isNaN(num)) {
        if (num > 280) return 'crown';
        if (num > 240) return '3star';
        if (num > 200) return '1star';
      }

      return '1diamond';
    }

    const targetNormRarity = rarity ? rarity.toLowerCase() : '';

    const fetchSetData = async (setItem) => {
      try {
        const res = await fetch(`https://api.tcgdex.net/v2/en/sets/${setItem.id}`, { 
          headers: { 'User-Agent': 'Mozilla/5.0' },
          signal: AbortSignal.timeout(6000) 
        });

        if (!res.ok) return null;
        const setData = await res.json();
        if (!setData || !setData.cards) return null;

        const formattedCards = setData.cards.map(card => {
          const rawRarity = card.rarity || '';
          const normRarity = normalizeRarity(rawRarity, card.name, card.localId || card.id.split('-')[1]);
          return {
            id: card.id,
            localId: card.localId || card.id.split('-').pop(),
            name: card.name,
            setId: setItem.id,
            setName: setItem.name,
            rarity: rawRarity || normRarity,
            normRarity: normRarity,
            image: card.image ? `${card.image}/low.webp` : '',
            highImage: card.image ? `${card.image}/high.webp` : ''
          };
        });

        const filteredCards = targetNormRarity
          ? formattedCards.filter(c => c.normRarity === targetNormRarity)
          : formattedCards;

        if (filteredCards.length > 0) {
          return {
            setId: setItem.id,
            setName: setItem.name,
            totalCards: filteredCards.length,
            cards: filteredCards
          };
        }
      } catch (e) {
        console.warn(`Failed fetching set ${setItem.id}`);
      }
      return null;
    };

    const resultsArray = await Promise.all(targetSets.map(fetchSetData));
    const result = resultsArray.filter(Boolean);

    return res.status(200).json({ data: result });

  } catch (error) {
    console.error('API Router Error:', error);
    return res.status(500).json({ error: 'Failed to fetch cards database', details: error.message });
  }
};
