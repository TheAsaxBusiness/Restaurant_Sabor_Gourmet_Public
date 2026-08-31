// ==========================================
// TABLEVIEW.JS - VISTA DE TABLAS E INFORMACIÓN
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
  renderScheduleTable(scheduleData) {
    if (!this.scheduleContainer || !scheduleData) return;

    const rows = scheduleData.map(item => `
      <tr>
        <td><strong>${item.day || item.dia || ''}</strong></td>
        <td>${item.hours || item.horario || ''}</td>
        <td><span style="color: var(--status-available); font-weight: 600;"><i class="fa-solid fa-circle" style="font-size: 0.7rem; margin-right: 0.3rem;"></i> ${item.status || 'Abierto'}</span></td>
      </tr>
    `).join('');

    this.scheduleContainer.innerHTML = `
      <table class="styled-table">
        <thead>
          <tr>
            <th>Días de Servicio</th>
            <th>Horario de Atención</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    `;
  }

  // Renderizar la tabla <table> de Combos Promocionales
  renderCombosTable(combosData) {
    if (!this.combosContainer || !combosData) return;

    const rows = combosData.map(item => `
      <tr>
        <td><strong style="color: var(--color-primary);">${item.name || item.combo || ''}</strong></td>
        <td>${item.description || item.includes || item.incluye || ''}</td>
        <td><strong style="color: var(--color-secondary);">RD$ ${Number(item.price || item.precioOferta || item.offerPrice || 0).toFixed(2)}</strong></td>
        <td><span style="background: rgba(46, 204, 113, 0.15); color: var(--status-available); padding: 0.25rem 0.6rem; border-radius: 12px; font-weight: 600;"><i class="fa-solid fa-tag"></i> ${item.savings || 'Ahorro Especial'}</span></td>
      </tr>
    `).join('');

    this.combosContainer.innerHTML = `
      <table class="styled-table">
        <thead>
          <tr>
            <th>Nombre del Combo</th>
            <th>Contenido & Incluye</th>
            <th>Precio Especial</th>
            <th>Ahorro Estimado</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    `;
  }

  // Renderizar la tabla <table> Nutricional
  renderNutritionTable(nutritionData) {
    if (!this.nutritionContainer || !nutritionData) return;

    const rows = nutritionData.map(item => `
      <tr>
        <td><strong>${item.dish || item.dishName || item.name || item.plato || ''}</strong></td>
        <td>${item.calories || item.calorias || ''}</td>
        <td>${item.protein || item.proteinas || ''}</td>
        <td>${item.carbs || item.carbohidratos || ''}</td>
        <td>${item.fat || item.grasas || ''}</td>
      </tr>
    `).join('');

    this.nutritionContainer.innerHTML = `
      <table class="styled-table">
        <thead>
          <tr>
            <th>Plato Gastronómico</th>
            <th>Calorías</th>
            <th>Proteínas</th>
            <th>Carbohidratos</th>
            <th>Grasas Totales</th>
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
