import { Component, OnInit, AfterViewInit, ChangeDetectorRef, ViewChildren, QueryList, Input, SimpleChanges, ViewChild } from '@angular/core';
import { ActivatedRoute, BaseRouteReuseStrategy, Router } from '@angular/router';
import { ApiService, ContextService, TreeComponent, RootTreeComponent } from 'sb-shared-lib';
import { CashdeskSession } from './../../session.model';
import { Order, OrderLine, OrderPayment, OrderPaymentPart } from './payments.model';
import { SessionOrderPaymentsOrderPaymentComponent } from './_components/payment/order-payment.component';
import { SessionOrderLinesComponent } from '../../order/lines/lines.component';
import { OrderService } from 'src/app/in/orderService';
import { BookingLineClass } from 'src/app/model';

import { MatTableDataSource } from '@angular/material/table';
import {DataSource, SelectionModel} from '@angular/cdk/collections';


// declaration of the interface for the map associating relational Model fields with their components
interface OrderComponentsMap {
    order_payments_ids: QueryList<SessionOrderPaymentsOrderPaymentComponent>
};


@Component({
    selector: 'session-order-payments',
    templateUrl: 'payments.component.html',
    styleUrls: ['payments.component.scss']
})
export class SessionOrderPaymentsComponent extends TreeComponent<Order, OrderComponentsMap> implements RootTreeComponent, OnInit, AfterViewInit {
    @ViewChildren(SessionOrderPaymentsOrderPaymentComponent) SessionOrderPaymentsOrderPaymentComponents: QueryList<SessionOrderPaymentsOrderPaymentComponent>;


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
            order_payments_ids: this.SessionOrderPaymentsOrderPaymentComponents
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
            try {
                const data = await this.api.fetch('/?get=sale_pos_order_tree', { id: order_id, variant: 'payments' });
                if (data) {
                    this.update(data);
                }
                // fetch order lines (ordered products that haven't been paid yet)
                this.orderLines = await this.api.collect('sale\\pos\\OrderLine', [[['order_id', '=', this.instance.id], ['order_payment_id', '=', 0]],[['order_id', '=', this.instance.id], ['order_payment_id', '=', null]] ], ['funding_id', 'has_funding', 'qty', 'price', 'total', 'order_payment_id'], 'id', 'asc', 0, 100);
                this.dataSource = new MatTableDataSource(this.orderLines);
                this.selection = new SelectionModel(true, []);
            }
            catch (response) {
                console.log(response);
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


    /** 
     * Handler for payment-add button.
     * Adds a new payment only if all payments are paid and there is some due amount left.
     */ 
    public async onclickCreateNewPayment() {

        // check consistency       
        if(!this.canAddPayment()) {
            return;
        }

        this.orderPayment = await this.api.create((new OrderPayment()).entity, { order_id: this.instance.id });

        // reload the Tree
        await this.load(this.instance.id);
    }

    public async onclickAddProoduct() {

        // retrieve selected ids
        const order_lines_ids: number[] = this.selection.selected.map( (a:any) => a.id);

        // if there is no payment yet: create one
        if(!this.instance.order_payments_ids.length) {
            await this.onclickCreateNewPayment();
        }

        let orderPayment = this.instance.order_payments_ids[this.instance.order_payments_ids.length-1];

        // if current (latest) payment is already paid, create a new payment
        if(orderPayment.status == 'paid') {
            await this.onclickCreateNewPayment();
            orderPayment = this.instance.order_payments_ids[this.instance.order_payments_ids.length-1];
        }

        // add selected product to the current (latest) payment
        await this.api.update('sale\\pos\\OrderPayment', [orderPayment.id], {order_lines_ids: order_lines_ids});

        // remove added items from product list
        const remainingOrderLines: any[] = this.dataSource.data.filter( (a:any) => (order_lines_ids.indexOf(a.id) < 0) );
        this.dataSource = new MatTableDataSource(remainingOrderLines);

        // reload the Tree
        await this.load(this.instance.id);
    }

    public onclickPayment(index: number) {
        this.selectedPaymentIndex = index;
    }

    public onDisplayDetails(value: any) {
        // this.current_pane = value;
        let newRoute = this.router.url.replace('payments', 'lines');
        this.router.navigateByUrl(newRoute);
    }

    public async onDigitTyped(value: any) {

        let children = this.componentsMap.order_payments_ids.toArray();
        let child = children[this.selectedPaymentIndex];
        let productAmount = child;
        if (child.display != "products") {

            child = child?.SessionOrderPaymentsPaymentPartComponents.toArray()[this.selectedPaymentPartIndex];

            let payment_method = child?.payment_method.value;

            // Find out the paymentMethod
            this.focus = child?.focused;
            if (this.digits?.toString()?.includes('.') && this.digits[this.digits.length - 1] == ".") {
                this.digits = child?.instance[child.focused] + ".";
            }
            else {
                this.digits = child?.instance[child.focused]
            }

            value = value.toString();
            this.digits = this.digits?.toString();
            if (value == "50" || value == "10" || value == "20") {
                value = parseInt(value);
                this.digits = parseFloat(this.digits);
                this.digits += value;
            }
            else if (value == "," && this.focus != "voucher_ref") {
                if (!this.digits?.includes('.')) {
                    this.digits += ".";
                    console.log(this.digits)
                }
            }
            else if (value == 'backspace') {
                // On enlève deux éléments (chiffre et virgule) si la valeur est une virgule
                let test = this.digits?.slice(0, -1);
                if (test?.slice(-1) == '.') test = test?.slice(0, -1);
                this.digits = test;
                // On met la valeur à 0, lorsqu'il n'y a plus de chiffre
                if (this.digits == "") this.digits = 0;
            }
            else if (value != 'backspace' && value != ',' && value != '+/-') {
                this.digits += value;
            }
            child?.update({ payment_method: payment_method });
            if(productAmount.focused == 'line'){
                this.digits = 0;
                this.digits += value;
                productAmount.setNewLineValue(parseFloat(this.digits));
            }
            else if (child.focused == "amount") {
                child.update({ amount: parseFloat(this.digits) });
                // .toFixed(2)
                // await child.onchangeAmount();
            }
            else if (child.focused == "booking_id") {
                // child.update({booking_id: this.digits});
                // await child.onchangeBookingId();
            }
            else if (child.focused == "voucher_ref") {
                child.update({ voucher_ref: parseFloat(this.digits) })
                await child.onchangeVoucherRef();
            }

        }
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

    public onTypeMode(value: any) {
    }
    
    public getDiscountValue(event: any) {
    }

    public async onvalidatePayment(index : number) {
        console.log(this.instance.order_payments_ids, index);
        this.instance.order_payments_ids[index].status = 'paid';
    }

// #todo
    public async makePayment(paymentPart : any) {
        console.log(' makePayment', paymentPart);
        return;
        let orderPayments = await this.api.collect('sale\\pos\\OrderPayment', [['order_id', '=', this.instance.id]], ['funding_id', 'has_funding']);
        
        await this.load(this.instance.id);
        await this.api.fetch('?do=lodging_order_do-pay', {id : this.instance.id });

        if(orderPayments[0].funding_id != null || 0){
            await this.api.update('sale\\pos\\OrderPaymentPart',[paymentPart.id], {  funding_id: orderPayments[0].funding_id, has_funding : true });
        }
    }

    public async customer_change(event: any){
        await this.api.update(this.instance.entity, [this.instance.id], { customer_id: event.id });
        this.load(this.instance.id);
    }

    public isAllSelected() {
        const numSelected = this.selection?.selected.length;
        const numRows = this.dataSource?.data.length;
        return numSelected === numRows;
    }

    /**
     * Selects all rows if they are not all selected; otherwise clear selection. 
     * 
     */
    public toggleAllRows() {
        if (this.isAllSelected()) {
            this.selection.clear();
            return;
        }

        this.selection.select(...this.dataSource.data);
    }

    public applyFilter(event:any) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();    
    }

    public onclickProductsList(index: number) {
        this.selectedPaymentIndex = index;
        this.show_products = true;
    }
}