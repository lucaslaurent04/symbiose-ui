import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { OrdersComponent } from './orders.component';
import { OrdersOrderComponent } from './order/orders.order.component';

const routes: Routes = [
    {
        path: '',
        component: OrdersComponent
    },    
    {
        path: 'order/:id/:status',
        component: OrdersOrderComponent
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrdersRoutingModule {}
