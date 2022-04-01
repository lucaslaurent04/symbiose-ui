import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ContextService } from 'sb-shared-lib';


@Component({
  selector: 'session-order-payments',
  templateUrl: 'payments.component.html',
  styleUrls: ['payments.component.scss']
})
export class SessionOrderPaymentsComponent implements OnInit, AfterViewInit {

  public ready: boolean = false;

  constructor(
    private context: ContextService
  ) {}


  public ngAfterViewInit() {

  }

  public ngOnInit() {
    console.log('OrdersComponent init');
    this.ready = true;
  }

}