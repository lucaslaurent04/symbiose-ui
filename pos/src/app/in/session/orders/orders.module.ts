import { NgModule } from '@angular/core';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { Platform } from '@angular/cdk/platform';
import { CustomDateAdapter } from '../../../customDateAdapter';

import { SharedLibModule, AuthInterceptorService } from 'sb-shared-lib';

import { SessionOrdersRoutingModule } from './orders-routing.module';

import { SessionOrdersComponent } from './orders.component';
import { SessionOrdersNewComponent } from './new/new.component';

@NgModule({
  imports: [
    SharedLibModule,
    SessionOrdersRoutingModule
  ],
  declarations: [
    SessionOrdersComponent,
    SessionOrdersNewComponent    
  ],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter, deps: [MAT_DATE_LOCALE, Platform] }
  ]
})
export class AppInSessionOrdersModule { }
