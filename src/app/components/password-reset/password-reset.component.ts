import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { UserAuthService } from '../../services/user-auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PasswordReset } from '../../model/passwordReset';

declare var bootstrap: any;

@Component({
  selector: 'app-password-reset-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './password-reset.component.html',
  styleUrls: []
})
export class PasswordResetModalComponent implements OnInit {
  entity: PasswordReset = {};
  isSubmitting = false;
  validationErrors: any = [];
  passwordMismatch = false;
  private modal: any;

  constructor(
    public userAuthService: UserAuthService, 
    private router: Router
  ) {}

  ngOnInit(): void {}

  openModal() {
    const modalElement = document.getElementById('passwordResetModal');
    if (modalElement) {
      this.modal = new bootstrap.Modal(modalElement);
      this.modal.show();
    }
  }

  closeModal() {
    if (this.modal) {
      this.modal.hide();
    }
    // Reset form
    this.entity = {};
    this.passwordMismatch = false;
    this.validationErrors = [];
  }

  checkPasswordMatch() {
    if (this.entity.newPassword && this.entity.confirmPassword) {
      this.passwordMismatch = this.entity.newPassword !== this.entity.confirmPassword;
    } else {
      this.passwordMismatch = false;
    }
  }

  resetPasswordAction() {
    if (this.entity.newPassword !== this.entity.confirmPassword) {
      this.passwordMismatch = true;
      return;
    }

    this.isSubmitting = true;
    this.validationErrors = [];
    this.passwordMismatch = false;

    this.userAuthService.resetPassword(this.entity)
      .then((response: any) => {
        this.isSubmitting = false;
        this.closeModal();
        this.router.navigateByUrl('/login');
      })
      .catch((error: any) => {
        this.isSubmitting = false;
        this.validationErrors = 
          error.response?.data?.errors || error.response?.data?.error || [];
      });
  }
}