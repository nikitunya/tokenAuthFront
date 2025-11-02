import { Injectable } from '@angular/core';
import axios from 'axios';
import { User } from '../model/user';
import { AccountType } from '../enums/AccounType.enum';
 
@Injectable({
  providedIn: 'root'
})
export class UserAuthService {
 
  constructor() { }
 
  login(data:any): Promise<any>{
    let payload = {
      email: data.email,
      password: data.password
    }
  
    return axios.post('/authenticate', payload)
  }
 
  register(user: User): Promise<any>{
    user.type = AccountType.USER;
    return axios.post('/user/registration', user)
  }
 
  getUser(): Promise<any>{
 
    return axios.get('/user/me', { headers:{Authorization: 'Bearer ' + localStorage.getItem('token')}})
    // return axios.get('/user/user', { headers:{Authorization: 'Bearer ' + localStorage.getItem('token')}})
  }
 
  logout(): Promise<any>{
 
    return axios.post('/api/logout',{}, { headers:{Authorization: 'Bearer ' + localStorage.getItem('token')}})
  }
}