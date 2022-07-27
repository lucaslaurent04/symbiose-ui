import { Component, OnInit, AfterViewInit, Input, Output, EventEmitter, ChangeDetectorRef, ViewChildren, QueryList, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService, ContextService, TreeComponent } from 'sb-shared-lib';
import { Order, OrderPayment, OrderPaymentPart, OrderLine } from '../../payments.model';
import { SessionOrderPaymentsPaymentPartComponent } from './part/payment-part.component';
import { SessionOrderPaymentsOrderLineComponent } from './line/order-line.component';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { isThisMinute } from 'date-fns';


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
    @Output() updatedQty = new EventEmitter();
    @Output() selectedPaymentPart = new EventEmitter();
    @Output() selectedOrderLine = new EventEmitter();
    @Input() customer = '';
    @ViewChildren(SessionOrderPaymentsPaymentPartComponent) SessionOrderPaymentsPaymentPartComponents: QueryList<SessionOrderPaymentsPaymentPartComponent>; 
    @ViewChildren(SessionOrderPaymentsOrderLineComponent) SessionOrderPaymentsOrderLineComponents: QueryList<SessionOrderPaymentsOrderLineComponent>; 


    public ready: boolean = false;
    public paymentPart : any;
    public qty:FormControl = new FormControl();
    public unit_price:FormControl = new FormControl();
    public display = "";
    public index : number;
    public focused: any;
    public line_quantity : any = "";




    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private cd: ChangeDetectorRef,
        private api: ApiService,    
        private context: ContextService,
        private dialog: MatDialog
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
        // this.line_quantity.valueChanges.subscribe( (value:number)  => console.log('okay') );
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
        await this.api.create((new OrderPaymentPart()).entity, {order_payment_id: this.instance.id});
        this.updated.emit();
    }

    public onDisplayProducts() {
        
    }

    public onSelectedOrderLine(index : number){   
        this.index = index;
        this.selectedOrderLine.emit(index);
    }

    public async setNewLineValue(digits : number){
        
        // change the value of the line, only if it's lower ! and add it to the right side again !
        this.instance.order_lines_ids.forEach((line : any) => {
            if(line.id == this.index){
                let newLineQty = line.qty.toString() + digits.toString();
                if(line.qty>= newLineQty){
                    this.line_quantity = newLineQty;
                    console.log(this.line_quantity, 'changeed')
                }else if (line.qty>= digits){
                    this.line_quantity = digits;
                    console.log(this.line_quantity, 'changeed')

                }
                this.changeQuantity(line);
            }
        });
        
        

    }

    public selectLine(index:number){
        this.index = index;
        console.log(this.index);
    }

    public onSelectedPaymentPart(index : number){
        this.selectedPaymentPart.emit(index);
    }

    public async onConfirmOrderPayment(){
        await this.api.update(this.instance.entity, [this.instance.id], {  status: 'paid' });
        this.updated.emit();

    }

    public async changeQuantity(line : any){
        
    // Remove the number of elements indicated, and create a new object with the difference

        if(parseInt(this.line_quantity) <line.qty){
            await this.api.create('lodging\\sale\\pos\\OrderLine', {
                order_id: line.order_id,
                order_payment_id: 0,
                order_unit_price: line.unit_price,
                has_funding: line.has_funding,
                funding_id: line.funding_id,
                vat_rate: line.vat_rate,
                discount: line.discount,
                free_qty: line.free_qty,
                name: line.name,
                qty: line.qty-parseInt(this.line_quantity)
            });
            await this.api.update('lodging\\sale\\pos\\OrderLine', [line.id], {
                qty : parseInt(this.line_quantity)
            });
        }else{
            await this.api.update('lodging\\sale\\pos\\OrderLine', [line.id], {
                qty : parseInt(this.line_quantity)
            });
        }  
        line.qty = this.line_quantity;  
        this.updatedQty.emit();    
    }
}