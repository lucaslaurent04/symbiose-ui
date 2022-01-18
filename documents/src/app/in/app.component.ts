import { Component, OnInit, AfterViewInit, ElementRef, QueryList, ViewChild, ViewChildren, NgZone  } from '@angular/core';
import { AuthService, ApiService, ContextService } from 'sb-shared-lib';
import { Router } from '@angular/router';

import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


@Component({
  selector: 'app',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit  {


  public ready: boolean = false;

  constructor(
    private auth: AuthService,
    private api: ApiService,
    private router: Router,
    private dialog: MatDialog,
    private context: ContextService,
    private zone: NgZone
  ) {}


  public ngAfterViewInit() {

    $('#sb-container').on('_close', (event, data) => {
      this.zone.run( () => {
        console.log("sb-container closed");

      });
    });

    $('#sb-container').on('_open', (event, data) => {
      this.zone.run( () => {
        console.log("sb-container opened");

      });
    });

    setTimeout( () => {
      this.ready = true;
    }, 500);
    
  }

  public ngOnInit() {
  }


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