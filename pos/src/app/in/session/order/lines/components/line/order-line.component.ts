import { Component, OnInit, AfterViewInit, Input, Output, EventEmitter, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ApiService, ContextService, TreeComponent } from 'sb-shared-lib';
import { Order, OrderLine } from '../../lines.model';


// declaration of the interface for the map associating relational Model fields with their components
interface OrderLineComponentsMap {
};

@Component({
    selector: 'session-order-lines-order-line',
    templateUrl: 'order-line.component.html',
    styleUrls: ['order-line.component.scss']
})
export class SessionOrderLinesOrderLineComponent extends TreeComponent<OrderLine, OrderLineComponentsMap> implements OnInit, AfterViewInit  {
    // servel-model relayed by parent
    @Input() set model(values: any) { this.update(values) }
    @Input() selected :any;
    @Output() updated = new EventEmitter();
    @Output() deleted = new EventEmitter();


    public ready: boolean = false;


    public qty:FormControl = new FormControl();
    public unit_price:FormControl = new FormControl();

    public selectedLine: any;


    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private cd: ChangeDetectorRef,
        private api: ApiService,    
        private context: ContextService
    ) { 
        super( new OrderLine() ) 
    }

    ngOnChanges(changes: SimpleChanges): void {
        //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
        //Add '${implements OnChanges}' to the class. 
        if(this.instance.id == this.selected){
            this.selectedLine = true;
        } else{
            this.selectedLine = false;
        }
    }

    public ngAfterViewInit() {}

    public ngOnInit() {
        // init componentsMap
        this.componentsMap = {
        };
        this.qty.valueChanges.subscribe( (value:number)  => this.instance.qty = value );
        this.unit_price.valueChanges.subscribe( (value:number)  => this.instance.unit_price = value );
    }

    public update(values:any) {
        super.update(values);
        // update widgets and sub-components, if necessary
    }

    public async onclickDelete() {
        await this.api.update((new Order()).entity, [this.instance.order_id], {order_lines_ids: [-this.instance.id]});
        // await this.api.remove(this.instance.entity, [this.instance.id]);
        this.deleted.emit();
    }

    public async onchangeQty() {
        await this.api.update(this.instance.entity, [this.instance.id], {qty: this.instance.qty});        
        this.updated.emit();
    }

    public async onchangeUnitPrice() {
        await this.api.update(this.instance.entity, [this.instance.id], {unit_price: this.instance.unit_price});        
        this.updated.emit();
    }

    public async onChangeOrderLine(){
        await this.api.update(this.instance.entity, [this.instance.id], {qty: this.instance.qty, unit_price: this.instance.unit_price, discount: this.instance.discount, free_qty: this.instance.free_qty, vat_rate: this.instance.vat_rate});        
        this.updated.emit();
    }

    // public async onchangeDiscount() {
        
    //     await this.api.update(this.instance.entity, [this.instance.id], {discount: this.instance.discount});        
    //     this.updated.emit();
    // }

    // public async onchangeFreeQuantity() {
        
    //     await this.api.update(this.instance.entity, [this.instance.id], {free_qty: this.instance.free_qty});        
    //     this.updated.emit();
    // }

    // public async onchangeVatRate() {
      
    //     await this.api.update(this.instance.entity, [this.instance.id], {vat_rate: this.instance.vat_rate});        
    //     this.updated.emit();
    // }
}