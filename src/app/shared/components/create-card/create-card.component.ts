import { Component, EventEmitter, Input, OnInit, Output, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-create-card',
  templateUrl: './create-card.component.html',
  styleUrls: ['./create-card.component.scss'],
})
export class CreateCardComponent {

  @Input() title: string = '';
  @Input() imagePath: string = '';

  @Output() clicked = new EventEmitter<void>();

  public handleClick() {
    this.clicked.emit();
  }
}
