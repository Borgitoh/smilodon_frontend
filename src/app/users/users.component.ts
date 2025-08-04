import { Component, OnInit } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  department: string;
  phone: string;
  status: 'active' | 'inactive';
  lastLogin: Date;
  createdAt: Date;
}

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  private usersSubject = new BehaviorSubject<User[]>([]);
  users$ = this.usersSubject.asObservable();
  showAddForm = false;
  
  newUser = {
    name: '',
    email: '',
    role: 'user' as 'admin' | 'manager' | 'user',
    department: '',
    phone: '',
    status: 'active' as 'active' | 'inactive'
  };

  constructor() {}

  ngOnInit(): void {
    this.loadMockUsers();
  }

  private loadMockUsers(): void {
    const mockUsers: User[] = [
      {
        id: '1',
        name: 'João Silva',
        email: 'joao@smilodon.com',
        role: 'admin',
        department: 'TI',
        phone: '+244 923 456 789',
        status: 'active',
        lastLogin: new Date('2024-01-15T10:30:00'),
        createdAt: new Date('2024-01-01')
      },
      {
        id: '2',
        name: 'Maria Santos',
        email: 'maria@smilodon.com',
        role: 'manager',
        department: 'Vendas',
        phone: '+244 924 567 890',
        status: 'active',
        lastLogin: new Date('2024-01-14T15:45:00'),
        createdAt: new Date('2024-01-05')
      },
      {
        id: '3',
        name: 'Pedro Costa',
        email: 'pedro@smilodon.com',
        role: 'user',
        department: 'Financeiro',
        phone: '+244 925 678 901',
        status: 'inactive',
        lastLogin: new Date('2024-01-10T09:15:00'),
        createdAt: new Date('2024-01-10')
      }
    ];
    
    this.usersSubject.next(mockUsers);
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) {
      this.resetForm();
    }
  }

  addUser(): void {
    if (this.isFormValid()) {
      const newUser: User = {
        ...this.newUser,
        id: Date.now().toString(),
        lastLogin: new Date(),
        createdAt: new Date()
      };
      
      const currentUsers = this.usersSubject.value;
      this.usersSubject.next([...currentUsers, newUser]);
      this.toggleAddForm();
    }
  }

  updateUserStatus(userId: string, status: 'active' | 'inactive'): void {
    const currentUsers = this.usersSubject.value;
    const updatedUsers = currentUsers.map(user =>
      user.id === userId ? { ...user, status } : user
    );
    this.usersSubject.next(updatedUsers);
  }

  deleteUser(userId: string): void {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      const currentUsers = this.usersSubject.value;
      const filteredUsers = currentUsers.filter(user => user.id !== userId);
      this.usersSubject.next(filteredUsers);
    }
  }

  private isFormValid(): boolean {
    return this.newUser.name.trim() !== '' && 
           this.newUser.email.trim() !== '' && 
           this.newUser.department.trim() !== '';
  }

  private resetForm(): void {
    this.newUser = {
      name: '',
      email: '',
      role: 'user',
      department: '',
      phone: '',
      status: 'active'
    };
  }

  getRoleText(role: string): string {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'manager': return 'Gerente';
      default: return 'Usuário';
    }
  }

  getRoleClass(role: string): string {
    switch (role) {
      case 'admin': return 'admin';
      case 'manager': return 'manager';
      default: return 'user';
    }
  }

  getStatusText(status: string): string {
    return status === 'active' ? 'Ativo' : 'Inativo';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleString('pt-BR');
  }
}
