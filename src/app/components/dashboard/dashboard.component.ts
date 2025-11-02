import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../model/user';
import { UserAuthService } from '../../services/user-auth.service';
import { CommonModule } from '@angular/common';
 
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: []
})
export class DashboardComponent implements OnInit{
  user!:User
 
  constructor(public userAuthService: UserAuthService, private router: Router) {}
 
  ngOnInit(): void {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
    if (!token) {
      this.router.navigateByUrl('/');
    } else {
      this.userAuthService.getUser().then(({ data }: any) => {
        this.user = data;
      });
    }
  }
 
  logoutAction () {
    this.userAuthService.logout().then(()=>{
      localStorage.setItem('token', "")
      this.router.navigateByUrl('/')
    }).catch(()=>{
      localStorage.setItem('token', "")
      this.router.navigateByUrl('/')
    })
   
  }
}