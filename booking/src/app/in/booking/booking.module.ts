import { NgModule } from '@angular/core';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { Platform } from '@angular/cdk/platform';

import { SharedLibModule, AuthInterceptorService, DateAdapter } from 'sb-shared-lib';

import { BookingRoutingModule } from './booking-routing.module';

import { BookingComponent } from './booking.component';
import { BookingServicesComponent, BookingUpdateDialogConfirm, BookingDeletionDialogConfirm } from './services/services.component';


import { BookingEditBookingsComponent } from './services/components/booking.edit.bookings/booking.edit.bookings.component';
import { BookingEditBookingsGroupComponent } from './services/components/booking.edit.bookings/components/booking.edit.bookings.group/booking.edit.bookings.group.component';
import { BookingEditBookingsGroupLineComponent } from './services/components/booking.edit.bookings/components/booking.edit.bookings.group.line/booking.edit.bookings.group.line.component';
import { BookingEditBookingsGroupLineDiscountComponent } from './services/components/booking.edit.bookings/components/booking.edit.bookings.group.line.discount/booking.edit.bookings.group.line.discount.component';
import { BookingEditBookingsGroupAccomodationComponent } from './services/components/booking.edit.bookings/components/booking.edit.bookings.group.accomodation/booking.edit.bookings.group.accomodation.component';
import { BookingEditBookingsGroupAccomodationLineComponent } from './services/components/booking.edit.bookings/components/booking.edit.bookings.group.accomodation.line/booking.edit.bookings.group.accomodation.line.component';

import { BookingCompositionComponent, BookingCompositionDialogConfirm } from './composition/composition.component';
import { BookingCompositionLinesComponent } from './composition/components/booking.composition.lines/booking.composition.lines.component';

import { BookingQuoteComponent } from './quote/quote.component';
import { BookingContractComponent } from './contract/contract.component';


@NgModule({
  imports: [
    SharedLibModule,
    BookingRoutingModule
  ],
  declarations: [
    BookingComponent, BookingServicesComponent, BookingUpdateDialogConfirm, BookingDeletionDialogConfirm,
    BookingEditBookingsComponent, 
    BookingEditBookingsGroupComponent, 
    BookingEditBookingsGroupAccomodationComponent, BookingEditBookingsGroupAccomodationLineComponent,
    BookingEditBookingsGroupLineComponent, BookingEditBookingsGroupLineDiscountComponent,
    BookingCompositionComponent, BookingCompositionDialogConfirm,
    BookingCompositionLinesComponent,
    BookingQuoteComponent, 
    BookingContractComponent
  ],
  providers: [
    { provide: DateAdapter, useClass: DateAdapter, deps: [MAT_DATE_LOCALE, Platform] }
  ]
})
export class AppInBookingModule { }
