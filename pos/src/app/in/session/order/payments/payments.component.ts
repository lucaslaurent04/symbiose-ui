import { Component, OnInit, AfterViewInit, ChangeDetectorRef, ViewChildren, QueryList, Input, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService, ContextService, TreeComponent, RootTreeComponent } from 'sb-shared-lib';
import { CashdeskSession } from './../../session.model';
import { Order, OrderPayment, OrderPaymentPart } from './payments.model';
import { SessionOrderPaymentsOrderPaymentComponent } from './components/payment/order-payment.component';
import { SessionOrderLinesComponent } from '../../order/lines/lines.component';
import { OrderService } from 'src/app/in/orderService';
import { BookingLineClass } from 'src/app/model';
import { TicketComponent } from './components/ticket/ticket.component';




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
    // @ViewChildren(SessionOrderLinesComponent) SessionOrderLinesComponents: QueryList<SessionOrderLinesComponent>; 
    @ViewChildren(TicketComponent) TicketComponent: QueryList<TicketComponent>;
    public back_button = "commande";

    public item: number;
    public ready: boolean = false;
    public posLineDisplay: any;
    public typeMode: any;
    public amount: any;
    public digits: any;
    public index: number;
    public selectedPaymentPart: number;
    public selectedOrderLine: number;
    public currentOrder: any;
    public focus: string;
    public due: number;
    public change: any;
    public session: CashdeskSession = new CashdeskSession();
    public ticket : any;
    public customer_name : string;
    public disabled_key= ["+"];
    public customer : any;

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
            order_payments_ids: this.SessionOrderPaymentsOrderPaymentComponents,
            // order_lines_ids: this.SessionOrderLinesComponents
        };
        this.componentsMap = map;
    }

    public ngOnInit() {
        // fetch the ID from the route

        this.route.params.subscribe(async (params) => {
            if (params && params.hasOwnProperty('session_id') && params.hasOwnProperty('order_id')) {
                try {
                    await this.loadSession(<number>params['session_id']);
                    await this.load(<number>params['order_id']);
                    this.ready = true;
                    this.currentOrder = this.instance;
                }
                catch (error) {
                    console.warn(error);
                }
            }
        });

        this.ticket = this.TicketComponent?.toArray()[0]

    }

    private async loadSession(session_id: number) {
        if (session_id > 0) {
            try {
                const result: any = await this.api.read(CashdeskSession.entity, [session_id], Object.getOwnPropertyNames(new CashdeskSession()));
                if (result && result.length) {
                    this.session = <CashdeskSession>result[0];
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
                const result: any = await this.api.fetch('/?get=sale_pos_order_tree', { id: order_id, variant: 'payments' });
                console.log(result, "la résultanteee")
                this.customer_name= result.customer_id.name;
                this.customer = result.customer_id;
                if (result) {
                    this.update(result);
                }
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
        this.currentOrder = this.instance;
        super.update(values);
    }

    public async ondeletePayment(line_id: number) {
        // a line has been removed: reload tree
        console.log("deleted")
        this.load(this.instance.id);
        this.updateTicket();

    }

    public async onupdatePayment(line_id: number) {
        // a line has been removed: reload tree
        this.load(this.instance.id);
        this.updateTicket();
    }

    public async onclickCreateNewPayment() {
        console.log(this.instance)
        let orderLines = await this.api.collect('sale\\pos\\OrderLine', [['order_id', '=', this.instance.id], ['has_funding', '=', 'true']], ['funding_id', 'has_funding']);
        
        let orderPayment = await this.api.create((new OrderPayment()).entity, { order_id: this.instance.id, funding_id: orderLines[0]?.funding_id, has_funding : true });

        // nécessaire ? Adapte déjà l'id semble-t-il
        for(let i = 0; i < orderLines.length; i++){
            await this.api.update('sale\\pos\\OrderLine',[orderLines[i]], {
                payment_id : orderPayment.id
            });
        }
        this.load(this.instance.id);
    }

    public updateTicket(){
        this.ticket = this.TicketComponent.toArray()[0]
        this.ticket.load();
    }

    public onClickLine(index: number) {
        this.index = index;
        // this.price = this.componentsMap.order_lines_ids._results[this.index].instance.unit_price;
        // this.quantity = this.componentsMap.order_lines_ids._results[this.index].instance.qty;
        // this.discountValue = this.componentsMap.order_lines_ids._results[this.index].instance.free_qty;
        // this.instanceElement = {...this.instance.order_lines_ids[this.index]};
    }

    public async onDigitTyped(value: any) {
        console.log(value);
        let children = this.componentsMap.order_payments_ids.toArray();
        let child = children[this.index];

        if (child.display != "products") {

            child = child?.SessionOrderPaymentsPaymentPartComponents.toArray()[this.selectedPaymentPart];

            let payment_method = child.payment_method.value;

            // Find out the paymentMethod
            this.focus = child.focused;
            if (this.digits?.toString()?.includes('.') && this.digits[this.digits.length - 1] == ".") {
                this.digits = child.instance[child.focused] + ".";
            } else {
                this.digits = child.instance[child.focused]
            }

            value = value.toString();
            this.digits = this.digits.toString();
            if (value == "50" || value == "10" || value == "20") {
                value = parseInt(value);
                this.digits = parseFloat(this.digits);
                this.digits += value;
            } else if (value == "," && this.focus != "voucher_ref") {
                if (!this.digits.includes('.')) {
                    this.digits += ".";
                    console.log(this.digits)
                }
            } else if (value == 'backspace') {
                // On enlève deux éléments (chiffre et virgule) si la valeur est une virgule
                let test = this.digits.slice(0, -1);
                if (test.slice(-1) == '.') test = test.slice(0, -1);
                this.digits = test;
                // On met la valeur à 0, lorsqu'il n'y a plus de chiffre
                if (this.digits == "") this.digits = 0;
            } else if (value != 'backspace' && value != ',' && value != '+/-') {
                this.digits += value;
            }
            child.update({ payment_method: payment_method });
            if (child.focused == "amount") {
                child.update({ amount: parseFloat(this.digits) });
                // .toFixed(2)
                await child.onchangeAmount();
            } else if (child.focused == "booking_id") {
                // child.update({booking_id: this.digits});
                // await child.onchangeBookingId();
            } else if (child.focused == "voucher_ref") {
                child.update({ voucher_ref: parseFloat(this.digits) })
                await child.onchangeVoucherRef();
            }

            this.currentOrder = this.instance;
            this.updateTicket();
        }
        
        
    }

    public onDisplayDetails(value: any) {
        this.posLineDisplay = value;
        console.log('dispallllalallalala')
        let newRoute = this.router.url.replace('payments','lines');
        this.router.navigateByUrl(newRoute);
    }

    public async onPrint() {


        // update all basic payment part field => payment_method, price, quantity
        // update the funding_id related to the paymentPart, if any
        // update voucher/booking_id if any
        // Close the order --> status = paid 
        // change route

        await this.api.fetch('?do=lodging_order_do-pay', {id : this.instance.id });
        await this.api.update(this.instance.entity, [this.instance.id], {status : "paid"});
        // this.router.navigate(['/']);

    }

    public onTypeMode(value: any) {
    }
    public getDiscountValue(event: any) {
    }

    public async makePayment(paymentPart : any) {
        let orderPayments = await this.api.collect('sale\\pos\\OrderPayment', [['order_id', '=', this.instance.id]], ['funding_id', 'has_funding']);
        // let fundings = await this.api.collect('sale\\pos\\OrderLine', [['order_id', '=', this.instance.id], ['has_funding', '=', 'true']], ['funding_id', 'has_funding']);
        
        if(orderPayments[0].funding_id != null || 0){
            await this.api.update('sale\\pos\\OrderPaymentPart',[paymentPart.id], {  funding_id: orderPayments[0].funding_id, has_funding : true });
        }
        // this.load(this.instance.id)
    }

    public async customer_change(event: any){
        await this.api.update(this.instance.entity, [this.instance.id], { customer_id: event.id });
        this.load(this.instance.id);
    }
}