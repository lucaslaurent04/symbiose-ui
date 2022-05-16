import { Component, Inject, OnInit, OnChanges, NgZone, Output, Input, EventEmitter, SimpleChanges, ViewChild } from '@angular/core';
import { AuthService, ContextService } from 'sb-shared-lib';
import { BookingApiService } from 'src/app/in/booking/_services/booking.api.service';

import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';

import { Observable, ReplaySubject, BehaviorSubject } from 'rxjs';

import { find, map, mergeMap, startWith, debounceTime } from 'rxjs/operators';


interface vmModel {
  rental_unit: {
    name:           string
    inputClue:      ReplaySubject<any>,
    filteredList:   Observable<any>,
    inputChange:    (event:any) => void,
    change:         (event:any) => void,
    focus:          () => void,
    restore:        () => void,
    reset:          () => void,
    display:        (type:any) => string
  },
  qty: {
    value:          number,
    change:         (event:any) => void,
    formControl:    FormControl
  }
}

@Component({
  selector: 'booking-edit-bookings-group-accomodation-line',
  templateUrl: 'booking.edit.bookings.group.accomodation.line.component.html',
  styleUrls: ['booking.edit.bookings.group.accomodation.line.component.scss']
})
export class BookingEditBookingsGroupAccomodationLineComponent implements OnInit  {

    // read-only parent group
    @Input() groupInput: any;
    @Input() productInput: any;

    // read-only parent booking
    @Input() bookingInput: Observable<any>;

    @Input() assignment: any;
    // list of all assignments (to prevent assigning same UL twice)
    @Input() assignments: any[];    

    @Output() updated:  EventEmitter<any> = new EventEmitter();


  private booking: any = null;

  public rental_unit:any;


  @ViewChild(MatAutocomplete) rentalUnitAutocomplete: MatAutocomplete;

  private ready = false;

  public vm: vmModel;

  constructor(
              private api: BookingApiService,
              private auth: AuthService,
              private zone: NgZone
              ) {

    this.rental_unit = null;


    this.vm = {
      rental_unit: {
        name:           '',
        inputClue:      new ReplaySubject(1),
        filteredList:   new Observable(),
        change:         (event:any) => this.rentalUnitChange(event),
        inputChange:    (event:any) => this.rentalUnitInputChange(event),
        focus:          () => this.rentalUnitFocus(),
        restore:        () => this.rentalUnitRestore(),
        reset:          () => this.rentalUnitReset(),
        display:        (type:any) => this.rentalUnitDisplay(type)
      },
      qty: {
        value:          1,
        formControl:    new FormControl('', Validators.required),
        change:         (event:any) => this.rentalUnitChange(event)
      }
    };

  }


  public ngOnInit() {

    // this.assignmentInput.subscribe( (assignment: any) => this.load(assignment) );

    this.load();

    this.bookingInput.subscribe( (booking: any) => this.booking = booking);

    /**
     * listen to the changes on FormControl objects
     */
    this.vm.rental_unit.filteredList = this.vm.rental_unit.inputClue.pipe(
      debounceTime(300),
      map( (value:any) => (typeof value === 'string' ? value : (value == null)?'':value.name) ),
      mergeMap( async (name:string) => this.filterRentalUnits(name) )
    );

  }

  /**
   * Assign values from parent and load sub-objects required by the view.
   *
   * @param accomodation
   */
  private async load() {
    this.zone.run( () => {
      this.ready = false;
    });

    this.zone.run( async () => {
      try {

        if(this.assignment.rental_unit_id) {
          let data:any = await this.api.read("lodging\\realestate\\RentalUnit", [this.assignment.rental_unit_id], ["id", "name", "capacity"]);
          if(data && data.length) {
            let rental_unit = data[0];
            this.rental_unit = rental_unit;
            this.vm.rental_unit.name = rental_unit.name + ' ('+ rental_unit.capacity +')';
          }
        }

        if(this.assignment.qty) {
          this.vm.qty.value = this.assignment.qty;
          this.vm.qty.formControl.setValue(this.assignment.qty);
        }

      }
      catch(response) {console.warn(response);}
      this.ready = true;
    });
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
    if(this.rental_unit) {
      this.vm.rental_unit.name = this.rental_unit.name + ' ('+ this.rental_unit.capacity +')';
    }
    else {
      this.vm.rental_unit.name = '';
    }
  }


  private rentalUnitChange(event:any) {
    console.log('BookingEditCustomerComponent::rentalUnitChange', event);

    // from mat-autocomplete
    if(event && event.option && event.option.value) {
      let rental_unit = event.option.value;
      let qty = Math.min(rental_unit.capacity, this.groupInput.nb_pers);
      this.rental_unit = rental_unit;
      this.vm.rental_unit.name = rental_unit.name + ' ('+ rental_unit.capacity +')';

      this.vm.qty.value = qty;
      this.vm.qty.formControl.setValue(qty);
      // relay change to parent component
      this.updated.emit({id: this.assignment.id, rental_unit_id: rental_unit.id, qty: qty});
    }

    // from qty formControl
    if(event && event.srcElement) {
      let qty = event.srcElement.value;
      this.vm.qty.value = qty;
      // relay change to parent component
      this.updated.emit({id: this.assignment.id, qty: qty});      
    }

  }

    private async filterRentalUnits(name: string) {
        let filtered:any[] = [];

        try {
            const data:any = await this.api.fetch('/?get=lodging_booking_rentalunits', {
                query: name,
                center_id: this.booking.center_id,
                date_from: (new Date(this.groupInput.date_from)).toISOString(),
                date_to: (new Date(this.groupInput.date_to).toISOString()),
                product_id: this.productInput.id
            });

            for(let unit of data) {
                if(this.assignments.findIndex( (a:any) => a.rental_unit_id == unit.id ) < 0) {
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


  public remove() {

  }

}