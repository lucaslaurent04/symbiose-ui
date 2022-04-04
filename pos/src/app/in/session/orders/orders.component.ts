import { Component, OnInit, AfterViewInit, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { readyException } from 'jquery';
import { ApiService, ContextService } from 'sb-shared-lib';

import { CashdeskSession, Order } from './orders.model';

@Component({
  selector: 'session-orders',
  templateUrl: 'orders.component.html',
  styleUrls: ['orders.component.scss']
})
export class SessionOrdersComponent implements OnInit, AfterViewInit {

  public ready: boolean = false;

  public session: CashdeskSession = new CashdeskSession();

  public orders: Order[] = new Array<Order>();

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private zone: NgZone,
        private api: ApiService,    
        private context: ContextService
    ) {}

    public ngAfterViewInit() {

    }

    public ngOnInit() {
        console.log('SessionOrdersComponent init');
        // fetch the ID from the route
        this.route.params.subscribe( async (params) => {
            
            if(params && params.hasOwnProperty('session_id')) {
                try {
                    await this.load(<number> params['session_id']);
                    this.ready = true;
                }
                catch(error) {
                    console.warn(error);
                }
            }
        });
    }
  
    private async load(id: number) {
        if(id > 0) {
            try {
                const result:any = await this.api.read(CashdeskSession.entity, [id], Object.getOwnPropertyNames(new CashdeskSession()));
                if(result && result.length) {
                    this.session = <CashdeskSession> result[0];
                    try {
                        const result:any = await this.api.collect(Order.entity, [
                            ['id', 'in', this.session.orders_ids],
                            ['status', '=', 'pending']
                        ], ['customer_id.name', ...Object.getOwnPropertyNames(new Order())]);
                        if(result && result.length) {
                            this.orders = result;
                        }
                    }
                    catch(response) {
                        console.warn('unable to retrieve orders');
                    }        
                }
            }
            catch(response) {
                throw 'unable to retrieve given session';
            }
        }
    }

    public onclickNewOrder() {
        this.router.navigate([this.router.url+'/new']);
    }

    public onclickSelectOrder(order_id:any) {
        this.router.navigate(['/session/'+this.session.id+'/order/'+order_id]) ;
    }
}