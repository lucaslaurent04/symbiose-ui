import { Component, OnInit, AfterViewInit, Inject, ElementRef, QueryList, ViewChild, ViewChildren, NgZone  } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { BookingApiService } from 'src/app/in/bookings/booking.api.service';
import { AuthService, ContextService } from 'sb-shared-lib';
import { MatSnackBar } from '@angular/material/snack-bar';



import { Observable, BehaviorSubject, ReplaySubject } from 'rxjs';
import { find, map, startWith, debounceTime, switchMap } from 'rxjs/operators';


/*
This is a SmartComponent.

Sub-components are in charge of:
 * loading sub-objects required for displaying the values related to the current booking.
 * creating sub-objects when required
 * send data update notifications to this component 

Smart components are in charge of updating the model.

*/

class Booking {
  constructor(
    public id: number = 0,
    public name: string = '',
    public created: Date = new Date(),
    public date_from: Date = new Date(),
    public date_to: Date = new Date(),
    public price: number = 0,
    public status: string = '',
    public customer_id: number = 0,
    public has_payer_organisation: boolean = false,
    public payer_organisation_id: number = 0,
    public center_id: number = 0, 
    public type_id = 0,
    public description: string = '',
    public contacts_ids: Array<number> = [],
    public booking_lines_groups_ids: Array<number> = []
  ) {}
}


@Component({
  selector: 'booking-edit',
  templateUrl: 'booking.edit.component.html',
  styleUrls: ['booking.edit.component.scss']
})
export class BookingEditComponent implements OnInit, AfterViewInit  {

  public booking: any = new Booking();
  public id: number = 0;

  public _bookingInput:  ReplaySubject<any> = new ReplaySubject(1);
  public _bookingOutput: ReplaySubject<any> = new ReplaySubject(1);

  public showSbContainer: boolean = false;


  public status:any = {
    'quote': 'Devis',
    'option': 'En option',
    'confirmed': 'Confirmée',
    'validated': 'Validée',
    'checkedin': 'En cours',
    'checkedout': 'Terminée',
    'due_balance': 'Solde débiteur',
    'credit_balance': 'Solde créditeur',
    'balanced': 'Soldée'
  }

  constructor(
              private auth: AuthService,
              private api: BookingApiService,
              private router: Router,
              private dialog: MatDialog,
              private route: ActivatedRoute,
              private snack: MatSnackBar,
              private zone: NgZone,
              private context:ContextService
              ) {
  }



  /**
   * Set up callbacks when component DOM is ready.
   */
  public ngAfterViewInit() {
    // _open and _close event are relayed by eqListener on the DOM node given as target when a context is requested
    // #sb-booking-container is defined in booking.edit.component.html
    $('#sb-booking-container').on('_close', (event, data) => {
      this.zone.run( () => {
        this.showSbContainer = false;
      });
    });
    $('#sb-booking-container').on('_open', (event, data) => {
      this.zone.run( () => {
        this.showSbContainer = true;
      });
    });
  }

  public ngOnInit() {
    console.log('BookingEditComponent init');

    // listen to changes relayed by children component on the _bookingInput observable
    this._bookingInput.subscribe(params => this.update(params));

    // fetch the booking ID from the route
    this.route.params.subscribe( async (params) => {
      console.log('BookingEditComponent : recevied routeParams change', params);
      if(params && params.hasOwnProperty('id')) {        
        this.id = <number> params['id'];     

        try {
          // load booking object
          let data = await this.load( Object.getOwnPropertyNames(new Booking()) );
          // update local object
          for(let field of Object.keys(data)) {
            this.booking[field] = data[field];
          }          
          // relay to children
          this._bookingOutput.next(this.booking);
          // assign booking to Booking API service (for conditionning calls)
          this.api.setBooking(this.booking);

          // relay change to context (to display sidemenu panes according to current object)
          this.context.change({
            context_only: true,   // do not change the view
            context: {
              entity: 'lodging\\sale\\booking\\Booking',
              type: 'form',
              purpose: 'view',
              domain: ['id', '=', this.id]              
            }
          });
        }
        catch(response) {
          console.warn(response);
        }
      }
    });

  }

  /**
   * Assign values based on selected booking and load sub-objects required by the view.
   * 
   */
  private async load(fields:any) {
    const result:any = await this.api.read("lodging\\sale\\booking\\Booking", [this.id], fields);
    if(result && result.length) {
      return result[0];
    }
    return {};
  }

