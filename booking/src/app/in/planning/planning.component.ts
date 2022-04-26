import { Component, Renderer2, ChangeDetectorRef, OnInit, AfterViewInit, NgZone, ViewChild, ElementRef, HostListener } from '@angular/core';

import { Subscription } from 'rxjs';

import { BookingDayClass } from 'src/app/model/booking.class';
import { ChangeReservationArg } from 'src/app/model/changereservationarg';
import { ApiService, AuthService, ContextService } from 'sb-shared-lib';
import { CalendarParamService } from './_services/calendar.param.service';
import { PlanningCalendarComponent } from './_components/planning.calendar/planning.calendar.component';

import * as screenfull from 'screenfull';

interface DateRange {
  from: Date,
  to: Date
}

@Component({
    selector: 'planning',
    templateUrl: './planning.component.html',
    styleUrls: ['./planning.component.scss']
})
export class PlanningComponent implements OnInit, AfterViewInit {    
    @ViewChild('planningBody') planningBody: ElementRef;
    @ViewChild('planningCalendar') planningCalendar: ElementRef;

    centers_ids: number[];

    date_range: DateRange = <DateRange>{};
    fullscreen: boolean = false;

    constructor(
        private api: ApiService,
        private auth:AuthService,
        private context: ContextService,
        private params: CalendarParamService,
        private cd: ChangeDetectorRef,
        private zone: NgZone
    ) {

        this.centers_ids = [];
    }

    ngOnInit() {
        if (screenfull.isEnabled) {
            screenfull.on('change', () => {
                this.fullscreen = screenfull.isFullscreen;
            });
        }
    }

    /**
   * Set up callbacks when component DOM is ready.
   */
    public ngAfterViewInit() {

    }

    public async onFullScreen() {
        console.log('onHelpFullScreen');
        if (screenfull.isEnabled) {
            this.cd.detach();
            await screenfull.request(this.planningBody.nativeElement);
            this.cd.reattach();
        }
        else {
            console.log('screenfull not enabled');
        }
    }

    public onShowBooking(booking: any) {
        let descriptor:any = {
            context_silent: true, // do not update sidebar            
            context: {
                entity: 'lodging\\sale\\booking\\Booking',
                type: 'form',
                name: 'default',
                domain: ['id', '=', booking.booking_id.id],
                mode: 'view',
                purpose: 'view',
                display_mode: 'popup',
                callback: (data:any) => {
                    // restart angular lifecycles
                    this.cd.reattach();
                }
            }
        };

        if(this.fullscreen) {
            descriptor.context['dom_container'] = '.planning-body';
        }
        // prevent angular lifecycles while a context is open
        this.cd.detach();
        this.context.change(descriptor);
    }

}