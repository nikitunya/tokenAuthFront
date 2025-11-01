import { CommonModule } from "@angular/common";
import { LoginComponent } from "./app/components/login/login.component";
import { Component } from "@angular/core";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, LoginComponent],
  template: `<login></login>` // or your actual template
})
export class AppComponent {}
