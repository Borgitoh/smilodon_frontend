import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductService } from '../services/product.service';
import { Product } from '../models/product.model';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {
  products$!: Observable<Product[]>;
  categories$!: Observable<string[]>;
  showAddForm = false;
  
  newProduct = {
    name: '',
    description: '',
    price: 0,
    category: '',
    stock: 0,
    active: true
  };

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.products$ = this.productService.getProducts();
    this.categories$ = this.productService.getCategories();
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) {
      this.resetForm();
    }
  }

  addProduct(): void {
    if (this.isFormValid()) {
      this.productService.addProduct(this.newProduct);
      this.toggleAddForm();
    }
  }

  updateProduct(id: string, updates: Partial<Product>): void {
    this.productService.updateProduct(id, updates);
  }

  deleteProduct(id: string): void {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      this.productService.deleteProduct(id);
    }
  }

  private isFormValid(): boolean {
    return this.newProduct.name.trim() !== '' && 
           this.newProduct.category.trim() !== '' && 
           this.newProduct.price > 0;
  }

  private resetForm(): void {
    this.newProduct = {
      name: '',
      description: '',
      price: 0,
      category: '',
      stock: 0,
      active: true
    };
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA'
    }).format(amount);
  }

  getStockStatus(product: Product): string {
    if (product.stock === 0) return 'out-of-stock';
    if (product.stock < 10) return 'low-stock';
    return 'in-stock';
  }

  getStockText(product: Product): string {
    if (product.stock === 0) return 'Esgotado';
    if (product.stock < 10) return 'Stock baixo';
    return 'Em stock';
  }
}
