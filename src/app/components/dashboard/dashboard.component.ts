import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../model/user';
import { UserAuthService } from '../../services/user-auth.service';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: []
})
export class DashboardComponent implements OnInit, OnDestroy {
  user!: User;

  customers: string[] = [];
  products: string[] = [];
  addresses: string[] = [];

  isLoading = false;
  remainingSeconds = 0;
  private countdownSub?: Subscription;

  constructor(
    public userAuthService: UserAuthService,
    public dataService: DataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

    if (!token) {
      this.router.navigateByUrl('/');
      return;
    }

    // Subscribe to countdown with a small delay to allow timers to initialize
    setTimeout(() => {
      this.countdownSub = this.userAuthService.tokenCountdown$.subscribe(seconds => {
        this.remainingSeconds = seconds;
      });
    }, 100);

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
        console.log(555);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        this.router.navigateByUrl('/');
      });
  }

  ngOnDestroy(): void {
    if (this.countdownSub) {
      this.countdownSub.unsubscribe();
    }
  }

  logoutAction(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
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
    console.log(123)
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

  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
}