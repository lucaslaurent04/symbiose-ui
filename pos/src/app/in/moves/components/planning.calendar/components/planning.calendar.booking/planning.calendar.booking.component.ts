import { Component, Input, Output, ElementRef, EventEmitter, OnInit, OnChanges, SimpleChanges, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ContextService } from 'sb-shared-lib';
import { BookingDayClass } from 'src/app/model/booking.class';
import { PlanningDialogBookingComponent } from '../../../planning.dialog.booking/planning.dialog.booking.component';

@Component({
  selector: 'planning-calendar-booking',
  templateUrl: './planning.calendar.booking.component.html',
  styleUrls: ['./planning.calendar.booking.component.css']
})
export class PlanningCalendarBookingComponent implements OnInit, OnChanges  {
  @Input()  color: string;
  @Input()  day: Date;
  @Input()  booking: BookingDayClass | null;
  @Input()  width: number;

  public is_weekend = false;
  public is_today = false;
  public is_first = false;

  constructor(
    private elementRef: ElementRef,
    private dialog: MatDialog,
    private context: ContextService
  ) {}

  ngOnInit() { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.booking) {
      this.datasourceChanged();
    }
  }

  private datasourceChanged() {
    this.is_first = false;

    this.is_today = ((date:Date) => {
      const today = new Date();
      return date.getDate() == today.getDate() && date.getMonth() == today.getMonth() && date.getFullYear() == today.getFullYear()
    })(this.day);

    this.is_weekend = ((date:Date) => (date.getDay() == 0 || date.getDay() == 6) )(this.day);

    if(this.booking) {

      let parts = this.booking.schedule_from.split(':');
      let time_from = parseInt(parts[0]);
      let offset  = (time_from/24)*this.width;

      parts = this.booking.schedule_to.split(':');
      let time_to = parseInt(parts[0]);
      let nb_hours = (24-time_from) + ( (this.booking.nb_nights-1) * 24) + time_to;

      let width = (this.width/24) * nb_hours;
      // use only the first consumption from the collection
      this.is_first = (this.booking.date_from.getDate() == this.day.getDate() && this.booking.date_from.getMonth() == this.day.getMonth());

      // on a besoin de l'offset par rapport au jour courant
      // et du nombre total d'heures
      this.elementRef.nativeElement.style.setProperty('--width', width+'px');
      this.elementRef.nativeElement.style.setProperty('--offset', offset+'px');
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