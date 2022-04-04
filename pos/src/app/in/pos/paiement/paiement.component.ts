import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-paiement',
  templateUrl: './paiement.component.html',
  styleUrls: ['./paiement.component.scss']
})
export class PaiementComponent implements OnInit {

  constructor() { }
  panelOpenState = true;
  payments: any = [{ total: "0", voucher: "", cash: "", bank: "", reservation: "", status: "", number: "" }];
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
    this.payments.push({ total: "0", voucher: "", cash: "", bank: "", reservation: "", number : "" });
    this.index = input+1;
    this.paymentValue.emit(this.payments[this.index].total);
    this.onGetTotal();
  }
  

  onCheckNumberPassed(value: any) {
    if (value == "," && !this.payments[this.index][this.field].includes('.')) {
      this.payments[this.index][this.field] += ".";
    }else if (value != 'backspace' && value != ',' && value != '+/-') {
      this.payments[this.index][this.field] += value;
      this.onGetTotal();
    }else if (value == 'backspace') {
      let test = this.payments[this.index][this.field].slice(0, -1);
      this.payments[this.index][this.field] = test;
      this.onGetTotal();
    }
  }

  onSelectionChange(toggle : string){
    this.paymentSelection.emit(toggle);
  }

  onButton(value:any){
      this.posLineDisplay.emit(value);
  }

  onGetTotal() {
    this.total = 0;
    console.log(this.payments);
    this.payments.forEach((element:any, i:number) => {
      if(this.payments[i].total != undefined && this.payments[i].total != ""){
        this.total += parseFloat(this.payments[i].total)
      }
    });


  
    // let cash;
    // let voucher;
    // let reservation;
    // let bank;
    // this.payments[this.index].cash != "" ? cash = parseFloat(this.payments[this.index].cash) : cash = 0;
    // this.payments[this.index].bank != "" ? bank = parseFloat(this.payments[this.index].bank) : bank = 0;
    // this.payments[this.index].voucher != "" ? voucher = parseFloat(this.payments[this.index].voucher) : voucher = 0;
    // this.payments[this.index].reservation != "" ? reservation = parseFloat(this.payments[this.index].reservation) : reservation = 0;
    // this.payments[this.index].total = cash + voucher + reservation + bank;
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

  // onBackSpace(element: any) {
  //   this.onCheckNumberPassed('backspace');
  // }

  // checkActionType(event: any) {
  //   this.actionType = event;
  //   if (this.payments[this.index][this.field] == "") {
  //     this.payments[this.index][this.field] = (parseFloat(event)).toString();

  //   } else {
  //     this.payments[this.index][this.field] = (parseFloat(this.payments[this.index][this.field]) + parseFloat(event)).toString();
  //   }
  //   this.onGetTotal();
  // }
}
