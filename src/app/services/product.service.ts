import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsSubject = new BehaviorSubject<Product[]>([]);
  products$ = this.productsSubject.asObservable();

  constructor() {
    this.loadMockData();
  }

  private loadMockData(): void {
    const mockProducts: Product[] = [
      {
        id: '1',
        name: 'Laptop Dell Inspiron',
        description: 'Laptop para uso empresarial com 8GB RAM e 256GB SSD',
        price: 120000,
        category: 'Informática',
        stock: 15,
        active: true,
        createdAt: new Date('2024-01-10')
      },
      {
        id: '2',
        name: 'Monitor Samsung 24"',
        description: 'Monitor Full HD para escritório',
        price: 35000,
        category: 'Informática',
        stock: 25,
        active: true,
        createdAt: new Date('2024-01-12')
      },
      {
        id: '3',
        name: 'Mesa de Escritório',
        description: 'Mesa executiva em madeira premium',
        price: 85000,
        category: 'Mobiliário',
        stock: 8,
        active: true,
        createdAt: new Date('2024-01-15')
      },
      {
        id: '4',
        name: 'Cadeira Ergonómica',
        description: 'Cadeira de escritório com apoio lombar',
        price: 45000,
        category: 'Mobiliário',
        stock: 12,
        active: true,
        createdAt: new Date('2024-01-18')
      }
    ];

    this.productsSubject.next(mockProducts);
  }

  getProducts(): Observable<Product[]> {
    return this.products$;
  }

  getProductById(id: string): Observable<Product | undefined> {
    return new BehaviorSubject(this.productsSubject.value.find(p => p.id === id)).asObservable();
  }

  addProduct(product: Omit<Product, 'id' | 'createdAt'>): void {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    
    const currentProducts = this.productsSubject.value;
    this.productsSubject.next([...currentProducts, newProduct]);
  }

  updateProduct(id: string, updates: Partial<Product>): void {
    const currentProducts = this.productsSubject.value;
    const updatedProducts = currentProducts.map(product =>
      product.id === id ? { ...product, ...updates } : product
    );
    this.productsSubject.next(updatedProducts);
  }

  deleteProduct(id: string): void {
    const currentProducts = this.productsSubject.value;
    const filteredProducts = currentProducts.filter(product => product.id !== id);
    this.productsSubject.next(filteredProducts);
  }

  getCategories(): Observable<string[]> {
    const categories = [...new Set(this.productsSubject.value.map(p => p.category))];
    return new BehaviorSubject(categories).asObservable();
  }
}
