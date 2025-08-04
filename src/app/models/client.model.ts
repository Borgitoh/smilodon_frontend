export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  taxNumber?: string;
  balance: number;
  creditLimit: number;
  invoices: string[];
  createdAt: Date;
}

export interface ClientTransaction {
  id: string;
  clientId: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  invoiceId?: string;
  date: Date;
}
