import { Component, OnInit, AfterViewInit, Input, Output, EventEmitter, ChangeDetectorRef, ViewChildren, QueryList } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ApiService, ContextService, TreeComponent } from 'sb-shared-lib';
import { Order, OrderPayment, OrderPaymentPart, OrderLine } from '../../payments.model';
import { SessionOrderPaymentsPaymentPartComponent } from './part/payment-part.component';
import { SessionOrderPaymentsOrderLineComponent } from './line/order-line.component';


// declaration of the interface for the map associating relational Model fields with their components
interface OrderPaymentComponentsMap {
    order_payment_parts_ids: QueryList<SessionOrderPaymentsPaymentPartComponent>
    order_lines_ids: QueryList<SessionOrderPaymentsOrderLineComponent>    
};

@Component({
    selector: 'session-order-payments-order-payment',
    templateUrl: 'order-payment.component.html',
    styleUrls: ['order-payment.component.scss']
})
export class SessionOrderPaymentsOrderPaymentComponent extends TreeComponent<OrderPayment, OrderPaymentComponentsMap> implements OnInit, AfterViewInit  {
    // servel-model relayed by parent
    @Input() set model(values: any) { this.update(values) }
    @Output() updated = new EventEmitter();
    @Output() deleted = new EventEmitter();
    @Output() validated = new EventEmitter();
    @Output() selectedPaymentPart = new EventEmitter();
    @Output() selectedOrderLine = new EventEmitter();

    @ViewChildren(SessionOrderPaymentsPaymentPartComponent) SessionOrderPaymentsPaymentPartComponents: QueryList<SessionOrderPaymentsPaymentPartComponent>; 
    @ViewChildren(SessionOrderPaymentsOrderLineComponent) SessionOrderPaymentsOrderLineComponents: QueryList<SessionOrderPaymentsOrderLineComponent>; 


    public ready: boolean = false;
    public paymentPart : any;

    public qty:FormControl = new FormControl();
    public unit_price:FormControl = new FormControl();

    public display = "";
    public index : number;
    

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private cd: ChangeDetectorRef,
        private api: ApiService,    
        private context: ContextService
    ) { 
        super( new OrderPayment() ) 
    }


    public ngAfterViewInit() {
        // init local componentsMap
        let map:OrderPaymentComponentsMap = {
            order_payment_parts_ids: this.SessionOrderPaymentsPaymentPartComponents,
            order_lines_ids: this.SessionOrderPaymentsOrderLineComponents
        };
        this.componentsMap = map;
    }

    public onclickOk() {
        console.log(this.componentsMap.order_lines_ids);
        console.log(this.SessionOrderPaymentsOrderLineComponents.toArray());
    }

    public ngOnInit() {

        this.qty.valueChanges.subscribe( (value:number)  => this.instance.qty = value );
        this.unit_price.valueChanges.subscribe( (value:number)  => this.instance.unit_price = value );
    }

    public update(values:any) {
        console.log('line item update', values.order_lines_ids[0]);
        
        super.update(values);

        // update widgets and sub-components, if necessary
        this.qty.setValue(this.instance.qty);
        this.unit_price.setValue(this.instance.unit_price);

        // this.cd.detectChanges();
    }

    public async onclickDelete() {
        await this.api.update((new Order()).entity, [this.instance.order_id], {order_payments_ids: [-this.instance.id]});
        this.deleted.emit();
    }

    public async onupdatePart(part_id:number) {
        // relay to parent component
        this.updated.emit();
    }
    
    public async ondeletePart(part_id:number) {
        // relay to parent component
        this.updated.emit();
    }

    public async onvalidate(paymentPart : any) {
        this.paymentPart = paymentPart;
        // relay to parent component
        this.validated.emit(paymentPart);
    }

    public async ondeleteLine(line_id:number) {
        await this.api.update(this.instance.entity, [this.instance.id], {order_lines_ids: [-line_id]});
        this.instance.order_lines_ids.splice(this.instance.order_lines_ids.findIndex((e:any)=>e.id == line_id),1);
        // this.updated.emit();
    }

    public async onclickCreateNewPart() {
        console.log(this.componentsMap.order_lines_ids)
        await this.api.create((new OrderPaymentPart()).entity, {order_payment_id: this.instance.id});
        this.updated.emit();
    }

    public onDisplayProducts() {
        // if (this.selectedProduct != 0) {
        //     const dialogRef = this.dialog.open(ProductInfo, {
        //       data: this.selectedProduct
        //     });
        //     dialogRef.afterClosed().subscribe(
        //     )
        //   }
    }

    public onSelectedOrderLine(index : number){   
        this.index = index;
        this.selectedOrderLine.emit(index);
    }

    public onSelectedPaymentPart(index : number){
        this.selectedPaymentPart.emit(index);
    }
}





// @Component({
//     selector: 'product-info',
//     template: `
//     <h2 style="background-color: white; text-align: center" mat-dialog-title>Informations de l'article</h2>
//     <div style="background-color: #F5F5F5; width: 40rem; padding:0.5rem" mat-dialog-content>
//       <div style="display: flex; justify-content:space-between; padding: 0.5rem; font-weight:bolder; padding:0.2rem;">
//         <div>
//           {{data.name}}
//         </div>
//         <div style="display: flex; flex-direction:column">
//           <span>
//             {{data.price}}
//           </span>
//           <span>
//             Taxe
//           </span>
//         </div>
//       </div>
  
//       <div style="margin-top: 0.25rem;">
//         <h4 style="border-bottom: 1px solid black; font-weight:bolder; padding:0.2rem;">Éléments comptables</h4>
//         <div>
//           <span>Prix HT</span> <span></span>
//         </div>
//         <div>
//           <span>Coût</span> <span></span>
//         </div>
//         <div>
//           <span>Marge</span> <span></span>
//         </div>
//       </div>
  
//       <div style="margin-top: 0.25rem;">
//         <h4 style="border-bottom: 1px solid black; font-weight:bolder; padding:0.2rem;">Stock</h4>
//         <div>
//           <span>Restant</span> <span></span>
//         </div>
//       </div>
  
//       <div style="margin-top: 0.25rem;">
//         <h4 style="border-bottom: 1px solid black; font-weight:bolder; padding:0.2rem;">Commande</h4>
//         <div>
//           <span>Restant</span> <span></span>
//         </div>
//       </div>
//       <div mat-dialog-actions style="display: flex; justify-content: flex-end; padding: 1rem">
//       <button  mat-raised-button (click)="closeDialog()"  color="primary">Fermer</button>
//       </div>
//     </div>
   
//     `
//   })
//   export class ProductInfo {
  
//     constructor(
//       public dialogDelete: MatDialogRef<ProductInfo>,
//       @Inject(MAT_DIALOG_DATA) public data: any
//     ) { }
//     public deleteConfirmation = false;
//     ngOnInit(): void {
//       console.log(this.data);
//     }
//     public closeDialog() {
//       this.dialogDelete.close({
//       })
//     }
//   }