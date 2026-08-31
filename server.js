const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname)));
app.use(express.json({ limit: '10mb' }));

// Helper para leer archivos JSON
const readJsonFile = (filename, callback) => {
  const filePath = path.join(__dirname, 'data', filename);
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return callback(err, null);
    try {
      callback(null, JSON.parse(data));
    } catch (parseErr) {
      callback(parseErr, null);
    }
  });
};

// Helper para escribir archivos JSON
const writeJsonFile = (filename, content, callback) => {
  const filePath = path.join(__dirname, 'data', filename);
  fs.writeFile(filePath, JSON.stringify(content, null, 2), 'utf8', callback);
};

// ==========================================
// API AUTENTICACIÓN
// ==========================================
app.post('/api/login', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Debe ingresar un correo electrónico.' });
  }

  readJsonFile('users.json', (err, data) => {
    if (err || !data || !data.users) {
      return res.status(500).json({ error: 'Error al consultar usuarios.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const foundUser = data.users.find(u => u.email.toLowerCase() === cleanEmail);

    if (foundUser) {
      res.json({ success: true, user: foundUser });
    } else {
      const newUser = {
        id: `USR-${Date.now().toString().slice(-3)}`,
        email: cleanEmail,
        name: cleanEmail.split('@')[0],
        role: 'customer',
        phone: '809-555-0000'
      };
      data.users.push(newUser);
      writeJsonFile('users.json', data, () => {});
      res.json({ success: true, user: newUser });
    }
  });
});

// ==========================================
// API MENÚ (GET, POST, PUT, DELETE)
// ==========================================
app.get('/api/menu', (req, res) => {
  readJsonFile('menu.json', (err, data) => {
    if (err) return res.status(500).json({ error: 'No se pudo cargar el menú.' });
    res.json(data);
  });
});

// [NEW] POST: Agregar plato al menú
app.post('/api/menu', (req, res) => {
  const { name, category, price, prepTime, description, image } = req.body;
  if (!name || !price || !category) {
    return res.status(400).json({ error: 'Nombre, categoría y precio son obligatorios.' });
  }

  readJsonFile('menu.json', (err, menuData) => {
    if (err || !menuData) return res.status(500).json({ error: 'Error al leer el menú.' });

    const newDish = {
      id: `dish-${Date.now().toString().slice(-4)}`,
      name,
      category,
      price: Number(price),
      prepTime: prepTime || '15-20 min',
      description: description || 'Especialidad gastronómica recién creada por el chef.',
      image: image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'
    };

    menuData.dishes.push(newDish);
    writeJsonFile('menu.json', menuData, (writeErr) => {
      if (writeErr) return res.status(500).json({ error: 'Error al guardar el nuevo plato.' });
      res.json({ success: true, message: `¡Plato "${name}" agregado con éxito!`, dish: newDish });
    });
  });
});

// [NEW] PUT: Editar plato del menú
app.put('/api/menu/:id', (req, res) => {
  const dishId = req.params.id;
  const { name, category, price, prepTime, description, image } = req.body;

  readJsonFile('menu.json', (err, menuData) => {
    if (err || !menuData) return res.status(500).json({ error: 'Error al leer el menú.' });

    const dishIndex = menuData.dishes.findIndex(d => String(d.id) === String(dishId));
    if (dishIndex === -1) return res.status(404).json({ error: 'Plato no encontrado.' });

    const updatedDish = {
      ...menuData.dishes[dishIndex],
      name: name || menuData.dishes[dishIndex].name,
      category: category || menuData.dishes[dishIndex].category,
      price: price ? Number(price) : menuData.dishes[dishIndex].price,
      prepTime: prepTime || menuData.dishes[dishIndex].prepTime,
      description: description || menuData.dishes[dishIndex].description,
      image: image || menuData.dishes[dishIndex].image
    };

    menuData.dishes[dishIndex] = updatedDish;

    writeJsonFile('menu.json', menuData, (writeErr) => {
      if (writeErr) return res.status(500).json({ error: 'Error al actualizar el plato.' });
      res.json({ success: true, message: `¡Plato "${updatedDish.name}" actualizado!`, dish: updatedDish });
    });
  });
});

// [NEW] DELETE: Eliminar plato del menú
app.delete('/api/menu/:id', (req, res) => {
  const dishId = req.params.id;

  readJsonFile('menu.json', (err, menuData) => {
    if (err || !menuData) return res.status(500).json({ error: 'Error al leer el menú.' });

    const initialLength = menuData.dishes.length;
    menuData.dishes = menuData.dishes.filter(d => String(d.id) !== String(dishId));

    if (menuData.dishes.length === initialLength) {
      return res.status(404).json({ error: 'Plato no encontrado.' });
    }

    writeJsonFile('menu.json', menuData, (writeErr) => {
      if (writeErr) return res.status(500).json({ error: 'Error al eliminar plato.' });
      res.json({ success: true, message: 'Plato eliminado correctamente del menú.' });
    });
  });
});

// ==========================================
// API MESAS (GET, POST, PUT, DELETE)
// ==========================================
app.get('/api/tables', (req, res) => {
  readJsonFile('tables.json', (err, data) => {
    if (err) return res.status(500).json({ error: 'No se pudieron obtener las mesas.' });
    res.json(data);
  });
});

// [NEW] POST: Agregar nueva mesa al salón
app.post('/api/tables', (req, res) => {
  const { number, zone, capacity, status } = req.body;
  if (!number || !capacity) {
    return res.status(400).json({ error: 'Número de mesa y capacidad son obligatorios.' });
  }

  readJsonFile('tables.json', (err, tableData) => {
    if (err || !tableData) return res.status(500).json({ error: 'Error al leer las mesas.' });

    const newTable = {
      id: `tbl-${Date.now().toString().slice(-4)}`,
      number: Number(number),
      zone: zone || 'Salón Principal',
      capacity: Number(capacity),
      status: status || 'Disponible'
    };

    tableData.tables.push(newTable);
    writeJsonFile('tables.json', tableData, (writeErr) => {
      if (writeErr) return res.status(500).json({ error: 'Error al guardar la nueva mesa.' });
      res.json({ success: true, message: `¡Mesa #${number} agregada al salón!`, table: newTable });
    });
  });
});

// [NEW] PUT: Actualizar estado o datos de mesa
app.put('/api/tables/:id', (req, res) => {
  const tableId = req.params.id;
  const { status, capacity, zone } = req.body;

  readJsonFile('tables.json', (err, tableData) => {
    if (err || !tableData) return res.status(500).json({ error: 'Error al leer las mesas.' });

    const targetTable = tableData.tables.find(t => String(t.id) === String(tableId));
    if (!targetTable) return res.status(404).json({ error: 'Mesa no encontrada.' });

    if (status) targetTable.status = status;
    if (capacity) targetTable.capacity = Number(capacity);
    if (zone) targetTable.zone = zone;

    writeJsonFile('tables.json', tableData, (writeErr) => {
      if (writeErr) return res.status(500).json({ error: 'Error al actualizar mesa.' });
      res.json({ success: true, message: `Mesa #${targetTable.number} actualizada a "${targetTable.status}".`, table: targetTable });
    });
  });
});

// [NEW] DELETE: Eliminar mesa del salón
app.delete('/api/tables/:id', (req, res) => {
  const tableId = req.params.id;

  readJsonFile('tables.json', (err, tableData) => {
    if (err || !tableData) return res.status(500).json({ error: 'Error al leer las mesas.' });

    const initialLength = tableData.tables.length;
    tableData.tables = tableData.tables.filter(t => String(t.id) !== String(tableId));

    if (tableData.tables.length === initialLength) {
      return res.status(404).json({ error: 'Mesa no encontrada.' });
    }

    writeJsonFile('tables.json', tableData, (writeErr) => {
      if (writeErr) return res.status(500).json({ error: 'Error al eliminar mesa.' });
      res.json({ success: true, message: 'Mesa eliminada del mapa de salón.' });
    });
  });
});

// ==========================================
// API RESERVAS, PEDIDOS & DASHBOARD
// ==========================================
app.post('/api/reservations', (req, res) => {
  const { name, email, phone, date, time, guests, zone, tableId } = req.body;
  if (!name || !date || !time || !guests) {
    return res.status(400).json({ error: 'Faltan datos obligatorios.' });
  }

  readJsonFile('tables.json', (err, tableData) => {
    if (!err && tableData && tableData.tables) {
      const targetTable = tableId 
        ? tableData.tables.find(t => t.id === tableId)
        : tableData.tables.find(t => t.status === 'Disponible' && t.capacity >= guests && (zone ? t.zone === zone : true));

      if (targetTable) {
        targetTable.status = 'Reservada';
        writeJsonFile('tables.json', tableData, () => {});
      }
    }

    res.json({
      success: true,
      message: `¡Reserva confirmada con éxito para ${name}!`,
      reservationDetails: {
        id: `RES-${Date.now().toString().slice(-4)}`,
        name, date, time, guests, zone: zone || 'Salón Principal', status: 'Confirmada'
      }
    });
  });
});

app.get('/api/orders', (req, res) => {
  readJsonFile('orders.json', (err, data) => {
    if (err) return res.status(500).json({ error: 'No se pudieron cargar los pedidos.' });
    res.json(data);
  });
});

app.post('/api/orders', (req, res) => {
  const { customerName, customerEmail, items, totals, userRole } = req.body;

  if (userRole === 'admin') {
    return res.status(403).json({ error: 'Acceso denegado: El perfil Administrador no realiza pedidos.' });
  }

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'El carrito está vacío.' });
  }

  readJsonFile('orders.json', (err, orderData) => {
    const orders = (orderData && orderData.orders) || [];
    const nextNum = 1000 + orders.length + 1;
    const newOrder = {
      id: `PED-${nextNum}`,
      customerName: customerName || 'Cliente Sabor',
      customerEmail: customerEmail || 'cliente@sabor.com',
      items,
      totals,
      status: 'En Cocina',
      ncf: `B010000${nextNum}`,
      createdAt: new Date().toLocaleString('es-DO', { dateStyle: 'short', timeStyle: 'short' })
    };

    orders.unshift(newOrder);
    writeJsonFile('orders.json', { orders }, (err) => {
      if (err) return res.status(500).json({ error: 'Error al guardar el pedido.' });
      res.json({
        success: true,
        message: '¡Pedido enviado a cocina con éxito!',
        order: newOrder
      });
    });
  });
});

