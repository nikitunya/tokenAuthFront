import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { UserAuthService } from '../../services/user-auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from '../../model/user';
 
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit{
  entity: User = {};
  confirmPassword: string = '';
  isSubmitting:boolean = false
  validationErrors:any = []
 
  constructor(public userAuthService: UserAuthService, private router: Router) {}
 
  ngOnInit(): void {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
      this.router.navigateByUrl('/dashboard');
    }
  }
 
  registerAction() {
    this.isSubmitting = true;
 
    this.userAuthService.register(this.entity)
    .then(({data}: any) => {
      this.router.navigateByUrl('/login')
      return data
    }).catch((error: any) => {
      this.isSubmitting = false;
      if (error.response.data.errors != undefined) {
        this.validationErrors = error.response.data.errors
      }
      
      return error
    })
  }
}