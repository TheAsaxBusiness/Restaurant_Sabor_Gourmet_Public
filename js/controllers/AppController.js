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

    if (formLogin) {
      formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email-input').value;
        const pass = document.getElementById('login-pass-input').value;

        const res = await this.authModel.login(email, pass);
        if (res.success) {
          this.cartView.showToast(`Bienvenido de nuevo, ${res.user.name}`, 'success');
          this.updateAuthUI(true);
        } else {
          this.cartView.showToast(res.message || 'Error al iniciar sesión.', 'error');
        }
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
    // Modal CRUD Menú
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
        const dishData = {
          name: document.getElementById('crud-dish-name').value,
          category: document.getElementById('crud-dish-category').value,
          price: Number(document.getElementById('crud-dish-price').value),
          prepTime: document.getElementById('crud-dish-time').value,
          description: document.getElementById('crud-dish-desc').value
        };

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
        const tableData = {
          number: Number(document.getElementById('crud-table-number').value),
          zone: document.getElementById('crud-table-zone').value,
          capacity: Number(document.getElementById('crud-table-capacity').value),
          status: 'Disponible'
        };

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
        document.getElementById('dashboard-metrics-container').innerHTML = '';
        document.getElementById('crm-customers-container').innerHTML = '';
        document.getElementById('admin-orders-container').innerHTML = '';
        document.getElementById('admin-menu-crud-container').innerHTML = '';
        document.getElementById('admin-tables-crud-container').innerHTML = '';
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
    } else {
      this.renderCustomerOrders(orders);
    }
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
    if (items.length === 0) return;

    const totals = this.cartModel.getTotals();

    const result = await this.orderModel.createOrder(user, items, totals);
    if (result.success) {
      this.cartModel.clear();
      this.updateCartUI();
      this.cartView.closeCart();
      this.cartView.showToast('¡Pedido enviado a cocina! Puedes ver tu factura en "Mis Pedidos".', 'success');
      
      this.switchView('view-mis-pedidos');
      this.refreshAdminAndCustomerOrders();
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
        
        const reservationData = {
          name: document.getElementById('res-name').value,
          email: document.getElementById('res-email').value,
          phone: document.getElementById('res-phone').value,
          date: document.getElementById('res-date').value,
          time: document.getElementById('res-time').value,
          guests: Number(document.getElementById('res-guests').value),
          zone: document.getElementById('res-zone').value
        };

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
