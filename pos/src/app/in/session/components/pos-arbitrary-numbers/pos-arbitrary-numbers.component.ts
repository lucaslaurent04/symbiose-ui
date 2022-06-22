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
  }

  checkNumberPassed(event: any) {
    this.onDigitTyped.emit(event);
  }

  onselectCustomer(customer:any){
    this.customer_name = customer.name;
    this.displayClient = true;
  }

}
