import { Component, OnInit, AfterViewInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ApiService, ContextService, TreeComponent } from 'sb-shared-lib';
import { OrderPayment, OrderPaymentPart } from '../../../payments.model';


// declaration of the interface for the map associating relational Model fields with their components
interface OrderPaymentPartComponentsMap {
    // no sub-items
};

@Component({
    selector: 'session-order-payments-payment-part',
    templateUrl: 'payment-part.component.html',
    styleUrls: ['payment-part.component.scss']
})
export class SessionOrderPaymentsPaymentPartComponent extends TreeComponent<OrderPaymentPart, OrderPaymentPartComponentsMap> implements OnInit, AfterViewInit  {
    // servel-model relayed by parent
    @Input() set model(values: any) { this.update(values) }
    @Output() updated = new EventEmitter();
    @Output() deleted = new EventEmitter();


    public ready: boolean = false;


    public amount:FormControl = new FormControl();
    public payment_method:FormControl = new FormControl();



    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private cd: ChangeDetectorRef,
        private api: ApiService,
        private context: ContextService
    ) {
        super( new OrderPaymentPart() )
    }


    public ngAfterViewInit() {
        this.componentsMap = {};
    }

    public ngOnInit() {
        this.amount.valueChanges.subscribe( (value:number)  => this.instance.amount = value );
        this.payment_method.valueChanges.subscribe( (value:number)  => this.instance.payment_method = value );
    }

    public update(values:any) {
        console.log('line item update', values);
        super.update(values);

        // update widgets and sub-components, if necessary
        this.amount.setValue(this.instance.amount);
        this.payment_method.setValue(this.instance.payment_method);

        // this.cd.detectChanges();
    }

    public async onclickDelete() {
        await this.api.update((new OrderPayment()).entity, [this.instance.order_payment_id], {order_payment_parts_ids: [-this.instance.id]});
        this.deleted.emit();
    }

    public async onchangeAmount() {
        await this.api.update(this.instance.entity, [this.instance.id], {amount: this.instance.amount});
        this.updated.emit();
    }

    public async onchangePaymentMethod() {
        await this.api.update(this.instance.entity, [this.instance.id], {payment_method: this.instance.payment_method});
        this.updated.emit();
    }

    public async onchangeBookingId() {
        await this.api.update(this.instance.entity, [this.instance.id], {unit_price: this.instance.unit_price});
        // no change in the tree - no reload needed
    }

    public async onchangeVoucherRef() {
        await this.api.update(this.instance.entity, [this.instance.id], {unit_price: this.instance.unit_price});
        // no change in the tree - no reload needed
    }

}