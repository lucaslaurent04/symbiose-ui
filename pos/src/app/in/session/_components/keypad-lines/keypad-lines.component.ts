import { Component, EventEmitter, Inject, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { th } from 'date-fns/locale';
import { data } from 'jquery';




@Component({
    selector: 'order-keypad-lines',
    templateUrl: './keypad-lines.component.html',
    styleUrls: ['./keypad-lines.component.scss']
})
export class OrderKeypadLinesComponent implements OnInit {

    public products: any = [{ id: 1, price: "5", name: "Esteban", quantity: "1.00", discount: "" }, { id: 2, price: "7.5", name: "Graccus", quantity: "1.00", discount: "" }];
    public selectedProduct = 0;
    public invoice = false;
    public actionType: any = "qty";
    public displayClient = true;
    public quantityTest = "";
    public priceTest = "";
    public discountTest = "";
    public numberPassed = 0;
    public numberPassedIndex = -1;
    public total = 0;
    public taxes = 0;
    public posLineDisplay: string = "main";
    public operator: string = '+';
    public paymentValue: string;

    @Output() onGetInvoice = new EventEmitter();
    @Output() onDisplayDetails = new EventEmitter();
    @Output() onKeyPressed = new EventEmitter();
    @Output() onTypeMode = new EventEmitter();
    @Output() customer_change : any = new EventEmitter();
    @Input() customer_name : string;

    constructor(private dialog: MatDialog) { }

    ngOnInit(): void {
        this.total = 0;
        this.products.forEach((element: any) => {
            this.total += Number(element.price) * Number(element.quantity);
        })
    }

    onInvoice() {
        this.invoice = !this.invoice;
        this.onGetInvoice.emit(this.invoice);
    }

    changeClient() {
        // could be used to change clients
    }

    getPosLineDisplay(value: string) {
        this.onDisplayDetails.emit(value);
        // this.discountValue = "0";
        // this.posLineDisplay = value;
    }

    getDiscountValue(value: any) {
    }

    getPaymentSelection(value: string) {

    }

    getPaymentValue(value: any) {
    }

    onDisplayProductInfo() {
    }

    onSelectedProductChange(element: any) {
        this.selectedProduct = element[0].value;
        // Products infos
        const dialogRef = this.dialog.open(PosOpening, {
            data: this.selectedProduct
        });
        dialogRef.afterClosed().subscribe(
        )
    }

    checkActionType(event: any) {
        this.onTypeMode.emit(event);
    }

    onselectCustomer(customer: any) {
        this.customer_name = customer.name;
        this.displayClient = true;
        this.customer_change.emit(customer);
    }

    onKeypress(event: any) {
        this.onKeyPressed.emit(event);
    }
}


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

    public deleteConfirmation = false;
    public displayTablet = false;
    public coins: any = [{ value: "" }, { value: "" }];

    constructor(
        public dialogDelete: MatDialogRef<PosOpening>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private dialog: MatDialog
    ) { }

    ngOnInit(): void {
        console.log(this.data);
    }

    onDisplayCoins() {
    }

    public closeDialog() {
        this.dialogDelete.close({});
    }
}







