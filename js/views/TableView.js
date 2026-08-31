// ==========================================
// TABLEVIEW.JS - VISTA DE TABLAS E INFORMACIÓN (CON CRUD ACCIONES)
// Altagracia - Dev 2 / Equipo Sabor Gourmet
// ==========================================

export default class TableView {
  constructor() {
    this.scheduleContainer = null;
    this.combosContainer = null;
    this.nutritionContainer = null;
    this.tablesStatusContainer = null;
  }

  init() {
    this.scheduleContainer = document.getElementById('schedule-container') || document.getElementById('schedule-table');
    this.combosContainer = document.getElementById('combos-container') || document.getElementById('combos-table');
    this.nutritionContainer = document.getElementById('nutrition-container') || document.getElementById('nutrition-table');
    this.tablesStatusContainer = document.getElementById('tables-status-container');
  }

  // Renderizar la tabla semántica <table> de Horarios
  renderScheduleTable(scheduleData, isAdmin = false) {
    if (!this.scheduleContainer || !scheduleData) return;

    const rows = scheduleData.map((item, index) => `
      <tr>
        <td><strong>${item.day || item.dia || ''}</strong></td>
        <td>${item.hours || item.horario || ''}</td>
        <td><span style="color: var(--status-available); font-weight: 600;"><i class="fa-solid fa-circle" style="font-size: 0.7rem; margin-right: 0.3rem;"></i> ${item.status || 'Abierto'}</span></td>
        ${isAdmin ? `
          <td style="text-align: center;">
            <button class="btn-outline edit-schedule-btn" data-index="${index}" style="padding: 0.25rem 0.6rem; font-size: 0.8rem; margin-right: 0.3rem;"><i class="fa-solid fa-pen"></i></button>
            <button class="btn-outline delete-schedule-btn" data-index="${index}" style="padding: 0.25rem 0.6rem; font-size: 0.8rem; color: #ff6b6b; border-color: #ff6b6b;"><i class="fa-solid fa-trash"></i></button>
          </td>
        ` : ''}
      </tr>
    `).join('');

    const adminHeader = isAdmin ? `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <h3 style="color: var(--color-primary); margin: 0;"><i class="fa-solid fa-clock"></i> Horarios de Atención</h3>
        <button id="open-add-schedule-modal" class="btn-primary" style="padding: 0.4rem 0.85rem; font-size: 0.85rem;"><i class="fa-solid fa-plus"></i> Agregar Horario</button>
      </div>
    ` : '';

    this.scheduleContainer.innerHTML = `
      ${adminHeader}
      <table class="styled-table">
        <thead>
          <tr>
            <th>Días de Servicio</th>
            <th>Horario de Atención</th>
            <th>Estado</th>
            ${isAdmin ? '<th>Acciones</th>' : ''}
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    `;
  }

  // Renderizar la tabla <table> de Combos Promocionales
  renderCombosTable(combosData, isAdmin = false) {
    if (!this.combosContainer || !combosData) return;

    const rows = combosData.map((item, index) => `
      <tr>
        <td><strong style="color: var(--color-primary);">${item.name || item.combo || ''}</strong></td>
        <td>${item.description || item.includes || item.incluye || ''}</td>
        <td><strong style="color: var(--color-secondary);">RD$ ${Number(item.price || item.precioOferta || item.offerPrice || 0).toFixed(2)}</strong></td>
        <td><span style="background: rgba(46, 204, 113, 0.15); color: var(--status-available); padding: 0.25rem 0.6rem; border-radius: 12px; font-weight: 600;"><i class="fa-solid fa-tag"></i> ${item.savings || 'Ahorro Especial'}</span></td>
        ${isAdmin ? `
          <td style="text-align: center;">
            <button class="btn-outline edit-combo-btn" data-index="${index}" style="padding: 0.25rem 0.6rem; font-size: 0.8rem; margin-right: 0.3rem;"><i class="fa-solid fa-pen"></i></button>
            <button class="btn-outline delete-combo-btn" data-index="${index}" style="padding: 0.25rem 0.6rem; font-size: 0.8rem; color: #ff6b6b; border-color: #ff6b6b;"><i class="fa-solid fa-trash"></i></button>
          </td>
        ` : ''}
      </tr>
    `).join('');

    const adminHeader = isAdmin ? `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <h3 style="color: var(--color-primary); margin: 0;"><i class="fa-solid fa-gift"></i> Combos Promocionales</h3>
        <button id="open-add-combo-modal" class="btn-primary" style="padding: 0.4rem 0.85rem; font-size: 0.85rem;"><i class="fa-solid fa-plus"></i> Agregar Combo</button>
      </div>
    ` : '';

    this.combosContainer.innerHTML = `
      ${adminHeader}
      <table class="styled-table">
        <thead>
          <tr>
            <th>Nombre del Combo</th>
            <th>Contenido & Incluye</th>
            <th>Precio Especial</th>
            <th>Ahorro Estimado</th>
            ${isAdmin ? '<th>Acciones</th>' : ''}
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    `;
  }

