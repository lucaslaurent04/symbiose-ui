import { Component, Inject, OnInit, OnChanges, NgZone, Output, Input, EventEmitter, SimpleChanges } from '@angular/core';
import { AuthService, ApiService, ContextService } from 'sb-shared-lib';

import { FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import {MatSnackBar} from '@angular/material/snack-bar';

import { Observable, ReplaySubject, BehaviorSubject } from 'rxjs';

import { find, map, mergeMap, startWith, debounceTime } from 'rxjs/operators';


interface vmModel {
  value: {
    value:          number,
    formControl:    FormControl,
    change:         (event:any) => void
  },
  type: {
    value:          string,
    formControl:    FormControl,
    change:         (event:any) => void
  }
}

@Component({
  selector: 'booking-edit-bookings-group-line-discount',
  templateUrl: 'booking.edit.bookings.group.line.discount.component.html',
  styleUrls: ['booking.edit.bookings.group.line.discount.component.scss']
})
export class BookingEditBookingsGroupLineDiscountComponent implements OnInit  {

  // read-only parent line
  @Input() lineInput: any;

  @Input() lineOutput: ReplaySubject<any>;
  @Input() discountInput: ReplaySubject<any>;
  @Input() discountOutput: ReplaySubject<any>;

  // current discount
  private discount: any;

  public ready: boolean = false;

  public vm: vmModel;

  constructor(
              private api: ApiService,
              private auth: AuthService,
              private dialog: MatDialog,
              private zone: NgZone,
              private snack: MatSnackBar
              ) {

    this.discount = {};


    this.vm = {
      value: {
        value:          0.0,
        formControl:    new FormControl('', Validators.required),
        change:         (event:any) => this.valueChange(event)
      },
      type: {
        value:          '',
        formControl:    new FormControl('', Validators.required),
        change:         (event:any) => this.typeChange(event)
      }
    };

  }


  public ngOnInit() {

    this.discountInput.subscribe( (discount: any) => this.load(discount) );

    /**
     * listen to the changes on FormControl objects
     */

    this.vm.value.formControl.valueChanges.subscribe( (value:number)  => {
      if(this.vm.type.value =='percent' && value > 1.0) {
        value = value / 100;
      }
      this.vm.value.value = value;
    });

    
  }

  /**
   * Assign values from parent and load sub-objects required by the view.
   * 
   * @param discount 
   */
  private async load(discount:any) {
    this.zone.run( () => {
      this.ready = false;
    });    
    
    this.zone.run( async () => {
      try {
        console.log("BookingEditBookingsGroupLineDiscountComponent: received changes from parent", discount.id, discount);

        // update local group object
        for(let field of Object.keys(discount)) {
          this.discount[field] = discount[field];
        }

        if(discount.hasOwnProperty('type')) {
          this.vm.type.value = discount.type;
          if(discount.type == 'percent') {
            this.vm.type.formControl.setValue(false);
          }
          else {
            this.vm.type.formControl.setValue(true);
          }
        }

        if(discount.hasOwnProperty('value')) {
          this.vm.value.value = discount.value;
          this.vm.value.formControl.setValue(discount.value);
        }      

      }
      catch(response) {console.warn(response);}
      this.ready = true;
    });
  }



  private typeChange(event:any) {
    console.log(event);
    // true is €, false, is %

    if(event) {
      this.vm.type.value = "amount";
    }
    else {
      this.vm.type.value = "percent";
    }
    if(this.vm.value.value) {
      this.discountOutput.next({id: this.discount.id, type: this.vm.type.value});
    }
  }

  private valueChange(event:any) {
    if(this.vm.value.value) {
      // relay change to parent component
      this.discountOutput.next({id: this.discount.id, type: this.vm.type.value, value: this.vm.value.value});

    }
  }

}