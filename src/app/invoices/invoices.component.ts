import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { InvoiceService } from '../services/invoice.service';
import { ClientService } from '../services/client.service';
import { ProductService } from '../services/product.service';
import { Invoice } from '../models/invoice.model';
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
  }

  viewInvoice(invoice: Invoice): void {
    this.selectedInvoice = invoice;
  }

  markAsPaid(invoiceId: string): void {
    this.invoiceService.markAsPaid(invoiceId);
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
