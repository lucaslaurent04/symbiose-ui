import { NgModule } from '@angular/core';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { Platform } from '@angular/cdk/platform';

import { SharedLibModule, AuthInterceptorService, DateAdapter } from 'sb-shared-lib';

import { BookingInvoiceRoutingModule } from './invoice-routing.module';

import { BookingInvoiceComponent } from './invoice.component';


@NgModule({
  imports: [
    SharedLibModule,
    BookingInvoiceRoutingModule
  ],
  declarations: [
    BookingInvoiceComponent
  ],
  providers: [
    { provide: DateAdapter, useClass: DateAdapter, deps: [MAT_DATE_LOCALE, Platform] }
  ]
})
export class AppInBookingInvoiceModule { }
