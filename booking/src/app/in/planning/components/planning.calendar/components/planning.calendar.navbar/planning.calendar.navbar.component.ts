import { Component, Input, Output, EventEmitter, OnInit, NgZone } from '@angular/core';
import { Observable }  from 'rxjs';
import { find, map, mergeMap, startWith, debounceTime } from 'rxjs/operators';

import {CalendarParamService} from '../../../../_services/calendar.param.service';

import { HeaderDays } from 'src/app/model/headerdays';
import { ChangeReservationArg } from 'src/app/model/changereservationarg';
import { ApiService, AuthService } from 'sb-shared-lib';
import { FormControl, FormGroup } from '@angular/forms';


@Component({
  selector: 'planning-calendar-navbar',
  templateUrl: './planning.calendar.navbar.component.html',
  styleUrls: ['./planning.calendar.navbar.component.scss']
})
export class PlanningCalendarNavbarComponent implements OnInit {
    @Input() day: number;
    @Input() month: number;
    @Input() year: number;
    @Output() changedays = new EventEmitter<ChangeReservationArg>();

    dateFrom: Date;
    dateTo: Date;

    centers: any[] = [];
    selected_centers_ids: any[] = [];    


    vm: any = {
        duration:   '31',
        date_range: new FormGroup({
            date_from: new FormControl(),
            date_to: new FormControl()
        })
    };
  

    constructor(
        private api: ApiService, 
        private auth: AuthService, 
        private params: CalendarParamService,
        private zone: NgZone) { 
    }

    ngAfterViewChecked() {

    }
    
    ngOnInit() {

        /*
            Setup events listeners
        */

        this.vm.date_range.get("date_to").valueChanges
        .subscribe( (value:Date) => {
            if(value) {
                this.dateFrom = this.vm.date_range.get("date_from").value;
                this.dateTo = this.vm.date_range.get("date_to").value;

                this.params.sync({
                    'date_from':  this.dateFrom,
                    'date_to':  this.dateTo
                });
            }
        });

        this.params.getObservable()
        .subscribe( async () => {
            // update local vars according to service new values
            this.dateFrom = new Date(this.params.date_from.getTime())
            this.dateTo = new Date(this.params.date_to.getTime())
            
            this.vm.duration = this.params.duration.toString();
            this.vm.date_range.get("date_from").setValue(this.dateFrom);
            this.vm.date_range.get("date_to").setValue(this.dateTo);
        });


        // by default set the first center of current user
        this.auth.getObservable()
        .subscribe( async (user:any) => {
            if(user.hasOwnProperty('centers_ids') && user.centers_ids.length) {
                try {
                    const centers = await this.api.collect('lodging\\identity\\Center', 
                        ['id', 'in', user.centers_ids], 
                        ['id', 'name', 'code'],
                        'name','asc',0,50
                    );
                    if(centers.length) {
                        this.selected_centers_ids = centers.map( (e:any) => e.id );                        
                        this.params.centers_ids = this.selected_centers_ids;
                        this.centers = centers;
                    }
                }
                catch(err) {
                    console.warn(err) ;
                }            
            }

        });

    }

    public onDurationChange(event: any) {
        console.log('onDurationChange');

        // update local values
        let duration = parseInt(event.value, 10);
        this.dateTo = new Date(this.dateFrom.getTime());
        this.dateTo.setDate(this.dateTo.getDate() + duration);

        this.vm.date_range.get("date_to").setValue(this.dateTo);
    }
  
    public onToday() {
        this.dateFrom = new Date();

        this.dateTo = new Date(this.dateFrom.getTime());
        this.dateTo.setDate(this.dateTo.getDate() + this.params.duration);
        this.vm.date_range.get("date_to").setValue(this.dateTo);
    }

    public onPrev() {
        this.dateFrom.setDate(this.dateFrom.getDate() - this.params.duration);

        this.dateTo = new Date(this.dateFrom.getTime());
        this.dateTo.setDate(this.dateTo.getDate() + this.params.duration);
        this.vm.date_range.get("date_to").setValue(this.dateTo);
    }

    public onNext() {
        this.dateFrom.setDate(this.dateFrom.getDate() + this.params.duration);

        this.dateTo = new Date(this.dateFrom.getTime());
        this.dateTo.setDate(this.dateTo.getDate() + this.params.duration);
        this.vm.date_range.get("date_to").setValue(this.dateTo);        
    }

    public onchangeSelectedCenters() {
        this.params.centers_ids = this.selected_centers_ids;
    }
    

}
