import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { StateService } from "./state.service";

@Injectable({
  providedIn: 'root'
})
export class MyGuardGuard implements CanActivate, CanActivateChild {

  token: string;

  constructor(
    private stateService: StateService,
    private router: Router
  ) {
    this.stateService.accessToken$.subscribe(
      token => { this.token = token }
    );
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if(this.token) {
      return true;
    }
    this.stateService.setModalMsg("You must login to proceed!");
    return this.router.parseUrl('/out');
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return true;
  }

}
