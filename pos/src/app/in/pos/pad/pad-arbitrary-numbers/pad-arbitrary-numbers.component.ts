import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-pad-arbitrary-numbers',
  templateUrl: './pad-arbitrary-numbers.component.html',
  styleUrls: ['./pad-arbitrary-numbers.component.scss']
})
export class PadArbitraryNumbersComponent implements OnInit {

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
