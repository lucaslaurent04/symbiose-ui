import { NgModule } from '@angular/core';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { Platform } from '@angular/cdk/platform';
import { CustomDateAdapter } from '../../../customDateAdapter';


import { SharedLibModule, AuthInterceptorService } from 'sb-shared-lib';

import { SessionOrderRoutingModule } from './order-routing.module';

import { SessionOrderComponent } from './order.component';

import { SessionOrderLinesComponent } from './lines/lines.component';
import { SessionOrderLinesOrderLineComponent } from './lines/components/line/order-line.component';

import { SessionOrderPaymentsComponent } from './payments/payments.component';
import { SessionOrderPaymentsOrderPaymentComponent } from './payments/components/payment/order-payment.component';
import { SessionOrderPaymentsOrderLineComponent } from './payments/components/payment/line/order-line.component';
import { SessionOrderPaymentsPaymentPartComponent } from './payments/components/payment/part/payment-part.component';


@NgModule({
  imports: [
    SharedLibModule,
    SessionOrderRoutingModule
  ],
  declarations: [
    SessionOrderComponent,
    SessionOrderLinesComponent,
    SessionOrderPaymentsComponent,
    SessionOrderPaymentsOrderPaymentComponent,
    SessionOrderLinesOrderLineComponent,
    SessionOrderPaymentsOrderLineComponent,
    SessionOrderPaymentsPaymentPartComponent
  ],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter, deps: [MAT_DATE_LOCALE, Platform] }
  ]
})
export class AppInSessionOrderModule { }
