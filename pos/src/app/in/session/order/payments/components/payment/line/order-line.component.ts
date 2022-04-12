import { Component, OnInit, AfterViewInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ApiService, ContextService, TreeComponent } from 'sb-shared-lib';
import { OrderPayment, OrderLine } from '../../../payments.model';
import {ThemePalette} from '@angular/material/core';


// declaration of the interface for the map associating relational Model fields with their components
interface OrderLineComponentsMap {
    // no sub-items
};

@Component({
    selector: 'session-order-payments-order-line',
    templateUrl: 'order-line.component.html',
    styleUrls: ['order-line.component.scss']
})
export class SessionOrderPaymentsOrderLineComponent extends TreeComponent<OrderLine, OrderLineComponentsMap> implements OnInit, AfterViewInit  {
    // servel-model relayed by parent
    @Input() set model(values: any) { this.update(values) }
    @Output() deleted = new EventEmitter();


    // public ready: boolean = false;
    public checked : boolean = true;


    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private cd: ChangeDetectorRef,
        private api: ApiService,    
        private context: ContextService
    ) { 
        super( new OrderLine() ) 
    }


    public ngAfterViewInit() {
        this.componentsMap = {};
    }

    public ngOnInit() {
    }

   

    public update(values:any) {
        console.log('line item update', values);
        super.update(values);
    }

    public async onclickDelete() {
        await this.api.update((new OrderPayment()).entity, [this.instance.order_payment_id], {order_lines_ids: [-this.instance.id]});
        this.deleted.emit();
    }

}