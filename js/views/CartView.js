// ==========================================
// CARTVIEW.JS
// Vista del Carrito de Compras
// Enmanuel - Dev 4
// ==========================================

export default class CartView {
    constructor() {
        this.cartModal = null;
        this.cartContent = null;
        this.cartBadge = null;
        this.cartButton = null;
    }

    // Inicializar referencias y eventos del carrito
    init() {
        this.cartModal = document.getElementById("cart-modal");
        this.cartContent = document.getElementById("cart-content");
        this.cartBadge = document.getElementById("cart-badge");
        this.cartButton = document.getElementById("cart-button");

        // Abrir el carrito
        if (this.cartButton) {
            this.cartButton.addEventListener("click", () => {
                this.openCart();
            });
        }

        // Cerrar el carrito
        const closeButton = document.getElementById("close-cart");

        if (closeButton) {
            closeButton.addEventListener("click", () => {
                this.closeCart();
            });
        }

        // Cerrar el modal al hacer clic fuera
        if (this.cartModal) {
            this.cartModal.addEventListener("click", (event) => {
                if (event.target === this.cartModal) {
                    this.closeCart();
                }
            });
        }
    }

    // Abrir modal
    openCart() {
        if (this.cartModal) {
            this.cartModal.classList.add("active");
        }
    }

    // Cerrar modal
    closeCart() {
        if (this.cartModal) {
            this.cartModal.classList.remove("active");
        }
    }

    // Construir la tabla dinámica del carrito
    renderCartModal(cartItems, totals, onUpdateQty, onRemove) {
        if (!this.cartContent) return;

        // Carrito vacío
        if (!cartItems || cartItems.length === 0) {
            this.cartContent.innerHTML = `
                <div class="empty-cart">
                    <h3>🛒 Tu carrito está vacío</h3>
                    <p>¡Agrega algunos platos deliciosos!</p>
                </div>
            `;
            return;
        }

        // Crear las filas de la tabla
        const rows = cartItems.map((item) => {
            const quantity = Number(item.quantity) || 1;
            const price = Number(item.price || item.precio) || 0;
            const subtotal = price * quantity;

            const name = item.name || item.nombre || "Plato";
            const image = item.image || item.img || "";

            return `
                <tr>
                    <td>
                        <img
                            src="${image}"
                            alt="${name}"
                            class="cart-image"
                        >
                    </td>

                    <td>${name}</td>

                    <td>
                        <div class="quantity-controls">
                            <button
                                class="qty-btn decrease-btn"
                                data-id="${item.id}"
                                data-action="decrease"
                                type="button"
                            >−</button>

                            <span class="quantity">${quantity}</span>

                            <button
                                class="qty-btn increase-btn"
                                data-id="${item.id}"
                                data-action="increase"
                                type="button"
                            >+</button>
                        </div>
                    </td>

                    <td>RD$ ${price.toFixed(2)}</td>

                    <td>RD$ ${subtotal.toFixed(2)}</td>

                    <td>
                        <button
                            class="delete-btn"
                            data-id="${item.id}"
                            type="button"
                            title="Eliminar producto"
                        >
                            🗑️
                        </button>
                    </td>
                </tr>
            `;
        }).join("");

        // Crear la tabla completa
        this.cartContent.innerHTML = `
            <div class="cart-table-container">

                <table class="cart-table">
                    <thead>
                        <tr>
                            <th>Foto</th>
                            <th>Plato</th>
                            <th>Cantidad</th>
                            <th>Precio</th>
                            <th>Subtotal</th>
                            <th>Eliminar</th>
                        </tr>
                    </thead>

                    <tbody>
                        ${rows}
                    </tbody>
                </table>

            </div>

            <div class="cart-totals">
                <p>
                    Subtotal:
                    <strong>RD$ ${Number(totals.subtotal || 0).toFixed(2)}</strong>
                </p>

                <p>
                    ITBIS (18%):
                    <strong>RD$ ${Number(totals.tax || 0).toFixed(2)}</strong>
                </p>

                <h3>
                    Total: RD$ ${Number(totals.total || 0).toFixed(2)}
                </h3>

                <button
                    id="checkout-button"
                    class="checkout-button"
                    type="button"
                >
                    Finalizar Pedido
                </button>
            </div>
        `;

        // Evento para aumentar y disminuir cantidades
        this.cartContent.querySelectorAll(".qty-btn").forEach((button) => {
            button.addEventListener("click", () => {
                const id = button.dataset.id;
                const action = button.dataset.action;

                const item = cartItems.find(
                    (product) => String(product.id) === String(id)
                );

                if (!item) return;

                let newQuantity = Number(item.quantity) || 1;

                if (action === "increase") {
                    newQuantity++;
                } else {
                    newQuantity--;
                }

                // Si llega a 0, eliminar producto
                if (newQuantity < 1) {
                    onRemove(id);
                } else {
                    onUpdateQty(id, newQuantity);
                }
            });
        });

        // Evento para eliminar productos
        this.cartContent.querySelectorAll(".delete-btn").forEach((button) => {
            button.addEventListener("click", () => {
                const id = button.dataset.id;
                onRemove(id);
            });
        });

        // Finalizar pedido
        const checkoutButton =
            this.cartContent.querySelector("#checkout-button");

        if (checkoutButton) {
            checkoutButton.addEventListener("click", () => {
                this.showToast(
                    "¡Gracias por tu pedido! 🍽️",
                    "success"
                );

                this.closeCart();
            });
        }
    }

    // Actualizar contador del carrito
    updateCartBadge(totalCount) {
        if (!this.cartBadge) return;

        this.cartBadge.textContent = totalCount;

        if (totalCount > 0) {
            this.cartBadge.style.display = "flex";
        } else {
            this.cartBadge.style.display = "none";
        }
    }

    // Alias por si en el proyecto se llama updateBadge()
    updateBadge(totalCount) {
        this.updateCartBadge(totalCount);
    }

    // Mostrar notificaciones
    showToast(message, type = "success") {
        const oldToast = document.querySelector(".toast");

        if (oldToast) {
            oldToast.remove();
        }

        const toast = document.createElement("div");

        toast.className = `toast ${type}`;
        toast.textContent = message;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add("show");
        }, 100);

        setTimeout(() => {
            toast.classList.remove("show");

            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }
}
