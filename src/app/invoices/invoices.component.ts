import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { InvoiceService } from '../services/invoice.service';
import { ClientService } from '../services/client.service';
import { ProductService } from '../services/product.service';
import { Invoice, InvoiceItem } from '../models/invoice.model';
import { Client } from '../models/client.model';
import { Product } from '../models/product.model';

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
