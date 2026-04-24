/* Copyright (c) 2026 Laczkó István & Brückner Gábor. All rights reserved. */
import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { BusyService } from "../services/busy-service";
import { delay, finalize, identity } from "rxjs";
import { environment } from "../../environments/environment";

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
    const busyService = inject(BusyService);

    // ElindĂ­tjuk a pĂ¶rgĹ‘t
    busyService.busy();

    return next(req).pipe(
        // FejlesztĂ©s alatt adunk hozzĂˇ egy kis kĂ©sleltetĂ©st, hogy lĂˇssuk a spinnert
        (environment.production ? identity : delay(500)),
        // Amikor vĂ©ge a kĂ©rĂ©snek (akĂˇr hiba, akĂˇr siker), leĂˇllĂ­tjuk a pĂ¶rgĹ‘t
        finalize(() => {
            busyService.idle();
        })
    );
};
