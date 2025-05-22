import { AuthData } from './auth.model';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Injectable } from '@angular/core';

import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        if (localStorage.getItem('currentUser')) {
            // logged in so return true
            let authData : AuthData = JSON.parse(localStorage.getItem('currentUser'));
            let ndate:number = new Date().getTime();
            if (ndate > authData.expiresIn) {
                this.authService.logout();
                return false;
            }
            this.authService.authData= JSON.parse(localStorage.getItem('currentUser'));
            return true;
        }

        // not logged in so redirect to login page with the return url
        this.router.navigate(['/login'], { queryParams: { returnUrl: state.url }});
        return false;
    }
}
