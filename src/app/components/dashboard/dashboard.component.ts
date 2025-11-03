import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../model/user';
import { UserAuthService } from '../../services/user-auth.service';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: []
})
export class DashboardComponent implements OnInit {
  user!: User;

  customers: string[] = [];
  products: string[] = [];
  addresses: string[] = [];

  isLoading = false;

  constructor(
    public userAuthService: UserAuthService,
    public dataService: DataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    if (!token) {
      this.router.navigateByUrl('/');
      return; // ← Important: stop execution here
    }

    // Prevent multiple calls
    if (this.isLoading) return;
    this.isLoading = true;

    this.userAuthService.getUser()
      .then(({ data }: any) => {
        this.user = data;
        this.isLoading = false;
      })
      .catch(err => {
        console.error(err);
        this.isLoading = false;
        console.log(555)
        localStorage.removeItem('token'); // Clear invalid token
        this.router.navigateByUrl('/');
      });
  }

  logoutAction(): void {
    localStorage.removeItem('token');
    this.router.navigateByUrl('/');
  }

  listCustomers(): void {
    this.dataService.listCustomers()
      .then(response => {
        this.customers = response.data;
      })
      .catch(err => console.error(err));
  }

  listProducts(): void {
    this.dataService.listProducts()
      .then(response => {
        this.products = response.data;
      })
      .catch(err => console.error(err));
  }

  listAddresses(): void {
    this.dataService.listAddresses()
      .then(response => {
        this.addresses = response.data;
      })
      .catch(err => console.error(err));
  }
}
