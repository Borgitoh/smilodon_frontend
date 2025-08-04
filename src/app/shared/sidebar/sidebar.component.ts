import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  menuItems = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard', active: true },
    { path: '/clients', icon: '👥', label: 'Clientes', active: false },
    { path: '/products', icon: '📦', label: 'Produtos', active: false },
    { path: '/invoices', icon: '📄', label: 'Faturas', active: false }
  ];

  constructor(private router: Router) {}

  navigate(path: string): void {
    this.menuItems.forEach(item => item.active = item.path === path);
    this.router.navigate([path]);
  }

  isActive(path: string): boolean {
    return this.router.url === path;
  }
}
