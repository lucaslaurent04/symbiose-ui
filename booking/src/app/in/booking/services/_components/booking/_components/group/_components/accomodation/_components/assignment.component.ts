import { Component, Inject, OnInit, OnChanges, NgZone, Output, Input, EventEmitter, SimpleChanges, AfterViewInit, ViewChild } from '@angular/core';
import { AuthService, ApiService, ContextService, TreeComponent } from 'sb-shared-lib';

import { FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

import { BookingPriceAdapter } from '../../../../../_models/booking_price_adapter.model';
import { BookingLineGroup } from '../../../../../_models/booking_line_group.model';
import { BookingAccomodationAssignement } from '../../../../../_models/booking_accomodation_assignment.model';
import { BookingAccomodation } from '../../../../../_models/booking_accomodation.model';
import { Booking } from '../../../../../_models/booking.model';


import {MatSnackBar} from '@angular/material/snack-bar';

import { Observable, ReplaySubject, BehaviorSubject } from 'rxjs';

import { find, map, mergeMap, startWith, debounceTime } from 'rxjs/operators';


interface BookingGroupAccomodationAssignmentComponentsMap {
};

interface vmModel {
    rental_unit: {
        name: string
        inputClue: ReplaySubject < any > ,
        filteredList: Observable < any > ,
        inputChange: (event: any) => void,
        focus: () => void,
        restore: () => void,
        reset: () => void,
        display: (type: any) => string
    },
    qty: {
        formControl: FormControl
    }
};

@Component({
  selector: 'booking-services-booking-group-accomodation-assignment',
  templateUrl: 'assignment.component.html',
  styleUrls: ['assignment.component.scss']
})
export class BookingServicesBookingGroupAccomodationAssignmentComponent extends TreeComponent<BookingAccomodationAssignement, BookingGroupAccomodationAssignmentComponentsMap> implements OnInit, OnChanges, AfterViewInit  {
    // server-model relayed by parent
    @Input() set model(values: any) { this.update(values) }
    @Input() accomodation: BookingAccomodation;
    @Input() group: BookingLineGroup;
    @Input() booking: Booking;
    @Output() updated = new EventEmitter();
    @Output() deleted = new EventEmitter();
    @ViewChild(MatAutocomplete) rentalUnitAutocomplete: MatAutocomplete;

    public ready: boolean = false;

    public vm: vmModel;

    constructor(
        private api: ApiService,
        private auth: AuthService,
        private dialog: MatDialog,
        private zone: NgZone,
        private snack: MatSnackBar
    ) {
        super( new BookingAccomodationAssignement() );

        this.vm = {
            rental_unit: {
                name:           '',
                inputClue:      new ReplaySubject(1),
                filteredList:   new Observable(),
                inputChange:    (event:any) => this.rentalUnitInputChange(event),
                focus:          () => this.rentalUnitFocus(),
                restore:        () => this.rentalUnitRestore(),
                reset:          () => this.rentalUnitReset(),
                display:        (type:any) => this.rentalUnitDisplay(type)
            },
            qty: {
                formControl:    new FormControl('', [Validators.required, this.validateQty.bind(this)]),
            }
        };
    }

    private validateQty(c: FormControl) {
        // qty cannot be bigger thant the rental unit capacity
        // qty cannot be bigger thant the number of persons
        return (this.instance && this.group && 
            c.value <= this.instance.rental_unit_id.capacity && c.value <= this.group.nb_pers ) ? null : {
            validateQty: {
                valid: false
            }
        };
    }

    public ngOnChanges(changes: SimpleChanges) {
        if(changes.model) {
        }
    }

    public ngAfterViewInit() {
        // init local componentsMap
        let map:BookingGroupAccomodationAssignmentComponentsMap = {
        };
        this.componentsMap = map;
    }


    public ngOnInit() {
        this.vm.rental_unit.filteredList = this.vm.rental_unit.inputClue.pipe(
            debounceTime(300),
            map( (value:any) => (typeof value === 'string' ? value : (value == null)?'':value.name) ),
            mergeMap( async (name:string) => this.filterRentalUnits(name) )
        );

        this.ready = true;
    }

    public async update(values:any) {
        console.log('assignment update', values);
        super.update(values);

        // assign VM values
        this.vm.rental_unit.name = (Object.keys(this.instance.rental_unit_id).length)?this.instance.rental_unit_id.name:'';
        this.vm.qty.formControl.setValue(this.instance.qty);
    }


    private rentalUnitInputChange(event:any) {
        this.vm.rental_unit.inputClue.next(event.target.value);
    }

    private rentalUnitFocus() {
        this.vm.rental_unit.inputClue.next("");
    }

    private rentalUnitDisplay(rental_unit:any): string {
        return rental_unit ? rental_unit.name + ' ('+ rental_unit.capacity +')': '';
    }

    private rentalUnitReset() {
        setTimeout( () => {
            this.vm.rental_unit.name = '';
        }, 100);
    }

    private rentalUnitRestore() {
        if(Object.keys(this.instance.rental_unit_id).length) {
            this.vm.rental_unit.name = this.instance.rental_unit_id.name + ' ('+ this.instance.rental_unit_id.capacity +')';
        }
        else {
            this.vm.rental_unit.name = '';
        }
    }

    public async onchangeRentalUnit(event:any) {
        let rental_unit = event.option.value;
        let qty = Math.min(rental_unit.capacity, this.group.nb_pers);
        this.vm.rental_unit.name = rental_unit.name + ' ('+ rental_unit.capacity +')';
        this.vm.qty.formControl.setValue(qty);

        // notify back-end about the change
        try {
            await this.api.update(this.instance.entity, [this.instance.id], {qty: this.vm.qty.formControl.value});
            // relay change to parent component
            this.updated.emit();
        }
        catch(response) {
            this.api.errorFeedback(response);
        }
    }

    public async onchangeQty(event:any) {
        if(this.vm.qty.formControl.invalid) {
            return;
        }
        let qty = event.srcElement.value;
        this.vm.qty.formControl.setValue(qty);
        // notify back-end about the change
        try {
            await this.api.update(this.instance.entity, [this.instance.id], {qty: this.vm.qty.formControl.value});
            // relay change to parent component
            this.updated.emit();
        }
        catch(response) {
            this.api.errorFeedback(response);
        }
    }

    private async filterRentalUnits(name: string) {
        let filtered:any[] = [];

        try {
            const data:any = await this.api.fetch('/?get=lodging_booking_rentalunits', {
                query: name,
                center_id: this.booking.center_id.id,
                date_from: this.group.date_from.toISOString(),
                date_to: this.group.date_to.toISOString(),
                product_id: this.accomodation.product_id.id
            });

            for(let unit of data) {
                // exclude units assigned in other lines from the result
                let found: boolean = false;
                for(let sibling_accomodation of this.group.accomodations_ids) {                    
                    if(sibling_accomodation.rental_unit_assignments_ids.findIndex( (a:any) => a.rental_unit_id.id == unit.id ) >= 0) {
                        found = true;
                        break;
                    }
                }

                if(!found) {
                    filtered.push(unit);
                }
            }

            if(filtered.length == 1) {
                // single result : wait for list update, then auto select
                setTimeout( () => this.rentalUnitAutocomplete.options.first.select(), 100);
            }

        }
        catch(response) {
            console.log(response);
        }
        return filtered;
    }


}