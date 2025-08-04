import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Invoice, InvoiceItem, InvoiceStats } from '../models/invoice.model';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private invoicesSubject = new BehaviorSubject<Invoice[]>([]);
  invoices$ = this.invoicesSubject.asObservable();

  constructor() {
    this.loadMockData();
  }

  private loadMockData(): void {
    const mockInvoices: Invoice[] = [
      {
        id: '1',
        number: 'SMD-001',
        clientId: '1',
        clientName: 'João Silva',
        items: [
          {
            productId: '1',
            productName: 'Laptop Dell Inspiron',
            quantity: 1,
            unitPrice: 120000,
            total: 120000
          }
        ],
        subtotal: 120000,
        tax: 21600,
        total: 141600,
        status: 'paid',
        issueDate: new Date('2024-01-20'),
        dueDate: new Date('2024-02-20'),
        paidDate: new Date('2024-01-25')
      },
      {
        id: '2',
        number: 'SMD-002',
        clientId: '2',
        clientName: 'Maria Santos',
        items: [
          {
            productId: '2',
            productName: 'Monitor Samsung 24"',
            quantity: 2,
            unitPrice: 35000,
            total: 70000
          },
          {
            productId: '4',
            productName: 'Cadeira Ergonómica',
            quantity: 1,
            unitPrice: 45000,
            total: 45000
          }
        ],
        subtotal: 115000,
        tax: 20700,
        total: 135700,
        status: 'sent',
        issueDate: new Date('2024-02-01'),
        dueDate: new Date('2024-03-01')
      }
    ];

    this.invoicesSubject.next(mockInvoices);
  }

  getInvoices(): Observable<Invoice[]> {
    return this.invoices$;
  }

  getInvoiceById(id: string): Observable<Invoice | undefined> {
    return new BehaviorSubject(this.invoicesSubject.value.find(i => i.id === id)).asObservable();
  }

  createInvoice(invoice: Omit<Invoice, 'id' | 'number'>): string {
    const invoiceCount = this.invoicesSubject.value.length + 1;
    const newInvoice: Invoice = {
      ...invoice,
      id: Date.now().toString(),
      number: `SMD-${invoiceCount.toString().padStart(3, '0')}`
    };

    const currentInvoices = this.invoicesSubject.value;
    this.invoicesSubject.next([...currentInvoices, newInvoice]);

    return newInvoice.id;
  }

  updateInvoice(id: string, updates: Partial<Invoice>): void {
    const currentInvoices = this.invoicesSubject.value;
    const updatedInvoices = currentInvoices.map(invoice =>
      invoice.id === id ? { ...invoice, ...updates } : invoice
    );
    this.invoicesSubject.next(updatedInvoices);
  }

  getInvoiceStats(): Observable<InvoiceStats> {
    const invoices = this.invoicesSubject.value;
    const stats: InvoiceStats = {
      totalInvoices: invoices.length,
      totalRevenue: invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0),
      paidInvoices: invoices.filter(i => i.status === 'paid').length,
      pendingInvoices: invoices.filter(i => i.status === 'sent').length,
      overdueInvoices: invoices.filter(i => i.status === 'overdue').length
    };

    return new BehaviorSubject(stats).asObservable();
  }

  markAsPaid(id: string): void {
    this.updateInvoice(id, {
      status: 'paid',
      paidDate: new Date()
    });
  }
}
