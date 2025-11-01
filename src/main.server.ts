import { bootstrapApplication, BrowserModule } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app/app.routes';
import { AppComponent } from './app.component';

export default () => bootstrapApplication(AppComponent, {
    providers: [
      importProvidersFrom(
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        AppRoutingModule
      )
    ]
  });
