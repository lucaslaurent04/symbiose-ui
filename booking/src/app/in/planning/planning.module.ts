import { NgModule } from '@angular/core';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { Platform } from '@angular/cdk/platform';
import { CustomDateAdapter } from '../../customDateAdapter';


import { SharedLibModule, AuthInterceptorService } from 'sb-shared-lib';

import { PlanningRoutingModule } from './planning-routing.module';

import { PlanningComponent } from './planning.component';
import { PlanningCalendarComponent } from './components/planning.calendar/planning.calendar.component';
import { PlanningCalendarBookingComponent } from './components/planning.calendar/components/planning.calendar.booking/planning.calendar.booking.component';
import { PlanningCalendarNavbarComponent } from './components/planning.calendar/components/planning.calendar.navbar/planning.calendar.navbar.component';
import { PlanningDialogBookingComponent } from './components/planning.dialog.booking/planning.dialog.booking.component';

import { LayoutModule } from '@angular/cdk/layout';
import { OverlayModule } from '@angular/cdk/overlay';

@NgModule({
  imports: [
    SharedLibModule,
    PlanningRoutingModule,
    LayoutModule,
    OverlayModule
  ],
  declarations: [
    PlanningComponent,
    PlanningCalendarComponent,
    PlanningCalendarBookingComponent,
    PlanningCalendarNavbarComponent,
    PlanningDialogBookingComponent
  ],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter, deps: [MAT_DATE_LOCALE, Platform] }
  ]
})
export class AppInPlanningModule { }
