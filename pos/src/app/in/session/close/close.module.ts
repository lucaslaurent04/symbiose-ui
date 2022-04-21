import { NgModule } from '@angular/core';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { Platform } from '@angular/cdk/platform';


import { SharedLibModule, AuthInterceptorService, DateAdapter } from 'sb-shared-lib';


import { SessionCloseComponent } from './close.component';


@NgModule({
  imports: [
    SharedLibModule
  ],
  declarations: [
    SessionCloseComponent
  ],
  providers: [
    { provide: DateAdapter, useClass: DateAdapter, deps: [MAT_DATE_LOCALE, Platform] }
  ]
})
export class AppInSessionCloseModule { }
