// ==========================================
// APP.JS - SCRIPT DE ENTRADA (BOOTSTRAPPER)
// Enmanuel - Dev 4 / Equipo Sabor Gourmet
// ==========================================

import AppController from './controllers/AppController.js';

// Inicializar el Controlador Principal al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
  const app = new AppController();
  app.init();
});
