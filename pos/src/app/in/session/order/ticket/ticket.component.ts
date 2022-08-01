import { Component, OnInit, AfterViewInit, ChangeDetectorRef, ViewChildren, QueryList, Input, SimpleChanges, ViewChild } from '@angular/core';
import { ActivatedRoute, BaseRouteReuseStrategy, Router } from '@angular/router';
import { ApiService, ContextService, TreeComponent, RootTreeComponent } from 'sb-shared-lib';
import { CashdeskSession } from '../../session.model';
import { Order, OrderLine, OrderPayment, OrderPaymentPart } from './ticket.model';

import { SessionOrderLinesComponent } from '../lines/lines.component';
import { OrderService } from 'src/app/in/orderService';
import { BookingLineClass } from 'src/app/model';

import { MatTableDataSource } from '@angular/material/table';
import {DataSource, SelectionModel} from '@angular/cdk/collections';


// declaration of the interface for the map associating relational Model fields with their components
interface OrderComponentsMap {

};


@Component({
    selector: 'session-order-ticket',
    templateUrl: 'ticket.component.html',
    styleUrls: ['ticket.component.scss']
})
export class SessionOrderTicketComponent extends TreeComponent<Order, OrderComponentsMap> implements RootTreeComponent, OnInit, AfterViewInit {
    // @ViewChildren(SessionOrderPaymentsOrderPaymentComponent) SessionOrderPaymentsOrderPaymentComponents: QueryList<SessionOrderPaymentsOrderPaymentComponent>;
    // @ViewChildren(SessionOrderLinesComponent) SessionOrderLinesComponents: QueryList<SessionOrderLinesComponent>;
    

    public ready: boolean = false;
    public typeMode: any;
    public amount: any;
    public digits: any;

    public selectedPaymentIndex: number;    
    public selectedPaymentPartIndex: number;
    public selectedTabIndex: number = 0;

    public focus: string;

    public show_products: boolean = false;
    public is_validated: boolean = false;

    public due: number;
    public change: any;
    public session: CashdeskSession = new CashdeskSession();

    public orderLines : any;
    public orderPayment : any;

    public dataSource : any;
    public selection : any;
    public invoice : any;
    public line_quantity : string;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private api: ApiService,
        private context: ContextService,
        public orderservice: OrderService
    ) {
        super(new Order());
    }

    public ngAfterViewInit() {
        // init local componentsMap
        let map: OrderComponentsMap = {
        };
        this.componentsMap = map;
    }

    public onclickInvoice(invoice : any){
        this.invoice = invoice;
    }

    public async onclickValidate() {
        try {
            await this.api.fetch('?do=lodging_order_do-pay', {id : this.instance.id });
            // enable ticket pane and switch to it
            this.is_validated = true;
            this.selectedTabIndex = 1;
        }
        catch(response) {
            console.warn(response);
        }
    }

    public ngOnInit() {        
        // fetch the IDs from the route
        this.route.params.subscribe(async (params) => {
            if (params && params.hasOwnProperty('session_id') && params.hasOwnProperty('order_id')) {
                try {
                    await this.loadSession(<number>params['session_id']);
                    await this.load(<number>params['order_id']);
                    this.ready = true;
                }
                catch (error) {
                    console.warn(error);
                }
            }
        });
    }

    private async loadSession(session_id: number) {
        if (session_id > 0) {
            try {
                const result: any = await this.api.read(CashdeskSession.entity, [session_id], Object.getOwnPropertyNames(new CashdeskSession()));
                if (result && result.length) {
                    this.session = <CashdeskSession> result[0];
                }
            }
            catch (response) {
                throw 'unable to retrieve given session';
            }
        }
    }


    /**
     * Load an Order object using the sale_pos_order_tree controller
     * @param order_id
     */
    async load(order_id: number) {
        
        if (order_id > 0) {
            console.log('###################"', order_id);
            try {
                const data = await this.api.fetch('/?get=sale_pos_order_tree', { id: order_id, variant: 'ticket' });
                if (data) {
                    this.update(data);
                }
                
            }
            catch (response) {
               throw 'unable to retrieve given order';
            }
        }
    }

    /**
     *
     * @param values
     */
    public update(values: any) {
        super.update(values);
    }

    public async ondeletePayment(line_id: number) {
        // a line has been removed: reload tree
        this.load(this.instance.id);
    }

    public async onupdatePayment(line_id: number) {
        // a line has been removed: reload tree
        await this.load(this.instance.id);    
    }

    public async onupdateQty() {
        // a line has been removed: reload tree
        this.load(this.instance.id);
    }

    public canAddPayment() {
        if(this.instance.order_payments_ids.length) {
            // if the latest payment is not done, deny
            if(this.instance.order_payments_ids[this.instance.order_payments_ids.length-1].status != 'paid') {
                return false;
            }
            // if sum of payment has reached due amount, deny
            if(this.instance.total_paid >= this.instance.price) {
                return false;
            }
        }        
        return true;
    }

    public calcDueRemaining() {
        return Math.max(0, this.instance.total - this.instance.total_paid);
    }



    public onclickCloseSession() {
        this.router.navigate(['/session/'+this.session.id+'/close']);
    }

    public onclickFullscreen() {
        const elem:any = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } 
        else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
        } 
        else if (elem.webkitRequestFullscreen) {            
            elem.webkitRequestFullscreen();
        } 
        else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        }
    }     

    public async onPrint() {
        window.print();
    }
    public async customer_change(event: any){
        await this.api.update(this.instance.entity, [this.instance.id], { customer_id: event.id });
        this.load(this.instance.id);
    }

}