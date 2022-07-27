import { NgModule } from '@angular/core';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { Platform } from '@angular/cdk/platform';
import { SharedLibModule, AuthInterceptorService, CustomDateAdapter } from 'sb-shared-lib';
import { SessionOrderRoutingModule } from './order-routing.module';
import { SessionOrderComponent } from './order.component';
import { SessionOrderLinesComponent } from './lines/lines.component';
import { ProductInfo, SessionOrderLinesOrderLineComponent } from './lines/_components/order-line/order-line.component';
import { SessionOrderPaymentsComponent } from './payments/payments.component';
import { SessionOrderPaymentsOrderPaymentComponent } from './payments/_components/payment/order-payment.component';
import { SessionOrderPaymentsOrderLineComponent } from './payments/_components/payment/line/order-line.component';
import { SessionOrderPaymentsPaymentPartComponent } from './payments/_components/payment/part/payment-part.component';
import { OrderKeypadLinesComponent, PosOpening } from '../_components/keypad-lines/keypad-lines.component';
import { PosClosingCoins, PosClosing } from '../close/close.component';
import { AppInSessionModule } from '../session.module';
import { PosPadGenericComponent } from '../_components/pad/generic/generic.component';
import { PosPadTypeToggleComponent } from '../_components/pad/type-toggle/type-toggle.component';
import { PosPadValueIncrementsComponent } from '../_components/pad/value-increments/value-increments.component';
import { PaymentComponent } from '../_components/pos/payment/payment.component';
import { SessionOrderLinesDiscountPaneComponent } from '../_components/pos/discount/discount-pane.component';

import { OrderKeypadPaymentComponent } from '../_components/keypad-payment/keypad-payment.component';
import { TicketComponent } from './payments/_components/ticket/ticket.component';
import { OrderItemsComponent } from './lines/_components/order-items/order-items.component';
import { CloseComponent } from '../close/close.component';

import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatPaginatorModule } from '@angular/material/paginator';


@NgModule({
  imports: [
    SharedLibModule,
    SessionOrderRoutingModule,
    MatButtonToggleModule,
    MatButtonToggleModule,
    MatPaginatorModule
  ],
  declarations: [
    SessionOrderComponent,
    SessionOrderLinesComponent,
    SessionOrderPaymentsComponent,
    SessionOrderPaymentsOrderPaymentComponent,
    SessionOrderLinesOrderLineComponent,
    SessionOrderPaymentsOrderLineComponent,
    SessionOrderPaymentsPaymentPartComponent,
    OrderKeypadLinesComponent,
    PosPadGenericComponent,
    PosPadTypeToggleComponent,
    PosOpening,
    ProductInfo,
    PosClosing,
    PosPadValueIncrementsComponent,
    PaymentComponent,
    PosClosingCoins,
    SessionOrderLinesDiscountPaneComponent,
    OrderKeypadPaymentComponent,
    TicketComponent,
    OrderItemsComponent,
    CloseComponent
  ],
  exports: [PosPadGenericComponent, PosPadValueIncrementsComponent, OrderKeypadPaymentComponent, CloseComponent],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter, deps: [MAT_DATE_LOCALE, Platform] },
  ]
})
export class AppInSessionOrderModule { }
