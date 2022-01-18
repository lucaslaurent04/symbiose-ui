import { NgModule } from '@angular/core';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { Platform } from '@angular/cdk/platform';
import { CustomDateAdapter } from '../../customDateAdapter';


import { SharedLibModule, AuthInterceptorService } from 'sb-shared-lib';

import { BookingRoutingModule } from './booking-routing.module';

import { BookingComponent } from './booking.component';
import { BookingEditComponent } from './edit/booking.edit.component';


import { BookingEditBookingsComponent } from './edit/components/booking.edit.bookings/booking.edit.bookings.component';
import { BookingEditBookingsGroupComponent } from './edit/components/booking.edit.bookings/components/booking.edit.bookings.group/booking.edit.bookings.group.component';
import { BookingEditBookingsGroupLineComponent } from './edit/components/booking.edit.bookings/components/booking.edit.bookings.group.line/booking.edit.bookings.group.line.component';
import { BookingEditBookingsGroupLineDiscountComponent } from './edit/components/booking.edit.bookings/components/booking.edit.bookings.group.line.discount/booking.edit.bookings.group.line.discount.component';
import { BookingEditBookingsGroupAccomodationComponent } from './edit/components/booking.edit.bookings/components/booking.edit.bookings.group.accomodation/booking.edit.bookings.group.accomodation.component';
import { BookingEditBookingsGroupAccomodationLineComponent } from './edit/components/booking.edit.bookings/components/booking.edit.bookings.group.accomodation.line/booking.edit.bookings.group.accomodation.line.component';

import { BookingCompositionComponent, BookingCompositionDialogConfirm } from './composition/booking.composition.component';
import { BookingCompositionLinesComponent } from './composition/components/booking.composition.lines/booking.composition.lines.component';

import { BookingQuoteComponent } from './quote/booking.quote.component';
import { BookingContractComponent } from './contract/booking.contract.component';

@NgModule({
  imports: [
    SharedLibModule,
    BookingRoutingModule
  ],
  declarations: [
    BookingComponent, BookingEditComponent, 
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
    { provide: DateAdapter, useClass: CustomDateAdapter, deps: [MAT_DATE_LOCALE, Platform] }
  ]
})
export class AppInBookingModule { }
