// ==========================================
// DASHBOARDMODEL.JS - MODELO DE DASHBOARD & CRM
// Franyel - Dev 1
// ==========================================

export default class DashboardModel {
  constructor() {
    this.metrics = null;
    this.customers = [];
  }

  // Cargar métricas e indicadores KPI desde /api/dashboard/metrics
  async loadMetrics() {
    try {
      const response = await fetch('/api/dashboard/metrics');
      if (!response.ok) throw new Error('Error al cargar métricas.');
      this.metrics = await response.json();
      return this.metrics;
    } catch (err) {
      console.error('Error en DashboardModel:', err);
      return null;
    }
  }

  // Cargar lista de clientes CRM desde /api/customers
  async loadCustomers() {
    try {
      const response = await fetch('/api/customers');
      if (!response.ok) throw new Error('Error al cargar clientes CRM.');
      const data = await response.json();
      this.customers = data.customers || [];
      return this.customers;
    } catch (err) {
      console.error('Error en DashboardModel (customers):', err);
      return [];
    }
  }

  // [CRUD CLIENTES] Agregar cliente CRM
  async addCustomer(customerData) {
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData)
      });
      const data = await res.json();
      if (data.success) await this.loadCustomers();
      return data;
    } catch (e) {
      return { success: false, error: 'Error al conectar con la API.' };
    }
  }

  // [CRUD CLIENTES] Editar cliente CRM
  async updateCustomer(id, customerData) {
    try {
      const res = await fetch(`/api/customers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData)
      });
      const data = await res.json();
      if (data.success) await this.loadCustomers();
      return data;
    } catch (e) {
      return { success: false, error: 'Error al conectar con la API.' };
    }
  }

  // [CRUD CLIENTES] Eliminar cliente CRM
  async deleteCustomer(id) {
    try {
      const res = await fetch(`/api/customers/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) await this.loadCustomers();
      return data;
    } catch (e) {
      return { success: false, error: 'Error al conectar con la API.' };
    }
  }
}
