import { NgModule } from '@angular/core';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { Platform } from '@angular/cdk/platform';
import { SharedLibModule, AuthInterceptorService, CustomDateAdapter } from 'sb-shared-lib';
import { AppSharedModule } from '../../shared.module';
import { SessionRoutingModule } from './session-routing.module';
import { SessionComponent } from './session.component';
import { SessionCloseComponent } from './close/close.component';
import { SessionCloseVerificationDialog } from './close/_components/verification.dialog/verification.component';

@NgModule({
  imports: [
    SharedLibModule,
    SessionRoutingModule,
    AppSharedModule
  ],
  declarations: [
    SessionComponent,
    SessionCloseComponent,
    SessionCloseVerificationDialog
  ],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter, deps: [MAT_DATE_LOCALE, Platform] }
  ]
})
export class AppInSessionModule { }
