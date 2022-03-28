import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ContextService } from 'sb-shared-lib';


@Component({
  selector: 'orders',
  templateUrl: 'orders.component.html',
  styleUrls: ['orders.component.scss']
})
export class OrdersComponent implements OnInit, AfterViewInit {

  public ready: boolean = false;

  constructor(
    private context: ContextService
  ) {}


  public ngAfterViewInit() {


  }

  public ngOnInit() {
    console.log('OrdersComponent init');
  }

}