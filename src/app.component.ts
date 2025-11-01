import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './app/components/login/login.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, LoginComponent],
  template: `
    <main>
      <login></login>
    </main>
  `
})
export class AppComponent {}