import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements OnInit {

  constructor() { }
  panelOpenState = true;
  payments: any = [{ total: "0", voucher: "", cash: "", bank: "", reservation: "", status: "", number: "0" }];
  paymentsIncrement = 1;
  actionType: any;
  index: number;
  total: number = 0;
  rendu: number = 0;
  field: any;
  myToggle : string;
  @Input() paymentAmount : string = "";
  @Output() paymentSelection = new EventEmitter();
  @Output() paymentValue = new EventEmitter();
  @Output() posLineDisplay = new EventEmitter();

  ngOnInit(): void {
  }

  addPayment(input : any) {
    this.payments.push({ total: "0", voucher: "", cash: "", bank: "", reservation: "", number : "0" });
    this.index = input+1;
    this.paymentValue.emit(this.payments[this.index].total);
    this.onGetTotal();
  }
  

  onSelectionChange(toggle : string){
    this.paymentSelection.emit(toggle);
  }

  onButton(value:any){
      this.posLineDisplay.emit(value);
  }

  onGetTotal() {
    this.total = 0;
    this.payments.forEach((element:any, i:number) => {
      if(this.payments[i].total != undefined && this.payments[i].total != ""){
        this.total += parseFloat(this.payments[i].total)
      }
    });
  }

  onGetFocusedInput(input: any) {
    this.index = input;
    this.paymentAmount = this.payments[this.index].total;
    this.field = 'total';
  }

  onGetNumber(input: any) {
    this.index = input;
    this.paymentAmount = this.payments[this.index].number;
    this.field = 'number';
    this.paymentValue.emit(this.paymentAmount);
  }

  onCancel(i:any){
    this.payments.splice(i,1);
  }

  public closeDialog() {
    
  }

  ngOnChanges(changes:SimpleChanges) {
    if(this.paymentAmount != undefined && this.index != undefined)this.payments[this.index][this.field] = this.paymentAmount; 
    this.onGetTotal();
  }
}
