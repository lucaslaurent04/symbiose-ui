import { Component, Inject, OnInit, OnChanges, NgZone, Output, Input, EventEmitter, SimpleChanges } from '@angular/core';
import { AuthService, ContextService } from 'sb-shared-lib';
import { BookingApiService } from 'src/app/in/bookings/_services/booking.api.service';

import { Observable, ReplaySubject, BehaviorSubject, async } from 'rxjs';

import {MatSnackBar} from '@angular/material/snack-bar';

import { find, map, mergeMap, startWith, debounceTime } from 'rxjs/operators';

import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { BookingDeletionDialogConfirm } from '../../booking.edit.component';

/*
This is a SmartComponent.

Sub-components are in charge of:
 * loading sub-objects required for displaying the values related to the current booking.
 * creating sub-objects when required
 * send data update notifications to this component

Smart components are in charge of updating the model.

*/

interface vmModel {
  price: {
      value:        number
  },
  groups: {
    folded:         any,
    toggle:         (event:any) => void,
    add:            () => void,
    remove:         (group:any) => void,
    drop:           (event:CdkDragDrop<any>) => void
  }
}

@Component({
  selector: 'booking-edit-bookings',
  templateUrl: 'booking.edit.bookings.component.html',
  styleUrls: ['booking.edit.bookings.component.scss']
})
export class BookingEditBookingsComponent implements OnInit  {

  @Input() bookingInput:  ReplaySubject<any>;
  @Input() bookingOutput: ReplaySubject<any>;

  // observable for updates from children components
  public _groupInput:  ReplaySubject<any> = new ReplaySubject(1);
  // array of observable for children components
  public _groupOutput: Array<ReplaySubject<any>> = [];


  private model_fields = {
    BookingLineGroup: ["id", "booking_id", "name", "order", "has_pack", "pack_id", "price",
                      "is_locked", "is_autosale", "is_extra", "date_from", "date_to",
                      "sojourn_type", "nb_pers", "nb_nights", "rate_class_id",
                      "booking_lines_ids", "accomodations_ids"]
  };


  // reference to parent's booking object for sub-object creation
  public booking:any;

  private center: any;
  private customer: any;

  public groups: Array<any>;


  public vm: vmModel;

  constructor(
              private api: BookingApiService,
              private auth: AuthService,
              private dialog: MatDialog,
              private zone: NgZone,
              private snack: MatSnackBar
              ) {

    this.booking = {};
    this.center = null;
    this.customer = null;

    this.groups = [];


    this.vm = {
      price: {
        value:          0.0
      },
      groups: {
        folded:         {},
        toggle:         (event:any) => this.groupToggle(event),
        add:            () => this.groupAdd(),
        remove:         (group:any) => this.groupRemove(group),
        drop:           (event:CdkDragDrop<any>) => this.groupDrop(event)
      }
    };

  }

  public ngOnInit() {

    // listen to the parent for changes on booking object
    this.bookingInput.subscribe( async (booking: any) => this.load(booking) );

    // listen to changes relayed by children component on the _bookingInput observable
    this._groupInput.subscribe(params => this.updateFromGroup(params));

  }

