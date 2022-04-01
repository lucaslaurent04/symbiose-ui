import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ContextService } from 'sb-shared-lib';


@Component({
  selector: 'sessions',
  templateUrl: 'sessions.component.html',
  styleUrls: ['sessions.component.scss']
})
export class SessionsComponent implements OnInit {

  public ready: boolean = false;

  constructor(
    private context: ContextService
  ) {}


  public ngOnInit() {
    console.log('SessionsComponent init');
    this.ready = true;

    // on connait le user en cours
    // il faut retrouver la session en cours 
  }

}