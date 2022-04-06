import { NgModule } from '@angular/core';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { Platform } from '@angular/cdk/platform';
import { CustomDateAdapter } from '../../customDateAdapter';


import { SharedLibModule, AuthInterceptorService } from 'sb-shared-lib';
import { SessionRoutingModule } from './session-routing.module';

import { SessionComponent } from './session.component';

import {MatButtonToggleModule} from '@angular/material/button-toggle';
import { PadNumbersComponent } from './components/pos/pad-numbers/pad-numbers.component';


@NgModule({
  imports: [
    SharedLibModule,
    SessionRoutingModule,
    MatButtonToggleModule
  ],
  declarations: [
    SessionComponent,
    PadNumbersComponent,
  ],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter, deps: [MAT_DATE_LOCALE, Platform] }
  ]
})
export class AppInSessionModule { }
