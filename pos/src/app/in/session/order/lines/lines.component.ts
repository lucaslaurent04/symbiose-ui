import { Component, OnInit, AfterViewInit, ChangeDetectorRef, ViewChildren, QueryList } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ApiService, ContextService, TreeComponent, RootTreeComponent } from 'sb-shared-lib';
import { CashdeskSession } from './../../session.model';
import { Order, OrderLine } from './lines.model';
import { SessionOrderLinesLineComponent } from './components/line.component';

// declaration of the interface for the map associating relational Model fields with their components
interface OrderComponentsMap {
    order_lines_ids: QueryList<SessionOrderLinesLineComponent>
};

@Component({
    selector: 'session-order-lines',
    templateUrl: 'lines.component.html',
    styleUrls: ['lines.component.scss']
})
export class SessionOrderLinesComponent extends TreeComponent<Order, OrderComponentsMap> implements RootTreeComponent, OnInit, AfterViewInit {

    @ViewChildren(SessionOrderLinesLineComponent) SessionOrderLinesLineComponents: QueryList<SessionOrderLinesLineComponent>; 

    public ready: boolean = false;

    public session: CashdeskSession = new CashdeskSession();

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private api: ApiService,
        private context: ContextService
    ) {
        super( new Order() );
    }

    public ngAfterViewInit() {
        // init local componentsMap
        let map:OrderComponentsMap = {
            order_lines_ids: this.SessionOrderLinesLineComponents
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


    public onupdateLine(line_id:any) {
        console.log('onupdateLine');
        // a line has been updated: reload tree
        this.load(this.instance.id);
    }

    public async ondeleteLine(line_id:number) {
        // a line has been removed: reload tree
        this.load(this.instance.id);
    }

    public async onclickCreateNewLine() {
        await this.api.create(OrderLine.entity, {order_id: this.instance.id});
        this.load(this.instance.id);
    }

}