  /**
   * Load subitem of current booking object.
   *
   * @param booking
   */
  private async load(booking:any) {
    this.zone.run( async () => {
      try {

        // update local booking object
        for(let field of Object.keys(booking)) {
          this.booking[field] = booking[field];
        }

        if(booking.hasOwnProperty('price')) {
          this.vm.price.value = booking.price;
        }

        if(booking.booking_lines_groups_ids && booking.booking_lines_groups_ids.length) {

          let data:any = await this.loadGroups(booking.booking_lines_groups_ids, this.model_fields['BookingLineGroup']);
          if(data) {
            for(let [index, group] of data.entries()) {
              // add new lines (indexes from this.lines and this._lineOutput are synced)
              if(index >= this.groups.length) {
                let item = new ReplaySubject(1);
                this._groupOutput.push(item);
                item.next(group);
                this.groups.push(group);
              }
              // if lines differ, overwrite previsously assigned line
              else if(JSON.stringify(this.groups[index]) != JSON.stringify(group) ) {
                let item = new ReplaySubject(1);
                this._groupOutput[index] = item;
                this.groups[index] = group;
                item.next(group);
              }
              if(!this.vm.groups.folded.hasOwnProperty(group.id)) {
                this.vm.groups.folded[group.id] = true;
              }
            }
            // remove remaining lines, if any
            if(this.groups.length > data.length) {
              this.groups.splice(data.length);
              this._groupOutput.splice(data.length);
            }
          }
        }

        if(booking.center_id) {
          let data:any = await this.api.read("lodging\\identity\\Center", [booking.center_id], ["id", "name", "code", "organisation_id", "discount_list_category_id"]);
          if(data && data.length) {
            this.center = data[0];
          }
        }

        if(booking.customer_id) {
          let data:any = await this.api.read("sale\\customer\\Customer", [booking.customer_id], ["id", "name", "rate_class_id"]);
          if(data && data.length) {
            this.customer = data[0];
          }
        }

      }
      catch(response) {console.warn(response);}
    });
  }

  private async loadGroups(ids:Array<any>, fields: any) {
    let data:any = await this.api.read("lodging\\sale\\booking\\BookingLineGroup",
                                      ids,
                                      fields,
                                      'order'
                                      );
    return data;
  }

  private groupToggle(event:any) {
    this.vm.groups.folded[event.group_id] = event.status;
  }

  private async groupAdd() {
    console.log("group add");

    try {
      let rate_class_id = 4;
      // default rate class is the rate_class of the customer of the booking
      if(this.customer && this.customer.rate_class_id) {
        rate_class_id = this.customer.rate_class_id;
      }
      let sojourn_type = (this.center.discount_list_category_id == 2)?'GG':'GA';
      const group:any = await this.api.create("lodging\\sale\\booking\\BookingLineGroup", {
        name: "Séjour " + this.center.name,
        order: this.groups.length + 1,
        booking_id: this.booking.id,
        rate_class_id: rate_class_id,
        sojourn_type: sojourn_type,
        date_from: this.booking.date_from,
        date_to: this.booking.date_to
      });

      this.vm.groups.folded[group.id] = false;

      let data = await this.loadGroups([group.id], this.model_fields['BookingLineGroup']);

      let item = new ReplaySubject(1);
      this._groupOutput.push(item);
      this.groups.push(data[0]);
      item.next(data[0]);
      // emit change to parent
      //this.bookingOutput.next({booking_lines_groups_ids: groups_ids});
    }
    catch(response: any) {
      this.api.errorFeedback(response);
    }
  }

  private async groupRemove(group:any) {

    if(group.is_autosale) {
      this.api.errorFeedback({error: {errors: {NOT_ALLOWED: 'cannot delete autosale groups'}}});
      return;
    }
    const dialogRef = this.dialog.open(BookingDeletionDialogConfirm, {
      width: '33vw',
      data: {booking: this.booking}
    });

    try {
      await new Promise( async(resolve, reject) => {
        dialogRef.afterClosed().subscribe( async (result) => (result)?resolve(true):reject());    
      });
    }
    catch(error) {
      return;
    }

    try {
      const response = await this.api.remove("lodging\\sale\\booking\\BookingLineGroup", [group.id], true);
      let index = this.groups.findIndex( (element) => element.id == group.id);
      this.groups.splice(index, 1);
      this._groupOutput.splice(index, 1);
    }
    catch(response) {
      this.api.errorFeedback(response);
    }
  }

  private groupDrop(event:CdkDragDrop<any>) {
    console.log(event.previousIndex, event.currentIndex);
    // adapt this.groups and this._groupOutput
    moveItemInArray(this.groups, event.previousIndex, event.currentIndex);
    moveItemInArray(this._groupOutput, event.previousIndex, event.currentIndex);

    // adapt new values for 'order' field
    for(let index in this.groups) {
      let item = this.groups[index];
      this.updateFromGroup({id: item.id, order: parseInt(index) + 1});
    }


  }

