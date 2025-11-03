import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { UserAuthService } from '../../services/user-auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JwtToken } from '../../model/jwtToken';
import { User } from '../../model/user';
import { PasswordResetModalComponent } from '../password-reset/password-reset.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PasswordResetModalComponent], // ← Add here!
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  entity: User = {};
  isSubmitting = false;
  validationErrors: any = []

  @ViewChild('passwordResetModal') passwordResetModal!: PasswordResetModalComponent;

  constructor(public userAuthService: UserAuthService, private router: Router) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        this.router.navigateByUrl('/dashboard');
      }
    }
  }

  loginAction() {
    this.isSubmitting = true;

    this.userAuthService.login(this.entity)
      .then(({data}: any) => {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        this.userAuthService.startTokenTimer();
        this.userAuthService.startTokenTimerWithCountdown();
        this.router.navigateByUrl('/dashboard');
      })
      .catch((error: any) => {
        this.isSubmitting = false;
        if (error.response.data.message === 'Password is expired. Please reset password') {
          this.passwordResetModal.openModal();
        } 
      });
  }
}