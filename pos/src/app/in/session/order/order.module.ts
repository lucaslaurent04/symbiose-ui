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
import { PosClosing, PosClosingCoins, PosComponent, PosOpening, ProductInfo } from '../components/pos/pos.component';
import { AppInSessionModule } from '../session.module';
import { PadComponent } from '../components/pos/pad/pad.component';
import { TypeToggleComponent } from '../components/pos/pad/type-toggle/type-toggle.component';
import { PadArbitraryNumbersComponent } from '../components/pos/pad/pad-arbitrary-numbers/pad-arbitrary-numbers.component';
import { PaiementComponent } from '../components/pos/paiement/paiement.component';
import { DiscountComponent } from '../components/pos/discount/discount.component';
import { InfoComponent } from '../components/pos/info/info.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { PosArbitraryNumbersComponent } from '../components/pos-arbitrary-numbers/pos-arbitrary-numbers.component';
import { ProductsComponent } from './lines/components/products/products.component';
import { TicketComponent } from './payments/components/ticket/ticket.component';


@NgModule({
  imports: [
    SharedLibModule,
    SessionOrderRoutingModule,
    MatButtonToggleModule,
    MatButtonToggleModule
  ],
  declarations: [
    SessionOrderComponent,
    SessionOrderLinesComponent,
    SessionOrderPaymentsComponent,
    SessionOrderPaymentsOrderPaymentComponent,
    SessionOrderLinesOrderLineComponent,
    SessionOrderPaymentsOrderLineComponent,
    SessionOrderPaymentsPaymentPartComponent,
    PosComponent,
    PadComponent,
    TypeToggleComponent,
    PosOpening,
    ProductInfo,
    PosClosing,
    PadArbitraryNumbersComponent,
    PaiementComponent,
    PosClosingCoins,
    DiscountComponent,
    InfoComponent,
    PosArbitraryNumbersComponent,
    ProductsComponent,
    TicketComponent,
    
  ],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter, deps: [MAT_DATE_LOCALE, Platform] }
  ]
})
export class AppInSessionOrderModule { }
