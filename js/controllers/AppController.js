// ==========================================
// APPCONTROLLER.JS - CONTROLADOR PRINCIPAL (MVC SPA, RBAC & GESTIÓN DINÁMICA CRUD)
// Enmanuel - Dev 4 / Equipo Sabor Gourmet
// ==========================================

import MenuModel from '../models/MenuModel.js';
import CartModel from '../models/CartModel.js';
import TableModel from '../models/TableModel.js';
import DashboardModel from '../models/DashboardModel.js';
import AuthModel from '../models/AuthModel.js';
import OrderModel from '../models/OrderModel.js';

import MenuView from '../views/MenuView.js';
import CartView from '../views/CartView.js';
import TableView from '../views/TableView.js';
import DashboardView from '../views/DashboardView.js';
import InvoiceView from '../views/InvoiceView.js';

export default class AppController {
  constructor() {
    this.menuModel = new MenuModel();
    this.cartModel = new CartModel();
    this.tableModel = new TableModel();
    this.dashboardModel = new DashboardModel();
    this.authModel = new AuthModel();
    this.orderModel = new OrderModel();

    this.menuView = new MenuView();
    this.cartView = new CartView();
    this.tableView = new TableView();
    this.dashboardView = new DashboardView();
    this.invoiceView = new InvoiceView();

    this.activeCategory = 'Todas';
    this.searchQuery = '';
    this.currentViewId = 'view-login';
  }

  async init() {
    this.initTheme();

    this.menuView.init();
    this.cartView.init();
    this.tableView.init();
    this.dashboardView.init();
    this.invoiceView.init();

    await this.menuModel.loadMenu();
    await this.tableModel.loadTables();
    await this.orderModel.loadOrders();

    this.renderMenuSection();
    this.updateCartUI();

    const tableData = this.menuModel.getTableData();
    this.tableView.renderScheduleTable(tableData.schedule);
    this.tableView.renderCombosTable(tableData.combos);
    this.tableView.renderNutritionTable(tableData.nutrition);

    const tables = this.tableModel.getAllTables();
    this.tableView.renderTablesStatus(tables);

    this.setupAuthListeners();
    this.setupCRUDModalsListeners();
    this.updateAuthUI();
    this.setupEventListeners();
  }

  initTheme() {
    const savedTheme = localStorage.getItem('sabor_gourmet_theme');
    const themeBtn = document.getElementById('theme-toggle-btn');

    if (savedTheme === 'light') {
      document.body.classList.add('light-theme');
      if (themeBtn) themeBtn.innerHTML = '<i class="fa-solid fa-sun" style="color: var(--color-primary);"></i>';
    } else {
      document.body.classList.remove('light-theme');
      if (themeBtn) themeBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
    }
  }

  toggleTheme() {
    const isLight = document.body.classList.toggle('light-theme');
    const themeBtn = document.getElementById('theme-toggle-btn');

    if (isLight) {
      localStorage.setItem('sabor_gourmet_theme', 'light');
      if (themeBtn) themeBtn.innerHTML = '<i class="fa-solid fa-sun" style="color: var(--color-primary);"></i>';
      this.cartView.showToast('Modo Claro Gourmet activado', 'info');
    } else {
      localStorage.setItem('sabor_gourmet_theme', 'dark');
      if (themeBtn) themeBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
      this.cartView.showToast('Modo Oscuro Gourmet activado', 'info');
    }
  }

  setupAuthListeners() {
    const formLogin = document.getElementById('main-login-form');
    const logoutBtn = document.getElementById('logout-btn');
    const brandLogo = document.getElementById('brand-logo');
    const emailInput = document.getElementById('login-email-input');
    const passInput = document.getElementById('login-pass-input');
    const errorBanner = document.getElementById('login-error-msg');
    const errorText = document.getElementById('login-error-text');
    const togglePassBtn = document.getElementById('toggle-pass-visibility');
    const passIcon = document.getElementById('pass-visibility-icon');

    // Alternar visibilidad de contraseña (mostrar/ocultar)
    if (togglePassBtn && passInput && passIcon) {
      togglePassBtn.addEventListener('click', () => {
        const isPass = passInput.type === 'password';
        passInput.type = isPass ? 'text' : 'password';
        passIcon.className = isPass ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
      });
    }

    // Limpiar errores visuales al escribir
    const clearErrors = () => {
      if (errorBanner) errorBanner.style.display = 'none';
      if (emailInput) emailInput.style.borderColor = '';
      if (passInput) passInput.style.borderColor = '';
    };

    if (emailInput) emailInput.addEventListener('input', clearErrors);
    if (passInput) passInput.addEventListener('input', clearErrors);

    if (formLogin) {
      formLogin.addEventListener('submit', async (e) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        clearErrors();

        const email = emailInput ? emailInput.value : '';
        const pass = passInput ? passInput.value : '';

        try {
          const res = await this.authModel.login(email, pass);
          if (res.success) {
            if (emailInput) emailInput.value = '';
            if (passInput) passInput.value = '';
            this.cartView.showToast(res.message || `Bienvenido de nuevo, ${res.user.name}`, 'success');
            this.updateAuthUI(true);
          } else {
            if (errorBanner && errorText) {
              errorText.textContent = res.message;
              errorBanner.style.display = 'block';
            }
            if (res.message && res.message.includes('correo') && emailInput) {
              emailInput.style.borderColor = '#e74c3c';
              emailInput.focus();
            } else if (res.message && res.message.includes('contraseña') && passInput) {
              passInput.style.borderColor = '#e74c3c';
              passInput.focus();
            }
            this.cartView.showToast(res.message || 'Error al iniciar sesión.', 'error');
          }
        } catch (err) {
          console.error('Error al procesar sesión:', err);
          this.cartView.showToast('Error inesperado al iniciar sesión.', 'error');
        }
        return false;
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        this.authModel.logout();
        this.cartView.showToast('Sesión cerrada correctamente.', 'info');
        this.updateAuthUI();
      });
    }

