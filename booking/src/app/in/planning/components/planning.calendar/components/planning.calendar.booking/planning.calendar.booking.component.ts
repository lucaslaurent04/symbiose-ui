import { Component, Input, Output, ElementRef, EventEmitter, OnInit, OnChanges, SimpleChanges, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ContextService } from 'sb-shared-lib';
import { PlanningDialogBookingComponent } from '../../../planning.dialog.booking/planning.dialog.booking.component';


const today = new Date();

@Component({
  selector: 'planning-calendar-booking',
  templateUrl: './planning.calendar.booking.component.html',
  styleUrls: ['./planning.calendar.booking.component.css']
})
export class PlanningCalendarBookingComponent implements OnInit, OnChanges  {
    @Input()  color: string;
    @Input()  day: Date;
    @Input()  consumptions: any[];
    @Input()  sojourns: any[];
    @Input()  width: number;

    public is_weekend = false;
    public is_today = false;

    constructor(
        private elementRef: ElementRef,
        private dialog: MatDialog,
        private context: ContextService
    ) {}

    ngOnInit() { }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.consumptions || changes.sojourns || changes.width) {
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
        if(this.consumptions.length) {
            console.log('datasourceChanged', this.consumptions);
        }

        this.is_today = (this.day.getDate() == today.getDate() && this.day.getMonth() == today.getMonth() && this.day.getFullYear() == today.getFullYear());
        this.is_weekend = (this.day.getDay() == 0 || this.day.getDay() == 6);

        let processed_consumptions: any = {};

        const unit = this.width/(24*3600);


        if(this.sojourns && this.sojourns.length) {
            console.log('{{{{{{', this.day, this.sojourns)
            // #memo - there should be only one sojourn for a given rental unit on a given day 
            for(let sojourn of this.sojourns) {
                if(!sojourn.hasOwnProperty('consumptions') || sojourn.consumptions.length <= 1) {
                    continue;
                }
                for(let consumption of sojourn.consumptions) {
                    processed_consumptions[consumption.id] = true;
                }
                let count = sojourn.consumptions.length;
                let first = sojourn.consumptions[0];
                let last = sojourn.consumptions[count-1];

                let time_from = this.getTime(first.schedule_from);
                let time_to = this.getTime(last.schedule_to);

                let offset:number  = unit * time_from;
                let width = unit * (((24*3600)-time_from) + (24*3600*(count-2)) + (time_to));
                
                this.elementRef.nativeElement.style.setProperty('--width', width+'px');
                this.elementRef.nativeElement.style.setProperty('--offset', offset+'px');
            }
        }

        if(this.consumptions && this.consumptions.length) {
            for(let consumption of this.consumptions) {
                if(processed_consumptions.hasOwnProperty(consumption.id)) {
                    continue;
                }
                console.log('####', consumption.id, consumption.date);

                let date = new Date(consumption.date);
                // offset since the start of the current day
                let offset:number = 0;
                let width:string = '100%';
                if(consumption.schedule_from != '00:00:00' || consumption.schedule_to != '24:00:00') {
                    let time_from = this.getTime(consumption.schedule_from);
                    let time_to = this.getTime(consumption.schedule_to);

                    offset  = unit * time_from;
                    width = Math.abs(unit * (time_to-time_from)).toString() + 'px';
                }
                // use only the first consumption from the collection
                /*
                    "date": "2022-03-25T00:00:00+01:00",
                    "schedule_from": "14:00:00",
                    "schedule_to": "24:00:00",
                */

                this.elementRef.nativeElement.style.setProperty('--width', width);
                this.elementRef.nativeElement.style.setProperty('--offset', offset+'px');
            }
        }
  }


    public onShowBooking(booking: any) {
        const dialog = this.dialog.open(PlanningDialogBookingComponent, {
            data: booking,
            width: '800px',
            height : '450px'
        });
        dialog.afterClosed().subscribe(data => {
            if(data && data.hasOwnProperty('open')) {
                switch(data.open) {
                    case 'booking':
                    this.onOpenBooking(data.id)
                    break;
                    case 'customer':
                    this.onOpenCustomer(data.id)
                    break;
                    case 'contact':
                    this.onOpenContact(data.id)
                    break;
                }
            }
        });
    }



  public onOpenBooking(booking_id: number) {
    let descriptor = {
      context: {
        entity:     'lodging\\sale\\booking\\Booking',
        type:       'form',
        name:       'default',
        domain:     [ 'id', '=', booking_id ],
        mode:       'view',
        purpose:    'view',
        target:     '#sb-planning-container'
      }
    };
    this.context.change(descriptor);
  }

  public onOpenCustomer(customer_id: number) {
    let descriptor = {
      context: {
        entity:     'sale\\customer\\Customer',
        type:       'form',
        name:       'default',
        domain:     [ 'id', '=', customer_id ],
        mode:       'view',
        purpose:    'view',
        target:     '#sb-planning-container'
      }
    };
    this.context.change(descriptor);
  }

  public onOpenContact(contact_id: number) {
    let descriptor = {
      context: {
        entity:     'sale\\booking\\Contact',
        type:       'form',
        name:       'default',
        domain:     [ 'id', '=', contact_id ],
        mode:       'view',
        purpose:    'view',
        target:     '#sb-planning-container'
      }
    };
    this.context.change(descriptor);
  }

}