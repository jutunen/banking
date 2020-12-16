import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { StateService } from "../state.service";
import { FormBuilder } from '@angular/forms';
import { RestService } from "../rest.service";
import { RegistrationData } from "../imports";
import base64url from "base64url";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  registerForm;

  constructor(
    private restService: RestService,
    private stateService: StateService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {

    this.registerForm = this.formBuilder.group({
      name: '',
      password: '',
      deposit: ''
    });
  }

  ngOnInit(): void {
  }

  onSubmit(formValue): void {
    if(formValue.name.length === 0) {
      this.stateService.setModalMsg("Name is missing!\nAdd name!");
      return;
    }

    if(formValue.password.length === 0) {
      this.stateService.setModalMsg("Password is missing!\nAdd password!");
      return;
    }

    if(formValue.deposit.length > 0) {
      if (isNaN(Number(formValue.deposit))) {
        this.stateService.setModalMsg("Invalid deposit!\nCheck deposit!");
        return;
      }
    }

    let userData = { name: formValue.name,
                     passwd: formValue.password,
                     deposit: Number(formValue.deposit)};

    this.stateService.showSpinner(true);
    this.restService.registerNewUser(userData as RegistrationData).
      subscribe( response => {
        this.stateService.showSpinner(false);
        if(response !== null) {
          this.stateService.setAccessToken(response.accessToken);
          let tokenPayload:any = base64url.decode(response.accessToken.split(".")[1]);
          tokenPayload = JSON.parse(tokenPayload);
          this.stateService.setModalMsg("Registration successfull!\nRemember your new account ID: " + tokenPayload.username);
          this.router.navigate(['/in', 'deposit']);
        }
      });
  }
}
