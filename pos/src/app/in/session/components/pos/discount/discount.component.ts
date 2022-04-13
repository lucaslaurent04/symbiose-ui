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
  @Input() item : any;
  public index : number;
  public liners : any;
  ngOnInit(): void {
  }

 

  onSelectedElement(selected : any){
    console.log(selected)
   if(selected[0].value == 0 || selected[0].value == 1){
     this.index = selected[0].value;
     this.discountValue.emit(this.liners[this.index].value);
   }
  }

  ngOnChanges(changes:SimpleChanges) {
    console.log(this.item.free_qty)
    this.liners = [{
      name: "Freebies",
      unit : "Qty",
      value : this.item.free_qty,
      colour : "",
      disabled : false
    },
    {
      name: "Discount",
      unit : "%",
      value : this.item.discount,
      colour : "",
      disabled : false
    },
    {
      name: "Quantity",
      unit : "units",
      value : this.item.qty,
      colour : "#3f51b5",
      disabled : false
    },
    {
      name: "Price",
      unit : "€",
      value : this.item.price,
      colour : "#3f51b5",
      disabled : false
    },
    {
      name: "Tax",
      unit : "%",
      value : this.item.vat_rate,
      colour : "#3f51b5",
      disabled : false
    }]
    if(this.item != undefined && this.index != undefined)this.liners[this.index].value = this.item; 
  }

  onButton(value: string){
    this.posLineDisplay.emit(value);
  }

}
