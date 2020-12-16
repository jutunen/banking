import { Component, OnInit } from '@angular/core';
import { StateService } from "../state.service";
import { RestService } from "../rest.service";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { isValidSum } from "../imports";

@Component({
  selector: 'app-deposit',
  templateUrl: './deposit.component.html',
  styleUrls: ['./deposit.component.css']
})
export class DepositComponent implements OnInit {

  token: string;
  deposit: string = "";
  destroy$: Subject<void> = new Subject<void>();

  constructor(
    private stateService: StateService,
    private restService: RestService
  ) { }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.stateService.accessToken$.pipe(takeUntil(this.destroy$)).subscribe(
      token => this.token = token
    );
  }

  handleDeposit(): void {

    if (this.deposit.length === 0) {
      this.stateService.setModalMsg("Deposit amount missing!\nAdd amount!");
      return;
    }

    if (!isValidSum(this.deposit)) {
      this.stateService.setModalMsg("Invalid deposit!\nCheck deposit!");
      return;
    }

    this.stateService.showSpinner(true);
    this.restService.deposit(this.deposit, this.token).
      subscribe( response => {
        this.stateService.showSpinner(false);
        if(response) {
          this.stateService.setBalance(String(response.balance));
          this.stateService.setModalMsg("Deposit successfull!");
          this.deposit = '';
        }
      });
  }
}
