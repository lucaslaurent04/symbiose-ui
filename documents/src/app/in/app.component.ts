import { Component, OnInit, AfterViewInit, ElementRef, QueryList, ViewChild, ViewChildren, NgZone  } from '@angular/core';
import { AuthService, ApiService, ContextService } from 'sb-shared-lib';
import { Router } from '@angular/router';



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

}
