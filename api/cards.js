export default async function handler(req, res) {
  const { rarity = '', setId = '' } = req.query;

  try {
    // 涵盖 Pocket 目前的主要扩展包和 Promo 卡
    const setIds = ['A1', 'A1a', 'P-A']; 
    
    // 如果指定了 setId，只请求单包（极速）；没指定则请求已定义的扩展包
    const targetSets = setId ? [setId] : setIds;

    const setPromises = targetSets.map(id => 
      fetch(`https://api.tcgdex.net/v2/en/sets/${id}`)
        .then(r => r.ok ? r.json() : null)
        .catch(() => null)
    );

    const setsData = (await Promise.all(setPromises)).filter(Boolean);

    let result = [];

    setsData.forEach(setData => {
      if (setData && setData.cards) {
        let cards = setData.cards.map(card => ({
          id: card.id,
          name: card.name,
          setId: setData.id,
          setName: setData.name || setData.id,
          rarity: card.rarity || 'Standard',
          image: card.image ? `${card.image}/low.webp` : '',
          highImage: card.image ? `${card.image}/high.webp` : ''
        }));

        // 稀有度过滤
        if (rarity) {
          cards = cards.filter(c => c.rarity.toLowerCase() === rarity.toLowerCase());
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
