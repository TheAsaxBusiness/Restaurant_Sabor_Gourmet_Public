// ==========================================
// CARTVIEW.JS - VISTA DEL CARRITO DE COMPRAS
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
                <div class="empty-cart" style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
                    <h3 style="color: var(--color-primary); font-size: 1.5rem; margin-bottom: 0.5rem;"><i class="fa-solid fa-cart-flatbed-suitcases"></i> Tu carrito está vacío</h3>
                    <p>¡Explora nuestro menú gastronómico y agrega tus platos favoritos!</p>
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
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);">
                    <td style="padding: 0.75rem 0.5rem;">
                        <img
                            src="${image}"
                            alt="${name}"
                            class="cart-image"
                            style="width: 50px; height: 50px; object-fit: cover; border-radius: 6px;"
                        >
                    </td>

                    <td style="padding: 0.75rem 0.5rem; font-weight: 600; color: var(--text-main);">${name}</td>

                    <td style="padding: 0.75rem 0.5rem;">
                        <div class="quantity-controls" style="display: flex; align-items: center; gap: 0.5rem;">
                            <button
                                class="qty-btn decrease-btn"
                                data-id="${item.id}"
                                data-action="decrease"
                                type="button"
                                style="background: var(--bg-surface-elevated); color: var(--text-main); border: 1px solid var(--color-primary); width: 26px; height: 26px; border-radius: 50%; font-weight: 700; cursor: pointer;"
                            >−</button>

                            <span class="quantity" style="font-weight: 700; color: var(--color-primary);">${quantity}</span>

                            <button
                                class="qty-btn increase-btn"
                                data-id="${item.id}"
                                data-action="increase"
                                type="button"
                                style="background: var(--bg-surface-elevated); color: var(--text-main); border: 1px solid var(--color-primary); width: 26px; height: 26px; border-radius: 50%; font-weight: 700; cursor: pointer;"
                            >+</button>
                        </div>
                    </td>

                    <td style="padding: 0.75rem 0.5rem; color: var(--text-muted); font-size: 0.9rem;">RD$ ${price.toFixed(2)}</td>

                    <td style="padding: 0.75rem 0.5rem; font-weight: 700; color: var(--color-secondary);">RD$ ${subtotal.toFixed(2)}</td>

                    <td style="padding: 0.75rem 0.5rem; text-align: center;">
                        <button
                            class="delete-btn"
                            data-id="${item.id}"
                            type="button"
                            title="Eliminar producto"
                            style="background: transparent; color: #E74C3C; border: none; font-size: 1.1rem; cursor: pointer;"
                        >
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join("");

        // Crear la tabla completa
        this.cartContent.innerHTML = `
            <div class="cart-table-container" style="overflow-x: auto; margin-bottom: 1.5rem;">

                <table class="cart-table" style="width: 100%; border-collapse: collapse; text-align: left;">
                    <thead>
                        <tr style="border-bottom: 2px solid var(--color-primary); color: var(--color-primary);">
                            <th style="padding: 0.5rem;">Foto</th>
                            <th style="padding: 0.5rem;">Plato</th>
                            <th style="padding: 0.5rem;">Cant.</th>
                            <th style="padding: 0.5rem;">Precio</th>
                            <th style="padding: 0.5rem;">Subtotal</th>
                            <th style="padding: 0.5rem;"></th>
                        </tr>
                    </thead>

                    <tbody>
                        ${rows}
                    </tbody>
                </table>

            </div>

            <div class="cart-totals" style="background: var(--bg-primary); border: 1px solid rgba(212,175,55,0.2); padding: 1.25rem; border-radius: var(--border-radius-md);">
                <p style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; color: var(--text-muted);">
                    Subtotal:
                    <strong style="color: var(--text-main);">RD$ ${Number(totals.subtotal || 0).toFixed(2)}</strong>
                </p>

                <p style="display: flex; justify-content: space-between; margin-bottom: 0.75rem; color: var(--text-muted);">
                    ITBIS (18%):
                    <strong style="color: var(--text-main);">RD$ ${Number(totals.tax || 0).toFixed(2)}</strong>
                </p>

                <h3 style="display: flex; justify-content: space-between; font-size: 1.4rem; color: var(--color-secondary); border-top: 1px solid rgba(255,255,255,0.1); padding-top: 0.75rem; margin-bottom: 1.25rem;">
                    <span>Total:</span>
                    <span>RD$ ${Number(totals.total || 0).toFixed(2)}</span>
                </h3>

                <button
                    id="checkout-button"
                    class="checkout-button btn-primary"
                    type="button"
                    style="width: 100%; font-size: 1.05rem;"
                >
                    <i class="fa-solid fa-credit-card"></i> Finalizar Pedido
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
                    "¡Gracias por tu pedido en Sabor Gourmet!",
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
        const iconClass = type === 'success' ? 'fa-circle-check' : 'fa-circle-info';

        toast.className = `toast ${type}`;
        toast.innerHTML = `<i class="fa-solid ${iconClass}" style="color: var(--color-primary); margin-right: 0.5rem;"></i> ${message}`;

        const container = document.getElementById("toast-container") || document.body;
        container.appendChild(toast);

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
