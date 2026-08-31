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
// API AUTENTICACIÓN (CON VALIDACIONES ROBUSTAS)
// ==========================================
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !email.trim()) {
    return res.status(400).json({ success: false, error: 'Por favor, ingrese su correo electrónico.' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return res.status(400).json({ success: false, error: 'El correo electrónico ingresado no es válido (ejemplo: usuario@dominio.com).' });
  }

  if (!password || !password.trim()) {
    return res.status(400).json({ success: false, error: 'Por favor, ingrese su contraseña.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ success: false, error: 'La contraseña debe tener al menos 6 caracteres.' });
  }

  readJsonFile('users.json', (err, data) => {
    if (err || !data || !data.users) {
      return res.status(500).json({ success: false, error: 'Error al consultar la base de datos de usuarios.' });
    }

    const foundUser = data.users.find(u => u.email.toLowerCase() === cleanEmail);

    if (foundUser) {
      // Validar contraseña para usuario existente
      if (foundUser.password && foundUser.password !== password) {
        return res.status(401).json({ success: false, error: 'Contraseña incorrecta. Por favor verifique sus datos.' });
      }

      // Si no tenía contraseña registrada previa, guardarla
      if (!foundUser.password) {
        foundUser.password = password;
        writeJsonFile('users.json', data, () => {});
      }

      res.json({ success: true, user: foundUser, message: '¡Sesión iniciada con éxito!' });
    } else {
      // Registrar nuevo usuario cliente con su contraseña validada
      const newUser = {
        id: `USR-${Date.now().toString().slice(-3)}`,
        email: cleanEmail,
        name: cleanEmail.split('@')[0],
        role: 'customer',
        phone: '809-555-0000',
        password: password
      };
      data.users.push(newUser);
      writeJsonFile('users.json', data, () => {});
      res.json({ success: true, user: newUser, message: '¡Cuenta creada e sesión iniciada!' });
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

// ==========================================
// API CLIENTES / CRM (POST, PUT, DELETE)
// ==========================================
app.post('/api/customers', (req, res) => {
  const { name, email, phone, points, favoriteDish } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, error: 'El nombre del cliente es obligatorio.' });
  }
  const cleanEmail = (email || '').trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!cleanEmail || !emailRegex.test(cleanEmail)) {
    return res.status(400).json({ success: false, error: 'Ingrese un correo electrónico válido.' });
  }

  readJsonFile('customers.json', (err, customerData) => {
    if (err || !customerData) return res.status(500).json({ success: false, error: 'Error al leer clientes.' });

    const newCustomer = {
      id: `c-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      email: cleanEmail,
      phone: (phone || '809-555-0000').trim(),
      visits: 1,
      points: Number(points) >= 0 ? Number(points) : 50,
      favoriteDish: favoriteDish || 'Mofongo Tradicional',
      lastOrderDate: new Date().toISOString().split('T')[0]
    };

    customerData.customers.push(newCustomer);
    writeJsonFile('customers.json', customerData, (writeErr) => {
      if (writeErr) return res.status(500).json({ success: false, error: 'Error al guardar el cliente.' });
      res.json({ success: true, message: `¡Cliente "${newCustomer.name}" registrado con éxito!`, customer: newCustomer });
    });
  });
});

app.put('/api/customers/:id', (req, res) => {
  const customerId = req.params.id;
  const { name, email, phone, points, favoriteDish } = req.body;

  readJsonFile('customers.json', (err, customerData) => {
    if (err || !customerData) return res.status(500).json({ success: false, error: 'Error al leer clientes.' });

    const customerIndex = customerData.customers.findIndex(c => String(c.id) === String(customerId));
    if (customerIndex === -1) return res.status(404).json({ success: false, error: 'Cliente no encontrado.' });

    const target = customerData.customers[customerIndex];
    if (name) target.name = name.trim();
    if (email) target.email = email.trim();
    if (phone) target.phone = phone.trim();
    if (points !== undefined) target.points = Math.max(0, Number(points));
    if (favoriteDish) target.favoriteDish = favoriteDish.trim();

    writeJsonFile('customers.json', customerData, (writeErr) => {
      if (writeErr) return res.status(500).json({ success: false, error: 'Error al actualizar cliente.' });
      res.json({ success: true, message: `¡Cliente "${target.name}" actualizado con éxito!`, customer: target });
    });
  });
});

app.delete('/api/customers/:id', (req, res) => {
  const customerId = req.params.id;

  readJsonFile('customers.json', (err, customerData) => {
    if (err || !customerData) return res.status(500).json({ success: false, error: 'Error al leer clientes.' });

    const initialLength = customerData.customers.length;
    customerData.customers = customerData.customers.filter(c => String(c.id) !== String(customerId));

    if (customerData.customers.length === initialLength) {
      return res.status(404).json({ success: false, error: 'Cliente no encontrado.' });
    }

    writeJsonFile('customers.json', customerData, (writeErr) => {
      if (writeErr) return res.status(500).json({ success: false, error: 'Error al eliminar cliente.' });
      res.json({ success: true, message: 'Cliente eliminado del registro CRM.' });
    });
  });
});

// ==========================================
// API HORARIOS (POST, PUT, DELETE)
// ==========================================
app.post('/api/schedule', (req, res) => {
  const { day, hours, status } = req.body;
  if (!day || !hours) {
    return res.status(400).json({ success: false, error: 'Días y horario de atención son obligatorios.' });
  }

  readJsonFile('menu.json', (err, menuData) => {
    if (err || !menuData) return res.status(500).json({ success: false, error: 'Error al leer la base de datos.' });

    menuData.schedule = menuData.schedule || [];
    const newSchedule = { day: day.trim(), hours: hours.trim(), status: status || 'Abierto' };
    menuData.schedule.push(newSchedule);

    writeJsonFile('menu.json', menuData, (writeErr) => {
      if (writeErr) return res.status(500).json({ success: false, error: 'Error al guardar el horario.' });
      res.json({ success: true, message: `¡Horario para "${day}" creado con éxito!`, schedule: menuData.schedule });
    });
  });
});

app.put('/api/schedule/:index', (req, res) => {
  const index = parseInt(req.params.index, 10);
  const { day, hours, status } = req.body;

  readJsonFile('menu.json', (err, menuData) => {
    if (err || !menuData || !menuData.schedule) return res.status(500).json({ success: false, error: 'Error al leer los horarios.' });
    if (isNaN(index) || index < 0 || index >= menuData.schedule.length) {
      return res.status(404).json({ success: false, error: 'Registro de horario no encontrado.' });
    }

    if (day) menuData.schedule[index].day = day.trim();
    if (hours) menuData.schedule[index].hours = hours.trim();
    if (status) menuData.schedule[index].status = status.trim();

    writeJsonFile('menu.json', menuData, (writeErr) => {
      if (writeErr) return res.status(500).json({ success: false, error: 'Error al actualizar horario.' });
      res.json({ success: true, message: '¡Horario actualizado correctamente!', schedule: menuData.schedule });
    });
  });
});

app.delete('/api/schedule/:index', (req, res) => {
  const index = parseInt(req.params.index, 10);

  readJsonFile('menu.json', (err, menuData) => {
    if (err || !menuData || !menuData.schedule) return res.status(500).json({ success: false, error: 'Error al leer los horarios.' });
    if (isNaN(index) || index < 0 || index >= menuData.schedule.length) {
      return res.status(404).json({ success: false, error: 'Registro de horario no encontrado.' });
    }

    menuData.schedule.splice(index, 1);

    writeJsonFile('menu.json', menuData, (writeErr) => {
      if (writeErr) return res.status(500).json({ success: false, error: 'Error al eliminar el horario.' });
      res.json({ success: true, message: 'Registro de horario eliminado.', schedule: menuData.schedule });
    });
  });
});

// ==========================================
// API COMBOS PROMOCIONALES (POST, PUT, DELETE)
// ==========================================
app.post('/api/combos', (req, res) => {
  const { name, description, price, savings } = req.body;
  if (!name || !price || Number(price) <= 0) {
    return res.status(400).json({ success: false, error: 'Nombre del combo y un precio mayor a 0 son obligatorios.' });
  }

  readJsonFile('menu.json', (err, menuData) => {
    if (err || !menuData) return res.status(500).json({ success: false, error: 'Error al leer la base de datos.' });

    menuData.combos = menuData.combos || [];
    const newCombo = {
      name: name.trim(),
      description: (description || 'Combo especial').trim(),
      price: Number(price),
      savings: (savings || 'Ahorro Especial').trim()
    };
    menuData.combos.push(newCombo);

    writeJsonFile('menu.json', menuData, (writeErr) => {
      if (writeErr) return res.status(500).json({ success: false, error: 'Error al guardar el combo.' });
      res.json({ success: true, message: `¡Combo "${name}" agregado con éxito!`, combos: menuData.combos });
    });
  });
});

app.put('/api/combos/:index', (req, res) => {
  const index = parseInt(req.params.index, 10);
  const { name, description, price, savings } = req.body;

  readJsonFile('menu.json', (err, menuData) => {
    if (err || !menuData || !menuData.combos) return res.status(500).json({ success: false, error: 'Error al leer los combos.' });
    if (isNaN(index) || index < 0 || index >= menuData.combos.length) {
      return res.status(404).json({ success: false, error: 'Combo promocional no encontrado.' });
    }

    if (name) menuData.combos[index].name = name.trim();
    if (description) menuData.combos[index].description = description.trim();
    if (price && Number(price) > 0) menuData.combos[index].price = Number(price);
    if (savings) menuData.combos[index].savings = savings.trim();

    writeJsonFile('menu.json', menuData, (writeErr) => {
      if (writeErr) return res.status(500).json({ success: false, error: 'Error al actualizar el combo.' });
      res.json({ success: true, message: '¡Combo promocional actualizado con éxito!', combos: menuData.combos });
    });
  });
});

app.delete('/api/combos/:index', (req, res) => {
  const index = parseInt(req.params.index, 10);

  readJsonFile('menu.json', (err, menuData) => {
    if (err || !menuData || !menuData.combos) return res.status(500).json({ success: false, error: 'Error al leer los combos.' });
    if (isNaN(index) || index < 0 || index >= menuData.combos.length) {
      return res.status(404).json({ success: false, error: 'Combo promocional no encontrado.' });
    }

    menuData.combos.splice(index, 1);

    writeJsonFile('menu.json', menuData, (writeErr) => {
      if (writeErr) return res.status(500).json({ success: false, error: 'Error al eliminar el combo.' });
      res.json({ success: true, message: 'Combo promocional eliminado.', combos: menuData.combos });
    });
  });
});

// ==========================================
// API INFORMACIÓN NUTRICIONAL (POST, PUT, DELETE)
// ==========================================
app.post('/api/nutrition', (req, res) => {
  const { dish, calories, protein, carbs, fat } = req.body;
  if (!dish || !calories) {
    return res.status(400).json({ success: false, error: 'Nombre del plato y valor calórico son obligatorios.' });
  }

  readJsonFile('menu.json', (err, menuData) => {
    if (err || !menuData) return res.status(500).json({ success: false, error: 'Error al leer la base de datos.' });

    menuData.nutrition = menuData.nutrition || [];
    const newNutr = {
      dish: dish.trim(),
      calories: calories.trim(),
      protein: (protein || '0g').trim(),
      carbs: (carbs || '0g').trim(),
      fat: (fat || '0g').trim()
    };
    menuData.nutrition.push(newNutr);

    writeJsonFile('menu.json', menuData, (writeErr) => {
      if (writeErr) return res.status(500).json({ success: false, error: 'Error al guardar información nutricional.' });
      res.json({ success: true, message: `¡Registro nutricional para "${dish}" agregado!`, nutrition: menuData.nutrition });
    });
  });
});

app.put('/api/nutrition/:index', (req, res) => {
  const index = parseInt(req.params.index, 10);
  const { dish, calories, protein, carbs, fat } = req.body;

  readJsonFile('menu.json', (err, menuData) => {
    if (err || !menuData || !menuData.nutrition) return res.status(500).json({ success: false, error: 'Error al leer la nutrición.' });
    if (isNaN(index) || index < 0 || index >= menuData.nutrition.length) {
      return res.status(404).json({ success: false, error: 'Registro nutricional no encontrado.' });
    }

    if (dish) menuData.nutrition[index].dish = dish.trim();
    if (calories) menuData.nutrition[index].calories = calories.trim();
    if (protein) menuData.nutrition[index].protein = protein.trim();
    if (carbs) menuData.nutrition[index].carbs = carbs.trim();
    if (fat) menuData.nutrition[index].fat = fat.trim();

    writeJsonFile('menu.json', menuData, (writeErr) => {
      if (writeErr) return res.status(500).json({ success: false, error: 'Error al actualizar nutrición.' });
      res.json({ success: true, message: '¡Información nutricional actualizada!', nutrition: menuData.nutrition });
    });
  });
});

app.delete('/api/nutrition/:index', (req, res) => {
  const index = parseInt(req.params.index, 10);

  readJsonFile('menu.json', (err, menuData) => {
    if (err || !menuData || !menuData.nutrition) return res.status(500).json({ success: false, error: 'Error al leer la nutrición.' });
    if (isNaN(index) || index < 0 || index >= menuData.nutrition.length) {
      return res.status(404).json({ success: false, error: 'Registro nutricional no encontrado.' });
    }

    menuData.nutrition.splice(index, 1);

    writeJsonFile('menu.json', menuData, (writeErr) => {
      if (writeErr) return res.status(500).json({ success: false, error: 'Error al eliminar nutrición.' });
      res.json({ success: true, message: 'Registro nutricional eliminado.', nutrition: menuData.nutrition });
    });
  });
});

app.listen(PORT, () => {
  console.log(`[SERVER] Servidor Restaurante Sabor Gourmet activo en http://localhost:${PORT}`);
});
