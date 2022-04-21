import { NgModule } from '@angular/core';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { Platform } from '@angular/cdk/platform';


import { SharedLibModule, AuthInterceptorService, DateAdapter } from 'sb-shared-lib';
import { SessionRoutingModule } from './session-routing.module';

import { SessionComponent } from './session.component';


// #todo - check this (shouldn't be imported here)
import {MatButtonToggleModule} from '@angular/material/button-toggle';




@NgModule({
  imports: [
    SharedLibModule,
    SessionRoutingModule,
    MatButtonToggleModule
  ],
  declarations: [
    SessionComponent,
    
  ],
  providers: [
    { provide: DateAdapter, useClass: DateAdapter, deps: [MAT_DATE_LOCALE, Platform] }
  ]
})
export class AppInSessionModule { }
