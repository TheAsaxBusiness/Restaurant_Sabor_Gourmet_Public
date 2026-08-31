// ==========================================
// DASHBOARDVIEW.JS - PANEL ADMIN CON MONITORES & MODULOS CRUD DE MENÚ Y MESAS
// Carlos / Enmanuel - Devs
// ==========================================

export default class DashboardView {
  constructor() {
    this.dashboardContainer = null;
    this.crmContainer = null;
    this.ordersContainer = null;
    this.menuCrudContainer = null;
    this.tablesCrudContainer = null;

    this.salesChart = null;
    this.categoryChart = null;
    this.prepTimeChart = null;
  }

  init() {
    this.dashboardContainer = document.getElementById('dashboard-metrics-container');
    this.crmContainer = document.getElementById('crm-customers-container');
    this.ordersContainer = document.getElementById('admin-orders-container');
    this.menuCrudContainer = document.getElementById('admin-menu-crud-container');
    this.tablesCrudContainer = document.getElementById('admin-tables-crud-container');
  }

  // Renderizar Tarjetas KPI, Gráficos y Monitores
  renderDashboard(metricsData) {
    if (!this.dashboardContainer || !metricsData) return;

    const { summary, topDishes, kitchenStatus } = metricsData;

    this.dashboardContainer.innerHTML = `
      <!-- Tarjetas KPI Principales -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.25rem; margin-bottom: 2.5rem;">
        <div style="background: var(--bg-surface); border: var(--border-glass); border-radius: var(--border-radius-md); padding: 1.25rem; text-align: center;">
          <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 0.3rem;"><i class="fa-solid fa-sack-dollar" style="color: var(--color-primary);"></i> Ventas del Día</p>
          <h3 style="color: var(--color-primary); font-size: 1.6rem;">RD$ ${Number(summary.dailySales || 0).toLocaleString('es-DO', { minimumFractionDigits: 2 })}</h3>
        </div>

        <div style="background: var(--bg-surface); border: var(--border-glass); border-radius: var(--border-radius-md); padding: 1.25rem; text-align: center;">
          <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 0.3rem;"><i class="fa-solid fa-bell-concierge" style="color: var(--color-secondary);"></i> Pedidos Activos</p>
          <h3 style="color: var(--color-secondary); font-size: 1.6rem;">${summary.activeOrders || 0} pedidos</h3>
        </div>

        <div style="background: var(--bg-surface); border: var(--border-glass); border-radius: var(--border-radius-md); padding: 1.25rem; text-align: center;">
          <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 0.3rem;"><i class="fa-solid fa-receipt" style="color: var(--color-primary);"></i> Ticket Promedio</p>
          <h3 style="color: var(--text-main); font-size: 1.6rem;">RD$ ${Number(summary.averageTicket || 0).toFixed(2)}</h3>
        </div>

        <div style="background: var(--bg-surface); border: var(--border-glass); border-radius: var(--border-radius-md); padding: 1.25rem; text-align: center;">
          <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 0.3rem;"><i class="fa-solid fa-stopwatch" style="color: var(--status-available);"></i> Tiempo Prom. Cocina</p>
          <h3 style="color: var(--status-available); font-size: 1.6rem;">${summary.averagePrepTimeMinutes || 0} min</h3>
        </div>
      </div>

      <!-- SECCIÓN DE GRÁFICOS INTERACTIVOS (CHART.JS) -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 2rem; margin-bottom: 2.5rem;">
        
        <div style="background: var(--bg-surface); border: var(--border-glass); border-radius: var(--border-radius-md); padding: 1.5rem;">
          <h4 style="color: var(--color-primary); font-size: 1.15rem; margin-bottom: 1rem;"><i class="fa-solid fa-chart-line"></i> Tendencia de Ventas del Día (RD$)</h4>
          <div style="position: relative; height: 240px; width: 100%;">
            <canvas id="salesChartCanvas"></canvas>
          </div>
        </div>

        <div style="background: var(--bg-surface); border: var(--border-glass); border-radius: var(--border-radius-md); padding: 1.5rem;">
          <h4 style="color: var(--color-primary); font-size: 1.15rem; margin-bottom: 1rem;"><i class="fa-solid fa-chart-pie"></i> Ventas por Categoría</h4>
          <div style="position: relative; height: 240px; width: 100%;">
            <canvas id="categoryChartCanvas"></canvas>
          </div>
        </div>

      </div>

      <!-- Gráfico 3 & Estado de Cocina -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 2rem; margin-bottom: 3rem;">
        
        <div style="background: var(--bg-surface); border: var(--border-glass); border-radius: var(--border-radius-md); padding: 1.5rem;">
          <h4 style="color: var(--color-primary); font-size: 1.15rem; margin-bottom: 1rem;"><i class="fa-solid fa-clock-rotate-left"></i> Tiempo Promedio de Preparación (Minutos)</h4>
          <div style="position: relative; height: 240px; width: 100%;">
            <canvas id="prepTimeChartCanvas"></canvas>
          </div>
        </div>

        <div style="background: var(--bg-surface); border: var(--border-glass); border-radius: var(--border-radius-md); padding: 1.5rem; display: flex; flex-direction: column; justify-content: center;">
          <h4 style="color: var(--color-primary); font-size: 1.15rem; margin-bottom: 1rem;"><i class="fa-solid fa-kitchen-set"></i> Monitoreo de Cocina en Vivo</h4>
          
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-primary); padding: 0.85rem 1rem; border-radius: var(--border-radius-sm);">
              <span><i class="fa-solid fa-hourglass-start" style="color: var(--status-reserved);"></i> En Espera / Pendientes</span>
              <strong style="color: var(--status-reserved); font-size: 1.2rem;">${kitchenStatus.pendingOrders || 0}</strong>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-primary); padding: 0.85rem 1rem; border-radius: var(--border-radius-sm);">
              <span><i class="fa-solid fa-fire-burner" style="color: var(--color-secondary);"></i> En Preparación</span>
              <strong style="color: var(--color-secondary); font-size: 1.2rem;">${kitchenStatus.inPreparation || 0}</strong>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-primary); padding: 0.85rem 1rem; border-radius: var(--border-radius-sm);">
              <span><i class="fa-solid fa-circle-check" style="color: var(--status-available);"></i> Listos para Servir</span>
              <strong style="color: var(--status-available); font-size: 1.2rem;">${kitchenStatus.readyToServe || 0}</strong>
            </div>
          </div>
        </div>

      </div>
    `;

    setTimeout(() => {
      this.initCharts(topDishes);
    }, 100);
  }

