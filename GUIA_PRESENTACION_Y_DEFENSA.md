# 🎓 Guía de Presentación & Defensa Académica - Restaurante Sabor Gourmet

Este documento contiene la estructura recomendada para la exposición en vivo y la guía de respuestas clave para defender el proyecto ante preguntas de evaluación.

---

## 🎤 1. Guía de Presentación en Vivo (5 a 8 minutos)

### Paso 1: Introducción y Selección Tecnológica (1 min)
> *"Buenas tardes profesor y compañeros. Les presento el proyecto **Restaurante Sabor Gourmet**, una aplicación web integral para la gestión de restaurantes, pedidos en línea, reservas de salón y administración en tiempo real."*
>
> *"Decidimos construir la aplicación utilizando **JavaScript ES6 Vanilla** en el Frontend, **HTML5/CSS3** con diseño adaptativo, y un servidor Backend en **Node.js con Express**."*

### Paso 2: Demostración en Vivo - Perfil Cliente (3 mins)
1. **Inicio de Sesión:**
   - Credenciales: `carlos@cliente.com` / `123456`.
   - *Punto a destacar:* Mostrar que la aplicación es una **Single Page Application (SPA)** y el login se ejecuta sin recargar la página.
2. **Navegación & Menú Interactivo:**
   - Filtrar platos por categorías (*Platos Fuertes, Postres, Bebidas*).
   - Realizar una búsqueda en vivo en la barra superior.
   - Abrir el modal de detalle gastronómico.
3. **Carrito de Compras & Pedidos:**
   - Agregar 2 platos al carrito.
   - Abrir el modal del carrito, ajustar cantidades y confirmar el pedido.
4. **Factura Fiscal con ITBIS (18%):**
   - Ir a la pestaña **"Mis Pedidos"**.
   - Abrir la factura oficial y mostrar el desglose de ITBIS (18%) y total.
5. **Reserva de Mesas:**
   - Ir a la pestaña **"Reservas"**, mostrar el mapa de estado de salón en tiempo real y hacer una reserva.

### Paso 3: Demostración en Vivo - Perfil Administrador (3 mins)
1. Cerrar sesión y acceder como Administrador (`admin@sabor.com` / `admin123`).
2. **Dashboard & KPIs:**
   - Mostrar los gráficos interactivos de ventas, platos populares y tiempos de cocina (*Chart.js*).
3. **Mantenimiento CRUD Completo:**
   - **Platos del Menú:** Mostrar el botón `+ Agregar Plato`, editar el precio de un plato existente y mostrar el aviso Toast de confirmación.
   - **Mesas del Salón:** Cambiar el estado de una mesa en tiempo real.
   - **Clientes CRM, Horarios, Combos y Nutrición:** Mostrar las tablas con sus respectivos botones de acción (`Editar` y `Eliminar`).

---

## 🧠 2. Guía de Preguntas Posibles & Respuestas de Defensa

### ❓ P1: ¿Qué patrón de arquitectura utilizaron en el Frontend?
> **Respuesta Oficial:**
> *"Utilizamos el patrón **MVC (Modelo-Vista-Controlador)**:*
> * **Modelos (`js/models/`):** Gestionan la lógica de datos y las solicitudes HTTP `fetch` a las rutas REST (`MenuModel`, `TableModel`, `OrderModel`, `AuthModel`, `DashboardModel`).
> * **Vistas (`js/views/`):** Se encargan exclusivamente de manipular el DOM y renderizar componentes visuales (`MenuView`, `TableView`, `DashboardView`, `CartView`, `InvoiceView`).
> * **Controlador (`js/controllers/AppController.js`):** Escucha los eventos del usuario, procesa las reglas de negocio e integra modelos y vistas."*

---

### ❓ P2: ¿Por qué la aplicación no recarga la página al cambiar de vista o enviar un formulario?
> **Respuesta Oficial:**
> *"Porque la aplicación está diseñada como una **Single Page Application (SPA)**. Interceptamos los eventos de envío de los formularios con `e.preventDefault()` y `onsubmit="return false;"`. La navegación entre pantallas altera la visibilidad de los contenedores (`view-page`) mediante clases CSS (`.active`), y la actualización de datos se realiza de forma asíncrona mediante **AJAX (Fetch API / Promises)**."*

---

### ❓ P3: ¿Cómo manejan la persistencia de datos en el servidor sin usar una BD SQL o NoSQL?
> **Respuesta Oficial:**
> *"Desarrollamos una API RESTful en **Node.js con Express** que utiliza el módulo nativo de Node.js `fs/promises` para escribir y leer de archivos JSON estructurados (`data/menu.json`, `data/tables.json`, `data/orders.json`, `data/users.json`, `data/customers.json`). Esto garantiza persistencia de datos real ante reinicios del servidor sin la sobrecarga de instalar motores de bases de datos externos."*

---

### ❓ P4: ¿Cómo controlan la seguridad y la diferenciación de roles entre Cliente y Admin?
> **Respuesta Oficial:**
> *"Implementamos **Control de Acceso Basado en Roles (RBAC)**:*
> * El endpoint `/api/login` autentica las credenciales.
> * `AuthModel` mantiene el estado del usuario activo.
> * El controlador aplica restricciones visuales y de rutas (`.nav-admin-only` vs `.nav-customer-only`). Si un cliente intenta forzar la navegación al panel de administración, el sistema bloquea el acceso y lo redirige automáticamente al inicio."*

---

### ❓ P5: ¿Qué validaciones de datos incorporaron en los formularios?
> **Respuesta Oficial:**
> *"Implementamos un esquema de validación en dos niveles:*
> 1. **Cliente:** Expresiones regulares (`RegEx`) para correos y teléfonos, restricción de comensales entre 1 y 20 personas, precios positivos `> 0`, claves de 6+ caracteres y bloqueo de fechas pasadas en reservas.
> 2. **Servidor:** El API de Express valida los tipos de datos y la integridad antes de almacenar en los JSON, respondiendo con códigos de estado HTTP apropiados (`400 Bad Request`, `401 Unauthorized`, `200 OK`)."*

---

### ❓ P6: ¿Cómo realizan el cálculo de los impuestos y comprobante fiscal?
> **Respuesta Oficial:**
> *"El `CartModel` y `InvoiceView` multiplican `precio * cantidad` para obtener el subtotal. Sobre ese monto se aplica el **18% del ITBIS** (Impuesto a las Transferencias de Bienes Industrializados y Servicios de República Dominicana), generando una factura con número de comprobante único lista para previsualizar e imprimir."*

---

## 📌 3. Credenciales Rápidas para Demostración

| Rol | Correo Electrónico | Contraseña | Vistas Accesibles |
| :--- | :--- | :--- | :--- |
| **Cliente** | `carlos@cliente.com` | `123456` | Inicio, Menú, Reservas, Horarios/Combos, Mis Pedidos |
| **Administrador** | `admin@sabor.com` | `admin123` | Menú, Reservas, Horarios/Combos, Panel Admin & CRM |

---

## ⚡ 4. Comandos de Inicio Servidor

```bash
# Iniciar el servidor Express en puerto 3000
npm start
```
* **URL Principal:** `http://localhost:3000`
