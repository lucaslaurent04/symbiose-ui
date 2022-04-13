import { Component, ChangeDetectorRef, Input, Output, EventEmitter, ViewChild, OnInit, AfterViewInit, ViewChildren, QueryList, ElementRef, AfterViewChecked } from '@angular/core';

import { ChangeReservationArg } from 'src/app/model/changereservationarg';
import { RentalUnitClass } from 'src/app/model/rental.unit.class';
import { BookingDayClass } from 'src/app/model/booking.class';
import { HeaderDays } from 'src/app/model/headerdays';


import { ApiService, AuthService } from 'sb-shared-lib';
import {CalendarParamService} from '../../_services/calendar.param.service';


class ConsumptionClass {
  constructor(
    public id:number = 0,
    public booking_id = 0,
    public booking_line_id = 0,
    public booking_line_group_id = 0,    
    public is_accomodation: Boolean = false,
    public rental_unit_id = 0,
    public date: Date = new Date(),
    public schedule_from: string = '',
    public schedule_to: string = ''
  ) {}
}

@Component({
  selector: 'planning-calendar',
  templateUrl: './planning.calendar.component.html',
  styleUrls: ['./planning.calendar.component.scss']
})
export class PlanningCalendarComponent implements OnInit, AfterViewInit, AfterViewChecked {
    @Input() year: number;
    @Input() month: number;
    @Input() day: number;

    @Output() filters = new EventEmitter<ChangeReservationArg>();


    // attach DOM element to compute the cells width
    @ViewChild('calTable') calTable: any;
    @ViewChild('calTableRefColumn') calTableRefColumn: any;

    @ViewChildren("calTableHeadCells") calTableHeadCells: QueryList<ElementRef>;
    
    public headers: any;

    public headerdays: HeaderDays;

    public cells_width: number;

    public colors: any[] = [
        '#ff9633', '#0fc4a7','#0288d1','#9575cd','#C80651'
    ];
  

    public consumptions: any = [];
    public rental_units: any = [];

    private previous_duration: number;
    private consumptions_map: any = {};
    private sojourns_map: any = {};    

    constructor(
        private params: CalendarParamService, 
        private api: ApiService, 
        private cd: ChangeDetectorRef) {
            this.headers = {};
            this.previous_duration = 0;
    }

    ngOnInit() { 
        this.params.getObservable().subscribe( () => {
            console.log('PlanningCalendarComponent cal params change', this.params);
            this.onFiltersChange();
        });
    }

    ngAfterViewInit() {
    }

    
    /**
     * After refreshing the view with new content, adapt header and relay new cell_width, if changed
     */
    ngAfterViewChecked() {

        for(let cell of this.calTableHeadCells) {
            this.cells_width = cell.nativeElement.offsetWidth;
            break;
        }

        let ten_percent = this.cells_width * 0.1;
        if(ten_percent < 100) {
            // set width to 100px
            this.calTableRefColumn.nativeElement.style.width = '100px';
        }
        else {
            if(ten_percent > 200) {
                // set width to 200px
                this.calTableRefColumn.nativeElement.style.width = '200px';
            }
            else {
                // set width to 10%
                this.calTableRefColumn.nativeElement.style.width = '10%';
            }
        }

        this.cd.detectChanges();
    }

    public getConsumptions(rentalUnit:RentalUnitClass, day: Date):any {
        let filtered = [];

        let date_index:string = day.toISOString().substring(0, 10);

        if(this.consumptions_map.hasOwnProperty(rentalUnit.id) && this.consumptions_map[rentalUnit.id].hasOwnProperty(date_index)) {
            filtered = this.consumptions_map[rentalUnit.id][date_index];
        }

        return filtered;
    }

    public getSojourns(rentalUnit:RentalUnitClass, day: Date):any {
        let filtered = [];

        let date_index:string = day.toISOString().substring(0, 10);

        if(this.sojourns_map.hasOwnProperty(rentalUnit.id) && this.sojourns_map[rentalUnit.id].hasOwnProperty(date_index)) {
            filtered = this.sojourns_map[rentalUnit.id][date_index];
        }

        return filtered;
    }

