import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../model/user';
import { UserAuthService } from '../../services/user-auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule], // ← Added FormsModule for ngModel
  templateUrl: './dashboard.component.html',
  styleUrls: []
})
export class DashboardComponent implements OnInit, OnDestroy {
  user!: User;

  revokeEmail: string = '';
  revokeResult: string = '';
  products: string[] = [];
  addresses: string[] = [];

  isLoading = false;
  remainingSeconds = 0;
  private countdownSub?: Subscription;

  private toastr = inject(ToastrService);

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
        this.isLoading = false;
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

  revokeAccess(): void {
    if (!this.revokeEmail || !this.revokeEmail.trim()) {
      this.revokeResult = 'Please enter an email';
      return;
    }

    this.userAuthService.revoke(this.revokeEmail)
      .then(response => {
        this.revokeResult = response.data?.message || 'Access revoked successfully';
        this.revokeEmail = '';
        this.toastr.success('Revoked successfully!', 'Success');
      })
      .catch(err => {
        this.toastr.error(err.response?.data.error, 'Error');
      });
  }

  listProducts(): void {
    this.dataService.listProducts()
      .then(response => {
        this.products = response.data;
      })
      .catch(err => {
        if (err.response) {
          if (err.response.status === 403) {
            this.toastr.error('Access forbidden. You do not have permission.', 'Forbidden');
          } else {
            this.toastr.error(err.response.data?.error || 'An unexpected error occurred.', 'Error');
          }
        } else {
          this.toastr.error('Network error or server unavailable.', 'Error');
        }
      });
  }

  listAddresses(): void {
    this.dataService.listAddresses()
      .then(response => {
        this.addresses = response.data;
      })
      .catch(err => {
        if (err.response) {
          if (err.response.status === 403) {
            this.toastr.error('Access forbidden. You do not have permission.', 'Forbidden');
          } else {
            this.toastr.error(err.response.data?.error || 'An unexpected error occurred.', 'Error');
          }
        } else {
          this.toastr.error('Network error or server unavailable.', 'Error');
        }
      });
  }

  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
}