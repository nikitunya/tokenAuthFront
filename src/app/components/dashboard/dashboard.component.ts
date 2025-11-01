import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../user/user';
import { UserAuthService } from '../../user-auth.service';
 
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: []
})
export class DashboardComponent implements OnInit{
  user!:User
 
  constructor(public userAuthService: UserAuthService, private router: Router) {}
 
  ngOnInit(): void {
   if(localStorage.getItem('token') == "" || localStorage.getItem('token') == null){
      this.router.navigateByUrl('/')
    }else {
      this.userAuthService.getUser().then(({data}: any)=>{
        this.user = data;
      })
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