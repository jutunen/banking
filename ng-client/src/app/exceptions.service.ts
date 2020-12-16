import { Injectable } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { StateService } from "./state.service";

@Injectable({
  providedIn: 'root'
})

export class ExceptionsService {

  constructor(
    private stateService: StateService,
    private router: Router
  ) { }

  handleTokenExpired(): void {
    this.stateService.setModalMsg("Your session expired!\nYou must login to proceed!\nWe're sorry!");
    this.router.navigate(['/out']);
    this.stateService.showSpinner(false);
    setTimeout(() => this.stateService.setAccessToken(""));
  }

}
