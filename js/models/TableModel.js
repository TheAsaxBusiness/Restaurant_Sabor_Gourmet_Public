// ==========================================
// TABLEMODEL.JS - MODELO DE MESAS CON CRUD COMPLETO
// Altagracia - Dev 2 / Equipo Sabor Gourmet
// ==========================================

export default class TableModel {
  constructor() {
    this.tables = [];
  }

  async loadTables() {
    try {
      const response = await fetch('/api/tables');
      if (!response.ok) throw new Error('Error al cargar mesas.');
      const data = await response.json();
      this.tables = data.tables || [];
      return this.tables;
    } catch (err) {
      console.error('Error en TableModel:', err);
      return [];
    }
  }

  // [NEW CRUD] Agregar nueva mesa POST /api/tables
  async addTable(tableData) {
    try {
      const response = await fetch('/api/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tableData)
      });
      const data = await response.json();
      if (data.success) {
        await this.loadTables();
      }
      return data;
    } catch (err) {
      console.error('Error al agregar mesa:', err);
      return { success: false, error: 'Error de conexión.' };
    }
  }

  // [NEW CRUD] Actualizar estado o capacidad de mesa PUT /api/tables/:id
  async updateTableStatus(tableId, newStatus) {
    try {
      const response = await fetch(`/api/tables/${tableId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await response.json();
      if (data.success) {
        await this.loadTables();
      }
      return data;
    } catch (err) {
      console.error('Error al actualizar mesa:', err);
      return { success: false, error: 'Error de conexión.' };
    }
  }

  // [NEW CRUD] Eliminar mesa DELETE /api/tables/:id
  async deleteTable(tableId) {
    try {
      const response = await fetch(`/api/tables/${tableId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.success) {
        await this.loadTables();
      }
      return data;
    } catch (err) {
      console.error('Error al eliminar mesa:', err);
      return { success: false, error: 'Error de conexión.' };
    }
  }

  async makeReservation(reservationData) {
    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reservationData)
      });
      const result = await response.json();
      if (result.success) {
        await this.loadTables();
      }
      return result;
    } catch (err) {
      console.error('Error al realizar reserva:', err);
      return { success: false, message: 'Error de red al procesar reserva.' };
    }
  }

  getAllTables() {
    return this.tables;
  }

  getAvailableTables() {
    return this.tables.filter(t => t.status === 'Disponible');
  }

  getTablesByZone(zone) {
    if (!zone || zone === 'Todas') return this.tables;
    return this.tables.filter(t => t.zone === zone);
  }
}
