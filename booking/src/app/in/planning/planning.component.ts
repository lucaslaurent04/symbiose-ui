import { Component, ChangeDetectorRef, OnInit, AfterViewInit, NgZone } from '@angular/core';

import { Subscription } from 'rxjs';

import { BookingDayClass } from 'src/app/model/booking.class';
import { ChangeReservationArg } from 'src/app/model/changereservationarg';
import { ApiService, AuthService } from 'sb-shared-lib';

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
  year: number;
  month: number;
  day: number;
  currentsearch: ChangeReservationArg;
  sub: Subscription;

  center_id: number;

  date_range: DateRange = <DateRange>{};

  rental_units: Array<RentalUnitClass> = [];
  bookings: Array<BookingDayClass> = [];

  public showSbContainer: boolean = false;

  constructor(
    private api: ApiService, 
    private auth:AuthService,
    private cd: ChangeDetectorRef,
    private zone: NgZone
  ) {

    const d     = new Date();
    this.year   = d.getFullYear();
    this.month  = d.getMonth() + 1;
    this.day    = d.getDate();

    this.center_id = 0;

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

  private async load() {
    console.log('load', this.center_id);
    
    this.rental_units = [];
    let consumptions: any = [];

    if(this.center_id) {

      const rental_units = await this.api.collect(
        "lodging\\realestate\\RentalUnit", 
        ["center_id", "=",  this.center_id], 
        Object.getOwnPropertyNames(new RentalUnitClass()),
        'id', 'asc', 0, 100
      );

      if(rental_units && rental_units.length) {
        this.rental_units = rental_units;
        let rental_units_ids = rental_units.map( (a:any) => a.id );

        consumptions = await this.api.collect(
          "sale\\booking\\Consumption", 
          [
            ['date', '>=', this.date_range.from],
            ['date', '<=', this.date_range.to],
            ['rental_unit_id', 'in',  rental_units_ids]
          ], 
          [ 
            ...['booking_id.customer_id.name', 'booking_id.status', 'booking_id.name', 'booking_id.contacts_ids', 'rental_unit_id.id', 'rental_unit_id.children_ids'], 
            ...Object.getOwnPropertyNames(new ConsumptionClass())
          ], 
          'id', 'asc', 0, 500);
        
      }  
    }
    return consumptions;
  }

  public async onFiltersChange(event: any) {
    console.log('PlanningComponent::onFiltersChange', event);

    let args = <ChangeReservationArg> event;

    this.currentsearch = args;

    this.date_range.from = args.date_from;
    this.date_range.to = args.date_to;

    this.center_id = args.center_id;

    try {
      let consumptions = await this.load();
      
      if(this.rental_units.length) {

        // group by booking_line_id
        let tmp:any = {};
        for(let consumption of consumptions) {
          if(!tmp.hasOwnProperty(consumption['booking_line_id'])) {
            tmp[consumption['booking_line_id']] = [];
          }
          if(!tmp[consumption['booking_line_id']].hasOwnProperty(consumption['rental_unit_id']['id'])) {
            tmp[consumption['booking_line_id']][consumption['rental_unit_id']['id']] = [];
          }

          tmp[consumption['booking_line_id']][consumption['rental_unit_id']['id']].push(consumption);
        }

// #todo - on peut avoir plusieurs unités locatives par bookingLine
// --> map sur 2 niveaux
console.log(tmp);

        for(let booking_line_id of Object.keys(tmp)) {
          // consumption
          let a = tmp[booking_line_id];
          let rental_unit_id:any;

          for(rental_unit_id of Object.keys(a)) {

            let b = a[rental_unit_id];
            rental_unit_id = parseInt(rental_unit_id);

            let first = b[0];
            let last = b[b.length-1];

            let date_from = new Date(first['date']);
            let date_to = new Date(last['date']);

            let schedule_from = first['schedule_from'];
            let schedule_to = last['schedule_to'];

            let nb_nights = ((a:Date, b:Date) => {        
              const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
              const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
              return Math.floor((utc2 - utc1) / (1000 * 3600 * 24));
            })(date_from, date_to);

            let capacity = this.rental_units.find( (a) => a.id == rental_unit_id ).capacity;

            this.bookings.push( new BookingDayClass(
              first.booking_id.id,
              first.booking_line_id,
              rental_unit_id,
              capacity, 
              new Date(first.date),
              date_from,
              date_to,
              schedule_from,
              schedule_to,
              nb_nights,
              first.booking_id.name,
              first.booking_id.status,
              first.booking_id.customer_id.id,
              first.booking_id.customer_id.name,
              // #todo : booking_payment_status
              'unknown',
              first['booking_id']['contacts_ids']
            ) );



            /*
            // #todo 
            - s'il s'agit d'une unité enfant, il faut marquer l'unité parente comme partiellement occupée (code couleur / opacité)
            */

            // if rental unit has children, sub-rental units are booked as well
            if(first.rental_unit_id.children_ids.length) {

              for(let unit_id of first.rental_unit_id.children_ids) {

                  this.bookings.push( new BookingDayClass(
                    first.booking_id.id,
                    first.booking_line_id,
                    unit_id,
                    capacity, 
                    new Date(first.date),
                    date_from,
                    date_to,
                    schedule_from,
                    schedule_to,      
                    nb_nights,
                    first.booking_id.name,
                    first.booking_id.status,
                    first.booking_id.customer_id.id,
                    first.booking_id.customer_id.name,
                    // #todo : booking_payment_status
                    'unknown',
                    first['booking_id']['contacts_ids']
                  ) );

              }
            }

          }
          
        }

      }

      this.cd.detectChanges();
    }
    catch(error) {
      console.warn(error);
    }

  }

}
