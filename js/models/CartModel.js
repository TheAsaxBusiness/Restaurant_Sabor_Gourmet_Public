// ==========================================
// CARTMODEL.JS - MODELO DE DATOS DEL CARRITO
// Franyel - Dev 1
// ==========================================

export default class CartModel {
  constructor() {
    this.items = [];
    this.taxRate = 0.18; // 18% ITBIS
    this.STORAGE_KEY = 'sabor_gourmet_cart';
    this.loadFromLocalStorage();
  }

  // Agregar producto al carrito o incrementar raciones
  addItem(product, quantity = 1) {
    if (!product || !product.id) return this.items;

    const existingIndex = this.items.findIndex(item => String(item.id) === String(product.id));

    if (existingIndex > -1) {
      this.items[existingIndex].quantity += quantity;
    } else {
      this.items.push({
        id: product.id,
        name: product.name || product.nombre,
        price: Number(product.price || product.precio) || 0,
        image: product.image || product.img || '',
        quantity: quantity
      });
    }

    this.saveToLocalStorage();
    return this.items;
  }

  // Eliminar producto del carrito por su ID
  removeItem(id) {
    this.items = this.items.filter(item => String(item.id) !== String(id));
    this.saveToLocalStorage();
    return this.items;
  }

  // Actualizar cantidad directa de raciones
  updateQuantity(id, quantity) {
    const item = this.items.find(item => String(item.id) === String(id));
    if (item) {
      item.quantity = Number(quantity);
      if (item.quantity <= 0) {
        return this.removeItem(id);
      }
    }
    this.saveToLocalStorage();
    return this.items;
  }

  // Obtener ítems del carrito
  getItems() {
    return this.items;
  }

  // Obtener suma total de unidades
  getTotalCount() {
    return this.items.reduce((total, item) => total + (Number(item.quantity) || 0), 0);
  }

  // Obtener cálculo de subtotal, ITBIS 18% y total general
  getTotals() {
    const subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * this.taxRate;
    const total = subtotal + tax;

    return {
      subtotal,
      tax,
      total,
      taxRatePercentage: 18
    };
  }

  // Vaciar carrito
  clear() {
    this.items = [];
    this.saveToLocalStorage();
    return this.items;
  }

  // Guardar estado en LocalStorage
  saveToLocalStorage() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.items));
    } catch (e) {
      console.warn('No se pudo guardar en LocalStorage:', e);
    }
  }

  // Cargar estado guardado desde LocalStorage
  loadFromLocalStorage() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        this.items = JSON.parse(saved) || [];
      }
    } catch (e) {
      this.items = [];
    }
    return this.items;
  }
}
