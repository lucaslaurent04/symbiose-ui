import { Component, EventEmitter, Inject, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { th } from 'date-fns/locale';
import { data } from 'jquery';

@Component({
  selector: 'app-pos-arbitrary-numbers',
  templateUrl: './pos-arbitrary-numbers.component.html',
  styleUrls: ['./pos-arbitrary-numbers.component.scss']
})
export class PosArbitraryNumbersComponent implements OnInit {

  constructor(private dialog: MatDialog) { }
  // public onResa = false;
  public products : any =  [{ id: 1, price: "5", name: "Esteban", quantity: "1.00", discount: "" }, { id: 2, price: "7.5", name: "Graccus", quantity: "1.00", discount: "" }];
  public selectedProduct = 0;
  public invoice = false;
  public actionType : any = "quantity";
  // public index : number;
  public quantityTest = "";
  public priceTest = "";
  public discountTest = "";
  public numberPassed = 0;
  public numberPassedIndex = -1;
  public total = 0;
  public taxes = 0;
  public myTimeout : any;
  public displayClient = true;
  public customer_name : string;
  public operator : string = '+';
  public paymentValue : string;
  
  @Output() onGetInvoice = new EventEmitter();
  @Output() onDisplayDetails = new EventEmitter();
  @Output() onDigitTyped = new EventEmitter();
  @Output() onTypeMode = new EventEmitter();
  @Input() item : number;

  ngOnInit(): void {
    this.total = 0;
    this.products.forEach((element: any) => {
      this.total += Number(element.price) * Number(element.quantity);
    })
  }

  onInvoice(){
    this.invoice = !this.invoice;
    this.onGetInvoice.emit(this.invoice);
  }

  changeClient() {
    // could be used to change clients
  }

  getPosLineDisplay(value: string){
    // this.discountValue = "0";
    // this.posLineDisplay = value;
  }

  getDiscountValue(value: any){
    // this.discountValue = value;
  }

  getPaymentSelection(value : string){

  }
  
  getPaymentValue(value : any){
    //en fait pour paiement, renommer les variables
    // this.discountValue = value;
  }

  onDisplayProductInfo() {
    
  }

  onSelectedProductChange(element: any) {
    this.selectedProduct = element[0].value;
    // this.index = this.products.findIndex((elem:any) => elem.id == element[0].value.id);
    // Products infos
    
  }

  onBackSpace(event: any) {
    this.checkNumberPassed(event);
  }

  checkActionType(event: any) {
    console.log(event)
    this.onTypeMode.emit(event);
    // this.actionType = event;
    // this.quantityTest = "";
    // this.priceTest = "";
  }

  checkNumberPassed(event: any) {
    this.onDigitTyped.emit(event);
    // this.price = this.price.toString();
    // this.quantity = this.quantity.toString();
    // this.discountValue = this.discountValue.toString();
    // // first check what component is displayed
    // if(this.posLineDisplay == "discount" || this.posLineDisplay =="payment"){
    //   if(event== 'backspace'){
    //     let test = this.discountValue.slice(0, -1);
    //     this.discountValue = test;
    //     this.emitDiscountValue.emit([this.discountValue, this.index]);
    //   }else if (((this.discountValue.includes('.') && this.discountValue.indexOf('.')>3)  || (!this.discountValue.includes('.') && this.discountValue.length>1)) && this.posLineDisplay !="payment"){
    //    this.discountValue = "100"; 
    //    this.emitDiscountValue.emit([this.discountValue, this.index]);
    //   }
    //    else if(event!= 'backspace' && event!= ',' && event!= '+/-') {
    //     this.discountValue += event;
    //     this.emitDiscountValue.emit([this.discountValue, this.index]);
    //   }else if(event == ','){
    //     if (!this.discountValue.includes('.')) {
    //       this.discountValue += ".";
    //       this.emitDiscountValue.emit([this.discountValue, this.index]);
    //     } 
    //   }
    // }else{

    //   if(event == '+' || event == "-" && this.index != undefined){
    //     if(this.operator =='-' && !this.products[this.index][this.actionType].includes('-')){
    //       this.products[this.index][this.actionType] = '-' + this.products[this.index][this.actionType];
    //     }else if (this.index != undefined){
    //       console.log(this.index)
    //       let test = this.products[this.index][this.actionType].replace('-', '+');
    //       this.products[this.index][this.actionType] = test
    //     }
    //     return;
    //   }
    //   else if(event != 'backspace' && event != '%'){
    //     this.numberPassed = event;
    //   }else if (event == "%"){
    //     this.posLineDisplay = "discount";
    //     this.onDisplayDetails.emit(this.posLineDisplay);
    //     this.emitDiscountValue.emit(this.discountValue);
    //     console.log(this.discountValue);
    //     return;
    //   }
  
    //   console.log(this.discountValue)
     
    //   clearTimeout(this.myTimeout);
    //   this.myTimeout = setTimeout(() => {
    //     this.quantityTest = "";
    //     this.priceTest = "";
    //     this.discountTest = "";
    //   }, 2000);
  
  

      
    //   if (typeof this.numberPassed == "number") {
    //     if (this.actionType == "quantity") {
    //       if (event != 'backspace') {
    //         this.quantityTest += this.numberPassed.toString();
    //         this.quantity = this.quantityTest;
    //       } else {
    //           if(this.quantity !=""){
    //             this.quantityTest = this.quantityTest.slice(0, -1);
    //             // this.products[this.index].quantity = this.quantityTest;
    //             this.quantity = this.quantityTest;
    //           }else{
    //             this.products.splice(this.index, 1);
    //           } 
    //       }
    //     } else if (this.actionType == "price") {
    //       if (event != 'backspace') {
    //         this.priceTest += this.numberPassed.toString()
    //         this.price = this.priceTest;
    //       } else {
    //         if (this.price !=""){
    //         this.priceTest = this.priceTest.slice(0, -1);
    //         this.price = this.priceTest;
    //         }else{
    //           this.products.splice(this.index, 1);
    //         }
    //       }
    //     } 
    //   } 
    //   else if (this.numberPassed == ",") {
    //     if (this.actionType == "quantity" && !this.quantityTest.includes('.')) {
    //       this.quantityTest += ".";
    //       this.quantity = this.quantityTest;
    //     } else if (this.actionType == "price" && !this.quantityTest.includes('.')) {
    //       this.priceTest += ".";
    //       this.price = this.priceTest;
    //     } 
    //   }
    //   this.emitPrice.emit(this.price);
    //   this.emitQuantity.emit(this.quantity);
      
    // }    
  }
  onselectCustomer(customer:any){
    this.customer_name = customer.name;
    this.displayClient = true;
  }

}
