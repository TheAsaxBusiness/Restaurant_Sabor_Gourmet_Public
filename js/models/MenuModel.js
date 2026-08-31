// ==========================================
// MENUMODEL.JS - MODELO DE MENÚ CON CRUD COMPLETO
// Franyel - Dev 1 / Equipo Sabor Gourmet
// ==========================================

export default class MenuModel {
  constructor() {
    this.dishes = [];
    this.tableData = { schedule: [], combos: [], nutrition: [] };
  }

  async loadMenu() {
    try {
      const response = await fetch('/api/menu');
      if (!response.ok) throw new Error('Error al obtener menú desde la API.');
      const data = await response.json();
      
      this.dishes = data.dishes || [];
      this.tableData = {
        schedule: data.schedule || [],
        combos: data.combos || [],
        nutrition: data.nutrition || []
      };
      
      return this.dishes;
    } catch (err) {
      console.error('Error en MenuModel:', err);
      return [];
    }
  }

  // [NEW CRUD] Enviar nuevo plato a la API POST /api/menu
  async addDish(dishData) {
    try {
      const response = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dishData)
      });
      const data = await response.json();
      if (data.success) {
        await this.loadMenu();
      }
      return data;
    } catch (err) {
      console.error('Error al agregar plato:', err);
      return { success: false, error: 'Error de conexión.' };
    }
  }

  // [NEW CRUD] Editar plato existente PUT /api/menu/:id
  async updateDish(dishId, dishData) {
    try {
      const response = await fetch(`/api/menu/${dishId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dishData)
      });
      const data = await response.json();
      if (data.success) {
        await this.loadMenu();
      }
      return data;
    } catch (err) {
      console.error('Error al actualizar plato:', err);
      return { success: false, error: 'Error de conexión.' };
    }
  }

  // [NEW CRUD] Eliminar plato DELETE /api/menu/:id
  async deleteDish(dishId) {
    try {
      const response = await fetch(`/api/menu/${dishId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.success) {
        await this.loadMenu();
      }
      return data;
    } catch (err) {
      console.error('Error al eliminar plato:', err);
      return { success: false, error: 'Error de conexión.' };
    }
  }

  getAllDishes() {
    return this.dishes;
  }

  getCategories() {
    const categories = this.dishes.map(item => item.category);
    return ['Todas', ...new Set(categories)];
  }

  getItemsByCategory(category) {
    if (!category || category === 'Todas') {
      return this.dishes;
    }
    return this.dishes.filter(item => item.category === category);
  }

  searchItems(query) {
    if (!query) return this.dishes;
    const cleanQuery = query.toLowerCase().trim();
    return this.dishes.filter(item => 
      item.name.toLowerCase().includes(cleanQuery) || 
      item.description.toLowerCase().includes(cleanQuery)
    );
  }

  getDishById(id) {
    return this.dishes.find(item => String(item.id) === String(id));
  }

  getTableData() {
    return this.tableData;
  }
}