  /**
   * Handler for updates relayed from children components
   */
  private async update(booking:any) {
    console.log('BookingEditComponent: received change', booking, this.booking);
    try {

      /*
      const dialogRef = this.dialog.open(BookingUpdateDialogConfirm, {
        width: '50vw',
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
      */

      // handle requests for updating single fields
      if(booking.hasOwnProperty('refresh')) {
        // some changes have been done that might impact current object
        // refresh property specifies which fields have to be re-loaded

        // #memo booking is going to be relayed to children: if fields are not loaded then some children will be missing
        let model_fields = Object.getOwnPropertyNames( new Booking() );

        // reload booking
        let data = await this.load(model_fields);        
        // update local object
        for(let field of Object.keys(data)) {
          this.booking[field] = data[field];
        }
        // notify children
        this._bookingOutput.next(this.booking);
        return;
      }

      // handle request for updating single fields (reload)

      let has_change = false;

      if(booking.hasOwnProperty('customer_id') && booking.customer_id != this.booking.customer_id) {
        await this.updateCustomer(booking.customer_id);
        has_change = true;
      }

      if( (booking.hasOwnProperty('payer_organisation_id') && booking.payer_organisation_id != this.booking.payer_organisation_id)
          || (booking.hasOwnProperty('has_payer_organisation') && booking.has_payer_organisation != this.booking.has_payer_organisation) ) {
        await this.updatePayer(booking.payer_organisation_id);
        has_change = true;
      }

      if(booking.hasOwnProperty('center_id') && booking.center_id != this.booking.center_id) {
        await this.updateCenter(booking.center_id);
        has_change = true;
      }

      if(booking.hasOwnProperty('type_id') && booking.type_id != this.booking.type_id) {
        await this.updateType(booking.type_id);
        has_change = true;
      }

      if(booking.hasOwnProperty('description') && booking.description != this.booking.description) {
        await this.updateDescription(booking.description);
        has_change = true;
      }

      if(booking.hasOwnProperty('contacts_ids') && booking.contacts_ids.length != this.booking.contacts_ids.length ) {
        this.booking.contacts_ids = booking.contacts_ids;
        has_change = true;
      }

      if(booking.hasOwnProperty('booking_lines_groups_ids') && booking.booking_lines_groups_ids.length != this.booking.booking_lines_groups_ids.length ) {
        this.booking.booking_lines_groups_ids = booking.booking_lines_groups_ids;
        has_change = true;
      }


      if(has_change) {
        // reload booking
        let data = await this.load( Object.getOwnPropertyNames( new Booking() ));
        // update local object
        for(let field of Object.keys(data)) {
          this.booking[field] = data[field];
        }
        // relay changes to children components
        this._bookingOutput.next(this.booking);
        // notify User
        this.snack.open("Réservation mise à jour");
      }
    }
    catch(response:any) {
      console.warn('some changes could not be stored', response);
      let error:string = 'unknonw';
      if(response && response.hasOwnProperty('error') && response['error'].hasOwnProperty('errors')) {
        let errors = response['error']['errors'];

        if(errors.hasOwnProperty('INVALID_STATUS')) {
          error = 'invalid_status';
        }
        else if(errors.hasOwnProperty('INVALID_PARAM')) {
          error = 'invalid_param';
        }
        else if(errors.hasOwnProperty('NOT_ALLOWED')) {
          error = 'not_allowed';
        }
        else if(errors.hasOwnProperty('CONFLICT_OBJECT')) {            
          error = 'conflict_object';
        }
      }

      switch(error) {
        case 'not_allowed':
          this.snack.open("Vous n'avez pas les autorisations pour cette opération.", "Erreur");
          break;
        case 'conflict_object':
          this.snack.open("Cette réservation a été modifiée entretemps par un autre utilisateur.", "Erreur");
          break;  
        case 'invalid_status':
          this.snack.open("La réservation n'est pas modifiable. Repassez en devis pour la modifier.", "Erreur");
          break;
        case 'unknonw':
        case 'invalid_param':
        default:
          this.snack.open("Erreur inconnue - certains changements n'ont pas pu être enregistrés.", "Erreur");
      }
    }
  }

  private async updateCustomer(customer_id:number) {
    console.log('BookingEditComponent::updateCustomer', customer_id);
    await this.api.update("lodging\\sale\\booking\\Booking", [this.id], <any>{"customer_id": customer_id});
  }

  private async updateDescription(description:string) {
    console.log('BookingEditComponent::updateDescription', description);
    await this.api.update("lodging\\sale\\booking\\Booking", [this.id], <any>{"description": description});
  }
  
  private async updatePayer(payer_organisation_id:number) {
    console.log('BookingEditComponent::updatePayer', payer_organisation_id);
    let values:any = {};

    if(payer_organisation_id <= 0) {
      values.has_payer_organisation = false;
      values.payer_organisation_id = 0;
    }
    else {
      values.has_payer_organisation = true;
      values.payer_organisation_id = payer_organisation_id;
    }

    await this.api.update("lodging\\sale\\booking\\Booking", [this.id], values);
  }


  private async updateCenter(center_id:number) {
    console.log('BookingEditComponent::updateCenter', center_id);
    await this.api.update("lodging\\sale\\booking\\Booking", [this.id], <any>{"center_id": center_id});
  }

  private async updateType(type_id:number) {
    console.log('BookingEditComponent::updateType', type_id);
    await this.api.update("lodging\\sale\\booking\\Booking", [this.id], <any>{"type_id": type_id});
  }


}


@Component({
  selector: 'booking-update-confirm-dialog',
  template: `
  <h1 mat-dialog-title>Modifier la réservation</h1>

  <div mat-dialog-content>
    <p><b>Confirmez-vous la modification ?</b></p>
  </div>

  <div mat-dialog-actions>
    <button mat-button [mat-dialog-close]="false">Annuler</button>
    <button mat-button [mat-dialog-close]="true" cdkFocusInitial>Confirmer</button>
  </div>
  `
})
export class BookingUpdateDialogConfirm {
  constructor(
    public dialogRef: MatDialogRef<BookingUpdateDialogConfirm>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
}

@Component({
  selector: 'booking-deletion-confirm-dialog',
  template: `
  <h1 mat-dialog-title>Suppression</h1>

  <div mat-dialog-content>
    <p><b>Confirmez-vous la suppression ?</b></p>
  </div>

  <div mat-dialog-actions>
    <button mat-button [mat-dialog-close]="false">Annuler</button>
    <button mat-button [mat-dialog-close]="true" cdkFocusInitial>Confirmer</button>
  </div>
  `
})
export class BookingDeletionDialogConfirm {
  constructor(
    public dialogRef: MatDialogRef<BookingDeletionDialogConfirm>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
}  