import { Component, OnInit } from '@angular/core';
import { StateService } from "../state.service";
import { RestService } from "../rest.service";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { isValidSum } from "../imports";

@Component({
  selector: 'app-withdraw',
  templateUrl: './withdraw.component.html',
  styleUrls: ['./withdraw.component.css']
})
export class WithdrawComponent implements OnInit {

  withdrawal: string = "";
  token: string;
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

  handleWithdraw(): void {

    if (this.withdrawal.length === 0) {
      this.stateService.setModalMsg("Withdrawal amount missing!\nAdd amount!");
      return;
    }

    if (!isValidSum(this.withdrawal)) {
      this.stateService.setModalMsg("Invalid withdrawal amount!\nCheck amount!");
      return;
    }

    this.stateService.showSpinner(true);
    this.restService.withdraw(this.withdrawal, this.token).
      subscribe( response => {
        this.stateService.showSpinner(false);
        if(response) {
          this.stateService.setBalance(String(response.balance));
          this.stateService.setModalMsg("Withdrawal successfull!");
          this.withdrawal = '';
        }
      });
  }

}
