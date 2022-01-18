import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BookingComponent } from './booking.component';
import { BookingEditComponent } from './edit/booking.edit.component';
import { BookingCompositionComponent } from './composition/booking.composition.component';
import { BookingQuoteComponent } from './quote/booking.quote.component';
import { BookingContractComponent } from './contract/booking.contract.component';

const routes: Routes = [
    {
        path: '',
        component: BookingComponent
    },    
    {
        path: 'edit/:id',
        component: BookingEditComponent
    },
    {
        path: 'edit',
        component: BookingEditComponent
    },
    {
        path: 'composition/:id',
        component: BookingCompositionComponent
    },
    {
        path: 'quote/:id',
        component: BookingQuoteComponent
    },
    {
        path: 'contract/:id',
        component: BookingContractComponent
    },
    {
        path: 'funding/remind/:id/:funding_id',
        component: BookingQuoteComponent
    },
    {
        path: 'funding/invoice/:id/:funding_id',
        component: BookingQuoteComponent
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BookingRoutingModule {}
