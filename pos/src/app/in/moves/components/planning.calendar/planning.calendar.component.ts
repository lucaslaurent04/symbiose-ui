import { Component, Input, Output, EventEmitter, ViewChild, OnInit, AfterViewInit } from '@angular/core';

import { PlanningCalendarNavbarComponent } from './components/planning.calendar.navbar/planning.calendar.navbar.component';
import { ChangeReservationArg } from 'src/app/model/changereservationarg';
import { RentalUnitClass } from 'src/app/model/rental.unit.class';
import { BookingDayClass } from 'src/app/model/booking.class';
import { HeaderDays } from 'src/app/model/headerdays';

@Component({
  selector: 'planning-calendar',
  templateUrl: './planning.calendar.component.html',
  styleUrls: ['./planning.calendar.component.scss']
})
export class PlanningCalendarComponent implements OnInit, AfterViewInit {
  @Input() year: number;
  @Input() month: number;
  @Input() day: number;
  @Input() rental_units: RentalUnitClass[] = new Array<RentalUnitClass>();
  @Input() bookings: BookingDayClass[] = new Array<BookingDayClass>();

  @Output() filters = new EventEmitter<ChangeReservationArg>();
  @ViewChild(PlanningCalendarNavbarComponent) navbar: PlanningCalendarNavbarComponent;

  // attach DOM element to compute the cells width
  @ViewChild('table_width') table_width: any;

  public headerdays: HeaderDays;

  public cell_width: number;

  public colors: any[] = [
    '#ff9633', '#0fc4a7','#0288d1','#9575cd','#C80651'
  ];
  

  constructor() {    
  }

  get currentYMD(): Date {
    return this.navbar.currymd;
  }

  ngOnInit() { }

  ngAfterViewInit() {
    this.cell_width = (this.table_width.nativeElement.offsetWidth - (this.headerdays.headDaysAll.length + 3) - 140) / this.headerdays.headDaysAll.length;
    console.log('retrieved width: ', this.cell_width);
  }


  onFiltersChange(data: ChangeReservationArg) {
    this.headerdays = data.days;
    this.filters.emit(data);
  }

  public getBooking(rentalUnit:RentalUnitClass, day: Date) {
    let filtered = this.bookings.filter( (booking:BookingDayClass) => (booking.rental_unit_id == rentalUnit.id && booking.date.getMonth() == day.getMonth() && booking.date.getDate() == day.getDate()) );
    if(filtered.length) {
      return filtered[0];
    }
    return null;
  }

}
