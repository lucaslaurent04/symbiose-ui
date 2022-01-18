import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { ApiService } from 'sb-shared-lib';

import { BookingDayClass } from 'src/app/model/booking.class';

class ContactClass {
  constructor(
    public id: number = 0,
    public name: string = '',
    public type: string = ''    
  ) {}
}

@Component({
  selector: 'planning-dialog-booking',
  templateUrl: './planning.dialog.booking.component.html',
  styleUrls: ['./planning.dialog.booking.component.scss']
})
export class PlanningDialogBookingComponent implements OnInit  {

  public contacts: any[]        = [];


  constructor(
    private dialog: MatDialogRef<PlanningDialogBookingComponent>, 
    private api:ApiService,
    @Inject(MAT_DIALOG_DATA) public booking: BookingDayClass
  ) {
    console.log(booking);
  }


  private async load() {

    try {
      const contacts = await this.api.collect(
        "sale\\booking\\Contact", 
        [
          ['id', 'in', this.booking.booking_contacts_ids],
        ], 
        [ ...['partner_identity_id.email',
          'partner_identity_id.phone'], ...Object.getOwnPropertyNames(new ContactClass())], 
        'id', 'asc', 0, 3
      );
  
      this.contacts = contacts;
    }
    catch(err) {
      console.warn(err);
    }

  }

  async ngOnInit() {
    await this.load();
  }

  onClose() {
    this.dialog.close();
  }

  onShowBooking(booking_id: number) {
    this.dialog.close({open: 'booking', id: booking_id});
  }

  onShowCustomer(customer_id: number) {
    this.dialog.close({open: 'customer', id: customer_id});
  }

  onShowContact(contact_id: number) {
    this.dialog.close({open: 'contact', id: contact_id});
  }
}