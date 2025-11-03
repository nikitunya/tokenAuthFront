import { inject, Injectable } from '@angular/core';
import axios from 'axios';
import { User } from '../model/user';
import { AccountType } from '../enums/AccounType.enum';
import { ToastrService } from 'ngx-toastr';
import { PasswordReset } from '../model/passwordReset';
import { BehaviorSubject, interval, Subscription } from 'rxjs';
 
@Injectable({
  providedIn: 'root'
})
export class UserAuthService {
  private tokenTimer: any;
  private refreshWarningShown = false;

  private toastr = inject(ToastrService);
  
  constructor() {
    this.setupAxiosInterceptor();
    this.initializeTokenTimers(); // ← Add this line
  }

  // ← Add this new method
  private initializeTokenTimers(): void {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token && !this.isTokenExpired(token)) {
        // Initialize countdown with actual remaining time
        const decoded = this.decodeToken(token);
        if (decoded?.exp) {
          const expTime = decoded.exp * 1000;
          const remaining = Math.max(0, expTime - Date.now());
          this.tokenCountdown$.next(Math.floor(remaining / 1000));
        }
        
        this.startTokenTimer();
        this.startTokenTimerWithCountdown();
      }
    }
  }
 
  login(data:any): Promise<any>{
    let payload = {
      email: data.email,
      password: data.password
    }
  
    return axios.post('/authenticate', payload).then((response) => {
      this.toastr.success('Login successful!', 'Success');
      return response;
    }).catch((error: any) => {
      this.toastr.error(error.response?.data?.message || 'Login failed', 'Error');
      throw error;
    });
  }
 
  register(user: User): Promise<any>{
    user.type = AccountType.USER;
    return axios.post('/user/registration', user).then((response) => {
      this.toastr.success('Registration sucessful!', 'Success');
      return response;
    }).catch((error: any) => {
      this.toastr.error(error.response?.data?.message || 'Login failed', 'Error');
      throw error;
    });
  }
 
  getUser(): Promise<any>{
    return axios.get('/user/me', { headers:{Authorization: 'Bearer ' + localStorage.getItem('accessToken')}})
  }

  resetPassword(passwordReset: PasswordReset): Promise<any> {
    return axios.post('/user/reset/password', passwordReset)
  }

  private isRefreshing = false;
  private refreshPromise?: Promise<any>;

  private async refreshTokenOnce(): Promise<any> {
    if (this.isRefreshing) {
      return this.refreshPromise;
    }

    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      this.logout();
      return Promise.reject('No refresh token');
    }

    // Show warning before refreshing
    if (!this.refreshWarningShown) {
      this.toastr.warning('Your session will expire soon. Refreshing token...', 'Warning');
      this.refreshWarningShown = true;
    }

    this.isRefreshing = true;
    this.refreshPromise = axios.post('/refresh', { refreshToken })
      .then((response) => {
        console.log(response)
        if (response.data?.accessToken && response.data?.refreshToken) {
          localStorage.setItem('accessToken', response.data.accessToken);
          localStorage.setItem('refreshToken', response.data.refreshToken);
          this.refreshWarningShown = false; // Reset flag for next refresh cycle
          this.startTokenTimer();
          this.startTokenTimerWithCountdown();
          return response.data;
        } else {
          console.log(123)
          throw new Error('Invalid refresh response');
        }
      })
      .catch((err) => {
        console.log(999)
        this.logout();
        throw err;
      })
      .finally(() => {
        this.isRefreshing = false;
        this.refreshPromise = undefined;
      });

    return this.refreshPromise;
  }

  private setupAxiosInterceptor() {
    axios.interceptors.request.use(async (config) => {
      let token = localStorage.getItem('accessToken');

      if (token && this.isTokenExpired(token)) {
        try {
          await this.refreshTokenOnce();
          token = localStorage.getItem('accessToken');
        } catch {
          this.logout();
          return Promise.reject('Session expired');
        }
      }

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    });

    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            await this.refreshTokenOnce();
            originalRequest.headers.Authorization = `Bearer ${localStorage.getItem('accessToken')}`;
            return axios(originalRequest);
          } catch {
            console.log(777)
            this.logout();
          }
        }
        return Promise.reject(error);
      }
    );
  }

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    // Clean up timers
    if (this.tokenTimer) clearTimeout(this.tokenTimer);
    if (this.countdownSub) this.countdownSub.unsubscribe();
    
    this.toastr.info('Session expired. Please log in again.', 'Info');
    window.location.href = '/login';
  }

  private decodeToken(token: string): any {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return null;
    }
  }

  private isTokenExpired(token: string): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded?.exp) return true;

    const exp = decoded.exp * 1000; // convert to ms
    const now = Date.now();

    // refresh if expiry is within 30 seconds
    return exp - now < 30_000;
  }

  startTokenTimer() {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const decoded = this.decodeToken(token);
    if (!decoded?.exp) return;

    const expTime = decoded.exp * 1000;
    const now = Date.now();
    const remaining = expTime - now;

    if (remaining <= 0) {
      this.logout();
      return;
    }

    // Warn user 1 minute before expiration
    const warningTime = Math.max(remaining - 60_000, 0);

    // Clear existing timer if already set
    if (this.tokenTimer) clearTimeout(this.tokenTimer);

    // Set up timer
    this.tokenTimer = setTimeout(() => {
      if (!this.refreshWarningShown) {
        this.toastr.warning('Your session will expire soon. Refreshing token...', 'Warning');
        this.refreshWarningShown = true;
      }

      // Auto-refresh token before it expires
      this.refreshTokenOnce().catch(() => this.logout());
    }, warningTime);
  }

  tokenCountdown$ = new BehaviorSubject<number>(0);
  private countdownSub?: Subscription;

  startTokenTimerWithCountdown() {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const decoded = this.decodeToken(token);
    if (!decoded?.exp) return;

    const expTime = decoded.exp * 1000;

    if (this.countdownSub) this.countdownSub.unsubscribe();

    this.countdownSub = interval(1000).subscribe(() => {
      const remaining = Math.max(0, expTime - Date.now());
      this.tokenCountdown$.next(Math.floor(remaining / 1000));
    });
  }
}