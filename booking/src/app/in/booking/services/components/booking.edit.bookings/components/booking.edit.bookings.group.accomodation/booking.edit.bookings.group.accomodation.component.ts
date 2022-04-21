import { Component, Inject, OnInit, OnChanges, NgZone, Output, Input, EventEmitter, SimpleChanges } from '@angular/core';
import { AuthService, ApiService, ContextService } from 'sb-shared-lib';

import { Observable, ReplaySubject, BehaviorSubject } from 'rxjs';
import { findIndex } from 'rxjs/operators';

import { MatSnackBar } from '@angular/material/snack-bar';
import { isNgTemplate } from '@angular/compiler';

interface vmModel {
  assignments: {
    total:          number,
    add:            () => void,
    remove:         (assignment:any) => void,
  }
}


@Component({
  selector: 'booking-edit-bookings-group-accomodation',
  templateUrl: 'booking.edit.bookings.group.accomodation.component.html',
  styleUrls: ['booking.edit.bookings.group.accomodation.component.scss']
})
export class BookingEditBookingsGroupAccomodationComponent implements OnInit  {

  // read-only parent group
  @Input() groupInput: any;
  // read-only parent booking
  @Input() bookingInput: any;

  @Input() accomodationOutput: ReplaySubject<any>;
  @Input() accomodationInput:  ReplaySubject<any>;

  // observable for updates from children components
  public _assignmentInput:  ReplaySubject<any> = new ReplaySubject(1);
  // array of observable for children components
  public _assignmentOutput: Array<ReplaySubject<any>> = [];

  private accomodation: any;

  // sub-objects (not present in group)
  public product:any;
  public assignments:any[];

  public ready: boolean = false;
  
  public vm: vmModel;


  constructor(
              private api: ApiService,
              private auth: AuthService,
              private zone: NgZone,
              private snack: MatSnackBar              
              ) {

    this.accomodation = null;
    this.product = {
      name: ''
    };
    this.assignments = [];

    this.vm = {
      assignments: {
        total:          0,
        add:            () => this.assignmentAdd(),
        remove:         (group:any) => this.assignmentRemove(group)
      }
    };

  }


  public ngOnInit() {

    this.accomodationInput.subscribe( (line: any) => this.load(line) );

    // listen to changes relayed by children components
    this._assignmentInput.subscribe(params => this.updateFromLine(params));

  }

  /**
   * Assign values from parent and load sub-objects required by the view.
   * 
   * @param accomodation bookingLine relating to an accomodation product
   */
  private async load(accomodation:any) {
    this.zone.run( () => {
      this.ready = false;
    });    
    
    this.zone.run( async () => {
      try {

        this.accomodation = accomodation;

        if(accomodation.product_id) {
          let data:any = await this.api.read("lodging\\sale\\catalog\\Product", [accomodation.product_id], ["id", "name", "sku"]);
          if(data && data.length) {
            let product = data[0];
            this.product = product;
          }

          if(accomodation.rental_unit_assignments_ids) {
            let data:any = await this.api.read("lodging\\sale\\booking\\BookingLineRentalUnitAssignement", accomodation.rental_unit_assignments_ids, ["id", "qty", "rental_unit_id"]);
            this.vm.assignments.total = 0;

            if(data && data.length) {

              for(let [index, line] of data.entries()) {
                // add new lines (indexes from this.lines and this._lineOutput are synced)
                if(index >= this.assignments.length) {
                  let item = new ReplaySubject(1);
                  this._assignmentOutput.push(item);
                  item.next(line);
                  this.assignments.push(line);
                }
                // if lines differ, overwrite previsously assigned line
                else if(JSON.stringify(this.assignments[index]) != JSON.stringify(line) ) {
                  let item = new ReplaySubject(1);
                  this._assignmentOutput[index] = item;
                  this.assignments[index] = line;
                  item.next(line);
                }

                this.vm.assignments.total += line.qty;
              }
              // remove remaining lines, if any
              if(this.assignments.length > data.length) {
                this.assignments.splice(data.length);
                this._assignmentOutput.splice(data.length);
              }

            }            
          }
          


        }
        
      }
      catch(response) {console.warn(response);}
      this.ready = true;
    });
  }


  private async updateFromLine(assignment: any) {
    console.log("BookingEditBookingsGroupAccomodationComponent: received changes from child", assignment);

    try {      

      let t_assignment_index = this.assignments.findIndex( (element) => element.id == assignment.id);
      let t_assignment = (t_assignment_index < 0)?undefined:this.assignments[t_assignment_index];

      if(assignment.hasOwnProperty('rental_unit_id')) {
        await this.updateRentalUnit(assignment);
        if(t_assignment) {
          console.log(t_assignment_index, t_assignment, this.assignments);
          this.assignments[t_assignment_index].rental_unit_id = assignment.rental_unit_id;
        }        
      }

      if(assignment.hasOwnProperty('qty') ) {
        await this.updateQuantity(assignment);
        if(t_assignment) {
          this.assignments[t_assignment_index].qty = assignment.qty;
        }
      }

      console.log(this.assignments);
      this.vm.assignments.total = this.assignments.reduce( (total, elem) => (elem && elem.qty)?total+parseInt(elem.qty):total, 0);
      
    }
    catch(error) {
      console.warn('some changes could not be stored', error);
      this.snack.open("Erreur: certains changements n'ont pas pu être enregistrés.", 'Erreur');
    }
  }  

  private async assignmentAdd() {
    try {
      const assignment = await this.api.create("lodging\\sale\\booking\\BookingLineRentalUnitAssignement", {
        qty: 1,
        booking_line_id: this.accomodation.id
      });
    
      let item = new ReplaySubject(1);
      this._assignmentOutput.push(item);
      item.next(assignment);
      this.assignments.push({id: assignment.id, qty: this.accomodation.qty});
      this.snack.open("Séjour mis à jour.");
    }
    catch(error) {
      console.log(error);
    }
  }

   /**
    * Emit change to parent for partial update.
    * @param assignment 
    */
     private async assignmentRemove(assignment: any) {
      let index = this.assignments.findIndex((a) => a.id == assignment.id);

      delete this.assignments[index];
      this.assignments.splice(index, 1);      

      await this.api.update("lodging\\sale\\booking\\BookingLine", this.accomodation.id, { rental_unit_assignments_ids: [-assignment.id] });

      this.vm.assignments.total = this.assignments.reduce( (total, elem) => (elem && elem.qty)?total+parseInt(elem.qty):0, 0);      

      this.snack.open("Séjour mis à jour.");      
    }

    private async updateRentalUnit(assignment:any) {
      await this.api.update("lodging\\sale\\booking\\BookingLineRentalUnitAssignement", [assignment.id], <any>{"rental_unit_id": assignment.rental_unit_id});

      this.snack.open("Séjour mis à jour.");
    }


    private async updateQuantity(assignment:any) {
      await this.api.update("lodging\\sale\\booking\\BookingLineRentalUnitAssignement", [assignment.id], <any>{"qty": assignment.qty});
      this.snack.open("Séjour mis à jour.");      
    }


}