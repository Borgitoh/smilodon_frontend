import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Client, ClientTransaction } from '../models/client.model';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private clientsSubject = new BehaviorSubject<Client[]>([]);
  private transactionsSubject = new BehaviorSubject<ClientTransaction[]>([]);

  clients$ = this.clientsSubject.asObservable();
  transactions$ = this.transactionsSubject.asObservable();

  constructor() {
    this.loadMockData();
  }

  private loadMockData(): void {
    const mockClients: Client[] = [
      {
        id: '1',
        name: 'João Silva',
        email: 'joao@example.com',
        phone: '+244 923 456 789',
        address: 'Rua da Independência, 123, Luanda',
        taxNumber: '123456789',
        balance: 0,
        creditLimit: 50000,
        invoices: ['1', '2'],
        createdAt: new Date('2024-01-15')
      },
      {
        id: '2',
        name: 'Maria Santos',
        email: 'maria@example.com',
        phone: '+244 924 567 890',
        address: 'Avenida Marginal, 456, Luanda',
        taxNumber: '987654321',
        balance: -15000,
        creditLimit: 75000,
        invoices: ['3'],
        createdAt: new Date('2024-02-20')
      }
    ];

    const mockTransactions: ClientTransaction[] = [
      {
        id: '1',
        clientId: '1',
        type: 'debit',
        amount: 25000,
        description: 'Fatura #001 - Produtos diversos',
        invoiceId: '1',
        date: new Date('2024-01-20')
      },
      {
        id: '2',
        clientId: '1',
        type: 'credit',
        amount: 25000,
        description: 'Pagamento fatura #001',
        date: new Date('2024-01-25')
      }
    ];

    this.clientsSubject.next(mockClients);
    this.transactionsSubject.next(mockTransactions);
  }

  getClients(): Observable<Client[]> {
    return this.clients$;
  }

  getClientById(id: string): Observable<Client | undefined> {
    return new BehaviorSubject(this.clientsSubject.value.find(c => c.id === id)).asObservable();
  }

  addClient(client: Omit<Client, 'id' | 'createdAt'>): void {
    const newClient: Client = {
      ...client,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    
    const currentClients = this.clientsSubject.value;
    this.clientsSubject.next([...currentClients, newClient]);
  }

  updateClient(id: string, updates: Partial<Client>): void {
    const currentClients = this.clientsSubject.value;
    const updatedClients = currentClients.map(client =>
      client.id === id ? { ...client, ...updates } : client
    );
    this.clientsSubject.next(updatedClients);
  }

  addTransaction(transaction: Omit<ClientTransaction, 'id' | 'date'>): void {
    const newTransaction: ClientTransaction = {
      ...transaction,
      id: Date.now().toString(),
      date: new Date()
    };

    // Update client balance
    const currentClients = this.clientsSubject.value;
    const updatedClients = currentClients.map(client => {
      if (client.id === transaction.clientId) {
        const balanceChange = transaction.type === 'credit' ? -transaction.amount : transaction.amount;
        return { ...client, balance: client.balance + balanceChange };
      }
      return client;
    });

    const currentTransactions = this.transactionsSubject.value;
    this.clientsSubject.next(updatedClients);
    this.transactionsSubject.next([...currentTransactions, newTransaction]);
  }

  getClientTransactions(clientId: string): Observable<ClientTransaction[]> {
    const clientTransactions = this.transactionsSubject.value.filter(t => t.clientId === clientId);
    return new BehaviorSubject(clientTransactions).asObservable();
  }
}
