import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { StateService } from "../state.service";
import { RestService } from "../rest.service";
import { Subject } from "rxjs";
import { takeUntil, filter } from "rxjs/operators";

@Component({
  selector: 'app-in',
  templateUrl: './in.component.html',
  styleUrls: ['./in.component.css']
})
export class InComponent implements OnInit {

  token: string;
  balance: string = "";
  accountId: string = "";
  name: string = "";
  location: string = "/in/deposit";
  destroy$: Subject<void> = new Subject<void>();

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  constructor(
    private stateService: StateService,
    private router: Router,
    private restService: RestService
    ) { }

  ngOnInit(): void {

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.location = event.url;
    });

    this.stateService.accessToken$.pipe(takeUntil(this.destroy$)).subscribe(
      token => this.token = token
    );

    this.stateService.balance$.pipe(takeUntil(this.destroy$)).subscribe(
      balance => this.balance = balance
    );

    this.stateService.userInfo$.pipe(takeUntil(this.destroy$)).subscribe(
      info => { this.accountId = info.accountId; this.name = info.name; }
    );

    this.restService.requestBalance(this.token).
      subscribe( response => {
        if(response !== null) {
          this.stateService.setBalance(response.balance);
          this.stateService.setUserInfo(response.name, response.id);
        }
      });
  }

  handleLogout(): void {
    this.router.navigate(['/out']);
    setTimeout(() => this.stateService.setAccessToken(""));
    this.stateService.showSpinner(false);
  }

  navigateToDeposit(): void {
    this.router.navigate(['/in/deposit']);
  }

  navigateToWithdraw(): void {
    this.router.navigate(['/in/withdraw']);
  }

  navigateToTransfer(): void {
    this.router.navigate(['/in/transfer']);
  }

  navigateToTransactions(): void {
    this.router.navigate(['/in/transactions']);
  }

}
