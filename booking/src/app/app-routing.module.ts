import { NgModule } from '@angular/core';

import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

import { AppComponent } from './in/app.component';

const routes: Routes = [
  /* routes specific to current app */
  {
    path: 'bookings',
    loadChildren: () => import(`./in/bookings/bookings.module`).then(m => m.AppInBookingsModule) 
  },
  {
    path: 'booking/:booking_id',
    loadChildren: () => import(`./in/booking/booking.module`).then(m => m.AppInBookingModule) 
  },
  {
    path: 'planning',
    loadChildren: () => import(`./in/planning/planning.module`).then(m => m.AppInPlanningModule) 
  },
  {
    /*
     default route, for bootstrapping the App
      1) load necessary info
      2) ask for permissions (and store choices)
      3) redirect to applicable page (/auth/sign or /in)
     */
    path: '',
    component: AppComponent
  }  
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules, onSameUrlNavigation: 'reload', useHash: true })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
