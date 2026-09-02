const express = require('express');
const serverless = require('serverless-http');

const app = express();
const router = express.Router();

app.use(express.json());

// Data Menu Utama
let menuItems = [
  // Minuman
  { id: '1', name: 'Americano', type: 'beverage', hasTemperature: true, hasSugar: true, isSoldOut: false },
  { id: '2', name: 'Cappuccino', type: 'beverage', hasTemperature: true, hasSugar: true, isSoldOut: false },
  { id: '3', name: 'Latte Macchiato', type: 'beverage', hasTemperature: true, hasSugar: true, isSoldOut: false },
  { id: '4', name: 'Espresso', type: 'beverage', hasTemperature: true, hasSugar: true, isSoldOut: false },
  { id: '5', name: 'Cold Brew', type: 'beverage', hasTemperature: true, hasSugar: true, isSoldOut: false },
  { id: '6', name: 'Tea', type: 'beverage', hasTemperature: true, hasSugar: true, isSoldOut: false },
  { id: '7', name: 'Collagena Milk', type: 'beverage', hasTemperature: true, hasSugar: true, isSoldOut: false },
  { id: '8', name: 'Bearbrand Milk', type: 'beverage', hasTemperature: true, hasSugar: false, isSoldOut: false },
  { id: '9', name: 'Kitkat', type: 'beverage', hasTemperature: true, hasSugar: false, isSoldOut: false },
  { id: '10', name: 'Vsoy', type: 'beverage', hasTemperature: true, hasSugar: false, isSoldOut: false },
  { id: '11', name: 'Hydro Coco', type: 'beverage', hasTemperature: true, hasSugar: false, isSoldOut: false },
  { id: '12', name: 'Sari Kacang Ijo', type: 'beverage', hasTemperature: true, hasSugar: false, isSoldOut: false },
  { id: '13', name: 'UC100', type: 'beverage', hasTemperature: true, hasSugar: false, isSoldOut: false },
  { id: '14', name: 'Fanta', type: 'beverage', hasTemperature: true, hasSugar: false, isSoldOut: false },
  { id: '15', name: 'Coca-cola', type: 'beverage', hasTemperature: true, hasSugar: false, isSoldOut: false },
  { id: '16', name: 'Pocari Sweat', type: 'beverage', hasTemperature: true, hasSugar: false, isSoldOut: false },
  { id: '17', name: 'Larutan Penyegar', type: 'beverage', hasTemperature: true, hasSugar: false, isSoldOut: false },
  
  // Makanan
  { id: '18', name: 'Nasi Goreng Deputi', type: 'food', hasTemperature: false, hasSugar: false, isSoldOut: false },
  { id: '19', name: 'Mie Goreng Special', type: 'food', hasTemperature: false, hasSugar: false, isSoldOut: false },
  { id: '20', name: 'Roti Bakar Kaya', type: 'food', hasTemperature: false, hasSugar: false, isSoldOut: false },
  { id: '21', name: 'French Fries / Kentang Goreng', type: 'food', hasTemperature: false, hasSugar: false, isSoldOut: false }
];

let orders = [];

function getBaseMenuName(fullName) {
  return fullName.split(' (')[0].replace(/^\d+\.\s*/, '');
}

function calculateMenuStats() {
  const stats = {};
  menuItems.forEach(item => { stats[item.name] = 0; });
  orders.forEach(order => {
    const baseName = getBaseMenuName(order.item_name);
    if (stats[baseName] !== undefined) { stats[baseName]++; }
  });

  const sortedStats = Object.keys(stats).map(name => ({ name, count: stats[name] }));
  if (orders.length === 0) return { top: 'Belum ada data', bottom: 'Belum ada data' };

  sortedStats.sort((a, b) => b.count - a.count);
  const maxCount = sortedStats[0].count;
  const minCount = sortedStats[sortedStats.length - 1].count;

  const topMenus = sortedStats.filter(m => m.count === maxCount && maxCount > 0).map(m => m.name);
  const bottomMenus = sortedStats.filter(m => m.count === minCount).map(m => m.name);

  return {
    top: topMenus.length > 0 ? topMenus.join(', ') + ` (${maxCount}x)` : 'Belum ada data',
    bottom: bottomMenus.length > 0 ? bottomMenus.join(', ') + ` (${minCount}x)` : 'Belum ada data'
  };
}

// Endpoint Rest API
router.get('/orders', (req, res) => { res.json(orders); });
router.get('/menu', (req, res) => { res.json(menuItems); });
router.get('/menu-stats', (req, res) => { res.json(calculateMenuStats()); });

router.post('/orders', (req, res) => {
  const newOrder = { ...req.body, status: 'PENDING' };
  orders.push(newOrder);
  res.status(201).json(newOrder);
});

router.post('/orders/status', (req, res) => {
  const { id, status } = req.body;
  const order = orders.find(o => o.id === id);
  if (order) {
    order.status = status;
  }
  res.json({ success: true, orders });
});

router.delete('/orders/:id', (req, res) => {
  const { id } = req.params;
  orders = orders.filter(o => o.id !== id);
  res.json({ success: true, orders });
});

app.use('/.netlify/functions/server/api', router);
app.use('/api', router);

module.exports.handler = serverless(app);