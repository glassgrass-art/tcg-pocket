export default async function handler(req, res) {
  const { rarity = '', setId = '' } = req.query;

  try {
    // Pocket 目前发行的核心及补充扩展包列表 (可根据需要继续追加)
    const setIds = ['A1', 'A1a', 'P-A']; 
    
    const targetSets = setId ? [setId] : setIds;

    const setPromises = targetSets.map(id => 
      fetch(`https://api.tcgdex.net/v2/en/sets/${id}`)
        .then(r => r.ok ? r.json() : null)
        .catch(() => null)
    );

    const setsData = (await Promise.all(setPromises)).filter(Boolean);

    let result = [];

    // 稀有度标准化映射，防止 API 字段微调导致查不到
    function normalizeRarity(str) {
      if (!str) return '';
      const s = str.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (s.includes('1diamond') || s === 'onediamond' || s === 'common') return '1diamond';
      if (s.includes('2diamond') || s === 'twodiamond' || s === 'uncommon') return '2diamond';
      if (s.includes('3diamond') || s === 'threediamond' || s === 'rare') return '3diamond';
      if (s.includes('4diamond') || s === 'fourdiamond' || s === 'double rare' || s === 'rr') return '4diamond';
      if (s.includes('1star') || s === 'onestar' || s === 'illustration rare' || s === 'ar') return '1star';
      if (s.includes('2star') || s === 'twostar' || s === 'special illustration rare' || s === 'sar' || s === 'sr') return '2star';
      if (s.includes('3star') || s === 'threestar' || s === 'immersive' || s === 'ur') return '3star';
      if (s.includes('crown') || s === 'crown rare') return 'crown';
      return s;
    }

    const targetNormRarity = normalizeRarity(rarity);

    setsData.forEach(setData => {
      if (setData && setData.cards) {
        let cards = setData.cards.map(card => {
          const rawRarity = card.rarity || 'Standard';
          return {
            id: card.id,
            name: card.name,
            setId: setData.id,
            setName: setData.name || setData.id,
            rarity: rawRarity,
            normRarity: normalizeRarity(rawRarity),
            image: card.image ? `${card.image}/low.webp` : '',
            highImage: card.image ? `${card.image}/high.webp` : ''
          };
        });

        // 如果传了稀有度，进行过滤匹配
        if (targetNormRarity) {
          cards = cards.filter(c => c.normRarity === targetNormRarity || c.rarity.toLowerCase().includes(targetNormRarity));
        }

        if (cards.length > 0) {
          result.push({
            setId: setData.id,
            setName: setData.name || setData.id,
            totalCards: cards.length,
            cards: cards
          });
        }
      }
    });

    res.status(200).json({ data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch cards' });
  }
}
