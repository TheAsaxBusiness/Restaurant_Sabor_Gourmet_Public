# 🍽️ Restaurante Sabor Gourmet - Aplicación Web Interactiva

[![Stack](https://img.shields.io/badge/Stack-HTML5%20%7C%20CSS3%20%7C%20ES6%2B%20%7C%20Express-d4af37)](https://github.com/TheAsaxBusiness/Restaurant_Sabor_Gourmet_Public)
[![Arquitectura](https://img.shields.io/badge/Arquitectura-POO%20%2F%20UML%20%2F%20MVC-2a9d8f)](#-4-especificación-de-clases-y-contratos-uml)

Esqueleto base y marco de trabajo para el desarrollo del sitio web/aplicación interactiva de la **Restaurante Sabor Gourmet**. El proyecto implementa una arquitectura orientada a objetos (POO) limpia con Vanilla HTML5, CSS3, JavaScript (ES6+), y un servidor ultraligero Node.js con Express para consumir una API JSON local sin base de datos externa.

---

## 📋 1. Resumen Ejecutivo del Proyecto

Este repositorio establece la estructura técnica, contratos de clases UML, distribución de tareas y roadmap para completar la aplicación web en un plazo de **4 días** trabajando con **4 integrantes**.

El sistema ofrece:
- **Hero Interactivo**: Video promocional en bucle (`<video controls autoplay muted loop>`).
- **Catálogo Dinámico de Menú**: Categorías, búsqueda en tiempo real, badges y modales de detalles con listas desordenadas de ingredientes (`<ul>/<li>`).
- **Tablas Semánticas**: Horarios de atención, combos promocionales y tabla nutricional.
- **Formulario de Reservas**: Validación interactiva para solicitud de mesas.
- **Carrito de Compras**: Cálculo automático de totales con **18% ITBIS/IVA**, persistencia en `LocalStorage` y notificaciones toast.

---

## 👥 2. Asignación del Equipo y Roles

| Integrante | Rol Técnico | Componentes y Archivos Clave |
| :--- | :--- | :--- |
| **Franyel** | **Dev 1: Tech Lead & Backend Datos** | `data/menu.json`, `js/models/MenuModel.js`, `js/models/CartModel.js` |
| **Carlos** | **Dev 2: Frontend & Multimedia** | `js/views/MenuView.js`, `assets/images/`, `assets/video/` |
| **Altagracia** | **Dev 3: UI System & Tablas** | `css/styles.css`, `js/views/TableView.js` |
| **Enmanuel** | **Dev 4: Carrito, Modales & Reservas** | `js/views/CartView.js`, Formulario Reservas, `js/app.js` |

---

## 🏗️ 3. Arquitectura del Proyecto y Estructura de Directorios

```text
Restaurant_Sabor_Gourmet_Public/
├── index.html              # Página principal (Hero, Categorías, Menú, Tablas, Reservas)
├── server.js               # Servidor Express ultraligero que sirve archivos estáticos y API /api/menu
├── package.json            # Configuración de dependencias (Express)
├── .gitignore              # Exclusión de node_modules y temporales
├── README.md               # Documentación completa del proyecto y UML
├── css/
│   └── styles.css          # Variables CSS, Responsive Layout, Modales y Tablas (Altagracia)
├── data/
│   └── menu.json           # API interna JSON: Platos, horarios, combos y nutrición (Franyel)
├── assets/
│   ├── images/             # Fotografías de alta resolución de los platos
│   └── video/              # Video promocional de cocina del chef
└── js/
    ├── models/
    │   ├── MenuModel.js    # Carga JSON, filtro por categoría y buscador (Franyel)
    │   └── CartModel.js    # Carrito, ITBIS 18% y LocalStorage (Franyel)
    ├── views/
    │   ├── MenuView.js     # Render de tarjetas, ingredientes (ul/li) y video modal (Carlos)
    │   ├── TableView.js    # Render de tablas (Horarios, Combos, Nutrición) (Altagracia)
    │   └── CartView.js     # Render de modal de carrito, badge y toasts (Enmanuel)
    └── app.js              # Controlador principal AppController e integración (Enmanuel)
```

---

## 📐 4. Especificación de Clases y Contratos UML

### Módulo de Datos (Franyel)
#### **`MenuModel` (`js/models/MenuModel.js`)**
- `loadMenu() : Promise<Array<Object>>` — Fetch a `/api/menu` (o `data/menu.json`).
- `getAllItems() : Array<Object>` — Retorna todos los platos.
- `getCategories() : Array<String>` — Categorías únicas sin duplicados.
- `getItemsByCategory(category: String) : Array<Object>` — Platos por categoría.
- `searchItems(query: String) : Array<Object>` — Búsqueda por término.
- `getItemById(id: String) : Object` — Retorna plato por ID.

#### **`CartModel` (`js/models/CartModel.js`)**
- `addItem(product: Object) : Array<Object>` — Agrega o incrementa cantidad.
- `removeItem(id: String) : Array<Object>` — Elimina plato del carrito.
- `updateQuantity(id: String, quantity: Number) : Array<Object>` — Actualiza cantidad.
- `getItems() : Array<Object>` — Ítems en el carrito.
- `getTotalCount() : Number` — Suma total de unidades.
- `getTotals() : Object` — Retorna `{ subtotal, tax, discount, total }` (ITBIS 18%).
- `saveToLocalStorage()` / `loadFromLocalStorage()` — Persistencia.

### Módulo Frontend & Menú (Carlos)
#### **`MenuView` (`js/views/MenuView.js`)**
- `init() : void` — Captura referencias del DOM.
- `renderCategories(categories: Array<String>, activeCategory: String, onSelectCategory: Function) : void` — Botones de filtro `<ul>/<li>`.
- `renderDishes(dishes: Array<Object>, onAddToCart: Function, onViewDetails: Function) : void` — Tarjetas de platos (`<img>`, badges, precio).
- `renderDishDetailModal(dish: Object) : void` — Modal con ingredientes (`<ul>`) y video (`<video>`).

### Módulo UI System & Tablas (Altagracia)
#### **`TableView` (`js/views/TableView.js`)**
- `init() : void` — Captura contenedores de tablas.
- `renderScheduleTable(scheduleData: Array<Object>) : void` — Tabla semántica `<table>` de horarios.
- `renderCombosTable(combosData: Array<Object>) : void` — Tabla comparativa `<table>` de combos.
- `renderNutritionTable(nutritionData: Array<Object>) : void` — Tabla nutricional.

### Módulo Carrito, Modales & Controlador (Enmanuel)
#### **`CartView` (`js/views/CartView.js`)**
- `init() : void` — Eventos de apertura y cierre.
- `renderCartModal(cartItems, totals, onUpdateQty, onRemove) : void` — Tabla interactiva `<table>` del pedido.
- `updateCartBadge(totalCount: Number) : void` — Contador flotante del icono.
- `showToast(message: String, type: String) : void` — Notificaciones toast.

#### **`AppController` (`js/app.js`)**
- `init() : Promise<void>` — Inicialización global y arranque.
- `setupEventListeners() : void` — Eventos de búsqueda, reservas y checkout.

---

## 🗓️ 5. Hoja de Ruta y Cronograma (4 Días)

| Día | Franyel (Backend) | Carlos (Frontend) | Altagracia (UI/Tablas) | Enmanuel (Cart/App) |
| :--- | :--- | :--- | :--- | :--- |
| **Día 1** | Estructurar `data/menu.json` y probar `MenuModel.js` | Armar HTML base (Header, Hero, Footer) | Definir variables y estilos base CSS | Diseñar HTML del modal del carrito |
| **Día 2** | Desarrollar `CartModel.js` con LocalStorage | Implementar `MenuView.js` para tarjetas | Crear estilos y `TableView.js` (Horarios/Combos) | Conectar botones 'Agregar' con `CartModel` |
| **Día 3** | Agregar filtros y buscador en `MenuModel.js` | Integrar sección `<video>` y fotos de platos | Hacer tablas responsive y pulir tipografía | Crear vista de tabla del carrito en `CartView.js` |
| **Día 4** | Pruebas de integración de datos en `app.js` | Revisión visual de tarjetas y galería | Efectos hover, animaciones y glassmorphism | Formulario de reserva + notificación final |

---

## 🚀 6. Instalación y Ejecución Local

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/TheAsaxBusiness/Restaurant_Sabor_Gourmet_Public.git
   cd Restaurant_Sabor_Gourmet_Public
   ```

2. **Instalar dependencias de Express**:
   ```bash
   npm install
   ```

3. **Iniciar el servidor local**:
   ```bash
   npm start
   ```

4. **Abrir en el navegador**:
   Navega a [http://localhost:3000](http://localhost:3000)

---
*© 2026 Restaurante Sabor Gourmet. Creado con HTML5, CSS3, JavaScript ES6+ & Express.*
