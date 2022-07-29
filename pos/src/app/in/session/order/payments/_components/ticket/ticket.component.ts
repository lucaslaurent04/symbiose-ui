import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'sb-shared-lib';

@Component({
    selector: 'app-ticket',
    templateUrl: './ticket.component.html',
    styleUrls: ['./ticket.component.scss']
})
export class TicketComponent implements OnInit {
    public ready:boolean = false;
    public order : any;
    public order_id : any;

    @Input() invoice : any;

    constructor(private api: ApiService, private route: ActivatedRoute) { }

    public ngOnInit() {
        // fetch the ID from the route
        this.route.params.subscribe(async (params) => {
            if (params && params.hasOwnProperty('session_id')) {
                try {
                    const order_id = <number>params['order_id'];
                    await this.load(order_id);
                    this.ready = true;
                }
                catch (error) {
                    console.warn(error);
                }
            }
        });
    }
 

    /**
     * Load an Order object using the sale_pos_order_tree controller
     * #memo - this method is called by parent composant
     */
    async load(id: number) {

        if (id > 0) {
            console.log('###################"', id);
            try {
                const result = await this.api.fetch('/?get=sale_pos_order_tree', { id: id, variant: 'ticket' });                
                if(result && result.length) {                
                    this.order = result[0];
                }
                setTimeout( () => {
                    this.ready = true;
                });
                
            }
            catch (response) {
               throw 'unable to retrieve given order';
            }
        }
    }

    async ngOnChanges(changeDetector: SimpleChanges) {
    }

}