import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-pad-value-increments',
  templateUrl: './value-increments.component.html',
  styleUrls: ['./value-increments.component.scss']
})
export class AppPadValueIncrementsComponent implements OnInit {

  constructor() { }
  @Output()  OnaddedNumber = new EventEmitter();
  @Output() OnBackspace = new EventEmitter();

  addedNumber = 0;

  onSelectionChange(value: number) {
    this.OnaddedNumber.emit(value);
  }

  onBackSpace(){
    this.OnBackspace.emit("backspace");
  }
  ngOnInit(): void {
  }

}
