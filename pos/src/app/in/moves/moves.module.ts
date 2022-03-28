import { NgModule } from '@angular/core';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { Platform } from '@angular/cdk/platform';
import { CustomDateAdapter } from '../../customDateAdapter';


import { SharedLibModule, AuthInterceptorService } from 'sb-shared-lib';

import { MovesRoutingModule } from './moves-routing.module';

import { MovesComponent } from './moves.component';

@NgModule({
  imports: [
    SharedLibModule,
    MovesRoutingModule
  ],
  declarations: [
    MovesComponent    
  ],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter, deps: [MAT_DATE_LOCALE, Platform] }
  ]
})
export class AppInMovesModule { }
