import { NgModule } from '@angular/core';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { Platform } from '@angular/cdk/platform';

import { SharedLibModule, AuthInterceptorService, DateAdapter } from 'sb-shared-lib';

import { BookingFundingRoutingModule } from './funding-routing.module';

import { BookingFundingComponent } from './funding.component';

@NgModule({
  imports: [
    SharedLibModule,
    BookingFundingRoutingModule
  ],
  declarations: [
    BookingFundingComponent
  ],
  providers: [
    { provide: DateAdapter, useClass: DateAdapter, deps: [MAT_DATE_LOCALE, Platform] }
  ]
})
export class AppInBookingFundingModule { }
