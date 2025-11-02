import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { UserAuthService } from '../../services/user-auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JwtToken } from '../../model/jwtToken';
import { User } from '../../model/user';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  entity: User = {};
  isSubmitting = false;
  validationErrors:any = []

  constructor(public userAuthService: UserAuthService, private router: Router) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined') {   // ✅ check if we are in the browser
      const token = localStorage.getItem('token');
      if (token) {
        this.router.navigateByUrl('/dashboard');
      }
    }
  }

  loginAction() {
    this.isSubmitting = true;

    this.userAuthService.login(this.entity)
      .then(({data}: any) => {
        localStorage.setItem('token', data.jwtToken);
        this.router.navigateByUrl('/dashboard');
      })
      .catch((error: any) => {
        this.isSubmitting = false;
        this.validationErrors =
          error.response?.data?.errors || error.response?.data?.error || [];
      });
  }
}
