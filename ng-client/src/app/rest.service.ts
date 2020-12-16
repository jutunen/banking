import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { catchError } from "rxjs/operators";
import * as Error from "./errors";
import { RegistrationData, LoginData, TRANSFER, TRANSACTIONS, DEPOSIT, WITHDRAWAL, LOGIN, REGISTRATION, BALANCE } from "./imports";
import { ExceptionsService } from "./exceptions.service";
import { StateService } from "./state.service";

@Injectable({
  providedIn: 'root'
})
export class RestService {

  constructor(
    private http: HttpClient,
    private exceptions: ExceptionsService,
    private stateService: StateService
  ) { }

  httpOptions = {
    headers: new HttpHeaders({ "Content-Type": "application/json" })
  };

  urlPrefix = 'http://localhost:5000/';

  transactions(skip: number, limit: number, token: string): Observable<any> {

    let httpOptions = {
      headers: new HttpHeaders({ "Authorization": `Bearer ${token}` })
    };

    return this.http
      .get<any>(this.urlPrefix + `user/transactions/${skip}/${limit}`, httpOptions)
      .pipe(catchError(this.handleError<string>(TRANSACTIONS, null)));

  }

  transfer(accountId: string, amount: string, token: string): Observable<any> {

    let httpOptions = {
      headers: new HttpHeaders({ "Authorization": `Bearer ${token}` })
    };

    return this.http
      .patch<any>(this.urlPrefix + 'user/transfer',{amount: Number(amount), account: Number(accountId)}, httpOptions)
      .pipe(catchError(this.handleError<string>(TRANSFER, null)));

  }

  withdraw(amount: string, token: string): Observable<any> {

    let httpOptions = {
      headers: new HttpHeaders({ "Authorization": `Bearer ${token}` })
    };

    return this.http
      .patch<any>(this.urlPrefix + 'user/withdraw',{ withdrawal: Number(amount) }, httpOptions)
      .pipe(catchError(this.handleError<string>(WITHDRAWAL, null)));

  }

  deposit(amount: string, token: string): Observable<any> {

    let httpOptions = {
      headers: new HttpHeaders({ "Authorization": `Bearer ${token}` })
    };

    return this.http
      .patch<any>(this.urlPrefix + 'user/deposit',{ deposit: Number(amount) }, httpOptions)
      .pipe(catchError(this.handleError<string>(DEPOSIT, null)));

  }

  requestBalance(token: string): Observable<any> {

    let httpOptions = {
      headers: new HttpHeaders({ "Authorization": `Bearer ${token}` })
    };

    return this.http
      .get<any>(this.urlPrefix + 'user/balance', httpOptions)
      .pipe(catchError(this.handleError<string>(BALANCE, null)));

  }

  logUserIn(data: LoginData): Observable<any> {

    return this.http
      .post<any>(this.urlPrefix + 'auth', data, this.httpOptions)
      .pipe(catchError(this.handleError<string>(LOGIN, null)));
  }

  registerNewUser(data: RegistrationData): Observable<any> {

    return this.http
      .post<any>(this.urlPrefix + 'user', data, this.httpOptions)
      .pipe(catchError(this.handleError<string>(REGISTRATION, null)));
  }

  private handleError<T>(operation = "operation", result?: T) {
    return (error: any): Observable<T> => {
      if(error.error === Error.TOKEN_EXPIRED) {
        this.exceptions.handleTokenExpired();
      } else if(error.error === Error.ID_NOT_FOUND && operation === LOGIN ) {
        this.stateService.setModalMsg("Login failed.\nPlease check your ID.");
      } else if(error.error === Error.TRANSACTIONS_NOT_FOUND ) {
        this.stateService.setModalMsg("Couldn't find any transactions!\n");
      } else if(error.error === Error.INVALID_PASSWORD ) {
        this.stateService.setModalMsg("Wrong password.\nPlease check your password.");
      } else if(error.error === Error.INSUFFICIENT_BALANCE && operation === WITHDRAWAL ) {
        this.stateService.setModalMsg("Insufficient balance.\nWithdrawal failed.");
      } else if(error.error === Error.ID_NOT_FOUND && operation === TRANSFER) {
        this.stateService.setModalMsg("Account does not exist.\nTransfer failed.");
      } else if(error.error === Error.INSUFFICIENT_BALANCE && operation === TRANSFER ) {
        this.stateService.setModalMsg("Insufficient balance.\nTransfer failed.");
      } else if(error.error === Error.INVALID_ID ) {
        this.stateService.setModalMsg("Login failed.\nPlease check your ID.");
      }
      else {
        this.stateService.setModalMsg(`${operation} failed. Try again later.`);
      }
      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}
