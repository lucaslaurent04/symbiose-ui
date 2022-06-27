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
    @Output() validated = new EventEmitter();
    @Input() customer : any;


    public ready: boolean = false;
    public hasValidated = false;
    
    public focused : string;
    public myToggle : string;

    public amount:FormControl = new FormControl();
    public voucher_ref:FormControl = new FormControl();
    public booking_id:FormControl = new FormControl();
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
        this.voucher_ref.valueChanges.subscribe( (value:number)  => this.instance.voucher_ref = value );
        this.booking_id.valueChanges.subscribe( (value:number)  => this.instance.booking_id = value );
        
    }

    public update(values:any) {
        super.update(values);
        // update widgets and sub-components, if necessary
        this.amount.setValue(this.instance.amount);
        this.payment_method.setValue(this.instance.payment_method);
        this.voucher_ref.setValue(this.instance.voucher_ref);
        this.booking_id.setValue(this.instance.booking_id);
        this.cd.detectChanges();
    }

    public async onclickDelete() {
        await this.api.update((new OrderPayment()).entity, [this.instance.order_payment_id], {order_payment_parts_ids: [-this.instance.id]});
        await this.api.remove(this.instance.entity, [this.instance.id]);
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

    public async onchangeBookingId(booking: any) {
        await this.api.update(this.instance.entity, [this.instance.id], {booking_id: booking.id});
        // no change in the tree - no reload needed
    }

    public async onchangeVoucherRef() {
        await this.api.update(this.instance.entity, [this.instance.id], {voucher_ref: this.instance.voucher_ref});
        // no change in the tree - no reload needed
    }

    public async validate(){
        this.validated.emit(this.instance);
        this.hasValidated = true;
    }

    public displayBooking (item : any): string{
        return item.name + '-' + item.customer_id.name;
    }
}