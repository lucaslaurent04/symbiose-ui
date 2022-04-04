import { NgModule } from '@angular/core';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { Platform } from '@angular/cdk/platform';
import { CustomDateAdapter } from '../../../customDateAdapter';


import { SharedLibModule, AuthInterceptorService } from 'sb-shared-lib';


import { SessionCloseComponent } from './close.component';


@NgModule({
  imports: [
    SharedLibModule
  ],
  declarations: [
    SessionCloseComponent
  ],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter, deps: [MAT_DATE_LOCALE, Platform] }
  ]
})
export class AppInSessionCloseModule { }
