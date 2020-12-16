import { Component, OnInit } from '@angular/core';
import { StateService } from "../state.service";

@Component({
  selector: 'app-initial',
  templateUrl: './initial.component.html',
  styleUrls: ['./initial.component.css']
})
export class InitialComponent implements OnInit {

  constructor(
    private stateService: StateService
  ) { }

  ngOnInit(): void {
  }
  
}
