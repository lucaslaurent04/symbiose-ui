import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BookingFundingComponent } from './funding.component';


const routes: Routes = [
    {
        path: '',
        component: BookingFundingComponent
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BookingFundingRoutingModule {}