    if (brandLogo) {
      brandLogo.addEventListener('click', () => {
        if (this.authModel.isLoggedIn()) {
          const user = this.authModel.getCurrentUser();
          this.switchView(user.role === 'admin' ? 'view-admin' : 'view-inicio');
        } else {
          this.switchView('view-login');
        }
      });
    }
  }

  // Configurar modales interactivos CRUD (Platos & Mesas)
  setupCRUDModalsListeners() {
    // Modal CRUD Menú (Platos)
    const dishModal = document.getElementById('dish-crud-modal');
    const closeDishModal = document.getElementById('close-dish-crud-modal');
    const dishForm = document.getElementById('dish-crud-form');

    if (closeDishModal && dishModal) {
      closeDishModal.addEventListener('click', () => dishModal.classList.remove('active'));
    }

    if (dishForm) {
      dishForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const dishId = document.getElementById('crud-dish-id').value;
        const name = document.getElementById('crud-dish-name').value.trim();
        const category = document.getElementById('crud-dish-category').value.trim();
        const priceNum = Number(document.getElementById('crud-dish-price').value);
        const prepTime = document.getElementById('crud-dish-time').value.trim();
        const description = document.getElementById('crud-dish-desc').value.trim();

        if (!name) return this.cartView.showToast('El nombre del plato es obligatorio.', 'error');
        if (!category) return this.cartView.showToast('Seleccione una categoría.', 'error');
        if (isNaN(priceNum) || priceNum <= 0) return this.cartView.showToast('Ingrese un precio válido mayor a 0.', 'error');
        if (!prepTime) return this.cartView.showToast('El tiempo de preparación es obligatorio.', 'error');
        if (!description) return this.cartView.showToast('La descripción del plato es obligatoria.', 'error');

        const dishData = { name, category, price: priceNum, prepTime, description };

        let result;
        if (dishId) {
          result = await this.menuModel.updateDish(dishId, dishData);
        } else {
          result = await this.menuModel.addDish(dishData);
        }

        if (result.success) {
          this.cartView.showToast(result.message || 'Plato guardado con éxito.', 'success');
          dishModal.classList.remove('active');
          dishForm.reset();
          this.renderMenuSection();
          this.refreshAdminAndCustomerOrders();
        } else {
          this.cartView.showToast(result.error || 'Error al guardar plato.', 'error');
        }
      });
    }

    // Modal CRUD Mesas
    const tableModal = document.getElementById('table-crud-modal');
    const closeTableModal = document.getElementById('close-table-crud-modal');
    const tableForm = document.getElementById('table-crud-form');

    if (closeTableModal && tableModal) {
      closeTableModal.addEventListener('click', () => tableModal.classList.remove('active'));
    }

    if (tableForm) {
      tableForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const num = Number(document.getElementById('crud-table-number').value);
        const zone = document.getElementById('crud-table-zone').value;
        const cap = Number(document.getElementById('crud-table-capacity').value);

        if (isNaN(num) || num <= 0) return this.cartView.showToast('El número de mesa debe ser un entero positivo.', 'error');
        if (isNaN(cap) || cap < 1 || cap > 20) return this.cartView.showToast('La capacidad de la mesa debe ser entre 1 y 20 personas.', 'error');

        const existingTables = this.tableModel.getAllTables();
        if (existingTables.some(t => Number(t.number) === num)) {
          return this.cartView.showToast(`La Mesa #${num} ya existe en el salón.`, 'error');
        }

        const tableData = { number: num, zone, capacity: cap, status: 'Disponible' };

        const result = await this.tableModel.addTable(tableData);
        if (result.success) {
          this.cartView.showToast(result.message || 'Mesa agregada con éxito.', 'success');
          tableModal.classList.remove('active');
          tableForm.reset();
          this.refreshAdminAndCustomerOrders();
        } else {
          this.cartView.showToast(result.error || 'Error al guardar mesa.', 'error');
        }
      });
    }

    // Modal CRUD Horarios
    const scheduleModal = document.getElementById('schedule-crud-modal');
    const closeScheduleModal = document.getElementById('close-schedule-crud-modal');
    const scheduleForm = document.getElementById('schedule-crud-form');

    if (closeScheduleModal && scheduleModal) {
      closeScheduleModal.addEventListener('click', () => scheduleModal.classList.remove('active'));
    }

    if (scheduleForm) {
      scheduleForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const index = document.getElementById('crud-schedule-index').value;
        const day = document.getElementById('crud-schedule-day').value.trim();
        const hours = document.getElementById('crud-schedule-hours').value.trim();
        const status = document.getElementById('crud-schedule-status').value;

        if (!day) return this.cartView.showToast('Ingrese los días de servicio.', 'error');
        if (!hours) return this.cartView.showToast('Ingrese el horario de atención.', 'error');

        const scheduleData = { day, hours, status };
        let result;
        if (index !== '') {
          result = await this.menuModel.updateSchedule(index, scheduleData);
        } else {
          result = await this.menuModel.addSchedule(scheduleData);
        }

        if (result.success) {
          this.cartView.showToast(result.message, 'success');
          scheduleModal.classList.remove('active');
          scheduleForm.reset();
          this.refreshAdminAndCustomerOrders();
        } else {
          this.cartView.showToast(result.error || 'Error al guardar horario.', 'error');
        }
      });
    }

    // Modal CRUD Combos
    const comboModal = document.getElementById('combo-crud-modal');
    const closeComboModal = document.getElementById('close-combo-crud-modal');
    const comboForm = document.getElementById('combo-crud-form');

    if (closeComboModal && comboModal) {
      closeComboModal.addEventListener('click', () => comboModal.classList.remove('active'));
    }

    if (comboForm) {
      comboForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const index = document.getElementById('crud-combo-index').value;
        const name = document.getElementById('crud-combo-name').value.trim();
        const description = document.getElementById('crud-combo-desc').value.trim();
        const price = Number(document.getElementById('crud-combo-price').value);
        const savings = document.getElementById('crud-combo-savings').value.trim();

        if (!name) return this.cartView.showToast('El nombre del combo es obligatorio.', 'error');
        if (!description) return this.cartView.showToast('El contenido del combo es obligatorio.', 'error');
        if (isNaN(price) || price <= 0) return this.cartView.showToast('Ingrese un precio positivo.', 'error');
        if (!savings) return this.cartView.showToast('Ingrese el ahorro estimado.', 'error');

        const comboData = { name, description, price, savings };
        let result;
        if (index !== '') {
          result = await this.menuModel.updateCombo(index, comboData);
        } else {
          result = await this.menuModel.addCombo(comboData);
        }

        if (result.success) {
          this.cartView.showToast(result.message, 'success');
          comboModal.classList.remove('active');
          comboForm.reset();
          this.refreshAdminAndCustomerOrders();
        } else {
          this.cartView.showToast(result.error || 'Error al guardar combo.', 'error');
        }
      });
    }

    // Modal CRUD Nutrición
    const nutrModal = document.getElementById('nutrition-crud-modal');
    const closeNutrModal = document.getElementById('close-nutrition-crud-modal');
    const nutrForm = document.getElementById('nutrition-crud-form');

    if (closeNutrModal && nutrModal) {
      closeNutrModal.addEventListener('click', () => nutrModal.classList.remove('active'));
    }

    if (nutrForm) {
      nutrForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const index = document.getElementById('crud-nutrition-index').value;
        const dish = document.getElementById('crud-nutrition-dish').value.trim();
        const calories = document.getElementById('crud-nutrition-calories').value.trim();
        const protein = document.getElementById('crud-nutrition-protein').value.trim();
        const carbs = document.getElementById('crud-nutrition-carbs').value.trim();
        const fat = document.getElementById('crud-nutrition-fat').value.trim();

        if (!dish) return this.cartView.showToast('El nombre del plato es obligatorio.', 'error');
        if (!calories) return this.cartView.showToast('Las calorías son obligatorias.', 'error');

        const nutrData = { dish, calories, protein, carbs, fat };
        let result;
        if (index !== '') {
          result = await this.menuModel.updateNutrition(index, nutrData);
        } else {
          result = await this.menuModel.addNutrition(nutrData);
        }

        if (result.success) {
          this.cartView.showToast(result.message, 'success');
          nutrModal.classList.remove('active');
          nutrForm.reset();
          this.refreshAdminAndCustomerOrders();
        } else {
          this.cartView.showToast(result.error || 'Error al guardar nutrición.', 'error');
        }
      });
    }

    // Modal CRUD Clientes CRM
    const customerModal = document.getElementById('customer-crud-modal');
    const closeCustomerModal = document.getElementById('close-customer-crud-modal');
    const customerForm = document.getElementById('customer-crud-form');

    if (closeCustomerModal && customerModal) {
      closeCustomerModal.addEventListener('click', () => customerModal.classList.remove('active'));
    }

    if (customerForm) {
      customerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('crud-customer-id').value;
        const name = document.getElementById('crud-customer-name').value.trim();
        const email = document.getElementById('crud-customer-email').value.trim().toLowerCase();
        const phone = document.getElementById('crud-customer-phone').value.trim();
        const points = Number(document.getElementById('crud-customer-points').value);

        if (!name) return this.cartView.showToast('El nombre del cliente es obligatorio.', 'error');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) return this.cartView.showToast('Ingrese un correo electrónico válido.', 'error');
        if (!phone) return this.cartView.showToast('El teléfono es obligatorio.', 'error');
        if (isNaN(points) || points < 0) return this.cartView.showToast('Los puntos de fidelidad deben ser un número no negativo.', 'error');

        const customerData = { name, email, phone, points };
        let result;
        if (id) {
          result = await this.dashboardModel.updateCustomer(id, customerData);
        } else {
          result = await this.dashboardModel.addCustomer(customerData);
        }

        if (result.success) {
          this.cartView.showToast(result.message, 'success');
          customerModal.classList.remove('active');
          customerForm.reset();
          this.refreshAdminAndCustomerOrders();
        } else {
          this.cartView.showToast(result.error || 'Error al guardar cliente.', 'error');
        }
      });
    }
  }

  // --- Handlers CRUD de Platos ---
  handleOpenAddDishModal() {
    const dishModal = document.getElementById('dish-crud-modal');
    const title = document.getElementById('dish-crud-modal-title');
    const form = document.getElementById('dish-crud-form');

    if (dishModal && form) {
      form.reset();
      document.getElementById('crud-dish-id').value = '';
      if (title) title.innerHTML = '<i class="fa-solid fa-utensils"></i> Agregar Nuevo Plato al Menú';
      dishModal.classList.add('active');
    }
  }

  handleOpenEditDishModal(dishId) {
    const dish = this.menuModel.getDishById(dishId);
    if (!dish) return;

    const dishModal = document.getElementById('dish-crud-modal');
    const title = document.getElementById('dish-crud-modal-title');

    if (dishModal) {
      document.getElementById('crud-dish-id').value = dish.id;
      document.getElementById('crud-dish-name').value = dish.name;
      document.getElementById('crud-dish-category').value = dish.category;
      document.getElementById('crud-dish-price').value = dish.price;
      document.getElementById('crud-dish-time').value = dish.prepTime || '15-20 min';
      document.getElementById('crud-dish-desc').value = dish.description || '';

      if (title) title.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Editar Plato: ${dish.name}`;
      dishModal.classList.add('active');
    }
  }

  async handleDeleteDish(dishId) {
    if (confirm('¿Estás seguro de que deseas eliminar este plato del menú?')) {
      const result = await this.menuModel.deleteDish(dishId);
      if (result.success) {
        this.cartView.showToast(result.message, 'success');
        this.renderMenuSection();
        this.refreshAdminAndCustomerOrders();
      } else {
        this.cartView.showToast(result.error || 'No se pudo eliminar el plato.', 'error');
      }
    }
  }

  // --- Handlers CRUD de Mesas ---
  handleOpenAddTableModal() {
    const tableModal = document.getElementById('table-crud-modal');
    const form = document.getElementById('table-crud-form');
    if (tableModal && form) {
      form.reset();
      tableModal.classList.add('active');
    }
  }

  async handleUpdateTableStatus(tableId, newStatus) {
    const result = await this.tableModel.updateTableStatus(tableId, newStatus);
    if (result.success) {
      this.cartView.showToast(result.message, 'success');
      this.refreshAdminAndCustomerOrders();
    }
  }

  async handleDeleteTable(tableId) {
    if (confirm('¿Deseas eliminar esta mesa del plano de salón?')) {
      const result = await this.tableModel.deleteTable(tableId);
      if (result.success) {
        this.cartView.showToast(result.message, 'success');
        this.refreshAdminAndCustomerOrders();
      } else {
        this.cartView.showToast(result.error || 'No se pudo eliminar la mesa.', 'error');
      }
    }
  }

  updateAuthUI(isFreshLogin = false) {
    const isLoggedIn = this.authModel.isLoggedIn();
    const user = this.authModel.getCurrentUser();

    const navLinks = document.getElementById('nav-links');
    const cartButton = document.getElementById('cart-button');
    const mobileToggle = document.getElementById('mobile-toggle');
    const userProfileWrapper = document.getElementById('user-profile-wrapper');
    const userDisplayName = document.getElementById('user-display-name');

    const customerOnlyItems = document.querySelectorAll('.nav-customer-only');
    const adminOnlyItems = document.querySelectorAll('.nav-admin-only');

    if (!isLoggedIn) {
      if (navLinks) navLinks.style.display = 'none';
      if (cartButton) cartButton.style.display = 'none';
      if (mobileToggle) mobileToggle.style.display = 'none';
      if (userProfileWrapper) userProfileWrapper.style.display = 'none';

      this.menuView.setUserRole('customer');
      this.switchView('view-login');
      return;
    }

    this.menuView.setUserRole(user.role);
    this.renderMenuSection();

    if (navLinks) navLinks.style.display = 'flex';
    if (mobileToggle) mobileToggle.style.display = 'block';
    if (userProfileWrapper) userProfileWrapper.style.display = 'flex';

    if (user.role === 'admin') {
      if (cartButton) cartButton.style.display = 'none';
      this.cartView.closeCart();

      if (userDisplayName) userDisplayName.innerHTML = `<i class="fa-solid fa-user-shield" style="color: var(--color-secondary);"></i> ${user.name} <span style="background: var(--color-secondary); color: #fff; padding: 0.15rem 0.4rem; border-radius: 8px; font-size: 0.75rem;">ADMIN</span>`;

      customerOnlyItems.forEach(el => el.style.display = 'none');
      adminOnlyItems.forEach(el => el.style.display = 'block');

      if (isFreshLogin || this.currentViewId === 'view-login' || this.currentViewId === 'view-inicio' || this.currentViewId === 'view-mis-pedidos') {
        this.switchView('view-admin');
      }
    } else {
      if (cartButton) cartButton.style.display = 'flex';

      if (userDisplayName) userDisplayName.innerHTML = `<i class="fa-solid fa-user" style="color: var(--color-primary);"></i> ${user.name}`;

      customerOnlyItems.forEach(el => el.style.display = 'block');
      adminOnlyItems.forEach(el => el.style.display = 'none');

      const viewAdmin = document.getElementById('view-admin');
      if (viewAdmin) {
        const el1 = document.getElementById('dashboard-metrics-container');
        const el2 = document.getElementById('crm-customers-container');
        const el3 = document.getElementById('admin-orders-container');
        const el4 = document.getElementById('admin-menu-crud-container');
        const el5 = document.getElementById('admin-tables-crud-container');
        if (el1) el1.innerHTML = '';
        if (el2) el2.innerHTML = '';
        if (el3) el3.innerHTML = '';
        if (el4) el4.innerHTML = '';
        if (el5) el5.innerHTML = '';
      }

      if (isFreshLogin || this.currentViewId === 'view-login' || this.currentViewId === 'view-admin') {
        this.switchView('view-inicio');
      }
    }

    this.refreshAdminAndCustomerOrders();
  }

  async refreshAdminAndCustomerOrders() {
    if (!this.authModel.isLoggedIn()) return;

    const user = this.authModel.getCurrentUser();
    const orders = await this.orderModel.loadOrders();

    if (user.role === 'admin') {
      // 1. Dashboard KPIs & Gráficos
      const metrics = await this.dashboardModel.loadMetrics();
      this.dashboardView.renderDashboard(metrics);

      // 2. Módulo CRUD de Menú (Platos)
      const dishes = this.menuModel.getAllDishes();
      this.dashboardView.renderMenuCRUD(
        dishes,
        () => this.handleOpenAddDishModal(),
        (id) => this.handleOpenEditDishModal(id),
        (id) => this.handleDeleteDish(id)
      );

      // 3. Módulo CRUD de Mesas del Salón
      const tables = await this.tableModel.loadTables();
      this.dashboardView.renderTablesCRUD(
        tables,
        () => this.handleOpenAddTableModal(),
        (id, newStatus) => this.handleUpdateTableStatus(id, newStatus),
        (id) => this.handleDeleteTable(id)
      );

      // 4. Monitor de Pedidos en Vivo
      this.dashboardView.renderAdminOrders(
        orders,
        (orderId, newStatus) => this.handleUpdateOrderStatus(orderId, newStatus),
        (orderId) => this.handlePreviewInvoice(orderId)
      );

      // 5. CRM Clientes
      const customers = await this.dashboardModel.loadCustomers();
      this.dashboardView.renderCRM(customers);

      this.bindTableCRUDListeners();
    } else {
      this.renderCustomerOrders(orders);
    }

    // Renderizar tablas semánticas según rol
    const tableData = this.menuModel.getTableData();
    const isAdmin = user ? user.role === 'admin' : false;
    this.tableView.renderScheduleTable(tableData.schedule, isAdmin);
    this.tableView.renderCombosTable(tableData.combos, isAdmin);
    this.tableView.renderNutritionTable(tableData.nutrition, isAdmin);
    this.bindTableCRUDListeners();
  }

  bindTableCRUDListeners() {
    // Horarios
    const addSchedBtn = document.getElementById('open-add-schedule-modal');
    if (addSchedBtn) {
      addSchedBtn.onclick = () => {
        document.getElementById('schedule-crud-form').reset();
        document.getElementById('crud-schedule-index').value = '';
        document.getElementById('schedule-crud-modal-title').innerHTML = '<i class="fa-solid fa-clock"></i> Agregar Nuevo Horario';
        document.getElementById('schedule-crud-modal').classList.add('active');
      };
    }

    document.querySelectorAll('.edit-schedule-btn').forEach(btn => {
      btn.onclick = () => {
        const index = btn.dataset.index;
        const data = this.menuModel.getTableData().schedule[index];
        if (data) {
          document.getElementById('crud-schedule-index').value = index;
          document.getElementById('crud-schedule-day').value = data.day;
          document.getElementById('crud-schedule-hours').value = data.hours;
          document.getElementById('crud-schedule-status').value = data.status || 'Abierto';
          document.getElementById('schedule-crud-modal-title').innerHTML = '<i class="fa-solid fa-pen"></i> Editar Horario';
          document.getElementById('schedule-crud-modal').classList.add('active');
        }
      };
    });

    document.querySelectorAll('.delete-schedule-btn').forEach(btn => {
      btn.onclick = async () => {
        if (confirm('¿Desea eliminar este registro de horario?')) {
          const index = btn.dataset.index;
          const res = await this.menuModel.deleteSchedule(index);
          if (res.success) {
            this.cartView.showToast(res.message, 'success');
            this.refreshAdminAndCustomerOrders();
          }
        }
      };
    });

    // Combos
    const addComboBtn = document.getElementById('open-add-combo-modal');
    if (addComboBtn) {
      addComboBtn.onclick = () => {
        document.getElementById('combo-crud-form').reset();
        document.getElementById('crud-combo-index').value = '';
        document.getElementById('combo-crud-modal-title').innerHTML = '<i class="fa-solid fa-gift"></i> Agregar Combo Promocional';
        document.getElementById('combo-crud-modal').classList.add('active');
      };
    }

    document.querySelectorAll('.edit-combo-btn').forEach(btn => {
      btn.onclick = () => {
        const index = btn.dataset.index;
        const data = this.menuModel.getTableData().combos[index];
        if (data) {
          document.getElementById('crud-combo-index').value = index;
          document.getElementById('crud-combo-name').value = data.name;
          document.getElementById('crud-combo-desc').value = data.description || data.includes || '';
          document.getElementById('crud-combo-price').value = data.price;
          document.getElementById('crud-combo-savings').value = data.savings || 'Ahorro Especial';
          document.getElementById('combo-crud-modal-title').innerHTML = '<i class="fa-solid fa-pen"></i> Editar Combo Promocional';
          document.getElementById('combo-crud-modal').classList.add('active');
        }
      };
    });

    document.querySelectorAll('.delete-combo-btn').forEach(btn => {
      btn.onclick = async () => {
        if (confirm('¿Desea eliminar este combo promocional?')) {
          const index = btn.dataset.index;
          const res = await this.menuModel.deleteCombo(index);
          if (res.success) {
            this.cartView.showToast(res.message, 'success');
            this.refreshAdminAndCustomerOrders();
          }
        }
      };
    });

    // Nutrición
    const addNutrBtn = document.getElementById('open-add-nutrition-modal');
    if (addNutrBtn) {
      addNutrBtn.onclick = () => {
        document.getElementById('nutrition-crud-form').reset();
        document.getElementById('crud-nutrition-index').value = '';
        document.getElementById('nutrition-crud-modal-title').innerHTML = '<i class="fa-solid fa-heart-pulse"></i> Agregar Registro Nutricional';
        document.getElementById('nutrition-crud-modal').classList.add('active');
      };
    }

    document.querySelectorAll('.edit-nutrition-btn').forEach(btn => {
      btn.onclick = () => {
        const index = btn.dataset.index;
        const data = this.menuModel.getTableData().nutrition[index];
        if (data) {
          document.getElementById('crud-nutrition-index').value = index;
          document.getElementById('crud-nutrition-dish').value = data.dish;
          document.getElementById('crud-nutrition-calories').value = data.calories;
          document.getElementById('crud-nutrition-protein').value = data.protein || '30g';
          document.getElementById('crud-nutrition-carbs').value = data.carbs || '40g';
          document.getElementById('crud-nutrition-fat').value = data.fat || '20g';
          document.getElementById('nutrition-crud-modal-title').innerHTML = '<i class="fa-solid fa-pen"></i> Editar Registro Nutricional';
          document.getElementById('nutrition-crud-modal').classList.add('active');
        }
      };
    });

    document.querySelectorAll('.delete-nutrition-btn').forEach(btn => {
      btn.onclick = async () => {
        if (confirm('¿Desea eliminar este registro nutricional?')) {
          const index = btn.dataset.index;
          const res = await this.menuModel.deleteNutrition(index);
          if (res.success) {
            this.cartView.showToast(res.message, 'success');
            this.refreshAdminAndCustomerOrders();
          }
        }
      };
    });

    // Clientes CRM
    const addCustBtn = document.getElementById('open-add-customer-modal');
    if (addCustBtn) {
      addCustBtn.onclick = () => {
        document.getElementById('customer-crud-form').reset();
        document.getElementById('crud-customer-id').value = '';
        document.getElementById('customer-crud-modal-title').innerHTML = '<i class="fa-solid fa-user-plus"></i> Registrar Nuevo Cliente CRM';
        document.getElementById('customer-crud-modal').classList.add('active');
      };
    }

    document.querySelectorAll('.edit-customer-btn').forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.id;
        const cust = this.dashboardModel.customers.find(c => String(c.id) === String(id));
        if (cust) {
          document.getElementById('crud-customer-id').value = cust.id;
          document.getElementById('crud-customer-name').value = cust.name;
          document.getElementById('crud-customer-email').value = cust.email;
          document.getElementById('crud-customer-phone').value = cust.phone;
          document.getElementById('crud-customer-points').value = cust.points || 0;
          document.getElementById('customer-crud-modal-title').innerHTML = `<i class="fa-solid fa-user-pen"></i> Editar Cliente: ${cust.name}`;
          document.getElementById('customer-crud-modal').classList.add('active');
        }
      };
    });

    document.querySelectorAll('.delete-customer-btn').forEach(btn => {
      btn.onclick = async () => {
        if (confirm('¿Desea eliminar este cliente del registro CRM?')) {
          const id = btn.dataset.id;
          const res = await this.dashboardModel.deleteCustomer(id);
          if (res.success) {
            this.cartView.showToast(res.message, 'success');
            this.refreshAdminAndCustomerOrders();
          }
        }
      };
    });
  }

  renderCustomerOrders(allOrders) {
    const container = document.getElementById('customer-orders-container');
    if (!container) return;

    const user = this.authModel.getCurrentUser();
    const myOrders = this.orderModel.getOrdersByCustomer(user.email);

    if (!myOrders || myOrders.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 3rem; color: var(--text-muted); background: var(--bg-surface); border-radius: var(--border-radius-md); border: var(--border-glass);">
          <h3 style="color: var(--color-primary); margin-bottom: 0.5rem;"><i class="fa-solid fa-receipt"></i> No tienes pedidos registrados</h3>
          <p>Explora nuestro menú interactivo y realiza tu primer pedido en línea.</p>
          <button class="btn-primary" data-target-page="view-menu" style="margin-top: 1rem;"><i class="fa-solid fa-book-open"></i> Ver Menú</button>
        </div>
      `;
      return;
    }

    const rows = myOrders.map(order => {
      let statusColor = 'var(--status-reserved)';
      if (order.status === 'En Camino') statusColor = 'var(--color-secondary)';
      if (order.status === 'Entregado') statusColor = 'var(--status-available)';

      const itemsText = (order.items || []).map(i => `${i.quantity}x ${i.name}`).join(', ');

      return `
        <tr>
          <td><strong style="color: var(--color-primary);">${order.id}</strong><br><small style="color: var(--text-muted);">${order.createdAt}</small></td>
          <td style="font-size: 0.9rem;">${itemsText}</td>
          <td><strong style="color: var(--color-secondary);">RD$ ${Number(order.totals.total).toFixed(2)}</strong></td>
          <td><span style="background: rgba(255,255,255,0.08); color: ${statusColor}; padding: 0.25rem 0.6rem; border-radius: 12px; font-weight: 700; font-size: 0.85rem;">● ${order.status}</span></td>
          <td>
            <button class="btn-outline preview-invoice-btn" data-order-id="${order.id}" style="padding: 0.35rem 0.8rem; font-size: 0.85rem;">
              <i class="fa-solid fa-file-invoice-dollar"></i> Previsualizar Factura PDF
            </button>
          </td>
        </tr>
      `;
    }).join('');

    container.innerHTML = `
      <div class="table-container">
        <table class="styled-table">
          <thead>
            <tr>
              <th>ID Pedido</th>
              <th>Platos Solicitados</th>
              <th>Total (con ITBIS)</th>
              <th>Estado de Entrega</th>
              <th>Acción Factura</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    `;

    container.querySelectorAll('.preview-invoice-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.handlePreviewInvoice(btn.dataset.orderId);
      });
    });
  }

  handlePreviewInvoice(orderId) {
    const order = this.orderModel.getOrderById(orderId);
    if (order) {
      this.invoiceView.renderInvoice(order);
    } else {
      this.cartView.showToast('No se encontró la factura del pedido.', 'error');
    }
  }

  async handleUpdateOrderStatus(orderId, newStatus) {
    const result = await this.orderModel.updateOrderStatus(orderId, newStatus);
    if (result.success) {
      this.cartView.showToast(`Pedido ${orderId} actualizado a "${newStatus}"`, 'success');
      this.refreshAdminAndCustomerOrders();
    }
  }

  async handleCheckoutOrder() {
    const user = this.authModel.getCurrentUser();

    if (user && user.role === 'admin') {
      this.cartView.showToast('El perfil Administrador no realiza compras.', 'error');
      return;
    }

    const items = this.cartModel.getItems();
    if (items.length === 0) {
      this.cartView.showToast('Tu carrito está vacío. Agrega platos antes de continuar.', 'info');
      return;
    }

    const totals = this.cartModel.getTotals();

    const result = await this.orderModel.createOrder(user, items, totals);
    if (result.success) {
      this.cartModel.clear();
      this.updateCartUI();
      this.cartView.closeCart();
      this.cartView.showToast('¡Pedido enviado a cocina! Puedes consultar el estado y la factura en "Mis Pedidos".', 'success');
      
      // Sincronizar inmediatamente los pedidos del cliente
      await this.refreshAdminAndCustomerOrders();
      this.switchView('view-mis-pedidos');
    } else {
      this.cartView.showToast(result.message || 'Error al procesar el pedido.', 'error');
    }
  }

  switchView(targetViewId) {
    if (!targetViewId) return;

    const user = this.authModel.getCurrentUser();

    if (!this.authModel.isLoggedIn() && targetViewId !== 'view-login') {
      targetViewId = 'view-login';
    }

    if (user && user.role === 'customer' && targetViewId === 'view-admin') {
      this.cartView.showToast('Acceso denegado: Datos internos restringidos.', 'error');
      targetViewId = 'view-inicio';
    }

    const pages = document.querySelectorAll('.view-page');
    pages.forEach(page => page.classList.remove('active'));

    const targetPage = document.getElementById(targetViewId);
    if (targetPage) {
      targetPage.classList.add('active');
      this.currentViewId = targetViewId;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Sincronizar automáticamente la vista Mis Pedidos o Admin al cambiar de pestaña
    if (targetViewId === 'view-mis-pedidos' || targetViewId === 'view-admin') {
      this.refreshAdminAndCustomerOrders();
    }

    const navButtons = document.querySelectorAll('.nav-link-btn');
    navButtons.forEach(btn => {
      if (btn.dataset.targetPage === targetViewId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    const navLinks = document.getElementById('nav-links');
    if (navLinks) navLinks.classList.remove('mobile-open');
  }

  renderMenuSection(categories = null) {
    const cats = categories || this.menuModel.getCategories();
    
    let filteredDishes = this.menuModel.getItemsByCategory(this.activeCategory);
    if (this.searchQuery) {
      filteredDishes = this.menuModel.searchItems(this.searchQuery);
      if (this.activeCategory !== 'Todas') {
        filteredDishes = filteredDishes.filter(d => d.category === this.activeCategory);
      }
    }

    this.menuView.renderCategories(cats, this.activeCategory, (cat) => this.handleCategorySelect(cat));
    this.menuView.renderDishes(
      filteredDishes, 
      (dish) => this.handleAddToCart(dish),
      (dish) => this.handleViewDetails(dish)
    );
  }

  handleCategorySelect(category) {
    this.activeCategory = category;
    this.renderMenuSection();
  }

  handleSearch(query) {
    this.searchQuery = query;
    this.renderMenuSection();
  }

  handleAddToCart(dish) {
    const user = this.authModel.getCurrentUser();
    if (user && user.role === 'admin') {
      this.cartView.showToast('El perfil Administrador no realiza compras.', 'info');
      return;
    }

    this.cartModel.addItem(dish, 1);
    this.updateCartUI();
    this.cartView.showToast(`¡${dish.name} agregado al carrito!`, 'success');
  }

  handleViewDetails(dish) {
    this.menuView.renderDishDetailModal(dish);
  }

  updateCartUI() {
    const cartItems = this.cartModel.getItems();
    const totals = this.cartModel.getTotals();
    const totalCount = this.cartModel.getTotalCount();

    this.cartView.updateCartBadge(totalCount);
    this.cartView.renderCartModal(
      cartItems,
      totals,
      (id, qty) => this.handleUpdateQty(id, qty),
      (id) => this.handleRemoveFromCart(id)
    );

    const checkoutBtn = document.getElementById('checkout-button');
    if (checkoutBtn) {
      checkoutBtn.onclick = () => this.handleCheckoutOrder();
    }
  }

  handleUpdateQty(id, quantity) {
    this.cartModel.updateQuantity(id, quantity);
    this.updateCartUI();
  }

  handleRemoveFromCart(id) {
    this.cartModel.removeItem(id);
    this.updateCartUI();
    this.cartView.showToast('Producto eliminado del carrito.', 'info');
  }

  setupEventListeners() {
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => this.toggleTheme());
    }

    document.querySelectorAll('[data-target-page]').forEach(element => {
      element.addEventListener('click', () => {
        const targetPage = element.dataset.targetPage;
        this.switchView(targetPage);
      });
    });

    const mobileToggle = document.getElementById('mobile-toggle');
    const navLinks = document.getElementById('nav-links');

    if (mobileToggle && navLinks) {
      mobileToggle.addEventListener('click', () => {
        navLinks.classList.toggle('mobile-open');
      });
    }

    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.handleSearch(e.target.value);
      });
    }

    const reservationForm = document.getElementById('reservation-form');
    if (reservationForm) {
      reservationForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('res-name').value.trim();
        const email = document.getElementById('res-email').value.trim().toLowerCase();
        const phone = document.getElementById('res-phone').value.trim();
        const date = document.getElementById('res-date').value;
        const time = document.getElementById('res-time').value;
        const guests = Number(document.getElementById('res-guests').value);
        const zone = document.getElementById('res-zone').value;

        if (!name) return this.cartView.showToast('Por favor ingrese su nombre completo.', 'error');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) return this.cartView.showToast('Por favor ingrese un correo electrónico válido.', 'error');
        if (!phone || phone.length < 7) return this.cartView.showToast('Por favor ingrese un teléfono de contacto válido.', 'error');
        if (!date) return this.cartView.showToast('Seleccione la fecha de su reserva.', 'error');

        const selectedDate = new Date(`${date}T00:00:00`);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) return this.cartView.showToast('La fecha de reserva no puede ser en el pasado.', 'error');

        if (!time) return this.cartView.showToast('Seleccione la hora de la reserva.', 'error');
        if (isNaN(guests) || guests < 1 || guests > 20) return this.cartView.showToast('El número de comensales debe ser entre 1 y 20 personas.', 'error');

        const reservationData = { name, email, phone, date, time, guests, zone };

        const result = await this.tableModel.makeReservation(reservationData);
        if (result.success) {
          this.cartView.showToast(result.message, 'success');
          reservationForm.reset();
          
          const tables = this.tableModel.getAllTables();
          this.tableView.renderTablesStatus(tables);
        } else {
          this.cartView.showToast('No se pudo procesar la reserva. Intenta nuevamente.', 'error');
        }
      });
    }
  }
}

