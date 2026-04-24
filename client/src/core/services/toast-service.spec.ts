/* Copyright (c) 2026 Laczkó István & Brückner Gábor. All rights reserved. */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast-service';
import { Router } from '@angular/router';

describe('ToastService', () => {
  let service: ToastService;
  let mockRouter: any;

  beforeEach(() => {
    mockRouter = { navigateByUrl: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: mockRouter }
      ]
    });
    
    // Clear DOM before each test
    const oldContainer = document.getElementById('toast-container');
    if (oldContainer) {
      oldContainer.remove();
    }

    service = TestBed.inject(ToastService);
  });

  afterEach(() => {
    const container = document.getElementById('toast-container');
    if (container) container.remove();
  });

  it('should create the toast-container on instantiation', () => {
    const container = document.getElementById('toast-container');
    expect(container).toBeTruthy();
    expect(container?.className).toContain('toast-bottom');
  });

  it('should display a success message and remove it after duration', async () => {
    service.success('Test Success', 10); // Use 10ms for fast test execution
    
    const container = document.getElementById('toast-container');
    expect(container?.childElementCount).toBe(1);
    
    const toast = container?.firstChild as HTMLElement;
    expect(toast.innerHTML).toContain('Test Success');
    expect(toast.className).toContain('alert-success');

    // Wait for setTimeout to execute
    await new Promise(resolve => setTimeout(resolve, 20));

    expect(container?.childElementCount).toBe(0);
  });

  it('should remove toast when the close button is clicked', () => {
    service.error('Test Error');
    
    const container = document.getElementById('toast-container');
    const toast = container?.firstChild as HTMLElement;
    const button = toast.querySelector('button');
    
    expect(container?.childElementCount).toBe(1);
    
    // Simulate click
    button?.click();
    
    expect(container?.childElementCount).toBe(0);
  });
});
