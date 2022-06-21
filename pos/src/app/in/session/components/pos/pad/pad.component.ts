import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-pad',
  templateUrl: './pad.component.html',
  styleUrls: ['./pad.component.scss']
})
export class PadComponent implements OnInit {
  constructor() { }
  element = '';
  numberPassed = 0;
  mouseUp: any;
  mouseDown: any;
  operator: string = '+';
  @Output() newItemEvent = new EventEmitter();
  @Output() newNumberPassed = new EventEmitter();

  ngOnInit(): void {
  }
  checkActionType(event: any) {
    this.newItemEvent.emit(event);
  }
  onPassNumber(value: any) {
    this.numberPassed = value;
    this.newNumberPassed.emit(value);
  }

  onDoubleClick() {
    if (this.operator == '+') {
      this.operator = '-'
    } else {
      this.operator = '+';
    }
  }
}
