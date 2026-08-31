// ==========================================
// AUTHMODALVIEW.JS - LOGIN / REGISTRO SIMULADO
// Enmanuel - Dev 4
// ==========================================

export default class AuthModalView {
  constructor() {
    this.authModal = null;
    this.authContent = null;
    this.closeBtn = null;
    this.userStatusBtn = null;
    this.roleToggleBtn = null;
  }

  init(onLogin, onRegister, onToggleRole, onLogout) {
    this.authModal = document.getElementById('auth-modal');
    this.authContent = document.getElementById('auth-modal-content');
    this.closeBtn = document.getElementById('close-auth-modal');
    this.userStatusBtn = document.getElementById('user-status-btn');
    this.roleToggleBtn = document.getElementById('role-toggle-btn');

    if (this.userStatusBtn) {
      this.userStatusBtn.addEventListener('click', () => this.openAuthModal(onLogin, onRegister));
    }

    if (this.roleToggleBtn) {
      this.roleToggleBtn.addEventListener('click', () => onToggleRole());
    }

    if (this.closeBtn && this.authModal) {
      this.closeBtn.addEventListener('click', () => this.closeAuthModal());
      this.authModal.addEventListener('click', (e) => {
        if (e.target === this.authModal) this.closeAuthModal();
      });
    }
  }

  // Actualizar el botón de usuario en la barra de navegación
  updateUserNav(user, onLogout) {
    if (!this.userStatusBtn) return;

    if (user && user.email) {
      const isAdm = user.role === 'admin';
      const roleBadge = isAdm ? '<span style="background: var(--color-secondary); padding: 0.15rem 0.5rem; border-radius: 10px; font-size: 0.75rem;">ADMIN</span>' : '<span style="background: var(--color-primary); color: #121212; padding: 0.15rem 0.5rem; border-radius: 10px; font-size: 0.75rem;">CLIENTE</span>';
      
      this.userStatusBtn.innerHTML = `
        <i class="fa-solid fa-user-circle"></i>
        <span>${user.name.split(' ')[0]}</span>
        ${roleBadge}
      `;
    } else {
      this.userStatusBtn.innerHTML = `
        <i class="fa-solid fa-right-to-bracket"></i>
        <span>Ingresar</span>
      `;
    }
  }

  openAuthModal(onLogin, onRegister) {
    if (!this.authContent || !this.authModal) return;

    this.authContent.innerHTML = `
      <div style="text-align: center; margin-bottom: 1.5rem;">
        <h3 style="color: var(--color-primary); font-size: 1.5rem; margin-bottom: 0.3rem;"><i class="fa-solid fa-user-lock"></i> Acceso Simulado Sabor Gourmet</h3>
        <p style="color: var(--text-muted); font-size: 0.9rem;">Selecciona tu rol para probar las vistas de Cliente o Administrador.</p>
      </div>

      <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem;">
        <button id="auth-tab-login" class="btn-primary" style="flex: 1; padding: 0.6rem;">Iniciar Sesión</button>
        <button id="auth-tab-register" class="btn-outline" style="flex: 1; padding: 0.6rem;">Registrarse</button>
      </div>

      <form id="simulated-login-form">
        <div class="form-group" style="margin-bottom: 1rem;">
          <label><i class="fa-solid fa-envelope"></i> Correo Electrónico</label>
          <input type="email" id="login-email" class="form-control" value="carlos@cliente.com" required>
        </div>

        <div class="form-group" style="margin-bottom: 1rem;">
          <label><i class="fa-solid fa-lock"></i> Contraseña</label>
          <input type="password" id="login-password" class="form-control" value="123456" required>
        </div>

        <div class="form-group" style="margin-bottom: 1.5rem;">
          <label><i class="fa-solid fa-user-gear"></i> Rol Simulado</label>
          <select id="login-role" class="form-control">
            <option value="customer">Perfil Cliente (Menú & Mis Pedidos)</option>
            <option value="admin">Perfil Administrador / Cocina (KPIs & Pedidos)</option>
          </select>
        </div>

        <button type="submit" class="btn-primary" style="width: 100%;"><i class="fa-solid fa-right-to-bracket"></i> Entrar a la Aplicación</button>
      </form>
    `;

    const form = document.getElementById('simulated-login-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const pass = document.getElementById('login-password').value;
        const role = document.getElementById('login-role').value;
        onLogin(email, pass, role);
        this.closeAuthModal();
      });
    }

    this.authModal.classList.add('active');
  }

  closeAuthModal() {
    if (this.authModal) {
      this.authModal.classList.remove('active');
    }
  }
}
