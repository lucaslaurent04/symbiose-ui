import { NgModule } from '@angular/core';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { Platform } from '@angular/cdk/platform';


import { SharedLibModule, AuthInterceptorService, CustomDateAdapter } from 'sb-shared-lib';

import { SessionsComponent } from './sessions.component';
import { PosClosingCoins, SessionsNewComponent } from './new/new.component';
import { AppInSessionOrderModule } from '../session/order/order.module';


@NgModule({
  imports: [
    SharedLibModule,
    AppInSessionOrderModule
  ],
  declarations: [
    SessionsComponent,
    SessionsNewComponent,
    PosClosingCoins
  ],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter, deps: [MAT_DATE_LOCALE, Platform] }
  ]
})
export class AppInSessionsModule { }
