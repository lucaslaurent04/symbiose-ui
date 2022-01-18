import { Component, OnInit, AfterViewInit  } from '@angular/core';
import { AuthService, ApiService } from 'sb-shared-lib';


@Component({
  selector: 'booking',
  templateUrl: 'booking.component.html',
  styleUrls: ['booking.component.scss']
})
export class BookingComponent implements OnInit  {


  constructor(
    private auth: AuthService
  ) {}


  public ngOnInit() {
    console.log('BookingComponent init');
  }

}