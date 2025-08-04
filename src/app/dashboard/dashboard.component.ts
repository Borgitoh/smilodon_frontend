import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { InvoiceService } from '../services/invoice.service';
import { ClientService } from '../services/client.service';
import { ProductService } from '../services/product.service';
import { InvoiceStats } from '../models/invoice.model';
import { Client } from '../models/client.model';
import { Product } from '../models/product.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  invoiceStats$!: Observable<InvoiceStats>;
  clients$!: Observable<Client[]>;
  products$!: Observable<Product[]>;
  
  totalClients = 0;
  totalProducts = 0;
  lowStockProducts = 0;

  constructor(
    private invoiceService: InvoiceService,
    private clientService: ClientService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.invoiceStats$ = this.invoiceService.getInvoiceStats();
    this.clients$ = this.clientService.getClients();
    this.products$ = this.productService.getProducts();

    this.clients$.subscribe(clients => {
      this.totalClients = clients.length;
    });

    this.products$.subscribe(products => {
      this.totalProducts = products.length;
      this.lowStockProducts = products.filter(p => p.stock < 10).length;
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA'
    }).format(amount);
  }
}
