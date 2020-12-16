import { Component } from '@angular/core';
import { StateService } from "./state.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'ng-banking';
  spinnerIsVisible: boolean = false;

  constructor(
    private stateService: StateService
  ) {}

  ngOnInit(): void {
    this.stateService.spinnerIsVisible$.subscribe(
      (visible) => (this.spinnerIsVisible = visible)
    );
  }
}
