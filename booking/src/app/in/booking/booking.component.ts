import { Component, OnInit, AfterViewInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ContextService } from 'sb-shared-lib';


@Component({
  selector: 'booking',
  templateUrl: 'booking.component.html',
  styleUrls: ['booking.component.scss']
})
export class BookingComponent implements OnInit, AfterViewInit {
    // @ViewChild('sbContainer') sbContainer: ElementRef;

    public ready: boolean = false;

    private default_descriptor: any = {
        route: '/booking/object.id',
        context: {
            entity: 'lodging\\sale\\booking\\Booking',
            view:   'form.default',
            reset: true
        }
    };


    private booking_id: number = 0;

    constructor(
        private route: ActivatedRoute,
        private context: ContextService
    ) {}


    public ngAfterViewInit() {

        this.route.params.subscribe( async (params) => {
            console.log('BookingComponent : received routeParams change', params);

            this.context.setTarget('#sb-container-booking');

            if(params && params.hasOwnProperty('booking_id')) {
                const booking_id:number = <number> params['booking_id'];
                if(isNaN(booking_id)) {
                    return;
                }
                this.booking_id = booking_id;
                const descriptor = this.context.getDescriptor();
                if(!Object.keys(descriptor.context).length) {
                    this.default_descriptor.route = '/booking/'+this.booking_id;
                    this.default_descriptor.context.domain = ["id", "=", this.booking_id];
                    this.context.change(this.default_descriptor);
                }
            }
        });
    }

    public ngOnInit() {
        console.log('BookingComponent init');

        this.context.ready.subscribe( (is_ready:boolean) => {
            this.ready = is_ready;
        });
    }

}