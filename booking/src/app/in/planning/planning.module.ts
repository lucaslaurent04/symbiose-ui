import { NgModule } from '@angular/core';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { Platform } from '@angular/cdk/platform';
import { CustomDateAdapter } from '../../customDateAdapter';


import { SharedLibModule, AuthInterceptorService } from 'sb-shared-lib';

import { PlanningRoutingModule } from './planning-routing.module';

import { PlanningComponent } from './planning.component';
import { PlanningCalendarComponent } from './_components/planning.calendar/planning.calendar.component';
import { PlanningCalendarBookingComponent } from './_components/planning.calendar/_components/planning.calendar.booking/planning.calendar.booking.component';
import { PlanningCalendarNavbarComponent } from './_components/planning.calendar/_components/planning.calendar.navbar/planning.calendar.navbar.component';

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
    PlanningCalendarNavbarComponent
  ],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter, deps: [MAT_DATE_LOCALE, Platform] }
  ]
})
export class AppInPlanningModule { }
