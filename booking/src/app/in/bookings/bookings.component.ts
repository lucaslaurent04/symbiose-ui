import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ContextService } from 'sb-shared-lib';


@Component({
  selector: 'bookings',
  templateUrl: 'bookings.component.html',
  styleUrls: ['bookings.component.scss']
})
export class BookingsComponent implements OnInit, AfterViewInit {

    public ready: boolean = false;

    private default_descriptor: any = {
        context: {
            entity: 'lodging\\sale\\booking\\Booking',
            view: "list.default",
            order: "id",
            sort: "desc",
            domain: ["status", "=", "quote"]
        }
    };

    constructor(
        private route: ActivatedRoute,
        private context: ContextService
    ) {}


    public ngAfterViewInit() {
        // once view is ready, subscribe to route changes
        this.route.params.subscribe( async (params) => {
            console.log('BookingComponent : received routeParams change', params);

            this.context.setTarget('#sb-container');

            const descriptor = this.context.getDescriptor();
            if(!Object.keys(descriptor.context).length) {
                this.context.change(this.default_descriptor);
            }
        });

    }

    public ngOnInit() {
        console.log('BookingsComponent init');

        this.context.ready.subscribe( (is_ready:boolean) => {
            this.ready = is_ready;
        });


    }

}