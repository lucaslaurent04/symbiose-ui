import { Component, OnInit, NgZone  } from '@angular/core';
import { ContextService } from 'sb-shared-lib';

@Component({
  selector: 'app',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit  {


  public ready: boolean = false;
  public context_open: boolean = false;

  constructor(
    private context: ContextService,
    private zone: NgZone
  ) {}


  public ngOnInit() {}


  public createCustomer() {

    let descriptor = {
      context: {
        entity:     'sale\\customer\\Customer',
        type:       'form',
        name:       'create',
        domain:     [ ['owner_identity_id', '=', 1] ],
        mode:       'edit',
        purpose:    'create',
        target:     '#sb-container',
        callback:   (data:any) => {
          if(data && data.objects && data.objects.length) {
            console.log('received value from create customer', data);
          }
        }
      }
    };

    this.context.change(descriptor);
  }


  public searchCustomer() {

    let descriptor = {
      context: {
        entity:     'sale\\customer\\Customer',
        type:       'list',
        name:       'default',
        domain:     [ ['owner_identity_id', '=', 1] ],
        mode:       'view',
        purpose:    'view',
        target:     '#sb-container'
      }
    };

    this.context.change(descriptor);
  }


  public createBooking() {

    let descriptor = {
      route: '/bookings',
      context: {
        entity:     'lodging\\sale\\booking\\Booking',
        type:       'form',
        name:       'create',
        mode:       'edit',
        purpose:    'create',
        target:     '#sb-container',
        callback:   (data:any) => {
          if(data && data.objects && data.objects.length) {
            console.log('received value from create booking', data);
            // new_id =  data.objects[0].id
            let descriptor = {
              context: {
                entity:     'lodging\\sale\\booking\\Booking',
                type:       'list',
                name:       'default',                
                mode:       'view',
                purpose:    'view',                
                target:     '#sb-container'
              }
            };        
            setTimeout( () => {
              this.context.change(descriptor);
            });            
          }
        }
      }
    };

    this.context.change(descriptor);
  }


  public searchBooking() {
    let descriptor = {
      route: '/bookings',
      context: {
        entity:     'lodging\\sale\\booking\\Booking',
        type:       'list',
        name:       'default',
        mode:       'view',
        purpose:    'view',
        target:     '#sb-container'
      }
    };

    this.context.change(descriptor);
  }


  public searchContact() {

    let descriptor = {
      context: {
        entity:     'sale\\booking\\Contact',
        type:       'list',
        name:       'default',
        domain:     [ ['relationship', '=', 'contact'] ],
        mode:       'view',
        purpose:    'view',
        target:     '#sb-container'
      }
    };

    this.context.change(descriptor);
  }  
}