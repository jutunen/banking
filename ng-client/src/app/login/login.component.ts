import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { StateService } from "../state.service";
import { RestService } from "../rest.service";
import { LoginData } from "../imports";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(
    private restService: RestService,
    private stateService: StateService,
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  loginClickHandler(accountId: string, password: string): void {

    if (accountId.length === 0) {
      this.stateService.setModalMsg("Account ID is missing!\nAdd ID!");
      return;
    }

    if (isNaN(Number(accountId))) {
      this.stateService.setModalMsg("Account ID must be number!");
      return;
    }

    if (password.length === 0) {
      this.stateService.setModalMsg("Password is missing!\nAdd password!");
      return;
    }

    let loginData = {
      id: accountId,
      passwd: password
    };

    this.stateService.showSpinner(true);

    this.restService.logUserIn(loginData as LoginData).
      subscribe( response => {
        this.stateService.showSpinner(false);
        if(response !== null) {
          this.stateService.setAccessToken(response.accessToken);
          this.router.navigate(['/in', 'deposit']);
        }
      });
  }
}