  // [NEW CRUD MODULE] Renderizar Módulo CRUD de Gestión de Platos del Menú
  renderMenuCRUD(dishes, onAddDish, onEditDish, onDeleteDish) {
    if (!this.menuCrudContainer) return;

    const rows = (dishes || []).map(dish => `
      <tr>
        <td><strong style="color: var(--color-primary);">${dish.name}</strong></td>
        <td><span style="background: rgba(255,255,255,0.08); padding: 0.2rem 0.5rem; border-radius: 8px;">${dish.category}</span></td>
        <td><strong style="color: var(--color-secondary);">RD$ ${dish.price.toLocaleString('es-DO')}</strong></td>
        <td>${dish.prepTime || '15 min'}</td>
        <td style="display: flex; gap: 0.4rem;">
          <button class="btn-outline edit-dish-btn" data-id="${dish.id}" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;"><i class="fa-solid fa-pen-to-square"></i> Editar</button>
          <button class="btn-outline delete-dish-btn" data-id="${dish.id}" style="padding: 0.3rem 0.6rem; font-size: 0.8rem; border-color: #E74C3C; color: #E74C3C;"><i class="fa-solid fa-trash"></i> Eliminar</button>
        </td>
      </tr>
    `).join('');

    this.menuCrudContainer.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <h3 style="color: var(--text-main); font-size: 1.3rem; margin: 0;"><i class="fa-solid fa-utensils" style="color: var(--color-primary);"></i> Gestión Dinámica de Platos del Menú (CRUD)</h3>
        <button id="add-new-dish-btn" class="btn-primary" type="button" style="padding: 0.55rem 1rem; font-size: 0.85rem;">
          <i class="fa-solid fa-plus"></i> Agregar Nuevo Plato
        </button>
      </div>

      <div class="table-container" style="margin-bottom: 3rem;">
        <table class="styled-table">
          <thead>
            <tr>
              <th>Nombre del Plato</th>
              <th>Categoría</th>
              <th>Precio (RD$)</th>
              <th>Tiempo Cocina</th>
              <th>Acciones CRUD</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    `;

    document.getElementById('add-new-dish-btn').addEventListener('click', () => onAddDish());

    this.menuCrudContainer.querySelectorAll('.edit-dish-btn').forEach(btn => {
      btn.addEventListener('click', () => onEditDish(btn.dataset.id));
    });

    this.menuCrudContainer.querySelectorAll('.delete-dish-btn').forEach(btn => {
      btn.addEventListener('click', () => onDeleteDish(btn.dataset.id));
    });
  }

  // [NEW CRUD MODULE] Renderizar Módulo CRUD de Gestión de Mesas del Salón
  renderTablesCRUD(tables, onAddTable, onUpdateStatus, onDeleteTable) {
    if (!this.tablesCrudContainer) return;

    const rows = (tables || []).map(t => {
      let badgeColor = 'var(--status-available)';
      if (t.status === 'Ocupada') badgeColor = 'var(--status-occupied)';
      if (t.status === 'Reservada') badgeColor = 'var(--status-reserved)';

      return `
        <tr>
          <td><strong style="color: var(--color-primary);">Mesa #${t.number}</strong></td>
          <td>${t.zone}</td>
          <td><strong>${t.capacity} personas</strong></td>
          <td><span style="color: ${badgeColor}; font-weight: 700;">● ${t.status}</span></td>
          <td>
            <select class="table-status-select form-control" data-id="${t.id}" style="padding: 0.25rem 0.5rem; font-size: 0.85rem;">
              <option value="Disponible" ${t.status === 'Disponible' ? 'selected' : ''}>Disponible</option>
              <option value="Ocupada" ${t.status === 'Ocupada' ? 'selected' : ''}>Ocupada</option>
              <option value="Reservada" ${t.status === 'Reservada' ? 'selected' : ''}>Reservada</option>
            </select>
          </td>
          <td>
            <button class="btn-outline delete-table-btn" data-id="${t.id}" style="padding: 0.3rem 0.6rem; font-size: 0.8rem; border-color: #E74C3C; color: #E74C3C;"><i class="fa-solid fa-trash"></i> Eliminar</button>
          </td>
        </tr>
      `;
    }).join('');

    this.tablesCrudContainer.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <h3 style="color: var(--text-main); font-size: 1.3rem; margin: 0;"><i class="fa-solid fa-chair" style="color: var(--color-primary);"></i> Gestión Dinámica de Mesas de Salón (CRUD)</h3>
        <button id="add-new-table-btn" class="btn-primary" type="button" style="padding: 0.55rem 1rem; font-size: 0.85rem;">
          <i class="fa-solid fa-plus"></i> Agregar Nueva Mesa
        </button>
      </div>

      <div class="table-container" style="margin-bottom: 3rem;">
        <table class="styled-table">
          <thead>
            <tr>
              <th>Número Mesa</th>
              <th>Área / Zona</th>
              <th>Capacidad</th>
              <th>Estado Actual</th>
              <th>Cambiar Estado</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    `;

    document.getElementById('add-new-table-btn').addEventListener('click', () => onAddTable());

    this.tablesCrudContainer.querySelectorAll('.table-status-select').forEach(select => {
      select.addEventListener('change', (e) => onUpdateStatus(select.dataset.id, e.target.value));
    });

    this.tablesCrudContainer.querySelectorAll('.delete-table-btn').forEach(btn => {
      btn.addEventListener('click', () => onDeleteTable(btn.dataset.id));
    });
  }

