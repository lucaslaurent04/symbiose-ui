import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ContextService } from 'sb-shared-lib';


@Component({
  selector: 'booking',
  templateUrl: 'booking.component.html',
  styleUrls: ['booking.component.scss']
})
export class BookingComponent implements OnInit, AfterViewInit {

  public ready: boolean = false;

  constructor(
    private context: ContextService
  ) {}


  public ngAfterViewInit() {

    this.context.getObservable().subscribe( (descriptor:any) => {
      if(Object.keys(descriptor.context).length == 0) {
        this.showBookings();
      }
    });
    
    setTimeout( () => {
      this.ready = true;
      // if no context is set, force to default one
      let descriptor = this.context.getDescriptor();
      if(Object.keys(descriptor.context).length == 0) {
        this.showBookings();
      }
    }, 500);

  }

  public ngOnInit() {
    console.log('BookingComponent init');
  }

  private showBookings() {
    let descriptor = {
      context: {
        "entity": 'lodging\\sale\\booking\\Booking',
        "view": "list.default",
        "order": "id",
        "sort": "desc",
        "domain": ["status", "=", "quote"]
      }
    };

    this.context.change(descriptor);
  }
}