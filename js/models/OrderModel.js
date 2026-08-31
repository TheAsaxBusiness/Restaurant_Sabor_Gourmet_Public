// ==========================================
// ORDERMODEL.JS - GESTIÓN DE PEDIDOS Y FACTURAS
// Franyel - Dev 1 / Equipo Sabor Gourmet
// ==========================================

export default class OrderModel {
  constructor() {
    this.orders = [];
  }

  // Cargar pedidos desde la API /api/orders
  async loadOrders() {
    try {
      const response = await fetch('/api/orders');
      if (!response.ok) throw new Error('Error al cargar pedidos.');
      const data = await response.json();
      this.orders = data.orders || [];
      return this.orders;
    } catch (err) {
      console.error('Error en OrderModel:', err);
      return [];
    }
  }

  // Enviar un nuevo pedido a la API /api/orders
  async createOrder(customer, items, totals) {
    try {
      const newOrderData = {
        customerName: customer.name || 'Cliente Sabor',
        customerEmail: customer.email || 'cliente@sabor.com',
        items,
        totals
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrderData)
      });
      
      const result = await response.json();
      if (result.success) {
        await this.loadOrders();
      }
      return result;
    } catch (err) {
      console.error('Error al crear pedido:', err);
      return { success: false, message: 'Error de conexión.' };
    }
  }

  // Actualizar el estado del pedido por el Administrador/Cocina ('En Cocina', 'En Camino', 'Entregado')
  async updateOrderStatus(orderId, newStatus) {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const result = await response.json();
      if (result.success) {
        await this.loadOrders();
      }
      return result;
    } catch (err) {
      console.error('Error al actualizar estado:', err);
      return { success: false };
    }
  }

  getOrders() {
    return this.orders;
  }

  getOrdersByCustomer(email) {
    if (!email) return this.orders;
    return this.orders.filter(o => o.customerEmail && o.customerEmail.toLowerCase() === email.toLowerCase());
  }

  getOrderById(id) {
    return this.orders.find(o => String(o.id) === String(id)) || null;
  }
}
