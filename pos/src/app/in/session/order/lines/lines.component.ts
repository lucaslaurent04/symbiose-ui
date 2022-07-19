import { Component, OnInit, AfterViewInit, ViewChildren, QueryList } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService, ContextService, TreeComponent, RootTreeComponent } from 'sb-shared-lib';
import { CashdeskSession } from './../../session.model';
import { Order, OrderLine } from './lines.model';
import { SessionOrderLinesOrderLineComponent } from './_components/line/order-line.component';
import { OrderService } from 'src/app/in/orderService';


// declaration of the interface for the map associating relational Model fields with their components
interface OrderComponentsMap {
    order_lines_ids: QueryList<SessionOrderLinesOrderLineComponent>
};

@Component({
    selector: 'session-order-lines',
    templateUrl: 'lines.component.html',
    styleUrls: ['lines.component.scss']
})
export class SessionOrderLinesComponent extends TreeComponent<Order, OrderComponentsMap> implements RootTreeComponent, OnInit, AfterViewInit {

    @ViewChildren(SessionOrderLinesOrderLineComponent) sessionOrderLinesOrderLineComponents: QueryList<SessionOrderLinesOrderLineComponent>;

    public ready: boolean = false;
    public session: CashdeskSession = new CashdeskSession();
    public orderLine: any;
    public error_message: boolean = false;

    public invoice: boolean;

    // string values for handling pad actions and apply them on properties of the selected line
    public str_unit_price: string = '';
    public str_qty: string = '';
    public str_discount: string = '';
    public str_free_qty: string = '';
    public str_vat_rate: string = '';

    public selected_field: string = 'qty';

    public customer_name : string;

    // reference to the selected line component
    private selectedLineComponent: SessionOrderLinesOrderLineComponent;
    // local copy of selected line
    public selectedLine: OrderLine;

    // pane to be displayed : 'main', 'discount'
    public current_pane: string = "main";

