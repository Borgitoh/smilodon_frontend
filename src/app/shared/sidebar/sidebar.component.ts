import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  menuItems = [
    { 
      path: '/dashboard', 
      icon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>`, 
      label: 'Dashboard', 
      active: true 
    },
    { 
      path: '/clients', 
      icon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>`, 
      label: 'Clientes', 
      active: false 
    },
    { 
      path: '/products', 
      icon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"/></svg>`, 
      label: 'Produtos', 
      active: false 
    },
    { 
      path: '/invoices', 
      icon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>`, 
      label: 'Faturas', 
      active: false 
    },
    { 
      path: '/users', 
      icon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m3 4.197a4 4 0 11-8 0 4 4 0 018 0z"/></svg>`, 
      label: 'Usuários', 
      active: false 
    }
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
