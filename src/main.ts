
import axios from 'axios';
import { environment } from './environments/environment.development';
import { bootstrapApplication, BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { importProvidersFrom } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app/app.routes';
  
  
axios.defaults.baseURL = environment.apiUrl
   
axios.interceptors.request.use(function (config) {
  config.headers['X-Binarybox-Api-Key'] = environment.apiKey
  return config;
});
  
bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      BrowserModule,
      FormsModule,
      ReactiveFormsModule,
      AppRoutingModule
    )
  ]
});