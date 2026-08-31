// ==========================================
// INVOICEVIEW.JS - PREVISUALIZACIÓN DE FACTURA Y EXPORTACIÓN PDF
// Enmanuel / Carlos - Devs
// ==========================================

export default class InvoiceView {
  constructor() {
    this.invoiceModal = null;
    this.invoiceContent = null;
    this.closeBtn = null;
    this.printBtn = null;
  }

  init() {
    this.invoiceModal = document.getElementById('invoice-modal');
    this.invoiceContent = document.getElementById('invoice-modal-content');
    this.closeBtn = document.getElementById('close-invoice-modal');
    this.printBtn = document.getElementById('print-invoice-btn');

    if (this.closeBtn && this.invoiceModal) {
      this.closeBtn.addEventListener('click', () => this.closeInvoice());
      this.invoiceModal.addEventListener('click', (e) => {
        if (e.target === this.invoiceModal) this.closeInvoice();
      });
    }

    if (this.printBtn) {
      this.printBtn.addEventListener('click', () => {
        window.print();
      });
    }
  }

  // Previsualizar la Factura Fiscal Formal del Pedido
  renderInvoice(order) {
    if (!this.invoiceContent || !this.invoiceModal || !order) return;

    const { id, customerName, customerEmail, items, totals, ncf, createdAt } = order;

    const itemRows = (items || []).map(item => {
      const price = Number(item.price) || 0;
      const qty = Number(item.quantity) || 1;
      const subtotal = price * qty;
      return `
        <tr>
          <td style="padding: 0.6rem; border-bottom: 1px solid #eee;">${qty}</td>
          <td style="padding: 0.6rem; border-bottom: 1px solid #eee;">${item.name}</td>
          <td style="padding: 0.6rem; border-bottom: 1px solid #eee; text-align: right;">RD$ ${price.toFixed(2)}</td>
          <td style="padding: 0.6rem; border-bottom: 1px solid #eee; text-align: right;">RD$ ${subtotal.toFixed(2)}</td>
        </tr>
      `;
    }).join('');

    this.invoiceContent.innerHTML = `
      <div id="printable-invoice" class="printable-invoice-body" style="background: #fff; color: #222; padding: 2rem; border-radius: 8px; font-family: 'Inter', sans-serif;">
        
        <!-- Encabezado Institucional -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #D4AF37; padding-bottom: 1rem; margin-bottom: 1.5rem;">
          <div>
            <h2 style="color: #121212; font-family: 'Playfair Display', serif; font-size: 1.8rem; margin: 0;">Sabor Gourmet</h2>
            <p style="font-size: 0.85rem; color: #555; margin-top: 0.2rem;">Restaurante & Alta Cocina Dominicano</p>
            <p style="font-size: 0.8rem; color: #666;">RNC: 130-98241-9 | Tel: (809) 555-0199</p>
            <p style="font-size: 0.8rem; color: #666;">Av. Winston Churchill #45, Santo Domingo</p>
          </div>
          <div style="text-align: right;">
            <span style="background: #D4AF37; color: #121212; padding: 0.3rem 0.8rem; border-radius: 4px; font-weight: 700; font-size: 0.85rem;">FACTURA FISCAL</span>
            <p style="font-size: 0.9rem; font-weight: 700; margin-top: 0.5rem; color: #121212;">NCF: ${ncf || 'B0100001042'}</p>
            <p style="font-size: 0.85rem; color: #555;">No. Pedido: <strong>${id}</strong></p>
            <p style="font-size: 0.8rem; color: #777;">Fecha: ${createdAt || new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <!-- Datos del Cliente -->
        <div style="background: #f9f9f9; padding: 1rem; border-radius: 6px; margin-bottom: 1.5rem; border: 1px solid #eaee;">
          <p style="font-size: 0.9rem; margin: 0;"><strong>Cliente:</strong> ${customerName || 'Cliente Sabor'}</p>
          <p style="font-size: 0.85rem; color: #555; margin-top: 0.2rem;"><strong>Email:</strong> ${customerEmail || 'cliente@sabor.com'}</p>
          <p style="font-size: 0.85rem; color: #555; margin-top: 0.2rem;"><strong>Tipo de Comprobante:</strong> Consumidor Final (18% ITBIS)</p>
        </div>

        <!-- Tabla de Raciones -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 1.5rem; font-size: 0.9rem;">
          <thead>
            <tr style="background: #121212; color: #D4AF37;">
              <th style="padding: 0.6rem; text-align: left;">Cant.</th>
              <th style="padding: 0.6rem; text-align: left;">Descripción del Plato</th>
              <th style="padding: 0.6rem; text-align: right;">Precio Unit.</th>
              <th style="padding: 0.6rem; text-align: right;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
          </tbody>
        </table>

        <!-- Totales de Facturación -->
        <div style="display: flex; justify-content: flex-end; margin-bottom: 1.5rem;">
          <div style="width: 260px; background: #f9f9f9; padding: 1rem; border-radius: 6px; border: 1px solid #ddd;">
            <p style="display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 0.4rem;">
              <span>Subtotal:</span>
              <strong>RD$ ${Number(totals.subtotal || 0).toFixed(2)}</strong>
            </p>
            <p style="display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 0.6rem; color: #555;">
              <span>ITBIS (18%):</span>
              <strong>RD$ ${Number(totals.tax || 0).toFixed(2)}</strong>
            </p>
            <h3 style="display: flex; justify-content: space-between; font-size: 1.2rem; color: #E65C00; border-top: 2px solid #121212; padding-top: 0.5rem; margin: 0;">
              <span>TOTAL:</span>
              <span>RD$ ${Number(totals.total || 0).toFixed(2)}</span>
            </h3>
          </div>
        </div>

        <!-- Pie Institucional -->
        <div style="text-align: center; border-top: 1px dashed #ccc; padding-top: 1rem; color: #777; font-size: 0.8rem;">
          <p>¡Gracias por preferir Restaurante Sabor Gourmet! 🍽️</p>
          <p style="margin-top: 0.2rem;">Esta factura constituye documento fiscal oficial emitido conforme a la norma de la DGII.</p>
        </div>

      </div>
    `;

    this.invoiceModal.classList.add('active');
  }

  closeInvoice() {
    if (this.invoiceModal) {
      this.invoiceModal.classList.remove('active');
    }
  }
}
