import { NgModule } from '@angular/core';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { Platform } from '@angular/cdk/platform';
import { CustomDateAdapter } from '../../customDateAdapter';


import { SharedLibModule, AuthInterceptorService } from 'sb-shared-lib';

import { BookingRoutingModule } from './bookings-routing.module';

import { BookingsComponent } from './bookings.component';


@NgModule({
  imports: [
    SharedLibModule,
    BookingRoutingModule
  ],
  declarations: [
    BookingsComponent
  ],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter, deps: [MAT_DATE_LOCALE, Platform] }
  ]
})
export class AppInBookingsModule { }
