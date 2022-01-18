import { Injectable } from '@angular/core';
import { environment } from '../environment/environment';
import { catchError, map } from "rxjs/operators";
import { HttpClient, HttpErrorResponse } from '@angular/common/http';


declare global {
  interface Window { eQ: any }
}

@Injectable({
  providedIn: 'root'
})

export class EqualUIService {

  private eq: any;

  constructor() {
    this.eq = new window.eQ('eq-listener');
  }

  public open(context: any) {
    this.eq.open(context);
  }

  public closeAll() {
    this.eq.closeAll();
  }

  public addSubscriber(events: string[], callback: (context:any) => void) {
    this.eq.addSubscriber(events, callback);
  }

}