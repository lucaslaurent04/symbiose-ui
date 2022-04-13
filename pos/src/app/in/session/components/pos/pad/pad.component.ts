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
  mouseUp : any;
  mouseDown: any;
  operator : string = '+';
  @Output() newItemEvent = new EventEmitter();
  @Output() newNumberPassed = new EventEmitter();
  
  ngOnInit(): void {
  }
  checkActionType(event:any){
    this.newItemEvent.emit(event);
  }
  onPassNumber(value: any){
    this.numberPassed = value;
    this.newNumberPassed.emit(value);
  }

  onMouseUp(){
    this.mouseUp = +new Date();
  }
  onMouseDown(){
    this.mouseDown = +new Date();
    let diff = this.mouseUp - this.mouseDown;
    console.log(diff, 'before')
    if(diff < -1000){ 
      // console.log(diff, 'aaaaa')
      // if(this.operator =='+'){
      //   this.operator = '-'
      // }else{
      //   this.operator = '+';
      // }  
      // this.onPassNumber(this.operator)
    }else{
      this.onPassNumber(this.operator)
    }
  }
}
