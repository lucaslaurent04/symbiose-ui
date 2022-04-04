import { Component, EventEmitter, Input, OnInit, Output, SimpleChange, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-discount',
  templateUrl: './discount.component.html',
  styleUrls: ['./discount.component.scss']
})
export class DiscountComponent implements OnInit {

  constructor() { }
  @Output() posLineDisplay = new EventEmitter();
  @Output() discountValue = new EventEmitter();
  @Input() item : string = "";
  public index : number;
  public liners = [
    {
      name: "Freebies",
      unit : "Qty",
      value : ""
    },
    {
      name: "Discount",
      unit : "%",
      value : ""
    },
    {
      name: "Quantity",
      unit : "units",
      value : ""
    },
    {
      name: "Price",
      unit : "€",
      value : ""
    },
    {
      name: "Tax",
      unit : "%",
      value : ""
    }
  ]
  ngOnInit(): void {
  }

  onSelectedElement(selected : any){
   if(selected[0].value == 0 || selected[0].value == 1){
     this.index = selected[0].value;
     this.discountValue.emit(this.liners[this.index].value);
     console.log(this.item);
   }
  }

  ngOnChanges(changes:SimpleChanges) {
    if(this.item != undefined && this.index != undefined)this.liners[this.index].value = this.item; 
  }

  onButton(value: string){
    this.posLineDisplay.emit(value);
  }

}
