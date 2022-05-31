import { Component, Inject, OnInit, OnChanges, NgZone, Output, Input, EventEmitter, SimpleChanges, AfterViewInit, ViewChild } from '@angular/core';
import { AuthService, ApiService, ContextService, TreeComponent } from 'sb-shared-lib';

import { FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

import { BookingPriceAdapter } from '../../../../../_models/booking_price_adapter.model';
import { BookingLineGroup } from '../../../../../_models/booking_line_group.model';
import { BookingAccomodationAssignment } from '../../../../../_models/booking_accomodation_assignment.model';
import { BookingAccomodation } from '../../../../../_models/booking_accomodation.model';
import { Booking } from '../../../../../_models/booking.model';


import {MatSnackBar} from '@angular/material/snack-bar';

import { Observable, ReplaySubject, BehaviorSubject } from 'rxjs';

import { find, map, mergeMap, startWith, debounceTime } from 'rxjs/operators';


interface BookingGroupAccomodationAssignmentComponentsMap {
};

interface vmModel {
    params: {
        center_id: number,
        date_from: string,
        date_to: string,
        product_id: number
    },
    rental_unit: {
        name: string
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
export class BookingServicesBookingGroupAccomodationAssignmentComponent extends TreeComponent<BookingAccomodationAssignment, BookingGroupAccomodationAssignmentComponentsMap> implements OnInit, OnChanges, AfterViewInit  {
    // server-model relayed by parent
    @Input() set model(values: any) { this.update(values) }
    @Input() accomodation: BookingAccomodation;
    @Input() group: BookingLineGroup;
    @Input() booking: Booking;
    @Output() updated = new EventEmitter();
    @Output() deleted = new EventEmitter();

    public ready: boolean = false;

    public vm: vmModel;

    constructor(
        private api: ApiService,
        private auth: AuthService,
        private dialog: MatDialog,
        private zone: NgZone,
        private snack: MatSnackBar
    ) {
        super( new BookingAccomodationAssignment() );

        this.vm = {
            params: {
                center_id:      0,
                date_from:      '',
                date_to:        '',
                product_id:     0
            },
            rental_unit: {
                name:           ''
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

        this.vm.params = {
            center_id: this.booking.center_id.id,
            date_from: this.group.date_from.toISOString(),
            date_to: this.group.date_to.toISOString(),
            product_id: this.accomodation.product_id.id
        }

    }


    public ngOnInit() {

        this.ready = true;
    }

    public async update(values:any) {
        console.log('assignment update', values);
        super.update(values);

        // assign VM values
        this.vm.rental_unit.name = (Object.keys(this.instance.rental_unit_id).length)?this.instance.rental_unit_id.name + ' ('+this.instance.rental_unit_id.capacity+')':'';
        this.vm.qty.formControl.setValue(this.instance.qty);
    }


    public displayRentalUnit(rental_unit: any): string {
        return rental_unit.name + ' (' + rental_unit.capacity + ')';
    }

    public async onchangeRentalUnit(event:any) {
        let rental_unit = event.option.value;
        let qty = Math.min(rental_unit.capacity, this.group.nb_pers);
        this.vm.rental_unit.name = rental_unit.name + ' ('+ rental_unit.capacity +')';
        this.vm.qty.formControl.setValue(qty);

        // notify back-end about the change
        try {
            await this.api.update(this.instance.entity, [this.instance.id], {rental_unit_id: rental_unit.id});
            // relay change to parent component
            // this.updated.emit();
        }
        catch(response) {
            this.api.errorFeedback(response);
        }
    }

    public async onchangeQty(event:any) {
        if(this.vm.qty.formControl.invalid) {
            this.vm.qty.formControl.markAsTouched();
            return;
        }
        let qty = event.srcElement.value;
        this.vm.qty.formControl.setValue(qty);
        // notify back-end about the change
        try {
            await this.api.update(this.instance.entity, [this.instance.id], {qty: this.vm.qty.formControl.value});
            // relay change to parent component
            // this.updated.emit();
        }
        catch(response) {
            this.api.errorFeedback(response);
        }
    }

}