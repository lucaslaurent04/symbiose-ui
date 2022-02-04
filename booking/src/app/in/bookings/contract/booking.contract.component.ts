import { Component, AfterContentInit, OnInit, NgZone, Inject, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { ApiService, AuthService, ContextService } from 'sb-shared-lib';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl, Validators } from '@angular/forms';
import { EditorChangeContent, EditorChangeSelection } from 'ngx-quill';
import { UserClass } from 'sb-shared-lib/lib/classes/user.class';



class Booking {
  constructor(
    public id: number = 0,
    public name: string = '',
    public date_from: Date = new Date(),
    public date_to: Date  = new Date(),
    public customer_id: number = 0,
    public center_id: number = 0,
    public has_contract: boolean = false,
    public contracts_ids: number[] = []
  ) {}
}

class Customer {
  constructor(
    public id: number = 0,
    public name: string = '',
    public email: string = ''
  ) {}
}

class Center {
  constructor(
    public id: number = 0,
    public name: string = '',
    public email: string = '',
    public organisation_id: number = 0,
    public template_category_id: number = 0
  ) {}
}

class Organisation {
  constructor(
    public id: number = 0,
    public name: string = '',
    public email: string = '',
    public signature: string = ''    
  ) {}
}

class Contact {
  constructor(
    public id: number = 0,
    public name: string = '',
    public email: string = '',
    public phone: string = ''
  ) {}
}

interface vmModel {
  title: {
    formControl:  FormControl,
    value:        string,
    change:       (event:any) => void
  },
  message: {
    formControl:  FormControl,
    value:        string,
    change:       (event:any) => void
  }
  sender: {
    addresses:    string [],
    value:        string,
    formControl:  FormControl,
    change:       (event:any) => void
  },
  recipient: {
    addresses:    string [],
    value:        string,
    formControl:  FormControl,
    change:       (event:any) => void
  }
};

@Component({
  selector: 'booking-contract',
  templateUrl: './booking.contract.component.html',
  styleUrls: ['./booking.contract.component.scss']
})
export class BookingContractComponent implements OnInit, AfterContentInit {

  public showSbContainer: boolean = false;
  public selectedTabIndex:number = 0;
  public loading = true;
  public is_sent = false;

  public user: UserClass = null;
  public booking_id: number;

  public contract_id: number;

  public organisation: any = new Organisation();
  public center: any = new Center();
  public booking: any = new Booking();
  public customer: any = new Customer();
  public contacts: any[] = [];

  public vm: vmModel;


