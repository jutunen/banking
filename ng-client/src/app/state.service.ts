import { Injectable } from '@angular/core';
import { BehaviorSubject } from "rxjs";
import { UserInfo } from "./imports";

@Injectable({
  providedIn: 'root'
})
export class StateService {

  private readonly _accessToken = new BehaviorSubject<string>("");
  readonly accessToken$ = this._accessToken.asObservable();

  setAccessToken(param: string): void {
    this._accessToken.next(param);
  }

  private readonly _balance = new BehaviorSubject<string>("");
  readonly balance$ = this._balance.asObservable();

  setBalance(param: string): void {
    this._balance.next(param);
  }

  private readonly _userInfo = new BehaviorSubject<UserInfo>({name:"", accountId:""});
  readonly userInfo$ = this._userInfo.asObservable();

  setUserInfo(name: string, accountId: string): void {
    this._userInfo.next({name:name, accountId:accountId});
  }

  private readonly _spinnerIsVisible = new BehaviorSubject<boolean>(false);
  readonly spinnerIsVisible$ = this._spinnerIsVisible.asObservable();

  showSpinner(param: boolean): void {
    if (param) {
      this._spinnerIsVisible.next(true);
    } else {
      this._spinnerIsVisible.next(false);
    }
  }

  private readonly _modalIsVisible = new BehaviorSubject<boolean>(false);
  readonly modalIsVisible$ = this._modalIsVisible.asObservable();

  private readonly _modalMsg = new BehaviorSubject<string>("");
  readonly modalMsg$ = this._modalMsg.asObservable();

  setModalMsg(param: string): void {
    this._modalMsg.next(param);
    this._modalIsVisible.next(true);
  }

  constructor() { }
}
