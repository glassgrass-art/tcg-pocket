import cardsData from '../cards.json';

export default function handler(req, res) {
  // 设置 CORS 跨域标头，方便前端随时调用
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { type, card_type, search, id } = req.query;
  let results = cardsData;

  // 根据 ID 精确查询
  if (id) {
    const card = results.find(c => c.id === id);
    if (!card) return res.status(404).json({ message: 'Card not found' });
    return res.status(200).json(card);
  }

  // 按属性 (Lightning, Darkness等) 筛选
  if (type) {
    results = results.filter(card => card.type && card.type.toLowerCase() === type.toLowerCase());
  }

  // 按卡牌大类 (Pokémon 或 Trainer) 筛选
  if (card_type) {
    results = results.filter(card => card.card_type && card.card_type.toLowerCase() === card_type.toLowerCase());
  }

  // 按名称模糊搜索
  if (search) {
    results = results.filter(card => card.name.toLowerCase().includes(search.toLowerCase()));
  }

  return res.status(200).json({
    total: results.length,
    data: results
  });
}
