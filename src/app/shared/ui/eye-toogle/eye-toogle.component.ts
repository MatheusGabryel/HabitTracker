import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-eye-toogle',
  templateUrl: './eye-toogle.component.html',
  styleUrls: ['./eye-toogle.component.scss'],
})
export class EyeToogleComponent {
  @Input() isVisible: boolean = false;

  @Output() isVisibleChange = new EventEmitter<boolean>();

  public toggleVisibility() {
    this.isVisible = !this.isVisible;
    this.isVisibleChange.emit(this.isVisible);
  }

}
