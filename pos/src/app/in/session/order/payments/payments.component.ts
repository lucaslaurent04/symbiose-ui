import { Component, OnInit, AfterViewInit, ChangeDetectorRef, ViewChildren, QueryList, Input, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService, ContextService, TreeComponent, RootTreeComponent } from 'sb-shared-lib';
import { CashdeskSession } from './../../session.model';
import { Order, OrderPayment, OrderPaymentPart} from './payments.model';
import { SessionOrderPaymentsOrderPaymentComponent } from './components/payment/order-payment.component';
import { OrderService } from 'src/app/in/orderService';
import { BookingLineClass } from 'src/app/model';




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

    public posLineDisplay :any;
    public typeMode : any;
    public amount : any;
    public digits : any;
    public index : number;
    public selectedPaymentPart : number;
    public selectedOrderLine : number;
    public currentOrder : any;
    public focus: string;    
    public due: number;
    public change: any;
    public session: CashdeskSession = new CashdeskSession();

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private api: ApiService,
        private context: ContextService,
        public orderservice : OrderService
    ) {
        super( new Order() );
    }

    public ngAfterViewInit() {
        // init local componentsMap
        let map:OrderComponentsMap = {
            order_payments_ids: this.SessionOrderPaymentsOrderPaymentComponents
        };
        this.componentsMap = map;

        
    }

    public ngOnInit() {
        // fetch the ID from the route
        this.route.params.subscribe( async (params) => {
            if(params && params.hasOwnProperty('session_id') && params.hasOwnProperty('order_id')) {
                try {
                    await this.loadSession(<number> params['session_id']);
                    await this.load(<number> params['order_id']);
                    this.ready = true;
                    console.log(this.instance)
                    this.currentOrder = this.instance;
                }
                catch(error) {
                    console.warn(error);
                }
            }
        });
    }

    private async loadSession(session_id: number) {
        
        if(session_id > 0) {
            try {
                const result:any = await this.api.read(CashdeskSession.entity, [session_id], Object.getOwnPropertyNames(new CashdeskSession()));
                if(result && result.length) {
                    this.session = <CashdeskSession> result[0];
                }
            }
            catch(response) {
                throw 'unable to retrieve given session';
            }
        }
        
    }


    /**
     * Load an Order object using the sale_pos_order_tree controller
     * @param order_id
     */
    async load(order_id: number) {
        if(order_id > 0) {
            try {
                const result:any = await this.api.fetch('/?get=sale_pos_order_tree', {id:order_id, variant: 'payments'});
                if(result) {
                    this.update(result);
                }
            }
            catch(response) {
                console.log(response);
                throw 'unable to retrieve given order';
            }
        }
    }


    /**
     * 
     * @param values 
     */
    public update(values:any) {
        this.currentOrder = this.instance;
        super.update(values);
    }

    public onupdatePayment(line_id:any) {
        console.log('onupdatePayment');
        // a line has been updated: reload tree
        this.load(this.instance.id);
    }

    public async ondeletePayment(line_id:number) {
        // a line has been removed: reload tree
        this.load(this.instance.id);
    }

    public async onclickCreateNewPayment() {
        await this.api.create((new OrderPayment()).entity, {order_id: this.instance.id});
        this.load(this.instance.id);
    }


    public onClickLine(index:number){
      this.index = index;
      // this.price = this.componentsMap.order_lines_ids._results[this.index].instance.unit_price;
      // this.quantity = this.componentsMap.order_lines_ids._results[this.index].instance.qty;
      // this.discountValue = this.componentsMap.order_lines_ids._results[this.index].instance.free_qty;
      // this.instanceElement = {...this.instance.order_lines_ids[this.index]};
    }
    
    public async onDigitTyped(value:any){
      console.log(value);
      let children = this.componentsMap.order_payments_ids.toArray();        
      let child = children[this.index];

      console.log(child)
      
      if(child.display != "products"){   
      
        child = child?.SessionOrderPaymentsPaymentPartComponents.toArray()[this.selectedPaymentPart];
        
        let payment_method = child.payment_method.value;
        
        this.focus = child.focused;
            if(this.digits?.toString()?.includes('.') && this.digits[this.digits.length-1] == "."){
            this.digits = child.instance[child.focused] + ".";
        }else{
            this.digits = child.instance[child.focused]
        }
        
        

        value = value.toString(); 
        this.digits = this.digits.toString(); 
        if ( value == "50" || value =="10" || value == "20") {
          value = parseInt(value);
          this.digits = parseFloat(this.digits);
          this.digits += value;
        }else if(value == "," && this.focus != "voucher_ref"){
            if (!this.digits.includes('.')) {
                this.digits += "."; 
            } 
        }else if (value == 'backspace') {
          let test = this.digits.slice(0, -1);
          this.digits = test;
        }else if(value != 'backspace' && value != ',' && value != '+/-'){
          this.digits += value;
        } 
        this.change = this.digits;
        child.update({payment_method: payment_method});
        if(child.focused == "amount"){
            child.update({amount: parseFloat(this.digits)});
            await child.onchangeAmount();
        }else if(child.focused == "booking_id"){
            // child.update({booking_id: this.digits});
            // await child.onchangeBookingId();
        }else if(child.focused == "voucher_ref"){
            child.update({voucher_ref : parseFloat(this.digits)})
            await child.onchangeVoucherRef();
        }
        this.currentOrder = this.instance;
      }
     
  }

    public onDisplayDetails(value:any){
        this.posLineDisplay = value;
    }

    public onPrint(){
    }

    public onTypeMode(value:any){

    }
    public getDiscountValue(event:any){

    }

    public makePayment(){
        let queue = this.orderservice.getQueue();
        console.log(queue);
    }

}