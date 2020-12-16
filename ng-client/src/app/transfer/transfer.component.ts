import { Component, OnInit } from '@angular/core';
import { StateService } from "../state.service";
import { RestService } from "../rest.service";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

@Component({
  selector: 'app-transfer',
  templateUrl: './transfer.component.html',
  styleUrls: ['./transfer.component.css']
})
export class TransferComponent implements OnInit {

  token: string;
  accountId: string;
  amount: string;
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

  handleTransfer(): void {
    this.stateService.showSpinner(true);
    this.restService.transfer(this.accountId, this.amount, this.token).
      subscribe( response => {
        this.stateService.showSpinner(false);
        if(response) {
          this.stateService.setBalance(String(response.balance));
          this.stateService.setModalMsg("Transfer successfull!");
          this.accountId = '';
          this.amount = '';
        }
      });
  }
}
