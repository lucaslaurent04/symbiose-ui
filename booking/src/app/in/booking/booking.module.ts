import { NgModule } from '@angular/core';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { Platform } from '@angular/cdk/platform';

import { SharedLibModule, CustomDateAdapter } from 'sb-shared-lib';

import { BookingRoutingModule } from './booking-routing.module';

import { BookingComponent } from './booking.component';
import { BookingServicesComponent, BookingUpdateDialogConfirm, BookingDeletionDialogConfirm } from './services/services.component';

import { BookingServicesBookingComponent } from './services/_components/booking/booking.component';
import { BookingServicesBookingGroupComponent } from './services/_components/booking/_components/group/group.component';
import { BookingServicesBookingGroupLineComponent } from './services/_components/booking/_components/group/_components/line/line.component';
import { BookingServicesBookingGroupAccomodationComponent } from './services/_components/booking/_components/group/_components/accomodation/accomodation.component';
import { BookingServicesBookingGroupAccomodationAssignmentComponent } from './services/_components/booking/_components/group/_components/accomodation/_components/assignment.component';
import { BookingServicesBookingGroupLineDiscountComponent } from './services/_components/booking/_components/group/_components/line/_components/discount/discount.component';

import { BookingCompositionComponent, BookingCompositionDialogConfirm } from './composition/composition.component';
import { BookingCompositionLinesComponent } from './composition/components/booking.composition.lines/booking.composition.lines.component';

import { BookingQuoteComponent } from './quote/quote.component';
import { BookingContractComponent } from './contract/contract.component';
import { BookingInvoiceComponent } from './invoice/invoice.component';


@NgModule({
  imports: [
    SharedLibModule,
    BookingRoutingModule
  ],
  declarations: [
    BookingComponent, BookingServicesComponent, BookingUpdateDialogConfirm, BookingDeletionDialogConfirm,
    BookingServicesBookingComponent, BookingServicesBookingGroupComponent, 
    BookingServicesBookingGroupLineComponent, BookingServicesBookingGroupAccomodationComponent, BookingServicesBookingGroupAccomodationAssignmentComponent,
    BookingServicesBookingGroupLineDiscountComponent,
    BookingCompositionComponent, BookingCompositionDialogConfirm,
    BookingCompositionLinesComponent,
    BookingQuoteComponent, 
    BookingContractComponent,
    BookingInvoiceComponent
  ],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter, deps: [MAT_DATE_LOCALE, Platform] }
  ]
})
export class AppInBookingModule { }
