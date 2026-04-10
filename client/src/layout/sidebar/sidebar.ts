import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { TranslatePipe } from '../../core/i18n/translate.pipe';
import { AccountService } from '../../core/services/account-service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './sidebar.html',
})
export class SidebarComponent {
  accountService = inject(AccountService);
  router = inject(Router);

  isHelpModalOpen = signal(false);

  openHelp() { this.isHelpModalOpen.set(true); }
  closeHelp() { this.isHelpModalOpen.set(false); }
  logout() {
    this.accountService.logout().subscribe({
      next: () => this.router.navigateByUrl('/')
    });
  }
}