  private async updateFromGroup(group: any) {
    console.log("BookingEditBookingsComponent: received changes from child", group);

    try {
      let index = this.groups.findIndex( (element) => element.id == group.id);
      let t_group = this.groups.find( (element) => element.id == group.id);

      // handle single fields updates

      let has_change = false;
      let refresh_requests:any = [];

      if(group.hasOwnProperty('name') && group.name != t_group.name) {
        await this.updateName(group);
        has_change = true;
      }

      if(group.hasOwnProperty('pack_id') && group.pack_id != t_group.pack_id) {
        await this.updatePack(group);
        // we need to reload booking price
        refresh_requests.push('price');
        has_change = true;
      }

      if(group.hasOwnProperty('rate_class_id') && group.rate_class_id != t_group.rate_class_id) {
        await this.updateRateClass(group);
        has_change = true;
      }

      if(group.hasOwnProperty('is_locked') && group.is_locked != t_group.is_locked) {
        await this.updateIsLocked(group);
        // we need to reload booking price
        refresh_requests.push('price');
        has_change = true;
      }

      if(group.hasOwnProperty('has_pack') && group.has_pack != t_group.has_pack) {
        await this.updateHasPack(group);
        has_change = true;
      }

      if( (group.hasOwnProperty('date_from') && group.date_from != t_group.date_from)
      || (group.hasOwnProperty('date_to') && group.date_to != t_group.date_to) ) {
        await this.updateDate(group);
        refresh_requests.push('price');
        has_change = true;
      }

      if(group.hasOwnProperty('nb_pers') && group.nb_pers != t_group.nb_pers) {
        await this.updateNbPers(group);
        refresh_requests.push('price');
        has_change = true;
      }

      if(group.hasOwnProperty('sojourn_type') && group.sojourn_type != t_group.sojourn_type) {
        await this.updateSojournType(group);
        refresh_requests.push('price');
        has_change = true;
      }

      if(group.hasOwnProperty('order') && group.order != t_group.order) {
        await this.updateOrder(group);
        has_change = true;
      }

      if(group.hasOwnProperty('booking_lines_ids')) {
        let diff = group.booking_lines_ids.filter( (lid:any) => t_group.booking_lines_ids.indexOf(lid) === -1);
        if(diff.length) {
          await this.updateBookingLinesIds(group);
          has_change = true;
        }
      }

      // handle explicit requests for updating single fields (reload partial object)
      if(group.hasOwnProperty('refresh')) {
        // some changes have been done that might impact current object
        // refresh property specifies which fields have to be re-loaded
        let model_fields = this.model_fields['BookingLineGroup'];

        if(group.refresh.hasOwnProperty('self')) {
          if(Array.isArray(group.refresh.self)) {
            model_fields = group.refresh.self;
          }
          // reload object from server
          let data = await this.loadGroups([group.id], model_fields);
          this._groupOutput[index].next(data[0]);
        }

        // handle requests to relay to parent
        if(group.refresh.hasOwnProperty('booking_id')) {
          // group.refresh.booking_id is an array of fields from sale\booking\Booking to be updated
          refresh_requests = [...refresh_requests, ...group.refresh.booking_id];
        }

      }
      // reload whole object from server
      else if(has_change) {

        let data = await this.loadGroups([group.id], this.model_fields['BookingLineGroup']);
        let object = data[0];
        for(let field of Object.keys(object)) {
          this.groups[index][field] = object[field];
        }
        // relay changes to children components
        this._groupOutput[index].next(this.groups[index]);
        // notify User
        this.snack.open("Regroupement mis à jour");
      }

      // relay refresh request to parent, if any
      if(refresh_requests.length) {
        this.bookingOutput.next({id: this.booking.id, refresh: refresh_requests});
      }

    }
    catch(response:any) {
      this.api.errorFeedback(response);
    }
  };