  // Renderizar la tabla de Pedidos en Vivo para el Administrador/Cocina
  renderAdminOrders(orders, onUpdateStatus, onPreviewInvoice) {
    if (!this.ordersContainer) return;

    if (!orders || orders.length === 0) {
      this.ordersContainer.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
          <p><i class="fa-solid fa-inbox"></i> No hay pedidos activos registrados en la cocina.</p>
        </div>
      `;
      return;
    }

    const rows = orders.map(order => {
      const itemsText = (order.items || []).map(i => `${i.quantity}x ${i.name}`).join(', ');
      let badgeColor = 'var(--status-reserved)';
      if (order.status === 'En Camino') badgeColor = 'var(--color-secondary)';
      if (order.status === 'Entregado') badgeColor = 'var(--status-available)';

      return `
        <tr>
          <td><strong style="color: var(--color-primary);">${order.id}</strong></td>
          <td>${order.customerName}<br><small style="color: var(--text-muted);">${order.customerEmail}</small></td>
          <td style="max-width: 250px; font-size: 0.85rem;">${itemsText}</td>
          <td><strong style="color: var(--color-secondary);">RD$ ${Number(order.totals.total).toFixed(2)}</strong></td>
          <td><span style="background: rgba(255,255,255,0.08); color: ${badgeColor}; padding: 0.25rem 0.6rem; border-radius: 12px; font-weight: 700; font-size: 0.85rem;">● ${order.status}</span></td>
          <td>
            <select class="order-status-select form-control" data-order-id="${order.id}" style="padding: 0.3rem 0.5rem; font-size: 0.85rem;">
              <option value="En Cocina" ${order.status === 'En Cocina' ? 'selected' : ''}>En Cocina</option>
              <option value="En Camino" ${order.status === 'En Camino' ? 'selected' : ''}>En Camino</option>
              <option value="Entregado" ${order.status === 'Entregado' ? 'selected' : ''}>Entregado</option>
            </select>
          </td>
          <td>
            <button class="btn-outline preview-invoice-btn" data-order-id="${order.id}" style="padding: 0.3rem 0.75rem; font-size: 0.85rem;">
              <i class="fa-solid fa-file-invoice-dollar"></i> Factura
            </button>
          </td>
        </tr>
      `;
    }).join('');

    this.ordersContainer.innerHTML = `
      <h3 style="color: var(--text-main); margin-bottom: 1rem; font-size: 1.3rem;"><i class="fa-solid fa-list-check" style="color: var(--color-primary);"></i> Monitor de Pedidos en Vivo (Cocina / Admin)</h3>
      <div class="table-container" style="margin-bottom: 3rem;">
        <table class="styled-table">
          <thead>
            <tr>
              <th>ID Pedido</th>
              <th>Cliente</th>
              <th>Platos Solicitados</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Cambiar Estado</th>
              <th>Factura</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    `;

    this.ordersContainer.querySelectorAll('.order-status-select').forEach(select => {
      select.addEventListener('change', (e) => {
        onUpdateStatus(e.target.dataset.orderId, e.target.value);
      });
    });

    this.ordersContainer.querySelectorAll('.preview-invoice-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        onPreviewInvoice(btn.dataset.orderId);
      });
    });
  }

  // Inicializar los 3 gráficos interactivos Chart.js
  initCharts(topDishes) {
    if (typeof Chart === 'undefined') return;

    if (this.salesChart) this.salesChart.destroy();
    if (this.categoryChart) this.categoryChart.destroy();
    if (this.prepTimeChart) this.prepTimeChart.destroy();

    const salesCanvas = document.getElementById('salesChartCanvas');
    if (salesCanvas) {
      const ctx1 = salesCanvas.getContext('2d');
      this.salesChart = new Chart(ctx1, {
        type: 'line',
        data: {
          labels: ['11:00 AM', '1:00 PM', '3:00 PM', '5:00 PM', '7:00 PM', '9:00 PM'],
          datasets: [{
            label: 'Ventas (RD$)',
            data: [4200, 12800, 6400, 5100, 14200, 9190],
            borderColor: '#D4AF37',
            backgroundColor: 'rgba(212, 175, 55, 0.15)',
            fill: true,
            tension: 0.4,
            borderWidth: 3
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: '#A0A0A0' }, grid: { color: 'rgba(255,255,255,0.05)' } },
            y: { ticks: { color: '#A0A0A0' }, grid: { color: 'rgba(255,255,255,0.05)' } }
          }
        }
      });
    }

    const categoryCanvas = document.getElementById('categoryChartCanvas');
    if (categoryCanvas) {
      const ctx2 = categoryCanvas.getContext('2d');
      this.categoryChart = new Chart(ctx2, {
        type: 'doughnut',
        data: {
          labels: ['Platos Fuertes', 'Entradas', 'Combos', 'Postres & Bebidas'],
          datasets: [{
            data: [55, 25, 12, 8],
            backgroundColor: ['#D4AF37', '#E65C00', '#2ECC71', '#3498DB']
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom', labels: { color: '#F5F5F5', boxWidth: 12 } } }
        }
      });
    }

    const prepCanvas = document.getElementById('prepTimeChartCanvas');
    if (prepCanvas) {
      const ctx3 = prepCanvas.getContext('2d');
      this.prepTimeChart = new Chart(ctx3, {
        type: 'bar',
        data: {
          labels: ['Mofongo Mariscos', 'Mofongo Criollo', 'Ensalada Tropical', 'Ensalada Fresca'],
          datasets: [{
            label: 'Minutos',
            data: [22, 18, 11, 9],
            backgroundColor: '#E65C00',
            borderRadius: 6
          }]
        },
        options: {
          indexAxis: 'y', responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: '#A0A0A0' }, grid: { color: 'rgba(255,255,255,0.05)' } },
            y: { ticks: { color: '#A0A0A0' }, grid: { display: false } }
          }
        }
      });
    }
  }

  renderCRM(customers) {
    if (!this.crmContainer || !customers) return;

    const rows = customers.map(c => `
      <tr>
        <td><strong style="color: var(--color-primary);">${c.name}</strong></td>
        <td>${c.email}</td>
        <td>${c.phone}</td>
        <td><span style="font-weight: 700; color: var(--text-main);">${c.visits} visitas</span></td>
        <td><span style="background: rgba(230, 92, 0, 0.15); color: var(--color-secondary); padding: 0.25rem 0.6rem; border-radius: 12px; font-weight: 700;"><i class="fa-solid fa-star"></i> ${c.points} pts</span></td>
        <td>${c.favoriteDish || 'Mofongo de Mariscos'}</td>
      </tr>
    `).join('');

    this.crmContainer.innerHTML = `
      <h3 style="color: var(--text-main); margin-bottom: 1rem; font-size: 1.3rem;"><i class="fa-solid fa-users-gear" style="color: var(--color-primary);"></i> Módulo de Clientes (CRM & Fidelidad)</h3>
      <div class="table-container">
        <table class="styled-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Frecuencia</th>
              <th>Puntos Fidelidad</th>
              <th>Plato Favorito</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    `;
  }
}
