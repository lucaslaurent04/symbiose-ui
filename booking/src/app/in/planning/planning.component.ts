import { Component, ChangeDetectorRef, OnInit, AfterViewInit, NgZone, ViewChild, ElementRef, HostListener } from '@angular/core';

import { Subscription } from 'rxjs';

import { BookingDayClass } from 'src/app/model/booking.class';
import { ChangeReservationArg } from 'src/app/model/changereservationarg';
import { ApiService, AuthService } from 'sb-shared-lib';
import {CalendarParamService} from './_services/calendar.param.service';
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
    year: number;
    month: number;
    day: number;
    sub: Subscription;

    centers_ids: number[];

    date_range: DateRange = <DateRange>{};
    fullscreen: boolean = false;

    public showSbContainer: boolean = false;

    constructor(
        private api: ApiService, 
        private auth:AuthService,
        private params: CalendarParamService,
        private cd: ChangeDetectorRef,
        private zone: NgZone
    ) {
        const d     = new Date();
        this.year   = d.getFullYear();
        this.month  = d.getMonth() + 1;
        this.day    = d.getDate();

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
            this.zone.run( () => {
                this.showSbContainer = false;
            });
        });
        $('#sb-planning-container').on('_open', (event, data) => {
            this.zone.run( () => {
                this.showSbContainer = true;
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

}