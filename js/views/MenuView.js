// ==========================================
// MENUVIEW.JS - VISTA DEL CATÁLOGO DE MENÚ (CON SELECCIÓN POR ROL)
// Enmanuel - Dev 4
// ==========================================

export default class MenuView {
  constructor() {
    this.dishesContainer = null;
    this.categoriesContainer = null;
    this.dishModal = null;
    this.dishModalContent = null;
    this.closeModalBtn = null;
    this.userRole = 'customer';
  }

  init() {
    this.dishesContainer = document.getElementById('dishes');
    this.categoriesContainer = document.getElementById('categories');
    this.dishModal = document.getElementById('dish-modal');
    this.dishModalContent = document.getElementById('dish-modal-content');
    this.closeModalBtn = document.getElementById('close-dish-modal');

    if (this.closeModalBtn && this.dishModal) {
      this.closeModalBtn.addEventListener('click', () => this.closeDishModal());
      this.dishModal.addEventListener('click', (e) => {
        if (e.target === this.dishModal) this.closeDishModal();
      });
    }
  }

  setUserRole(role) {
    this.userRole = role || 'customer';
  }

  renderCategories(categories, activeCategory, onCategorySelect) {
    if (!this.categoriesContainer) return;

    this.categoriesContainer.innerHTML = '';
    const ul = document.createElement('ul');
    ul.className = 'categories-list';

    categories.forEach(cat => {
      const li = document.createElement('li');
      li.className = `category-pill ${cat === activeCategory ? 'active' : ''}`;
      li.textContent = cat;
      li.addEventListener('click', () => onCategorySelect(cat));
      ul.appendChild(li);
    });

    this.categoriesContainer.appendChild(ul);
  }

  renderDishes(dishes, onAddToCart, onViewDetails) {
    if (!this.dishesContainer) return;

    this.dishesContainer.innerHTML = '';

    if (!dishes || dishes.length === 0) {
      this.dishesContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-muted);">
          <i class="fa-solid fa-utensils" style="font-size: 3rem; color: var(--color-primary); margin-bottom: 1rem;"></i>
          <h3>No se encontraron platos en esta categoría</h3>
          <p>Intenta con otro término de búsqueda o selecciona otra categoría.</p>
        </div>
      `;
      return;
    }

    const isAdmin = this.userRole === 'admin';

    dishes.forEach(dish => {
      const card = document.createElement('div');
      card.className = 'dish-card';

      // Si el usuario es ADMIN, el botón de compra está deshabilitado u oculto
      const actionButtonHTML = isAdmin 
        ? `<button class="btn-outline view-detail-btn" type="button" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;"><i class="fa-solid fa-eye"></i> Ver Detalles</button>`
        : `<button class="add-cart-btn" type="button"><i class="fa-solid fa-cart-plus"></i> Agregar</button>`;

      card.innerHTML = `
        <div class="dish-image-wrapper">
          <img src="${dish.image}" alt="${dish.name}" class="dish-image" loading="lazy">
          <div class="prep-time-badge">
            <i class="fa-solid fa-clock"></i> ${dish.prepTime || '15-20 min'}
          </div>
        </div>
        <div class="dish-content">
          <h3 class="dish-title">${dish.name}</h3>
          <p class="dish-desc">${dish.description}</p>
          <div class="dish-footer">
            <span class="dish-price">RD$ ${dish.price.toLocaleString('es-DO')}</span>
            ${actionButtonHTML}
          </div>
        </div>
      `;

      // Evento de clic en la tarjeta para ver detalles
      card.addEventListener('click', (e) => {
        if (e.target.closest('.add-cart-btn')) {
          e.stopPropagation();
          onAddToCart(dish);
        } else {
          onViewDetails(dish);
        }
      });

      this.dishesContainer.appendChild(card);
    });
  }

  renderDishDetailModal(dish) {
    if (!this.dishModalContent || !this.dishModal) return;

    this.dishModalContent.innerHTML = `
      <div style="text-align: center;">
        <img src="${dish.image}" alt="${dish.name}" style="width: 100%; max-height: 240px; object-fit: cover; border-radius: var(--border-radius-md); margin-bottom: 1.25rem;">
        <h2 style="color: var(--color-primary); font-size: 1.8rem; margin-bottom: 0.5rem;">${dish.name}</h2>
        <p style="color: var(--text-muted); margin-bottom: 1.25rem; font-size: 1rem;">${dish.description}</p>
        
        <div style="display: flex; justify-content: space-around; background: var(--bg-primary); padding: 1rem; border-radius: var(--border-radius-sm); margin-bottom: 1.5rem; border: var(--border-glass);">
          <div>
            <span style="color: var(--text-muted); font-size: 0.85rem;">Tiempo Cocina</span>
            <p style="font-weight: 700; color: var(--color-primary);"><i class="fa-solid fa-stopwatch"></i> ${dish.prepTime || '15-20 min'}</p>
          </div>
          <div>
            <span style="color: var(--text-muted); font-size: 0.85rem;">Categoría</span>
            <p style="font-weight: 700; color: var(--text-main);">${dish.category}</p>
          </div>
          <div>
            <span style="color: var(--text-muted); font-size: 0.85rem;">Precio Unitario</span>
            <p style="font-weight: 700; color: var(--color-secondary);">RD$ ${dish.price.toLocaleString('es-DO')}</p>
          </div>
        </div>
      </div>
    `;

    this.dishModal.classList.add('active');
  }

  closeDishModal() {
    if (this.dishModal) {
      this.dishModal.classList.remove('active');
    }
  }
}