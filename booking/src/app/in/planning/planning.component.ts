import { Component, Renderer2, ChangeDetectorRef, OnInit, AfterViewInit, NgZone, ViewChild, ElementRef, HostListener } from '@angular/core';

import { Subscription } from 'rxjs';

import { BookingDayClass } from 'src/app/model/booking.class';
import { ChangeReservationArg } from 'src/app/model/changereservationarg';
import { ApiService, AuthService, ContextService } from 'sb-shared-lib';
import { CalendarParamService } from './_services/calendar.param.service';
import { PlanningCalendarComponent } from './components/planning.calendar/planning.calendar.component';

import * as screenfull from 'screenfull';

interface DateRange {
  from: Date,
  to: Date
}

class RentalUnitClass {
  constructor(
    public id: number = 0,
    public name: string = '',
    public code: string = '',
    public capacity: number = 0,
  ) {}
}


class ConsumptionClass {
  constructor(
    public id:number = 0,
    public booking_id = 0,
    public booking_line_id = 0,
    public rental_unit_id = 0,
    public date: Date = new Date(),
    public schedule_from: string = '',
    public schedule_to: string = ''
  ) {}
}

@Component({
    selector: 'planning',
    templateUrl: './planning.component.html',
    styleUrls: ['./planning.component.scss']
})
export class PlanningComponent implements OnInit, AfterViewInit {
    @HostListener("document:fullscreenchange", []) onchangeFullScreen() {
        this.fullscreen = !this.fullscreen;
    }
    @ViewChild('planningBody') planningBody: ElementRef;
    @ViewChild('planningCalendar') planningCalendar: ElementRef;

    centers_ids: number[];

    date_range: DateRange = <DateRange>{};
    fullscreen: boolean = false;

    public showSbContainer: boolean = false;

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

    }

    /**
   * Set up callbacks when component DOM is ready.
   */
    public ngAfterViewInit() {
        // _open and _close event are relayed by eqListener on the DOM node given as target when a context is requested
        // #sb-booking-container is defined in booking.edit.component.html
        $('#sb-planning-container').on('_close', (event, data) => {
            // restart angular lifecycles
            this.cd.reattach();
            this.planningCalendar.nativeElement.classList.remove('hidden');
            this.showSbContainer = false;
        });
        $('#sb-planning-container').on('_open', (event, data) => {
            // prevent angular lifecycles while a context is open
            this.zone.run( () => {                
                this.showSbContainer = true;
                this.planningCalendar.nativeElement.classList.add('hidden');
                setTimeout( () => this.cd.detach() );
            });
            
        });
    }

    onFullScreen() {
        console.log('onHelpFullScreen');
        if (screenfull.isEnabled) {
            screenfull.toggle(this.planningBody.nativeElement);
        }
        else {
            console.log('screenfull not enabled');
        }
    }

    public onShowBooking(booking: any) {
        let descriptor = {
            context: {
                entity: 'lodging\\sale\\booking\\Booking',
                type: 'form',
                name: 'default',
                domain: ['id', '=', booking.booking_id.id],
                mode: 'view',
                purpose: 'view',
                // display_mode: 'popup',
                target: '#sb-planning-container'
            }
        };

        this.context.change(descriptor);
    }

}