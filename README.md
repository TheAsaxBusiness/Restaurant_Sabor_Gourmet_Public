# 🍽️ Restaurante Sabor Gourmet - Plataforma Gastronómica Web (MVC SPA)

Sistema Web de Alta Cocina Dominicana desarrollado con arquitectura **Model-View-Controller (MVC)** en Javascript ES6+, backend REST en **Express.js**, navegación por pestañas **Single Page Application (SPA)**, control de acceso por roles (**RBAC**), gestión dinámica **CRUD de Menú y Mesas**, previsualización de **Facturas PDF con ITBIS (18%)**, **Dashboard KPI con Gráficos Interactivos** y **Modo Oscuro / Claro Gourmet**.

---

## 👥 Equipo de Desarrollo - Grupo 7

- **Franyel** - *Dev 1 / Modelos de Datos, Autenticación `users.json` & Pedidos API*
- **Carlos** - *Dev 3 / Dashboard KPI, Gráficos Chart.js & CRM Clientes*
- **Altagracia** - *Dev 2 / Módulo de Reservas, Mesas & Tablas Semánticas*
- **Enmanuel** - *Dev 4 / Controlador Principal `AppController.js`, Vistas SPA, Facturación PDF & Estilos CSS3*

---

## 🔑 Credenciales de Prueba

Para ingresar al sistema, utiliza cualquiera de los siguientes correos registrados en la base de datos `data/users.json`:

| Perfil | Correo Electrónico | Contraseña | Rol Detectado | Permisos y Accesos |
| :--- | :--- | :--- | :--- | :--- |
| **Cliente** | `carlos@cliente.com` | `123456` | `customer` | Navegación pública, menú gastronómico, carrito de compra, reservas de mesas y emisión de **Factura PDF**. |
| **Administrador** | `admin@sabor.com` | `admin123` | `admin` | **Monitor de Cocina**, **CRUD de Platos**, **CRUD de Mesas**, **KPIs de Ventas** y **CRM**. *(Sin carrito de compra)*. |

---

## 🚀 Características y Funcionalidades

### 🔐 1. Autenticación Silenciosa & Control de Acceso por Roles (RBAC)
- **Cero Tokens Toy:** La aplicación analiza silenciosamente el correo ingresado en el formulario contra `data/users.json` para determinar la identidad y el rol.
- **Bloqueo Inicial Gated Auth:** Todas las vistas permanecen bloqueadas hasta que el usuario inicie sesión correctamente.
- **Regla Estricta 1 (Admin no compra):** El perfil `admin` tiene el botón de Carrito oculto y los botones de compra desactivados/reemplazados por *"Ver Detalles"*.
- **Regla Estricta 2 (Privacidad de datos):** El perfil `customer` tiene las métricas de ventas internas, CRM e indicadores de cocina **estrictamente ocultos y bloqueados**.

---

### 📋 2. Módulos CRUD Dinámicos para el Administrador
- **Gestión Dinámica de Platos (`/api/menu`):** Agregar nuevos platos, editar precios/descripciones o eliminar platos del catálogo de forma persistente.
- **Gestión Dinámica de Mesas (`/api/tables`):** Crear nuevas mesas en el salón (Salón Principal, Terraza, VIP), actualizar su estado en tiempo real (*Disponible*, *Ocupada*, *Reservada*) o eliminarlas del mapa.

---

### 🧾 3. Facturación Fiscal Formal & Exportación a PDF
- **Previsualización de Factura:** Modal institucional con RNC (`130-98241-9`), NCF oficial DGII, desglose de raciones, Subtotal, **ITBIS (18%)** y Total.
- **Exportación / Impresión en PDF:** Botón con reglas CSS `@media print` optimizadas para imprimir la factura limpia en blanco y negro institucional sin menús ni fondos oscuros.

---

