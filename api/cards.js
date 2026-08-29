export default async function handler(req, res) {
  const { rarity = '', setId = '' } = req.query;

  try {
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

    // 官方精准稀有度映射 (含彩星 / 异色星)
    function normalizeRarity(rawRarity) {
      if (!rawRarity) return '1diamond';
      const r = rawRarity.toString().trim();
      const s = r.toLowerCase().replace(/[^a-z0-9]/g, '');

      // 符号与英文标准匹配
      if (r === '◇' || r === '◆' || s.includes('1diamond') || s === 'onediamond' || s === 'common') return '1diamond';
      if (r === '◇◇' || r === '◆◆' || s.includes('2diamond') || s === 'twodiamond' || s === 'uncommon') return '2diamond';
      if (r === '◇◇◇' || r === '◆◆◆' || s.includes('3diamond') || s === 'threediamond' || s === 'rare') return '3diamond';
      if (r === '◇◇◇◇' || r === '◆◆◆◆' || s.includes('4diamond') || s === 'fourdiamond' || s === 'doublerare' || s === 'rr') return '4diamond';

      // 异色 / 彩星卡识别 (Shiny Star)
      if (s.includes('shiny') || s.includes('colorstar') || s.includes('shinystar') || r.includes('S')) return 'shinystar';

      // 普通星级与皇冠
      if (r === '☆' || r === '★' || s.includes('1star') || s.includes('onestar') || s === 'ar') return '1star';
      if (r === '☆☆' || r === '★★' || s.includes('2star') || s.includes('twostar') || s === 'sar' || s === 'sr') return '2star';
      if (r === '☆☆☆' || r === '★★★' || s.includes('3star') || s.includes('threestar') || s === 'ur' || s.includes('immersive')) return '3star';
      if (r === '♛' || r === '👑' || s.includes('crown')) return 'crown';

      return '1diamond';
    }

    const targetNormRarity = rarity ? normalizeRarity(rarity) : '';

    const fetchSetData = async (setItem) => {
      try {
        const res = await fetch(`https://api.tcgdex.net/v2/en/sets/${setItem.id}`, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          signal: AbortSignal.timeout(6000)
        });

        if (!res.ok) return null;
        const setData = await res.json();
        if (!setData || !setData.cards) return null;

        // 并发批量调取该 Set 内部单卡详情获取绝对精准的官方 rarity
        const detailPromises = setData.cards.map(async (c) => {
          try {
            const cardRes = await fetch(`https://api.tcgdex.net/v2/en/cards/${c.id}`, { signal: AbortSignal.timeout(3000) });
            if (cardRes.ok) {
              const detail = await cardRes.json();
              return { ...c, rarity: detail.rarity || c.rarity };
            }
          } catch (e) {}
          return c;
        });

        const fullCardsData = await Promise.all(detailPromises);

        const formattedCards = fullCardsData.map(card => {
          const rawRarity = card.rarity || '';
          const normRarity = normalizeRarity(rawRarity);

          return {
            id: card.id,
            localId: card.localId || card.id.split('-').pop(),
            name: card.name,
            setId: setItem.id,
            setName: setItem.name,
            rarity: rawRarity || '◇',
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

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate'); // 开启强缓存，二次加载瞬间完成
    res.status(200).json({ data: result });

  } catch (error) {
    console.error('API Router Error:', error);
    res.status(500).json({ error: 'Failed to fetch cards database', details: error.message });
  }
}