  private async updateName(group:any) {
    console.log('BookingEditBookingsComponent::updateName', group);
    await this.api.update("lodging\\sale\\booking\\BookingLineGroup", [group.id], <any>{"name": group.name});
  }

  private async updatePack(group:any) {
    console.log('BookingEditBookingsComponent::updatePack', group);
    await this.api.update("lodging\\sale\\booking\\BookingLineGroup", [group.id], <any>{"pack_id": group.pack_id});
    // update local instance
    let t_group = this.groups.find( (element) => element.id == group.id);
    t_group.pack_id = group.pack_id;
  }

  private async updateRateClass(group:any) {
    console.log('BookingEditBookingsComponent::updateRateClass', group);
    await this.api.update("lodging\\sale\\booking\\BookingLineGroup", [group.id], <any>{"rate_class_id": group.rate_class_id});
    // update local instance
    let t_group = this.groups.find( (element) => element.id == group.id);
    t_group.rate_class_id = group.rate_class_id;
  }

  private async updateHasPack(group:any) {
    console.log('BookingEditBookingsComponent::updateHasPack', group);
    await this.api.update("lodging\\sale\\booking\\BookingLineGroup", [group.id], <any>{"has_pack": group.has_pack});
    // update local instance
    let t_group = this.groups.find( (element) => element.id == group.id);
    t_group.has_pack = group.has_pack;
  }

  private async updateNbPers(group:any) {
    console.log('BookingEditBookingsComponent::updateNbPers', group);
    await this.api.update("lodging\\sale\\booking\\BookingLineGroup", [group.id], <any>{"nb_pers": group.nb_pers});
    // update local instance
    let t_group = this.groups.find( (element) => element.id == group.id);
    t_group.nb_pers = group.nb_pers;
  }

  private async updateSojournType(group:any) {
    console.log('BookingEditBookingsComponent::updateSojournType', group);
    await this.api.update("lodging\\sale\\booking\\BookingLineGroup", [group.id], <any>{"sojourn_type": group.sojourn_type});
    // update local instance
    let t_group = this.groups.find( (element) => element.id == group.id);
    t_group.sojourn_type = group.sojourn_type;
  }

  private async updateOrder(group:any) {
    console.log('BookingEditBookingsComponent::updateOrder', group);
    await this.api.update("lodging\\sale\\booking\\BookingLineGroup", [group.id], <any>{"order": group.order});
    // update local instance
    let t_group = this.groups.find( (element) => element.id == group.id);
    t_group.order = group.order;
  }

  private async updateIsLocked(group:any) {
    console.log('BookingEditBookingsComponent::updateIsLocked', group);
    await this.api.update("lodging\\sale\\booking\\BookingLineGroup", [group.id], <any>{"is_locked": group.is_locked});
  }

  private async updateDate(group:any) {
    console.log('BookingEditBookingsComponent::updateDate', group);
    if(group.date_from && group.date_to) {
      await this.api.update("lodging\\sale\\booking\\BookingLineGroup", [group.id], <any>{"date_from": group.date_from, "date_to": group.date_to});
      // update local instance
      let t_group = this.groups.find( (element) => element.id == group.id);
      t_group.date_from = group.date_from;
      t_group.date_to = group.date_to;
    }
    else if(group.date_from) {
      await this.api.update("lodging\\sale\\booking\\BookingLineGroup", [group.id], <any>{"date_from": group.date_from});
      // update local instance
      let t_group = this.groups.find( (element) => element.id == group.id);
      t_group.date_from = group.date_from;
    }
    else {
      await this.api.update("lodging\\sale\\booking\\BookingLineGroup", [group.id], <any>{"date_to": group.date_to});
      // update local instance
      let t_group = this.groups.find( (element) => element.id == group.id);
      t_group.date_to = group.date_to;
    }
  }

  private async updateBookingLinesIds(group:any) {
    await this.api.update("lodging\\sale\\booking\\BookingLineGroup", [group.id], <any>{"booking_lines_ids": group.booking_lines_ids});
  }

}