### 📊 4. Dashboard KPIs & 3 Gráficos Interactivos (Chart.js)
- **Línea con Degradado Dorado:** Tendencia de ingresos en RD$ por bloques de horarios del día.
- **Rosca / Donut Chart:** Porcentaje de ventas desglosado por categoría gastronómica.
- **Barras Horizontales:** Comparativa visual del tiempo promedio de preparación en cocina por plato.

---

### 🎨 5. Diseño Gourmet, Animaciones & Modo Oscuro / Claro
- **Glassmorphism & Animaciones:** Header flotante translúcido, transiciones suaves `fadeInScale` y micro-animaciones en tarjetas.
- **Tema Oscuro & Claro (Dark/Light Mode):** Alternador en la barra superior que conmuta entre el tema oscuro carbón y un tema claro marfil cálido, guardando la preferencia en `LocalStorage`.
- **Iconografía FontAwesome 6:** Integración completa de íconos vectoriales sin emojis directos en el código.
- **100% Responsivo (Mobile-First):** Menú hamburguesa desplegable y reajuste automático de tarjetas a 1 columna en smartphones.

---

## 🛠️ Estructura del Proyecto (Patrón MVC)

```text
Restaurant_Sabor_Gourmet_Public/
├── assets/                  # Material multimedia y videos del Hero
├── css/
│   └── styles.css           # Tokens de diseño, animaciones, CSS3 & @media print
├── data/
│   ├── menu.json            # Base de datos JSON de Platos y Nutrición
│   ├── tables.json          # Base de datos JSON de Mesas del Salón
│   ├── orders.json          # Registro de Pedidos en tiempo real
│   ├── customers.json       # Datos del CRM de Clientes
│   └── users.json           # Cuentas de usuarios y roles registrados
├── docs/                    # Documentación formal (.docx)
│   ├── Epicas_y_Historias_de_Usuario.docx
│   ├── Arquitectura_Modelos_Clases_y_Servidor.docx
│   └── Guia_de_Fases_y_Roadmap_de_Desarrollo.docx
├── js/
│   ├── app.js               # Script de entrada principal (Bootstrapper ES6)
│   ├── controllers/
│   │   └── AppController.js # Orquestador MVC Principal (SPA & RBAC)
│   ├── models/
│   │   ├── MenuModel.js     # Modelo de datos y operaciones CRUD del Menú
│   │   ├── CartModel.js     # Modelo de Carrito de compras e ITBIS 18%
│   │   ├── TableModel.js    # Modelo de Mesas y Reservas
│   │   ├── DashboardModel.js# Modelo de métricas de negocio
│   │   ├── AuthModel.js     # Modelo de Autenticación con users.json
│   │   └── OrderModel.js    # Modelo de Pedidos en vivo
│   └── views/
│       ├── MenuView.js      # Renderizador del Catálogo de Platos
│       ├── CartView.js      # Renderizador del Carrito Slidout Drawer
│       ├── TableView.js     # Renderizador de Mesas y Reservas
│       ├── DashboardView.js # Renderizador de KPIs, Gráficos y Módulos CRUD Admin
│       ├── InvoiceView.js   # Modal Previsualizador de Factura PDF
│       └── AuthModalView.js # Componentes auxiliares de autenticación
├── index.html               # Estructura semántica HTML5 y contenedores SPA
├── server.js                # Servidor Backend REST API en Express
├── README.md                # Guía y documentación del proyecto
└── package.json             # Dependencias del proyecto
```

---

## 💻 Instrucciones para Ejecutar el Proyecto

### 1. Clonar el repositorio
```bash
git clone git@github-asax:TheAsaxBusiness/Restaurant_Sabor_Gourmet_Public.git
cd Restaurant_Sabor_Gourmet_Public
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Iniciar el servidor backend Express
```bash
npm start
```

### 4. Abrir en el navegador
Visita **[http://localhost:3000](http://localhost:3000)** en cualquier navegador web.

---

## 📄 Licencia y Derechos

© 2026 Restaurante Sabor Gourmet. Desarrollado por el **Grupo 7 (Franyel, Carlos, Altagracia, Enmanuel)** para la materia de Desarrollo de Aplicaciones Web.
