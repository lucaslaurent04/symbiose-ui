import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SessionComponent } from './session.component';

const routes: Routes = [
    {
        path: 'close',
        loadChildren: () => import(`./close/close.module`).then(m => m.AppInSessionCloseModule)
    },
    {
        path: 'moves',
        loadChildren: () => import(`./moves/moves.module`).then(m => m.AppInSessionMovesModule)
    },
    {
        path: 'orders',
        loadChildren: () => import(`./orders/orders.module`).then(m => m.AppInSessionOrdersModule)
    },
    {
        path: 'order/:order_id',
        loadChildren: () => import(`./order/order.module`).then(m => m.AppInSessionOrderModule)
    },
    {
        path: '',
        component: SessionComponent
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SessionRoutingModule {}
