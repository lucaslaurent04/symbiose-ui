import { Component, Inject, OnInit, OnChanges, NgZone, Output, Input, EventEmitter, SimpleChanges, AfterViewInit, ViewChild } from '@angular/core';
import { AuthService, ApiService, ContextService, TreeComponent } from 'sb-shared-lib';

import { FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

import { BookingLineGroup } from '../../../../_models/booking_line_group.model';
import { BookingAgeRangeAssignment } from '../../../../_models/booking_agerange_assignment.model';
import { Booking } from '../../../../_models/booking.model';


import {MatSnackBar} from '@angular/material/snack-bar';

import { Observable, ReplaySubject, BehaviorSubject } from 'rxjs';

import { find, map, mergeMap, startWith, debounceTime, debounce } from 'rxjs/operators';


interface BookingGroupAgeRangeComponentsMap {
};

interface vmModel {
    age_range: {
        value: any
    },
    qty: {
        formControl: FormControl,
        change:      () => void
    }
};

@Component({
  selector: 'booking-services-booking-group-agerange',
  templateUrl: 'agerange.component.html',
  styleUrls: ['agerange.component.scss']
})
export class BookingServicesBookingGroupAgeRangeComponent extends TreeComponent<BookingAgeRangeAssignment, BookingGroupAgeRangeComponentsMap> implements OnInit, OnChanges, AfterViewInit  {
    // server-model relayed by parent
    @Input() set model(values: any) { this.update(values) }
    @Input() agerange: BookingAgeRangeAssignment;
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
        super( new BookingAgeRangeAssignment() );

        this.vm = {
            age_range: {
                value:          {}
            },
            qty: {
                formControl:    new FormControl('', [Validators.required, this.validateQty.bind(this)]),
                change:         () => this.onchange()
            }
        };
    }

    private validateQty(c: FormControl) {
        // qty cannot be zero
        // qty cannot be bigger than the number of persons
        return (this.instance && this.group &&
            c.value > 0 && c.value <= this.group.nb_pers ) ? null : {
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
        let map:BookingGroupAgeRangeComponentsMap = {
        };
        this.componentsMap = map;

        this.vm.age_range.value = this.instance.age_range_id;
        this.vm.qty.formControl.setValue(this.instance.qty);
    }


    public ngOnInit() {
        this.ready = true;

        this.vm.qty.formControl.valueChanges.pipe(debounceTime(500)).subscribe( () => {
            if(this.vm.qty.formControl.invalid) {
                this.vm.qty.formControl.markAsTouched();
                return;
            }
        });

    }


    public selectAgeRange(age_range:any) {
        console.log(age_range);
        this.vm.age_range.value = age_range;
        this.onchange();
    }

    public async update(values:any) {
        console.log('assignment update', values);
        super.update(values);

        // assign VM values
        this.vm.qty.formControl.setValue(this.instance.qty);
    }

    private async onchange() {
        // notify back-end about the change
        try {
            let age_range = this.vm.age_range.value;
            await this.api.update(this.instance.entity, [this.instance.id], {
                age_range_id: age_range.id,
                qty: this.vm.qty.formControl.value
            });
            // do not relay change to parent component
        }
        catch(response) {
            this.api.errorFeedback(response);
        }
    }


}