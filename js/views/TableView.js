
 export class TableView {
  constructor() {
    this.scheduleContainer = null;
    this.combosContainer = null;
    this.nutritionContainer = null;
  }

  init() {
    this.scheduleContainer = document.getElementById("schedule-table");
    this.combosContainer = document.getElementById("combos-table");
    this.nutritionContainer = document.getElementById("nutrition-table");
  }

  renderScheduleTable(scheduleData) {
    if (!this.scheduleContainer) return;

    if (!scheduleData || scheduleData.length === 0) {
      this.scheduleContainer.innerHTML = "<p>No hay horarios disponibles.</p>";
      return;
    }

    let html = `
      <table>
        <thead>
          <tr>
            <th>Día</th>
            <th>Horario</th>
          </tr>
        </thead>
        <tbody>
    `;

    scheduleData.forEach(item => {
      html += `
        <tr>
          <td>${item.day || item.dia || ""}</td>
          <td>${item.hours || item.horario || ""}</td>
        </tr>
      `;
    });

    html += `
        </tbody>
      </table>
    `;

    this.scheduleContainer.innerHTML = html;
  }

  renderCombosTable(combosData) {
    if (!this.combosContainer) return;

    if (!combosData || combosData.length === 0) {
      this.combosContainer.innerHTML = "<p>No hay combos disponibles.</p>";
      return;
    }

    let html = `
      <table>
        <thead>
          <tr>
            <th>Combo</th>
            <th>Incluye</th>
            <th>Precio regular</th>
            <th>Precio oferta</th>
          </tr>
        </thead>
        <tbody>
    `;

    combosData.forEach(combo => {
      html += `
        <tr>
          <td>${combo.name || combo.combo || ""}</td>
          <td>${combo.includes || combo.incluye || ""}</td>
          <td>RD$ ${Number(combo.regularPrice || combo.precioRegular || 0).toFixed(2)}</td>
          <td>RD$ ${Number(combo.offerPrice || combo.precioOferta || 0).toFixed(2)}</td>
        </tr>
      `;
    });

    html += `
        </tbody>
      </table>
    `;

    this.combosContainer.innerHTML = html;
  }

  renderNutritionTable(nutritionData) {
    if (!this.nutritionContainer) return;

    if (!nutritionData || nutritionData.length === 0) {
      this.nutritionContainer.innerHTML = "<p>No hay información nutricional disponible.</p>";
      return;
    }

    let html = `
      <table>
        <thead>
          <tr>
            <th>Plato</th>
            <th>Calorías</th>
            <th>Proteínas</th>
            <th>Carbohidratos</th>
            <th>Grasas</th>
          </tr>
        </thead>
        <tbody>
    `;

    nutritionData.forEach(item => {
      html += `
        <tr>
          <td>${item.name || item.plato || ""}</td>
          <td>${item.calories || item.calorias || ""}</td>
          <td>${item.protein || item.proteinas || ""}</td>
          <td>${item.carbs || item.carbohidratos || ""}</td>
          <td>${item.fat || item.grasas || ""}</td>
        </tr>
      `;
    });

    html += `
        </tbody>
      </table>
    `;

    this.nutritionContainer.innerHTML = html;
  }
}
