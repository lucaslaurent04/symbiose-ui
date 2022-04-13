import { Component, OnInit, AfterViewInit, ChangeDetectorRef, ViewChildren, QueryList, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService, ContextService, TreeComponent, RootTreeComponent } from 'sb-shared-lib';
import { CashdeskSession } from './../../session.model';
import { Order, OrderLine } from './lines.model';
import { SessionOrderLinesOrderLineComponent } from './components/line/order-line.component';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

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

    @ViewChildren(SessionOrderLinesOrderLineComponent) SessionOrderLinesOrderLineComponents: QueryList<SessionOrderLinesOrderLineComponent>; 

    public ready: boolean = false;

    public session: CashdeskSession = new CashdeskSession();

    public selectedLine: number;
    public index: number;

    public invoice: boolean;

    public price: any = "";
    public quantity: any = "";
    public discountValue :any ="";

    public instanceElement : any;

    public posLineDisplay: string = "main";

    public typeMode : string = "quantity";

    private debounce:any;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private api: ApiService,
        private context: ContextService,
        private cdRef:ChangeDetectorRef
    ) {
        super( new Order() );
    }

    public ngAfterViewInit() {
        // init local componentsMap
        let map:OrderComponentsMap = {
            order_lines_ids: this.SessionOrderLinesOrderLineComponents
        };
        this.componentsMap = map;
    }

    public ngOnInit() {
        console.log('SessionOrderLinesComponent init');

        // fetch the ID from the route
        this.route.params.subscribe( async (params) => {
            if(params && params.hasOwnProperty('session_id') && params.hasOwnProperty('order_id')) {
                try {
                    await this.loadSession(<number> params['session_id']);
                    await this.load(<number> params['order_id']);
                    this.ready = true;
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
                const result:any = await this.api.fetch('/?get=sale_pos_order_tree', {id:order_id, variant: 'lines'});
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
        super.update(values);
    }


    public async onupdateLine(line_id:any) {
        console.log('onupdateLine');
        // a line has been updated: reload tree
        await this.load(this.instance.id);
    }

    public async ondeleteLine(line_id:number) {
        // a line has been removed: reload tree
        this.load(this.instance.id);
    }

    public async onclickCreateNewLine() {
        await this.api.create( (new OrderLine()).entity, {order_id: this.instance.id});
        await this.load(this.instance.id);
    }

    public onClickLine(index:number){
        this.index = index;
        this.price = this.componentsMap.order_lines_ids._results[this.index].instance.unit_price;
        this.quantity = this.componentsMap.order_lines_ids._results[this.index].instance.qty;
        this.discountValue = this.componentsMap.order_lines_ids._results[this.index].instance.free_qty;
    }

    public onDigitTyped(event:any){


        // first check what component is displayed
        if(this.posLineDisplay == "discount"){
            this.discountValue = this.discountValue.toString();
          if(event== 'backspace'){
            let test = this.discountValue.slice(0, -1);
            this.discountValue = test;
          }else if (((this.discountValue.includes('.') && this.discountValue.indexOf('.')>3)  || (!this.discountValue.includes('.') && this.discountValue.length>1))){
           this.discountValue = "100"; 
          }
           else if(event!= 'backspace' && event!= ',' && event!= '+/-') {
            this.discountValue += event;
          }else if(event == ','){
            if (!this.discountValue.includes('.')) {
              this.discountValue += ".";

            } 
          }
        }else{
    
          if(event == '+' || event == "-" && this.index != undefined){
            // if(this.operator =='-' && !this.products[this.index][this.actionType].includes('-')){
            //   this.products[this.index][this.actionType] = '-' + this.products[this.index][this.actionType];
            // }else if (this.index != undefined){
            //   console.log(this.index)
            //   let test = this.products[this.index][this.actionType].replace('-', '+');
            //   this.products[this.index][this.actionType] = test
            // }
            // return;
          }
          else if(event != 'backspace' && event != '%'){
            // this.numberPassed = event;
          }else if (event == "%"){
            this.posLineDisplay = "discount";
            // this.discountValue = parseFloat(value[0]);
            // this.instance.order_lines_ids[this.index].free_qty = parseFloat(value[0]);
            this.instanceElement = {...this.instance.order_lines_ids[this.index]};
            // console.log("recieved discountvalue",value);
            return;
          }
      
         
        //   clearTimeout(this.myTimeout);
        //   this.myTimeout = setTimeout(() => {
           
        //   }, 2000);
      
      
    
          console.log(this.typeMode)
        
            // Adding comma's if necessary
            if(event == ","){
                if (this.typeMode == "quantity" && !this.quantity.includes('.')) {
                    this.quantity += ".";
                    this.componentsMap.order_lines_ids._results[this.index].instance.qty= this.quantity;
                  } else if (this.typeMode == "price" && !this.price.includes('.')) {
                    this.price += ".";
                    this.componentsMap.order_lines_ids._results[this.index].instance.unit_price = this.price;
                  } 
            } else if (this.typeMode == "quantity") {
                this.quantity = this.quantity.toString();
              if (event != 'backspace') {
                this.quantity += event;
                this.componentsMap.order_lines_ids._results[this.index].instance.qty = this.quantity;
              } else {
                  if(this.quantity !=""){
                    this.quantity = this.quantity.slice(0, -1);
                    this.componentsMap.order_lines_ids._results[this.index].instance.qty = this.quantity;
                  }else{
                    this.componentsMap.order_lines_ids._results.splice(this.index, 1);
                    this.load(this.instance.id);
                  } 
              }
            } else if (this.typeMode == "price") {
                this.price = this.price.toString();
              if (event != 'backspace') {
                this.price += event;
                this.componentsMap.order_lines_ids._results[this.index].instance.unit_price = this.price;
              } else {
                if (this.price !=""){
                this.price = this.price.slice(0, -1);
                this.componentsMap.order_lines_ids._results[this.index].instance.unit_price = this.price;
                }else{
                    console.log(this.componentsMap.order_lines_ids._results)
                this.componentsMap.order_lines_ids._results.splice(this.index, 1);
                this.load(this.instance.id);
                console.log(this.componentsMap.order_lines_ids._results)
                // let children = this.componentsMap.order_lines_ids.toArray();        
                // let child = children[this.index];
                // child.onclickDelete();
                }
              }
            } 
          
            // child.update({qty: this.quantity, unit_price: this.price}); 
            
            // if(this.debounce){
            //     clearTimeout(this.debounce);
            // }
            // this.debounce = setTimeout( async () => {
            //     await child.onchangeQty();
            //     await this.onupdateLine(child.id);
            // },500);
            
        
            
        




        // console.log("recieved quantity",value);
        // console.log(this.componentsMap);
        // let children = this.componentsMap.order_lines_ids.toArray();        
        // let child = children[this.index];
        
        // child.update({qty: value}); 
        
        // if(this.debounce){
        //     clearTimeout(this.debounce);
        // }
        // this.debounce = setTimeout( async () => {
        //     await child.onchangeQty();
        //     await this.onupdateLine(child.id);
        // },500);

    }
}

    
    public onGetInvoice(value:any){
        this.invoice = value;
    }

    public onDisplayDetails(value:any){
        this.posLineDisplay = value;
    }

    public onTypeMode(value:any){

    }
    public getDiscountValue(event:any){
        console.log('ok')
    }
}