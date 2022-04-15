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
    @Output() selectedPaymentPart = new EventEmitter();
    @Output() selectedOrderLine = new EventEmitter();

    @ViewChildren(SessionOrderPaymentsPaymentPartComponent) SessionOrderPaymentsPaymentPartComponents: QueryList<SessionOrderPaymentsPaymentPartComponent>; 
    @ViewChildren(SessionOrderPaymentsOrderLineComponent) SessionOrderPaymentsOrderLineComponents: QueryList<SessionOrderPaymentsOrderLineComponent>; 


    public ready: boolean = false;


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
        // init componentsMap
        this.componentsMap = {
        };
        this.qty.valueChanges.subscribe( (value:number)  => this.instance.qty = value );
        this.unit_price.valueChanges.subscribe( (value:number)  => this.instance.unit_price = value );
    }

    public update(values:any) {
        console.log('line item update', values);
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
        if(this.display != "products"){
            this.display = "products";
        }else{
            this.display = "";
        } 
        
        console.log(this.componentsMap.order_lines_ids)
        console.log(this.componentsMap.order_lines_ids.toArray())
        
    }

    public onSelectedOrderLine(index : number){   
        this.index = index;
        this.selectedOrderLine.emit(index);
    }

    public onSelectedPaymentPart(index : number){
        this.selectedPaymentPart.emit(index);
    }
}