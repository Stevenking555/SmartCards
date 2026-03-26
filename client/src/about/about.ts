import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../core/i18n/translate.pipe';
import { SidebarComponent } from '../layout/sidebar/sidebar';
import { BottomNavComponent } from '../layout/bottom-nav/bottom-nav';

@Component({
  selector: 'app-about',
  imports: [RouterLink, TranslatePipe, SidebarComponent, BottomNavComponent],
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class AboutComponent { }


