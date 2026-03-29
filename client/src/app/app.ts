import { Component, inject } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { BusyService } from '../core/services/busy-service';

@Component({
  standalone: true,
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  imports: [RouterOutlet]
})
export class App {
  protected router = inject(Router);
  protected busyService = inject(BusyService);
}