    private debounce: any;

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
            order_lines_ids: this.sessionOrderLinesOrderLineComponents
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
                const result : any = await this.api.read(CashdeskSession.entity, [session_id], Object.getOwnPropertyNames(new CashdeskSession()));
                if ( result &&  result.length) {
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
                this.orderLine = await this.api.fetch('/?get=sale_pos_order_tree', { id: order_id, variant: 'lines' });
                console.log(this.orderLine)
                this.customer_name= this.orderLine.customer_id.name;
                if (this.orderLine) {
                    this.update(this.orderLine);
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
        super.update(values);
    }

    public async onupdateLine() {
        // a line has been updated: reload tree
        await this.load(this.instance.id);
    }

    public async ondeleteLine() {
        // a line has been removed: reload tree
        this.load(this.instance.id);
    }

    public async onclickCreateNewLine() {
        await this.api.create((new OrderLine()).entity, { order_id: this.instance.id });
        // reload tree
        this.load(this.instance.id);
    }

    public onSelectLine(index: number, line: any) {
        console.log('onSelectLine', line);

        this.selectedLineComponent = this.sessionOrderLinesOrderLineComponents.toArray()[index];
        // create a clone of the selected line
        this.selectedLine = <OrderLine> {...line};

        this.str_unit_price = this.selectedLine.unit_price.toString();
        this.str_qty = this.selectedLine.qty.toString();
        this.str_discount = (this.selectedLine.discount * 100).toString();
        this.str_free_qty = this.selectedLine.free_qty.toString();
        this.str_vat_rate = (this.selectedLine.vat_rate * 100).toString();
    }


    /**
     * We received an event from the pad
     * special keys : 0-9, '%', 'backspace', '+/-', '+', '-'
     */
    public async onPadPressed(key: any) {

        // make sure a line is currently selected
        if(!this.selectedLine) {
            return;
        }

        // special key: '%' is a request for switch to discount pane
        if (key == "%") {
            this.switchPane('discount');
            // force a view refresh
            // #todo - to improve
            this.selectedLine = <OrderLine> { ...this.selectedLine };
            return;
        }


        /*
            adapt local values based on the received key and current pane
        */

        if (this.selected_field == "qty") {
            // Reset the quantity to zero after we type one number
            if(this.str_qty == "1") this.str_qty = "";
            if (['+', '-'].indexOf(key) >= 0) {
                if (key == "-") {
                    if(this.str_qty.includes('-')) {
                        this.str_qty = this.str_qty.replace('-', '');
                    }
                    else {
                        this.str_qty = '-' + this.str_qty;
                    }
                }
                else if (key == "+") {
                    if(this.str_qty.includes('-')) {
                        this.str_qty = this.str_qty.replace('-', '');
                    }
                }
            }
            else if (key == 'backspace') {
                if (this.str_qty.length) {
                    // remove last char
                    this.str_qty = this.str_qty.slice(0, -1);
                    if (!this.str_qty.length) {
                        this.str_qty = "0";
                    }
                }
            }
            else if (/^[0-9]{1}/.test(key)) {
                // char is a digit: append it
                this.str_qty += key;
            }
        }
        if (this.selected_field == "free_qty") {
            if (['+', '-'].indexOf(key) >= 0) {
                if (key == "-") {
                    if(this.str_free_qty.includes('-')) {
                        this.str_free_qty = this.str_free_qty.replace('-', '');
                    }
                    else {
                        this.str_free_qty = '-' + this.str_free_qty;
                    }
                }
                else if (key == "+") {
                    if(this.str_free_qty.includes('-')) {
                        this.str_free_qty = this.str_free_qty.replace('-', '');
                    }
                }
            }
            else if (key == 'backspace') {
                if (this.str_free_qty.length) {
                    // remove last char
                    this.str_free_qty = this.str_free_qty.slice(0, -1);
                    if (!this.str_free_qty.length) {
                        this.str_free_qty = "0";
                    }
                }
            }
            else if (/^[0-9]{1}/.test(key)) {
                // char is a digit: append it
                this.str_free_qty += key;
            }
        }        
        else if (this.selected_field == "unit_price") {
            if (key == ",") {
                if(!this.str_unit_price.includes('.')) {
                    this.str_unit_price += ".";
                }
            }
            else if (['+', '-'].indexOf(key) >= 0) {
                if (key == "-") {
                    if (this.str_unit_price.includes('-')) {
                        this.str_unit_price = this.str_unit_price.replace('-', '');
                    }
                    else {
                        this.str_unit_price = '-' + this.str_unit_price;
                    }
                }
                else if (key == "+" && this.str_unit_price.includes('-')) {
                    this.str_unit_price = this.str_unit_price.replace('-', '');
                }
            }
            else if (key == 'backspace') {
                if (this.str_unit_price.length) {
                    // remove last char
                    this.str_unit_price = this.str_unit_price.slice(0, -1);
                    if (!this.str_unit_price.length) {
                        this.str_unit_price = "0";
                    }
                    // remove decimal separator if unnecessary
                    else if(this.str_unit_price.includes('.')) {
                        let num_val = parseFloat(this.str_unit_price);
                        if(Number.isInteger(num_val)) {
                            this.str_unit_price = num_val.toString();
                        }
                    }
                }
            }
            else if (/^[0-9]{1}/.test(key)) {
                this.str_unit_price += key;
            }
        }
        else if (this.selected_field == "discount") {
            if (['+', '-'].indexOf(key) >= 0) {
                if(key == "-") {
                    if(this.str_discount.includes('-')) {
                        this.str_discount = this.str_discount.replace('-', '');
                    }
                    else {
                        this.str_discount = '-' + this.str_discount;
                    }
                }
                else if(key == "+") {
                    if (this.str_discount.includes('-')) {
                        this.str_discount = this.str_discount.replace('-', '');
                    }
                }
            }
            else if (key == 'backspace') {
                if (this.str_discount.length) {
                    // remove last char
                    this.str_discount = this.str_discount.slice(0, -1);
                    if (!this.str_discount.length) {
                        this.str_discount = "0";
                    }
                }
            }
            else if (/^[0-9]{1}/.test(key)) {
                this.str_discount += key;
            }
        }
        else if (this.selected_field == "vat_rate") {
            if (['+', '-'].indexOf(key) >= 0) {
                if(key == "-") {
                    if(this.str_vat_rate.includes('-')) {
                        this.str_vat_rate = this.str_vat_rate.replace('-', '');
                    }
                    else {
                        this.str_vat_rate = '-' + this.str_vat_rate;
                    }
                }
                else if(key == "+") {
                    if (this.str_vat_rate.includes('-')) {
                        this.str_vat_rate = this.str_vat_rate.replace('-', '');
                    }
                }
            }
            else if (key == 'backspace') {
                if (this.str_vat_rate.length) {
                    // remove last char
                    this.str_vat_rate = this.str_vat_rate.slice(0, -1);
                    if (!this.str_vat_rate.length) {
                        this.str_vat_rate = "0";
                    }
                }
            }
            else if (/^[0-9]{1}/.test(key)) {
                this.str_vat_rate += key;
            }
        }        


        /*
            trigger an immediate update (UI only)
        */
        console.log(this.str_discount, this.str_vat_rate, this.str_qty, this.str_free_qty, this.str_unit_price);

        // update local copy
        this.selectedLine = <OrderLine> {...this.selectedLine,
            discount: parseFloat(this.str_discount) / 100,
            vat_rate: parseFloat(this.str_vat_rate) / 100,
            qty: parseInt(this.str_qty, 10),
            free_qty: parseInt(this.str_free_qty, 10),
            unit_price: Math.round(parseFloat(this.str_unit_price)*100) / 100
        };

        // refresh selected line Component
        this.selectedLineComponent.update(this.selectedLine);
        

        /*
            relay to currently selected child with a debounce
        */

        if (this.debounce) {
            clearTimeout(this.debounce);
        }
        this.debounce = setTimeout(async () => {
            this.selectedLineComponent.onChange();
        }, 1500);
    }

    public onGetInvoice(value: any) {
        this.invoice = value;
    }

    public onDisplayDetails(value: any) {
        // this.current_pane = value;
        let newRoute = this.router.url.replace('lines', 'payments');
        this.router.navigateByUrl(newRoute);
    }

    public switchPane(event: string) {
        this.current_pane = event;
    }

    public onSelectField(event: any) {
        this.selected_field = event;
    }

    public async onAddBookingOrderLine(funding: any) {
        if (this.instance.order_lines_ids.length == 0) {
            this.error_message = false;
            try {
                const line = await this.api.create((new OrderLine()).entity, { order_id: this.instance.id, unit_price: funding.due_amount, qty: 1, has_funding: true, funding_id: funding.id, name: funding.name });
                await this.api.update(this.instance.entity, [this.instance.id], { order_lines_ids: [line.id] });
                this.load(this.instance.id);
            }
            catch(response) {
                // unexpected error
            }
        }else{
            this.error_message = true;
        }
        // Changement temporaire pour reload le composant
    }

    public async onAddProduct(product: any) {
        if (!this.instance.order_lines_ids[0]?.has_funding) {
            let has_funding = false;
            this.error_message = false;
            this.instance.order_lines_ids.forEach((element: any) => {
                if (element.has_funding == true) {
                    has_funding = true;
                }
            });
            if (!has_funding) {
                try {
                    const line = await this.api.create((new OrderLine()).entity, {
                        order_id: this.instance.id,
                        unit_price: 0,      // we don't know the price yet (will be resolved by back-end)
                        qty: 1,
                        name: product.sku,
                        product_id: product.id
                    });
                    await this.api.update(this.instance.entity, [this.instance.id], { order_lines_ids: [line.id] });
                    this.load(this.instance.id);
                }
                catch(response) {
                    // unexpected error
                }
            }
        }else{
            this.error_message = true;
        }
    }

    public calcTaxes() {
        return Math.round( (this.instance.price - this.instance.total) * 100) / 100;
    }

    public async customer_change(event : any){
        await this.api.update(this.instance.entity, [this.instance.id], { customer_id: event.id });
        this.load(this.instance.id);
    }
}