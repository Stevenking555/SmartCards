/* Copyright (c) 2026 Laczkó István & Brückner Gábor. All rights reserved. */
import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { BusyService } from "../services/busy-service";
import { delay, finalize, identity } from "rxjs";
import { environment } from "../../environments/environment";

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
    const busyService = inject(BusyService);

    // Start the spinner
    busyService.busy();

    return next(req).pipe(
        // Add a small delay in development to see the spinner
        (environment.production ? identity : delay(500)),
        // When the request ends (whether error or success), stop the spinner
        finalize(() => {
            busyService.idle();
        })
    );
};