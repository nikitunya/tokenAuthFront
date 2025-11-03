import { Injectable } from '@angular/core';
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})
export class DataService {

    private getAuthHeader() {
        const token = localStorage.getItem('token'); // get JWT from localStorage
        return { Authorization: `Bearer ${token}` };
    }

    listCustomers(): Promise<any> {
        return axios.post('/action/customer/list', {}, { headers: this.getAuthHeader() });
    }

    listProducts(): Promise<any> {
        return axios.post('/action/product/list', {}, { headers: this.getAuthHeader() });
    }

    listAddresses(): Promise<any> {
        return axios.post('/action/address/list', {}, { headers: this.getAuthHeader() });
    }
}
