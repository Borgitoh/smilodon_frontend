import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { ClientService } from '../services/client.service';
import { InvoiceService } from '../services/invoice.service';
import { Client, ClientTransaction } from '../models/client.model';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss']
})
export class ClientsComponent implements OnInit {
  clients$!: Observable<Client[]>;
  showAddForm = false;
  showTransactionModal = false;
  selectedClient: Client | null = null;

  newClient = {
    name: '',
    email: '',
    phone: '',
    address: '',
    taxNumber: '',
    balance: 0,
    creditLimit: 50000,
    invoices: []
  };

  newTransaction = {
    type: 'credit' as 'credit' | 'debit',
    amount: 0,
    description: ''
  };

  constructor(
    private clientService: ClientService,
    private invoiceService: InvoiceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.clients$ = this.clientService.getClients();
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) {
      this.resetForm();
    }
  }

  openTransactionModal(client: Client): void {
    this.selectedClient = client;
    this.showTransactionModal = true;
    this.newTransaction = {
      type: 'credit',
      amount: 0,
      description: ''
    };
  }

  closeTransactionModal(): void {
    this.showTransactionModal = false;
    this.selectedClient = null;
  }

  addClient(): void {
    if (this.isFormValid()) {
      this.clientService.addClient(this.newClient);
      this.toggleAddForm();
    }
  }

  addTransaction(): void {
    if (this.selectedClient && this.newTransaction.amount > 0) {
      // If it's a debit transaction, check if it needs to be linked to an invoice
      let transactionData: any = {
        clientId: this.selectedClient.id,
        type: this.newTransaction.type,
        amount: this.newTransaction.amount,
        description: this.newTransaction.description
      };

      // For debit transactions, create an invoice automatically
      if (this.newTransaction.type === 'debit') {
        // Navigate to invoice creation with pre-selected client
        this.router.navigate(['/invoices'], {
          queryParams: {
            clientId: this.selectedClient.id,
            amount: this.newTransaction.amount,
            description: this.newTransaction.description
          }
        });
        this.closeTransactionModal();
        return;
      }

      this.clientService.addTransaction(transactionData);
      this.closeTransactionModal();
    }
  }

  createInvoiceForClient(client: Client): void {
    // Navigate to invoices with pre-selected client
    this.router.navigate(['/invoices'], {
      queryParams: { clientId: client.id }
    });
  }

  private isFormValid(): boolean {
    return this.newClient.name.trim() !== '' &&
           this.newClient.email.trim() !== '' &&
           this.newClient.phone.trim() !== '';
  }

  private resetForm(): void {
    this.newClient = {
      name: '',
      email: '',
      phone: '',
      address: '',
      taxNumber: '',
      balance: 0,
      creditLimit: 50000,
      invoices: []
    };
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA'
    }).format(amount);
  }

  getBalanceStatus(client: Client): string {
    if (client.balance === 0) return 'neutral';
    return client.balance > 0 ? 'debt' : 'credit';
  }

  getBalanceText(client: Client): string {
    const absBalance = Math.abs(client.balance);
    if (client.balance === 0) return 'Sem débito';
    if (client.balance > 0) return `Deve ${this.formatCurrency(absBalance)}`;
    return `Crédito ${this.formatCurrency(absBalance)}`;
  }
}
