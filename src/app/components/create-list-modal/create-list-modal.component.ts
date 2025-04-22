import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-create-list-modal',
  templateUrl: './create-list-modal.component.html',
  styleUrls: ['./create-list-modal.component.scss'],
})
export class CreateListModalComponent  implements OnInit {

  constructor() { }

  @Output() close = new EventEmitter<void>();

  closeModal() {
    this.close.emit();
  }
  ngOnInit() {}

}
