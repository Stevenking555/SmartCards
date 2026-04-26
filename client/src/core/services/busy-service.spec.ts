/* Copyright (c) 2026 Laczkó István & Brückner Gábor. All rights reserved. */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { BusyService } from './busy-service';

describe('BusyService', () => {
  let service: BusyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BusyService);
  });

  it('should be created and default to 0 busy requests', () => {
    expect(service).toBeTruthy();
    expect(service.busyRequestCount()).toBe(0);
  });

  it('should increment busy request count when busy() is called', () => {
    service.busy();
    expect(service.busyRequestCount()).toBe(1);

    service.busy();
    expect(service.busyRequestCount()).toBe(2);
  });

  it('should decrement busy request count when idle() is called', () => {
    service.busy();
    service.busy();
    service.idle();
    expect(service.busyRequestCount()).toBe(1);
  });

  it('should never decrement below 0', () => {
    service.idle();
    expect(service.busyRequestCount()).toBe(0);

    service.busy();
    service.idle();
    service.idle();
    expect(service.busyRequestCount()).toBe(0);
  });
});
