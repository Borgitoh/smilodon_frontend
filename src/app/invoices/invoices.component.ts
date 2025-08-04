import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { InvoiceService } from '../services/invoice.service';
import { ClientService } from '../services/client.service';
import { ProductService } from '../services/product.service';
import { Invoice, InvoiceItem } from '../models/invoice.model';
import { Client } from '../models/client.model';
import { Product } from '../models/product.model';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-invoices',
  templateUrl: './invoices.component.html',
  styleUrls: ['./invoices.component.scss']
})
export class InvoicesComponent implements OnInit {
  invoices$!: Observable<Invoice[]>;
  clients$!: Observable<Client[]>;
  products$!: Observable<Product[]>;
  showCreateForm = false;
  selectedInvoice: Invoice | null = null;
  showPrintModal = false;

  newInvoice = {
    clientId: '',
    clientName: '',
    items: [] as InvoiceItem[],
    subtotal: 0,
    tax: 0,
    total: 0,
    status: 'draft' as 'draft' | 'sent' | 'paid' | 'overdue',
    issueDate: new Date(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
  };

  newItem = {
    productId: '',
    productName: '',
    quantity: 1,
    unitPrice: 0,
    total: 0
  };

  constructor(
    private invoiceService: InvoiceService,
    private clientService: ClientService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.invoices$ = this.invoiceService.getInvoices();
    this.clients$ = this.clientService.getClients();
    this.products$ = this.productService.getProducts();
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    if (!this.showCreateForm) {
      this.resetForm();
    }
  }

  onClientChange(): void {
    this.clientService.getClientById(this.newInvoice.clientId).subscribe(client => {
      if (client) {
        this.newInvoice.clientName = client.name;
      }
    });
  }

  onProductChange(): void {
    this.productService.getProductById(this.newItem.productId).subscribe(product => {
      if (product) {
        this.newItem.productName = product.name;
        this.newItem.unitPrice = product.price;
        this.calculateItemTotal();
      }
    });
  }

  calculateItemTotal(): void {
    this.newItem.total = this.newItem.quantity * this.newItem.unitPrice;
  }

  addItem(): void {
    if (this.newItem.productId && this.newItem.quantity > 0) {
      this.newInvoice.items.push({ ...this.newItem });
      this.calculateInvoiceTotal();
      this.resetItem();
    }
  }

  removeItem(index: number): void {
    this.newInvoice.items.splice(index, 1);
    this.calculateInvoiceTotal();
  }

  calculateInvoiceTotal(): void {
    this.newInvoice.subtotal = this.newInvoice.items.reduce((sum, item) => sum + item.total, 0);
    this.newInvoice.tax = this.newInvoice.subtotal * 0.18; // 18% tax
    this.newInvoice.total = this.newInvoice.subtotal + this.newInvoice.tax;
  }

  createInvoice(): void {
    if (this.newInvoice.clientId && this.newInvoice.items.length > 0) {
      this.invoiceService.createInvoice(this.newInvoice);
      this.toggleCreateForm();
    }
  }

  viewInvoice(invoice: Invoice): void {
    this.selectedInvoice = invoice;
  }

  printInvoice(invoice: Invoice): void {
    this.selectedInvoice = invoice;
    this.showPrintModal = true;

    // Wait for modal to render then print
    setTimeout(() => {
      window.print();
    }, 100);
  }

  printDocument(): void {
    window.print();
  }

  downloadInvoicePDF(invoice: Invoice): void {
    const pdf = new jsPDF();

    // Set font
    pdf.setFont('helvetica');

    // Company header
    pdf.setFontSize(24);
    pdf.setTextColor(30, 58, 138); // Primary blue
    pdf.text('SMILODON', 20, 30);

    pdf.setFontSize(12);
    pdf.setTextColor(107, 114, 128); // Gray
    pdf.text('Sistema de Faturação', 20, 40);
    pdf.text('Luanda, Angola', 20, 50);
    pdf.text('info@smilodon.com', 20, 60);

    // Invoice header
    pdf.setFontSize(20);
    pdf.setTextColor(31, 41, 55); // Dark gray
    pdf.text('FATURA', 150, 30);

    pdf.setFontSize(10);
    pdf.setTextColor(107, 114, 128);
    pdf.text(`Número: ${invoice.number}`, 150, 45);
    pdf.text(`Data: ${this.formatDate(invoice.issueDate)}`, 150, 55);
    pdf.text(`Vencimento: ${this.formatDate(invoice.dueDate)}`, 150, 65);

    // Line separator
    pdf.setDrawColor(226, 232, 240);
    pdf.line(20, 75, 190, 75);

    // Client info
    pdf.setFontSize(12);
    pdf.setTextColor(31, 41, 55);
    pdf.text('Faturar a:', 20, 90);

    pdf.setFontSize(11);
    pdf.setTextColor(75, 85, 99);
    pdf.text(invoice.clientName, 20, 100);

    // Items table header
    let yPosition = 120;
    pdf.setFontSize(10);
    pdf.setTextColor(31, 41, 55);
    pdf.setFillColor(248, 250, 252);
    pdf.rect(20, yPosition - 5, 170, 10, 'F');

    pdf.text('Produto', 25, yPosition);
    pdf.text('Qtd', 110, yPosition);
    pdf.text('Preço Unit.', 130, yPosition);
    pdf.text('Total', 165, yPosition);

    // Items
    yPosition += 15;
    pdf.setTextColor(75, 85, 99);

    invoice.items.forEach((item, index) => {
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 30;
      }

      pdf.text(item.productName, 25, yPosition);
      pdf.text(item.quantity.toString(), 110, yPosition);
      pdf.text(this.formatCurrencyForPDF(item.unitPrice), 130, yPosition);
      pdf.text(this.formatCurrencyForPDF(item.total), 165, yPosition);

      yPosition += 10;
    });

    // Totals
    yPosition += 10;
    pdf.setDrawColor(226, 232, 240);
    pdf.line(120, yPosition, 190, yPosition);

    yPosition += 15;
    pdf.setFontSize(10);
    pdf.text('Subtotal:', 130, yPosition);
    pdf.text(this.formatCurrencyForPDF(invoice.subtotal), 165, yPosition);

    yPosition += 10;
    pdf.text('IVA (18%):', 130, yPosition);
    pdf.text(this.formatCurrencyForPDF(invoice.tax), 165, yPosition);

    yPosition += 10;
    pdf.setDrawColor(31, 41, 55);
    pdf.line(120, yPosition, 190, yPosition);

    yPosition += 15;
    pdf.setFontSize(12);
    pdf.setTextColor(31, 41, 55);
    pdf.text('Total:', 130, yPosition);
    pdf.text(this.formatCurrencyForPDF(invoice.total), 165, yPosition);

    // Footer
    pdf.setFontSize(8);
    pdf.setTextColor(107, 114, 128);
    pdf.text('Obrigado pela preferência!', 20, yPosition + 30);

    // Save the PDF
    pdf.save(`Fatura_${invoice.number}.pdf`);
  }

  private formatCurrencyForPDF(amount: number): string {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA'
    }).format(amount);
  }

  closePrintModal(): void {
    this.showPrintModal = false;
    this.selectedInvoice = null;
  }

  markAsPaid(invoiceId: string): void {
    this.invoiceService.markAsPaid(invoiceId);
  }

  private resetForm(): void {
    this.newInvoice = {
      clientId: '',
      clientName: '',
      items: [],
      subtotal: 0,
      tax: 0,
      total: 0,
      status: 'draft',
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    };
    this.resetItem();
  }

  private resetItem(): void {
    this.newItem = {
      productId: '',
      productName: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    };
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA'
    }).format(amount);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'paid': return 'paid';
      case 'sent': return 'pending';
      case 'overdue': return 'overdue';
      default: return 'draft';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'paid': return 'Paga';
      case 'sent': return 'Enviada';
      case 'overdue': return 'Vencida';
      default: return 'Rascunho';
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }
}
