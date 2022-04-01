import { NgModule } from '@angular/core';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { Platform } from '@angular/cdk/platform';
import { CustomDateAdapter } from '../../../customDateAdapter';


import { SharedLibModule, AuthInterceptorService } from 'sb-shared-lib';

import { SessionOrderRoutingModule } from './order-routing.module';

import { SessionOrderComponent } from './order.component';
import { SessionOrderLinesComponent } from './lines/lines.component';
import { SessionOrderPaymentsComponent } from './payments/payments.component';

import { SessionOrderLinesLineComponent } from './lines/components/line.component';


@NgModule({
  imports: [
    SharedLibModule,
    SessionOrderRoutingModule
  ],
  declarations: [
    SessionOrderComponent,
    SessionOrderLinesComponent,
    SessionOrderPaymentsComponent,
    SessionOrderLinesLineComponent
  ],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter, deps: [MAT_DATE_LOCALE, Platform] }
  ]
})
export class AppInSessionOrderModule { }
