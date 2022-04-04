import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss']
})
export class InfoComponent implements OnInit {

  constructor() { }
  @Output() posLineDisplay = new EventEmitter();
  ngOnInit(): void {
  }

  onButton(value: string){
    this.posLineDisplay.emit(value);
  }

  onSelectedElement(element:any){

  }
}