app.put('/api/orders/:id/status', (req, res) => {
  const orderId = req.params.id;
  const { status } = req.body;

  readJsonFile('orders.json', (err, orderData) => {
    if (err || !orderData) return res.status(500).json({ error: 'Error al buscar el pedido.' });
    
    const targetOrder = orderData.orders.find(o => String(o.id) === String(orderId));
    if (!targetOrder) return res.status(404).json({ error: 'Pedido no encontrado.' });

    targetOrder.status = status;
    writeJsonFile('orders.json', orderData, (err) => {
      if (err) return res.status(500).json({ error: 'Error al actualizar pedido.' });
      res.json({ success: true, message: `Estado actualizado a "${status}".`, order: targetOrder });
    });
  });
});

app.get('/api/dashboard/metrics', (req, res) => {
  readJsonFile('menu.json', (err, menuData) => {
    const dishes = (menuData && menuData.dishes) || [];
    res.json({
      summary: {
        dailySales: 45890.00,
        activeOrders: 14,
        averageTicket: 1150.00,
        averagePrepTimeMinutes: 16.5,
        occupancyPercentage: 70
      },
      topDishes: dishes.slice(0, 4).map(d => ({
        id: d.id, name: d.name, ordersToday: Math.floor(Math.random() * 25) + 10, prepTime: d.prepTime
      })),
      kitchenStatus: { pendingOrders: 5, inPreparation: 6, readyToServe: 3 }
    });
  });
});

app.get('/api/customers', (req, res) => {
  readJsonFile('customers.json', (err, data) => {
    if (err) return res.status(500).json({ error: 'No se cargaron los clientes.' });
    res.json(data);
  });
});

app.listen(PORT, () => {
  console.log(`[SERVER] Servidor Restaurante Sabor Gourmet activo en http://localhost:${PORT}`);
});
