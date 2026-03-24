import { Component, EventEmitter, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../_services/account-service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  standalone: true,
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class RegisterComponent {

  @Output() cancelRegister = new EventEmitter<void>();
  private accountService = inject(AccountService);
  private router = inject(Router);
  protected creds: any = {}

  //Later we will need proper validation, with the route guard I guess

  register() {
    this.accountService.register(this.creds).subscribe({
      next: result => {
        console.log(result);
        this.creds = {};
        this.router.navigateByUrl('/home');
      },
      error: (error: any) => console.log(error)
    })
  }

  cancel() {
    this.cancelRegister.emit();
  }
}
