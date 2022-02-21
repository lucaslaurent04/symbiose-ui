import { Inject, Injectable } from '@angular/core';

import { Observable, ReplaySubject } from 'rxjs';
import * as $ from 'jquery';
import { DOCUMENT } from '@angular/common';

import { NavigationEnd, Router } from '@angular/router';
import { EqualUIService } from './eq.service';

declare global {
  interface Window { context: any; }
}

@Injectable({
  providedIn: 'root'
})

/**
 * This service offers a getObservable() method allowing to access an Observable that any component can subscribe to.
 * Subscribers will allways receive the latest emitted value as a Context object.
 *
 */
export class ContextService {

  private observable: ReplaySubject<any>;

  // current route
  private current_route: string = '';

  public getObservable() {
    return this.observable;
  }

  constructor(
    private router: Router,
    @Inject(DOCUMENT) private document: Document,
    private eq:EqualUIService
  ) {

    this.observable = new ReplaySubject<any>(1);

    // listen to context changes
    this.eq.addSubscriber(['open', 'close'], (context:any) => {
      this.observable.next({context: context});
    });

    // listen to route change requests
    this.eq.addSubscriber(['navigate'], (descriptor:any) => {
      this.change(descriptor);
    });

    // listen to route changes and keep track of current route
    this.router.events.subscribe( (event: any) => {
      if (event instanceof NavigationEnd) {
        console.log('ContextService : route change', event);
        this.current_route = event.url;
      }
    });

  }

  /**
   * Request a change by providing a descriptor that holds a route and/or a context.
   *
   * @param descriptor  Descriptor might contain both route and context objects.
   */
  public change(descriptor:any) {

    // switch route, if requested
    if(descriptor.hasOwnProperty('route')) {
      console.log("ContextService: received route change request", descriptor);

      // make sure no eq context is left open
      this.eq.closeAll();

      this.router.navigate([descriptor.route]);
    }

    // switch context, if requested
    if(descriptor.hasOwnProperty('context')) {
      console.log("ContextService: received context change request", descriptor);
      // request eq.openContext()
      if(!descriptor.context_only) {
        this.eq.open(descriptor.context);
      }      
      this.observable.next({context: descriptor.context});
    }
  }

}