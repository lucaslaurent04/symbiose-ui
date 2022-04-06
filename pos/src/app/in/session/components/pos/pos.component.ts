import { Component, EventEmitter, Inject, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { th } from 'date-fns/locale';
import { data } from 'jquery';




@Component({
  selector: 'pos-pad',
  templateUrl: './pos.component.html',
  styleUrls: ['./pos.component.scss']
})
export class PosComponent implements OnInit {

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
  // public posLineDisplay : string = "main";
  // public discountValue : any = "";
  public operator : string = '+';
  public paymentValue : string;
  
  @Output() onGetInvoice = new EventEmitter();
  @Output() onDisplayDetails = new EventEmitter();
  @Output() onDigitTyped = new EventEmitter();
  @Output() onTypeMode = new EventEmitter();

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
    if (this.selectedProduct != 0) {
      const dialogRef = this.dialog.open(ProductInfo, {
        data: this.selectedProduct
      });
      dialogRef.afterClosed().subscribe(
      )
    }
  }

  onSelectedProductChange(element: any) {
    this.selectedProduct = element[0].value;
    // this.index = this.products.findIndex((elem:any) => elem.id == element[0].value.id);
    // Products infos
    const dialogRef = this.dialog.open(PosOpening, {
      data: this.selectedProduct
    });
    dialogRef.afterClosed().subscribe(
    )
  }

  onBackSpace(event: any) {
    this.checkNumberPassed(event);
  }

  checkActionType(event: any) {
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
}





// Infos Produits


@Component({
  selector: 'product-info',
  template: `
  <h2 style="background-color: white; text-align: center" mat-dialog-title>Informations de l'article</h2>
  <div style="background-color: #F5F5F5; width: 40rem; padding:0.5rem" mat-dialog-content>
    <div style="display: flex; justify-content:space-between; padding: 0.5rem; font-weight:bolder; padding:0.2rem;">
      <div>
        {{data.name}}
      </div>
      <div style="display: flex; flex-direction:column">
        <span>
          {{data.price}}
        </span>
        <span>
          Taxe
        </span>
      </div>
    </div>

    <div style="margin-top: 0.25rem;">
      <h4 style="border-bottom: 1px solid black; font-weight:bolder; padding:0.2rem;">Éléments comptables</h4>
      <div>
        <span>Prix HT</span> <span></span>
      </div>
      <div>
        <span>Coût</span> <span></span>
      </div>
      <div>
        <span>Marge</span> <span></span>
      </div>
    </div>

    <div style="margin-top: 0.25rem;">
      <h4 style="border-bottom: 1px solid black; font-weight:bolder; padding:0.2rem;">Stock</h4>
      <div>
        <span>Restant</span> <span></span>
      </div>
    </div>

    <div style="margin-top: 0.25rem;">
      <h4 style="border-bottom: 1px solid black; font-weight:bolder; padding:0.2rem;">Commande</h4>
      <div>
        <span>Restant</span> <span></span>
      </div>
    </div>
    <div mat-dialog-actions style="display: flex; justify-content: flex-end; padding: 1rem">
    <button  mat-raised-button (click)="closeDialog()"  color="primary">Fermer</button>
    </div>
  </div>
 
  `
})
export class ProductInfo {

  constructor(
    public dialogDelete: MatDialogRef<ProductInfo>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }
  public deleteConfirmation = false;
  ngOnInit(): void {
    console.log(this.data);
  }
  public closeDialog() {
    this.dialogDelete.close({
    })
  }
}





// Ouverture de caisse


@Component({
  selector: 'pos-opening',
  template: `
  <h2 mat-dialog-title style="text-align:center">Contrôle des espèces à l'ouverture</h2>
  <div mat-dialog-content  style="width: 40rem; background-color:lightgray; padding: 1rem">
    <div>
      <div style="display: flex; justify-content:space-between; padding: 0.5rem">
        <h4 style="font-weight:bold">Espèces à l'ouverture</h4> 
        <div class="tablet" style="width:25%; display:flex; justify-content:space-evenly;align-items: center; border-bottom: 1px solid black; float:right;padding: 0.4rem">
          <p style="font-size: 1.5rem; margin:0; height:max-content">{{data.price}}</p>
          <button style="padding: 0.75rem;" (click)="onDisplayCoins()" *ngIf ="!displayTablet"><mat-icon>tablet_android</mat-icon></button>
        </div>
      </div>
      <div>
        <!-- <app-pad style="width: 50%;" *ngIf = "displayTablet"></app-pad> -->
        <textarea style="background-color: white; border: 2px solid lightgreen; margin: 0.2rem; padding: 0.2rem; width:100%;" name="" id="" cols="30" rows="10" placeholder="Espèces">
        <ul> <li></li> </ul></textarea>
      </div>
    </div> 
    <div mat-dialog-actions style="display: flex; justify-content: flex-end; background-color:lightgray; width: 100%">
    <button mat-raised-button color="primary" style="display:block;" mat-raised-button (click)="closeDialog()" >Fermer</button>
  </div>
  `
})

export class PosOpening {
  constructor(
    public dialogDelete: MatDialogRef<PosOpening>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog
  ) { }
  public deleteConfirmation = false;
  public displayTablet = false;
  public coins : any = [{value :""}, { value : ""}];
  ngOnInit(): void {
    console.log(this.data);
  }

  onDisplayCoins() {
    const dialogRef = this.dialog.open(PosClosingCoins, {
    });
    dialogRef.afterClosed().subscribe(
      data =>{
        console.log(data)
        this.coins = data.data.filter((element:any)=>{
          element.number != "";
        });
      }
    )
  }

  public closeDialog() {
    this.dialogDelete.close({
    })
  }
}


// Fermeture de caisse

@Component({
  selector: 'pos-closing',
  template: `
  <h2 mat-dialog-title style="text-align:center">Contrôle de fermeture</h2>
  <div mat-dialog-content style="background-color:#F5F5F5; padding: 3rem">
    <div style="display: flex; justify-content: space-between; align-items:center; border-bottom: 1px solid lightgray">
      <div style="display: flex; flex-direction:column">
       <p>Total x commandes <span> prix </span></p> 
       <p>Paiements <span> prix </span></p> 
      </div>
      <div style="border-left: light-grey 1px solid;">
        Money details:
        x x x €
      </div>
    </div>
    <div>
      <div style="display: flex; width: 100%; justify-content: space-around; margin: 0.5rem; padding:1rem">
        <div>
          <h4>Moyen de Paiement</h4>
        </div>
        <div>
          <h4>Attendu</h4>
        </div>
        <div>
          <h4>Compté</h4>
          <div style="display: flex; border-bottom: 1px solid black;">
            <p style="padding-right: 0.4rem;">{{data.name}}</p>
            <button  (click)="onDisplayCoins()" *ngIf = "!displayTablet" ><mat-icon>tablet_android</mat-icon></button>
          </div>
        </div>
        <div>
          <h4>Différence</h4>
          <p color="red">prix</p>
        </div>
      </div> 
      <div style="display: flex; justify-content:center">
        <div *ngIf= displayTablet style="display: flex; justify-content:center">
          <!-- <app-pad ></app-pad>
          <app-pad-arbitrary-numbers></app-pad-arbitrary-numbers> -->
        </div>
        <textarea style="width: 100%;" name="" id="" cols="30" rows="10" placeholder="Notes">
          
        </textarea>
      </div>
      <div style="display: flex; margin-top: 0.4rem ">
         <mat-checkbox class="example-margin"></mat-checkbox>
         <span style="margin-left: 0.4rem;">Accepter la différence de paiement et l'enregistrer au journal des pertes et des profits</span>
      </div>
    </div>
    <div mat-dialog-actions style="display: flex; justify-content: flex-end;">
    <button mat-raised-button color="primary" (click)="closeDialog()" >Fermer</button>
    </div>
  </div>
  `
})

export class PosClosing {
  constructor(
    public dialogDelete: MatDialogRef<PosClosing>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog
  ) { }
  public deleteConfirmation = false;
  public displayTablet = false;
  ngOnInit(): void {
    console.log(this.data);
  }

  onDisplayCoins() {
    const dialogRef = this.dialog.open(PosClosingCoins, {
    });
    dialogRef.afterClosed().subscribe(
      data =>{
        return data;
      }
    )
  }
  onDisplayTablet() {
  }

  public closeDialog() {
    this.dialogDelete.close({
    })
  }
}




// Checking des pièces/billets

@Component({
  selector: 'pos-closing-coins',
  template: `
  <div mat-dialog-content>
    <div>
      <div>
        <h2 style="text-align: center; text-decoration:underline; margin:2rem">Pièces/Billets</h2>
      </div>
      <div style="display: flex; justify-content: space-evenly; align-items: center; width: 75rem">
        <div style="display: grid;
                    grid-auto-flow: column;
                    grid-template-columns: repeat(2, 1fr);
                    grid-template-rows: repeat(8, 1fr); height: 100%">
            <div *ngFor="let coin of coins; index as i" style="margin: 0.2rem;">
              <input style="font-size: 1.2rem" type="number" [value]="coin.number" (focus)="onGetFocusedInput(i)"> <mat-label style="font-size: 1.2rem; font-weight: bold; padding: 0.2rem">{{coin.value}}€</mat-label>
            </div>
        </div>
        <!-- <div style="display: flex; border-bottom: 1px solid black;" *ngIf = "!displayTablet">
            <p style="padding-right: 0.4rem;">{{data.name}}</p>
            <button  (click)="displayTablet = !displayTablet" ><mat-icon>tablet_android</mat-icon></button>
        </div> -->
        <div style="display: flex; border: 1px solid lightgreen">
          <app-pad (newNumberPassed)="onCheckNumberPassed($event)"></app-pad>
          <app-pad-arbitrary-numbers (OnaddedNumber)="checkActionType($event)" (OnBackspace)="onBackSpace($event)"></app-pad-arbitrary-numbers>
        </div>
      </div>    
    </div>
  </div>
  <div>
    <h3 style="margin-top: 0.5rem; margin-left:6rem; font-weight: bold">TOTAL: {{total.toFixed(2)}} €</h3>
  </div>
  <div mat-dialog-actions style="display: flex; justify-content: flex-end">
    <button mat-raised-button color="primary" style="float:right" mat-raised-button (click)="closeDialog()" >Fermer</button>
  </div>`
})

export class PosClosingCoins {
  constructor(
    public dialogDelete: MatDialogRef<PosClosingCoins>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }
  public deleteConfirmation = false;
  public displayTablet = false;
  public index: number;
  public total: number = 0;
  public actionType: any = "";
  public coins = [
    {
      value: 0.01, number: ""
    },
    {
      value: 0.02, number: ""
    },
    {
      value: 0.05, number: ""
    },
    {
      value: 0.1, number: ""
    },
    {
      value: 0.2, number: ""
    },
    {
      value: 0.5, number: ""
    },
    {
      value: 1, number: ""
    },
    {
      value: 2, number: ""
    },
    {
      value: 5, number: ""
    },
    {
      value: 10, number: ""
    },
    {
      value: 20, number: ""
    },
    {
      value: 50, number: ""
    },
    {
      value: 100, number: ""
    },
    {
      value: 200, number: ""
    },
    {
      value: 500, number: ""
    }
  ]


  ngOnInit(): void {
  }

  onCheckNumberPassed(value: any) {
    if (value != 'backspace' && value != ',' && value != '+/-') {
      this.coins[this.index].number += value;
      this.onGetTotal();
    }


    if (value == 'backspace') {
      let test = this.coins[this.index].number.slice(0, -1);
      this.coins[this.index].number = test;
      this.onGetTotal();
    }
  }

  onGetTotal() {
    this.total = 0;
    this.coins.forEach((element) => {
      if (element.number != "") {
        this.total += element.value * parseFloat(element.number);
      }
    })
  }

  onGetFocusedInput(input: any) {
    this.index = input;
  }

  public closeDialog() {
    this.dialogDelete.close({
      data: this.coins,
      total: this.total
    })
  }

  onBackSpace(element: any) {
    this.onCheckNumberPassed('backspace');
  }

  checkActionType(event: any) {
    this.actionType = event;
    if (this.coins[this.index].number == "") {
      this.coins[this.index].number = (parseFloat(event)).toString();

    } else {
      this.coins[this.index].number = (parseFloat(this.coins[this.index].number) + parseFloat(event)).toString();
    }
    this.onGetTotal();
  }
}