  constructor(
    private dialog: MatDialog,
    private api: ApiService,
    private auth: AuthService,
    private route: ActivatedRoute,
    private context:ContextService,
    private snack: MatSnackBar,
    private zone: NgZone) {


      this.vm = {
        title: {
          value:          "Contrat pour votre réservation",
          formControl:    new FormControl('', Validators.required),
          change:         (event:any) => this.titleChange(event)
        },
        message: {
          value:          "<p>Nous vous remercions de la confiance que vous nous témoignez pour l'organisation de votre séjour dans l'un de nos Gîtes. <br />Vous trouverez les détails du devis pour votre réservation dans le document joint à ce message.</p>",
          formControl:    new FormControl('', Validators.required),
          change:         (event:any) => this.messageChange(event)
        },
        sender: {
          addresses:      [],
          value:          '',
          formControl:    new FormControl('', [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,8}$")]),
          change:         (event:any) => this.senderChange(event)
        },
        recipient: {
          addresses:      [],
          value:          '',
          formControl:    new FormControl('', [Validators.required, Validators.email]),
          change:         (event:any) => this.recipientChange(event)
        }

      };
  }

  /**
   * Set up callbacks when component DOM is ready.
   */
  public ngAfterContentInit() {
    this.loading = false;

    this.vm.title.formControl.setValue(this.vm.title.value);    
    this.vm.message.formControl.setValue(this.vm.message.value);

  }

  ngOnInit() {

    this.auth.getObservable().subscribe( async (user: UserClass) => {
      this.user = user;
      this.refreshSenderAddresses();
    });

    // fetch the booking ID from the route
    this.route.params.subscribe( async (params) => {
      if(params && params.hasOwnProperty('id')) {
        try {
          this.booking_id = <number> params['id'];
          const result = await this.loadBooking();

          let booking:any = new Booking();
          for(let field of Object.getOwnPropertyNames(booking) ) {
            if(result.hasOwnProperty(field)) {
              booking[field] = result[field];
            }
          }
          this.booking = <Booking> booking;

          if(this.booking.contracts_ids && this.booking.contracts_ids.length) {
            this.contract_id = this.booking.contracts_ids.shift();
          }

          // relay change to context (to display sidemenu panes according to current object)
          this.context.change({
            context_only: true,   // do not change the view
            context: {
              entity: 'lodging\\sale\\booking\\Booking',
              type: 'form',
              purpose: 'view',
              domain: ['id', '=', this.booking_id]              
            }
          });

        }
        catch(error) {
          console.warn(error);
        }

        if(this.booking.customer_id) {
          try {

            const result = await this.loadCustomer();

            let customer:any = new Customer();
            for(let field of Object.getOwnPropertyNames(customer) ) {
              if(result.hasOwnProperty(field)) {
                customer[field] = result[field];
              }
            }
            this.customer = <Customer> customer;
            this.refreshRecipientAddresses();
          }
          catch(error) {
            console.warn(error);
          }
        }


        if(this.booking.contacts_ids && this.booking.contacts_ids.length) {
          try {
            const result = <Array<any>> await this.loadContacts();

            if(result && result.length) {
              // reset current list
              this.contacts = [];
              for(let item of result) {
                let contact:any = new Contact();
                for(let field of Object.getOwnPropertyNames(contact) ) {
                  if(contact.hasOwnProperty(field)) {
                    contact[field] = item[field];
                  }
                }
                this.contacts.push(contact);
              }
            }
            this.refreshRecipientAddresses();
          }
          catch(error) {
            console.warn(error);
          }
        }
        if(this.booking.center_id) {
          try {

            const result = await this.loadCenter();

            let center:any = new Center();
            for(let field of Object.getOwnPropertyNames(center) ) {
              if(result.hasOwnProperty(field)) {
                center[field] = result[field];
              }
            }
            this.center = <Center> center;
            this.refreshSenderAddresses();

            this.fetchTemplates();
          }
          catch(error) {
            console.warn(error);
          }
        }

        if(this.center.organisation_id) {
          try {
            const result = await this.loadOrganisation();

            let organisation:any = new Organisation();
            for(let field of Object.getOwnPropertyNames(organisation) ) {
              if(result.hasOwnProperty(field)) {
                organisation[field] = result[field];
              }
            }
            this.organisation = <Organisation> organisation;
            this.refreshSenderAddresses();
          }
          catch(error) {
            console.warn(error);
          }
        }

      }


    });
  }


  /**
   * fetch template from server for 
   * 
   * quote.mail.subject, quote.mail.body + organisation signature
   */
   private async fetchTemplates() {
    const result = await this.api.collect("communication\\Template", [ ['category_id', '=', this.center.template_category_id], ['type', '=', 'contract'] ], ['name', 'value']);

    if(result && result.length) {
     console.log(result);
      for(let template of result) {
        if(template.name == 'contract.mail.subject') {
          // strip html nodes
          this.vm.title.formControl.setValue(template.value.replace(/<[^>]*>?/gm, ''));
        }
        else if(template.name == 'contract.mail.body') {
          this.vm.message.formControl.setValue(template.value);
        }
      }
    }
  }

  private async loadBooking() {
    const result = <Array<any>> await this.api.read("lodging\\sale\\booking\\Booking", [this.booking_id], Object.getOwnPropertyNames(new Booking()));
    if(result && result.length) {
      return result[0];
    }
    return {};
  }

  private async loadCustomer() {
    const result = <Array<any>> await this.api.read("sale\\customer\\Customer", [this.booking.customer_id], Object.getOwnPropertyNames(new Customer()));
    if(result && result.length) {
      return result[0];
    }
    return {};
  }

  private async loadContacts() {
    const result = <Array<any>> await this.api.read("sale\\booking\\Contact", this.booking.contacts_ids, Object.getOwnPropertyNames(new Contact()));
    if(result && result.length) {
      return result;
    }
    return [];
  }

  private async loadCenter() {
    const result = <Array<any>> await this.api.read("lodging\\identity\\Center", [this.booking.center_id], Object.getOwnPropertyNames(new Center()));
    if(result && result.length) {
      return result[0];
    }
    return {};
  }

  private async loadOrganisation() {
    const result = <Array<any>> await this.api.read("identity\\Identity", [this.center.organisation_id], Object.getOwnPropertyNames(new Organisation()));
    if(result && result.length) {
      return result[0];
    }
    return {};
  }

  public refreshSenderAddresses() {

    // address of current user
    if(this.user) {
      if(!this.vm.sender.addresses.includes(this.user.login)) {
        this.vm.sender.addresses.push(this.user.login);
      }
    }

    // address related to the center of the booking
    if(this.center.email && this.center.email.length) {
      if(!this.vm.sender.addresses.includes(this.center.email)) {
        this.vm.sender.addresses.push(this.center.email);
      }
    }

    // address related to the organisation of the center of the booking
    if(this.organisation.email && this.organisation.email.length) {
      if(!this.vm.sender.addresses.includes(this.organisation.email)) {
        this.vm.sender.addresses.push(this.organisation.email);
      }
    }

  }

  private async refreshRecipientAddresses() {

    console.log('refreshRecipientAddresses', this.customer, this.contacts);

    // customer address
    if(this.customer && this.customer.email && this.customer.email.length) {
      if(!this.vm.recipient.addresses.includes(this.customer.email)) {
        this.vm.recipient.addresses.push(this.customer.email);
      }
    }

    // emails of the contacts
    if(this.contacts && this.contacts.length) {
      for(let contact of this.contacts) {
        if(contact.email.length && !this.vm.recipient.addresses.includes(contact.email)) {
          this.vm.recipient.addresses.push(contact.email);
        }
      }
    }

    // no email found
    if(!this.vm.recipient.addresses.length) {
      // for testing
      this.vm.recipient.addresses.push(this.user.login);
    }    

  }

  public messageChange(event: EditorChangeContent | EditorChangeSelection) {

      if(event.event == 'text-change' && event.hasOwnProperty('html')) {
        this.vm.message.value = event.html;
      }
  }

  public titleChange(event: any) {
    this.vm.title.value = this.vm.title.formControl.value
  }

  public senderChange(event:any) {
    this.vm.sender.value = event.value;
  }

  public recipientChange(event:any) {

    this.vm.recipient.value = event.value;
  }

  public async onSend() {

    /*
      Validate values (otherwise mark fields as invalid)
    */
   

    let is_error = false;

    if(this.vm.sender.formControl.invalid || this.vm.sender.value.length == 0) {
      this.vm.sender.formControl.markAsTouched();
      is_error = true;
    }

    if(this.vm.recipient.formControl.invalid || this.vm.recipient.value.length == 0) {
      this.vm.recipient.formControl.markAsTouched();
      is_error = true;
    }
    
    if(this.vm.title.formControl.invalid || this.vm.title.value.length == 0) {
      this.vm.title.formControl.markAsTouched();
      is_error = true;
    }

    if(this.vm.message.formControl.invalid || this.vm.message.value.length == 0) {
      this.vm.message.formControl.markAsTouched();
      is_error = true;
    }


    if(is_error) return;

    try {
      this.loading = true;
      const response:any = await this.api.call('?do=lodging_booking_send-contract', {
          booking_id: this.booking_id,
          sender_email: this.vm.sender.value,
          recipient_email: this.vm.recipient.value,
          title: this.vm.title.value,
          message: this.vm.message.value
      });
      this.is_sent = true;
      this.snack.open("Contrat envoyé avec succès.");
    }
    catch(err) {
      this.snack.open("Format non reconnu", "Erreur");
      console.log(err);
    }
    this.loading = false;
  }
}