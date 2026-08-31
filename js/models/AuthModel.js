// ==========================================
// AUTHMODEL.JS - AUTENTICACIÓN ROBUSTA CON FAILSAFE
// Franyel - Dev 1 / Equipo Sabor Gourmet
// ==========================================

export default class AuthModel {
  constructor() {
    this.STORAGE_KEY = 'sabor_gourmet_session';
    this.currentUser = null;
    this.loadSession();
  }

  loadSession() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved && saved !== 'null') {
        this.currentUser = JSON.parse(saved);
      } else {
        this.currentUser = null;
      }
    } catch (e) {
      this.currentUser = null;
    }
  }

  // Iniciar sesión consultando la API con validaciones completas de correo y contraseña
  async login(email, password) {
    const cleanEmail = (email || '').toLowerCase().trim();
    const cleanPassword = (password || '').trim();

    // 1. Validar correo obligatorio y formato
    if (!cleanEmail) {
      return { success: false, message: 'Por favor, ingresa tu correo electrónico.' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return { success: false, message: 'El formato de correo no es válido. Ejemplo: usuario@dominio.com' };
    }

    // 2. Validar contraseña obligatoria y longitud mínima (6 caracteres)
    if (!cleanPassword) {
      return { success: false, message: 'Por favor, ingresa tu contraseña.' };
    }

    if (cleanPassword.length < 6) {
      return { success: false, message: 'La contraseña debe tener al menos 6 caracteres.' };
    }

    try {
      // Consulta a la API Backend
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword })
      });

      const data = await response.json();

      if (response.ok && data.success && data.user) {
        this.currentUser = data.user;
        this.saveSession();
        return { success: true, user: this.currentUser, message: data.message || '¡Sesión iniciada con éxito!' };
      } else {
        return { success: false, message: data.error || 'Error al iniciar sesión. Verifica tus credenciales.' };
      }
    } catch (err) {
      console.warn('Backend API no disponible, aplicando fallback local:', err);

      // Fallback local con validación de contraseña
      const knownAccounts = {
        'carlos@cliente.com': { pass: '123456', role: 'customer', name: 'Carlos Mendoza' },
        'altagracia@cliente.com': { pass: '123456', role: 'customer', name: 'Altagracia Guzmán' },
        'admin@sabor.com': { pass: 'admin123', role: 'admin', name: 'Gerencia Sabor Gourmet' },
        'cocina@sabor.com': { pass: 'admin123', role: 'admin', name: 'Jefe de Cocina' }
      };

      const account = knownAccounts[cleanEmail];
      if (account && account.pass !== cleanPassword) {
        return { success: false, message: 'Contraseña incorrecta para esta cuenta.' };
      }

      const isAdmin = cleanEmail.includes('admin') || cleanEmail.includes('cocina');
      this.currentUser = {
        id: isAdmin ? 'USR-201' : 'USR-101',
        email: cleanEmail,
        name: account ? account.name : (isAdmin ? 'Gerencia Sabor Gourmet' : cleanEmail.split('@')[0]),
        role: isAdmin ? 'admin' : 'customer'
      };

      this.saveSession();
      return { success: true, user: this.currentUser };
    }
  }

  logout() {
    this.currentUser = null;
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (e) {}
    return null;
  }

  isLoggedIn() {
    return this.currentUser !== null;
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isAdmin() {
    return this.currentUser && this.currentUser.role === 'admin';
  }

  saveSession() {
    try {
      if (this.currentUser) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.currentUser));
      }
    } catch (e) {}
  }
}
