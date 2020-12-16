import { Component, OnInit, Input } from '@angular/core';
import { StateService } from "../state.service";

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent implements OnInit {

  message: string;
  modalIsVisible: boolean;

  constructor(
    private stateService: StateService
  ) { }

  ngOnInit(): void {
    this.stateService.modalIsVisible$.subscribe(
      visible => this.modalIsVisible = visible
    );

    this.stateService.modalMsg$.subscribe(
      msg => this.message = msg
    );
  }

  closeModal(): void {
    this.modalIsVisible = false;
  }

}
