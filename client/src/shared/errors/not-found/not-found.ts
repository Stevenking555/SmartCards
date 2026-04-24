/* Copyright (c) 2026 Laczkó István & Brückner Gábor. All rights reserved. */
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './not-found.html'
})
export class NotFoundComponent { }

