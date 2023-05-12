import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { UserService } from './profile/user.service';
import {
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(public userService: UserService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (!this.userService.isAuthenticated()) {
      this.router.navigate([
        '/loginPassword',
        {
          previousUrl: state.url,
        },
      ]);
    }
    return this.userService.isAuthenticated();
  }
}
