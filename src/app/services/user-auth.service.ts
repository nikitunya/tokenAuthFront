import { inject, Injectable } from '@angular/core';
import axios from 'axios';
import { User } from '../model/user';
import { AccountType } from '../enums/AccounType.enum';
import { ToastrService } from 'ngx-toastr';
import { error } from 'console';
import { PasswordReset } from '../model/passwordReset';
 
@Injectable({
  providedIn: 'root'
})
export class UserAuthService {
  private toastr = inject(ToastrService);
  constructor() { }
 
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
 
    return axios.get('/user/me', { headers:{Authorization: 'Bearer ' + localStorage.getItem('token')}})
    // return axios.get('/user/user', { headers:{Authorization: 'Bearer ' + localStorage.getItem('token')}})
  }

  resetPassword(passwordReset: PasswordReset): Promise<any> {
    return axios.post('/user/reset/password', passwordReset)
  }
}