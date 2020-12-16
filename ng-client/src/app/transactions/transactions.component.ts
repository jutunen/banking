import { Component, OnInit } from '@angular/core';
import { StateService } from "../state.service";
import { RestService } from "../rest.service";
import { Pipe, PipeTransform } from "@angular/core";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { tr_types } from "../imports";

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css']
})
export class TransactionsComponent implements OnInit {

  page: number = 1;
  count: number = 5; // transactions per page
  totalCount: number = 0; // total number of transactions
  pages: number = 1;
  pageArray: number[];
  transactions: [];
  token: string;
  accountId: string;
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
      token => { this.token = token; setTimeout(() => this.getTransactions()
      )}
    );

    this.stateService.userInfo$.pipe(takeUntil(this.destroy$)).subscribe(
      info => this.accountId = info.accountId
    );
  }

  getAccountId(param: any): string {

    if(param.type === 3) {
        if(param.from === this.accountId) {
          return param.to;
        } else {
          return param.from;
        }
      }

    return "";
  }

  getTransactionType(param: any): string {

    if(param.type === 3) {
        if(param.from === this.accountId) {
          return "transfer-out";
        } else {
          return "transfer-in";
        }
      }

    return tr_types[param.type];
  }

  getPageCount(): number {
    return Math.ceil(this.totalCount / this.count);
  }

  nextPage(): void {
    let pageCount = this.getPageCount();
    if(this.page === pageCount) { return; }
    this.getTransactions(this.page + 1);
  }

  prevPage(): void {
    if(this.page === 1) { return; }
    this.getTransactions(this.page - 1);
  }

  getTransactions(page: number = 1): void {
    this.stateService.showSpinner(true);
    this.restService.transactions((page - 1) * this.count, this.count, this.token).pipe(takeUntil(this.destroy$)).
      subscribe( response => {
        this.stateService.showSpinner(false);
        if(response) {
          this.transactions = response.transactions;
          this.totalCount = response.count;
          this.pages = this.getPageCount();
          this.pageArray = Array.from({length: this.pages}, (v, k) => k+1);
          this.page = Number(page);
        }
      });
  }
}

@Pipe({ name: "formatDate" })
export class FormatDatePipe implements PipeTransform {
  transform(date: string): string {
    if (!date) { return ""; }
    let d = new Date(date);
    return d.getDate() + '.' + (d.getMonth() + 1 ) + '.' + d.getFullYear();
  }
}
