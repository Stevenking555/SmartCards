import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { BusyService } from "../services/busy-service";
import { delay, finalize, identity } from "rxjs";
import { environment } from "../../environments/environment";

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
    const busyService = inject(BusyService);

    // Elindítjuk a pörgőt
    busyService.busy();

    return next(req).pipe(
        // Fejlesztés alatt adunk hozzá egy kis késleltetést, hogy lássuk a spinnert
        (environment.production ? identity : delay(500)),
        // Amikor vége a kérésnek (akár hiba, akár siker), leállítjuk a pörgőt
        finalize(() => {
            busyService.idle();
        })
    );
};