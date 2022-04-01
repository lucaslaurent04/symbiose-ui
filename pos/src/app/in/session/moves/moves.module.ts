import { NgModule } from '@angular/core';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { Platform } from '@angular/cdk/platform';
import { CustomDateAdapter } from '../../../customDateAdapter';


import { SharedLibModule, AuthInterceptorService } from 'sb-shared-lib';

import { SessionMovesRoutingModule } from './moves-routing.module';

import { SessionMovesComponent } from './moves.component';

@NgModule({
  imports: [
    SharedLibModule,
    SessionMovesRoutingModule
  ],
  declarations: [
    SessionMovesComponent    
  ],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter, deps: [MAT_DATE_LOCALE, Platform] }
  ]
})
export class AppInSessionMovesModule { }
