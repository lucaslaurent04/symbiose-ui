import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SessionOrderComponent } from './order.component';


import { SessionOrderLinesComponent } from './lines/lines.component';
import { SessionOrderPaymentsComponent } from './payments/payments.component';

const routes: Routes = [
    {
        path: 'lines',
        component: SessionOrderLinesComponent
    },
    {
        path: 'payments',
        component: SessionOrderPaymentsComponent
    },
    { 
        path: '',   redirectTo: 'lines', pathMatch: 'full'    
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SessionOrderRoutingModule {}