  // Renderizar la tabla <table> Nutricional
  renderNutritionTable(nutritionData, isAdmin = false) {
    if (!this.nutritionContainer || !nutritionData) return;

    const rows = nutritionData.map((item, index) => `
      <tr>
        <td><strong>${item.dish || item.dishName || item.name || item.plato || ''}</strong></td>
        <td>${item.calories || item.calorias || ''}</td>
        <td>${item.protein || item.proteinas || ''}</td>
        <td>${item.carbs || item.carbohidratos || ''}</td>
        <td>${item.fat || item.grasas || ''}</td>
        ${isAdmin ? `
          <td style="text-align: center;">
            <button class="btn-outline edit-nutrition-btn" data-index="${index}" style="padding: 0.25rem 0.6rem; font-size: 0.8rem; margin-right: 0.3rem;"><i class="fa-solid fa-pen"></i></button>
            <button class="btn-outline delete-nutrition-btn" data-index="${index}" style="padding: 0.25rem 0.6rem; font-size: 0.8rem; color: #ff6b6b; border-color: #ff6b6b;"><i class="fa-solid fa-trash"></i></button>
          </td>
        ` : ''}
      </tr>
    `).join('');

    const adminHeader = isAdmin ? `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <h3 style="color: var(--color-primary); margin: 0;"><i class="fa-solid fa-heart-pulse"></i> Información Nutricional</h3>
        <button id="open-add-nutrition-modal" class="btn-primary" style="padding: 0.4rem 0.85rem; font-size: 0.85rem;"><i class="fa-solid fa-plus"></i> Agregar Registro Nutricional</button>
      </div>
    ` : '';

    this.nutritionContainer.innerHTML = `
      ${adminHeader}
      <table class="styled-table">
        <thead>
          <tr>
            <th>Plato Gastronómico</th>
            <th>Calorías</th>
            <th>Proteínas</th>
            <th>Carbohidratos</th>
            <th>Grasas Totales</th>
            ${isAdmin ? '<th>Acciones</th>' : ''}
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    `;
  }

  // Renderizar el mapa de estado de Mesas en vivo
  renderTablesStatus(tables) {
    if (!this.tablesStatusContainer || !tables) return;

    const cards = tables.map(t => {
      let statusColor = 'var(--status-available)';
      if (t.status === 'Ocupada') statusColor = 'var(--status-occupied)';
      if (t.status === 'Reservada') statusColor = 'var(--status-reserved)';

      return `
        <div style="background: var(--bg-primary); border: 1px solid rgba(255,255,255,0.1); padding: 1rem; border-radius: var(--border-radius-md); text-align: center;">
          <h4 style="color: var(--color-primary); margin-bottom: 0.3rem;"><i class="fa-solid fa-chair"></i> Mesa ${t.number}</h4>
          <p style="font-size: 0.85rem; color: var(--text-muted);">${t.zone} (${t.capacity} pers.)</p>
          <span style="display: inline-block; margin-top: 0.5rem; color: ${statusColor}; font-weight: 700; font-size: 0.85rem;"><i class="fa-solid fa-circle" style="font-size: 0.6rem; margin-right: 0.3rem;"></i> ${t.status}</span>
        </div>
      `;
    }).join('');

    this.tablesStatusContainer.innerHTML = `
      <h3 style="color: var(--text-main); margin-bottom: 1rem; font-size: 1.2rem;"><i class="fa-solid fa-chair" style="color: var(--color-primary);"></i> Estado de Salón en Tiempo Real:</h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 1rem;">
        ${cards}
      </div>
    `;
  }
}

export { TableView };
