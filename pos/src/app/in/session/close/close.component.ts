import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ContextService } from 'sb-shared-lib';


@Component({
  selector: 'session-close',
  templateUrl: 'close.component.html',
  styleUrls: ['close.component.scss']
})
export class SessionCloseComponent implements OnInit, AfterViewInit {

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