/* Copyright (c) 2026 Laczkó István & Brückner Gábor. All rights reserved. */
import { Component, inject } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { BusyService } from '../core/services/busy-service';
import { ThemeService } from '../core/services/theme-service';

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
  private themeService = inject(ThemeService); // Just inject to trigger constructor
}


