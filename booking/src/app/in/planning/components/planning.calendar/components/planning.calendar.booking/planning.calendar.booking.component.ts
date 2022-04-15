import { Component, Input, Output, ElementRef, EventEmitter, OnInit, OnChanges, SimpleChanges, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';

const today = new Date();
const millisecondsPerDay:number = 24 * 60 * 60 * 1000;

@Component({
  selector: 'planning-calendar-booking',
  templateUrl: './planning.calendar.booking.component.html',
  styleUrls: ['./planning.calendar.booking.component.scss']
})
export class PlanningCalendarBookingComponent implements OnInit, OnChanges  {
    @Input()  color: string;
    @Input()  day: Date;
    @Input()  consumption: any;
    @Input()  sojourns: any[];
    @Input()  width: number;
    @Output() hover = new EventEmitter<any>();
    @Output() selected = new EventEmitter<any>();    

    public has_consumption = false;
    public is_weekend = false;
    public is_today = false;

    constructor(
        private elementRef: ElementRef
    ) {}

    ngOnInit() { }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.consumption || changes.width) {
            this.datasourceChanged();
        }
    }

    /**
     * convert a string formated time to a unix timestamp
     */
    private getTime(time:string) {
        let parts = time.split(':');
        return parseInt(parts[0])*3600 + parseInt(parts[1])*60 + parseInt(parts[2]);
    }

    private datasourceChanged() {

        const unit = this.width/(24*3600);

        this.is_today = (this.day.getDate() == today.getDate() && this.day.getMonth() == today.getMonth() && this.day.getFullYear() == today.getFullYear());
        this.is_weekend = (this.day.getDay() == 0 || this.day.getDay() == 6);

        if(!this.consumption || !Object.keys(this.consumption).length) {
            this.has_consumption = false;
            return;    
        }

        this.has_consumption = true;

        let date = new Date(this.consumption.date);
        // offset since the start of the current day
        let offset:number = 0;
        let width:string = '100%';

        if( this.consumption.date_from != this.consumption.date_to || this.consumption.schedule_from != '00:00:00' || this.consumption.schedule_to != '24:00:00') {

            let time_from = this.getTime(this.consumption.schedule_from);
            let time_to = this.getTime(this.consumption.schedule_to);

            let date_from = new Date(this.consumption.date_from.substring(0, 10));
            let date_to = new Date(this.consumption.date_to.substring(0, 10));
            
            let days = Math.abs(date_to.getTime() - date_from.getTime()) / millisecondsPerDay;

            offset  = unit * time_from;
            width = Math.abs(unit * (((24*3600)-time_from) + (24*3600*(days-1)) + (time_to))).toString() + 'px';

        }

        this.elementRef.nativeElement.style.setProperty('--width', width);
        this.elementRef.nativeElement.style.setProperty('--offset', offset+'px');


  }


    public onShowBooking(booking: any) {
       this.selected.emit(booking);
    }

    public onEnterConsumption(consumption:any) {
        this.hover.emit(consumption);
    }

    public onLeaveConsumption(consumption:any) {
        this.hover.emit();
    }

}