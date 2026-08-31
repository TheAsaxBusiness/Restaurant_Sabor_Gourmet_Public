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
}