    private async load() {
    
        this.rental_units = [];

        if(this.params.centers_ids.length) {

            const rental_units = await this.api.collect(
                "lodging\\realestate\\RentalUnit", 
                ["center_id", "in",  this.params.centers_ids], 
                Object.getOwnPropertyNames(new RentalUnitClass()),
                'id', 'asc', 0, 100
            );

            if(rental_units && rental_units.length) {
                this.rental_units = rental_units;
                let rental_units_ids = rental_units.map( (a:any) => a.id );

                this.consumptions = await this.api.collect(
                    "sale\\booking\\Consumption", 
                    [
                        ['date', '>=', this.params.date_from],
                        ['date', '<=', this.params.date_to],
                        ['rental_unit_id', 'in',  rental_units_ids]
                    ], 
                    [
                    'booking_id.customer_id.name', 'booking_id.status', 'booking_id.name', 'booking_id.contacts_ids', 'booking_id.payment_status',
                    'rental_unit_id.id', 'rental_unit_id.children_ids', 
                    ...Object.getOwnPropertyNames(new ConsumptionClass())
                    ], 
                    'date', 'asc', 0, 500
                );
            }
        }
    }



    private async onFiltersChange() {

        this.createHeaderDays();
        
        try {

            await this.load();
            this.consumptions_map = {};
            this.sojourns_map = {};

            let tmp_consumptions_map:any = {};
            let tmp_sojourns_map:any = {};
            
            // group consumptions by rental_unit and date
            for(let consumption of this.consumptions) {
                let date_index = consumption.date.substring(0, 10);

                // handle only one consumption by booking_line and by date
                // #todo - do this on server side
                if(tmp_consumptions_map.hasOwnProperty(consumption.booking_line_id)) {
                    if(tmp_consumptions_map[consumption.booking_line_id].hasOwnProperty(date_index)) {
                        continue;
                    }                    
                }
                else {
                    tmp_consumptions_map[consumption.booking_line_id] = {};
                }                
                tmp_consumptions_map[consumption.booking_line_id][date_index] = true;


                if(!this.consumptions_map.hasOwnProperty(consumption.rental_unit_id.id)) {
                    this.consumptions_map[consumption.rental_unit_id.id] = {};
                }

                if(!this.consumptions_map[consumption.rental_unit_id.id].hasOwnProperty(date_index)) {
                    this.consumptions_map[consumption.rental_unit_id.id][date_index] = [];
                }
                this.consumptions_map[consumption.rental_unit_id.id][date_index].push(consumption);


                if(!tmp_sojourns_map.hasOwnProperty(consumption.rental_unit_id.id)) {
                    tmp_sojourns_map[consumption.rental_unit_id.id] = {};
                }

                if(!tmp_sojourns_map[consumption.rental_unit_id.id].hasOwnProperty(consumption.booking_line_group_id)) {
                    tmp_sojourns_map[consumption.rental_unit_id.id][consumption.booking_line_group_id] = {
                        consumptions: []
                    };
                    this.sojourns_map[consumption.rental_unit_id.id] = {};
                    this.sojourns_map[consumption.rental_unit_id.id][date_index] = [];
                    // add only first booking_line_group
                    this.sojourns_map[consumption.rental_unit_id.id][date_index].push(tmp_sojourns_map[consumption.rental_unit_id.id][consumption.booking_line_group_id]);
                }

                tmp_sojourns_map[consumption.rental_unit_id.id][consumption.booking_line_group_id].consumptions.push(consumption);
                
                
            }

            this.cd.detectChanges();
        }
        catch(error) {
            console.warn(error);
        }

    }


    /**
     * Recompute content of the header.
     * 
     * Convert to folloiwuing structure : 
     * 
     * headers.months:
     *    months[]
     *        {
     *            month:
     *            days: 
     *        }
     *
     * headers.days: date[]
     */
    private createHeaderDays() {

        if(this.previous_duration != this.params.duration) {
            // temporarily reset cells_width to an arbitrary ow value
            this.cells_width = 12;
        }

        this.previous_duration = this.params.duration;
        
        // reset headers
        this.headers = {
            months: [],
            days: []
        };

        let months:any = {};
        // pass-1 assign dates
        for (let i = 0; i < this.params.duration; i++) {
            let currdate = new Date(this.params.date_from.getTime());
            currdate.setDate(currdate.getDate() + i);            
            this.headers.days.push(currdate);
            let month_index = currdate.getFullYear()*100+currdate.getMonth();
            if(!months.hasOwnProperty(month_index)) {
                months[month_index] = [];
            }
            months[month_index].push(currdate);
        }

        // pass-2 assign months (in order)
        let months_array = Object.keys(months).sort( (a: any, b: any) => (a - b) );
        for(let month of months_array) {
            this.headers.months.push(
                {
                    date: months[month][0],
                    month: month,
                    days: months[month]
                }
            );
        }

    }

}
