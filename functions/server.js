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
  if (!fullName) return '';
  return fullName.split(' (')[0].replace(/^\d+\.\s*/, '');
}

function calculateMenuStats() {
  const stats = {};
  menuItems.forEach(item => { stats[item.name] = 0; });

  orders.forEach(order => {
    const itemName = order.item_name || order.itemName || order.item || '';
    const baseName = getBaseMenuName(itemName);
    if (stats[baseName] !== undefined) { 
      stats[baseName]++; 
    }
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
router.get('/orders', (req, res) => { 
  res.json(orders); 
});

router.get('/menu', (req, res) => { 
  res.json(menuItems); 
});

router.get('/menu-stats', (req, res) => { 
  res.json(calculateMenuStats()); 
});

// POST: Buat Pesanan Baru (Normalisasi Key & ID String)
router.post('/orders', (req, res) => {
  const body = req.body || {};
  
  const customerName = body.customer_name || body.customerName || body.name || 'Pemesan';
  const itemName = body.item_name || body.itemName || body.item || 'Pesanan';
  const note = body.note || '';

  const newOrder = {
    id: String(body.id || Date.now()),
    customer_name: customerName,
    name: customerName,
    customerName: customerName,
    item_name: itemName,
    item: itemName,
    itemName: itemName,
    note: note,
    table_number: body.table_number || '-',
    status: 'PENDING',
    created_at: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };

  orders.push(newOrder);
  res.status(201).json(newOrder);
});

// POST: Ubah Status Pesanan (Perbaikan Perbandingan ID String)
router.post('/orders/status', (req, res) => {
  const { id, status } = req.body || {};
  const order = orders.find(o => String(o.id) === String(id));
  
  if (order) {
    order.status = status;
    return res.json({ success: true, order, orders });
  }
  
  res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan', orders });
});

// DELETE: Pembatalan Pesanan
router.delete('/orders/:id', (req, res) => {
  const { id } = req.params;
  orders = orders.filter(o => String(o.id) !== String(id));
  res.json({ success: true, orders });
});

// POST: Tambah/Edit Menu (Admin Panel)
router.post('/menu', (req, res) => {
  const { id, name, type, hasTemperature, hasSugar } = req.body || {};
  
  if (id) {
    const index = menuItems.findIndex(m => String(m.id) === String(id));
    if (index !== -1) {
      menuItems[index] = {
        ...menuItems[index],
        name,
        type: type || 'beverage',
        hasTemperature: Boolean(hasTemperature),
        hasSugar: Boolean(hasSugar)
      };
      return res.json({ success: true, menu: menuItems[index] });
    }
  }

  const newMenu = {
    id: String(Date.now()),
    name,
    type: type || 'beverage',
    hasTemperature: Boolean(hasTemperature),
    hasSugar: Boolean(hasSugar),
    isSoldOut: false
  };

  menuItems.push(newMenu);
  res.status(201).json({ success: true, menu: newMenu });
});

// POST: Toggle Status Sold Out Menu
router.post('/menu/toggle-status', (req, res) => {
  const { id } = req.body || {};
  const menu = menuItems.find(m => String(m.id) === String(id));
  
  if (menu) {
    menu.isSoldOut = !menu.isSoldOut;
    return res.json({ success: true, isSoldOut: menu.isSoldOut });
  }
  
  res.status(404).json({ success: false, message: 'Menu tidak ditemukan' });
});

// Route Routing Netlify & Standalone
app.use('/.netlify/functions/server/api', router);
app.use('/api', router);

module.exports.handler = serverless(app);
