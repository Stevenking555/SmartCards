import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth/auth.service';
import { RouterLink } from '@angular/router';

interface Deck {
  title: string;
  cards: number;
  due: number;
  progress: number;
}

interface NewDeck {
  title: string;
  goal: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePageComponent {

  // ── State ──────────────────────────────────────────
  isModalOpen = signal(false);
  auth = inject(AuthService);

  decks: Deck[] = [
    { title: 'Advanced Medicine',     cards: 452,   due: 12, progress: 78 },
    { title: 'Japanese Kanji N2',     cards: 1200,  due: 54, progress: 43 },
    { title: 'Modern Architecture',   cards: 85,    due: 0,  progress: 100 },
    { title: 'UX Design Fundamentals',cards: 120,   due: 8,  progress: 61 },
  ];

  newDeck: NewDeck = { title: '', goal: '1 Week' };

  weeklyActivity = [
    { day: 'Mon', height: 35,  active: false },
    { day: 'Tue', height: 58,  active: false },
    { day: 'Wed', height: 72,  active: false },
    { day: 'Thu', height: 90,  active: true  },
    { day: 'Fri', height: 45,  active: false },
    { day: 'Sat', height: 30,  active: false },
    { day: 'Sun', height: 20,  active: false },
  ];

  // ── Helpers ──────────────────────────────────────────
  get dueTodayCount(): number {
    return this.decks.filter(d => d.due > 0).length;
  }

  // ── Modal ──────────────────────────────────────────
  openModal(): void {
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.newDeck = { title: '', goal: '1 Week' };
  }

  // ── Deck actions ──────────────────────────────────────────
  onCreateDeck(): void {
    if (!this.newDeck.title.trim()) return;
    this.decks = [
      ...this.decks,
      { title: this.newDeck.title, cards: 0, due: 0, progress: 0 },
    ];
    this.closeModal();
  }

  onDeleteDeck(title: string): void {
    this.decks = this.decks.filter(d => d.title !== title);
  }
}