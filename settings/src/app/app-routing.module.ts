import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AppComponent } from './in/app.component';

import { BookingComponent } from './in/booking/booking.component';


const routes: Routes = [
  /* routes specific to current app */
  {
    /*
     default route, for bootstrapping the App
      1) display a loader and try to authentify
      2) store user details (roles and permissions)
      3) redirect to applicable page (/apps or /auth)
     */
    path: '',
    component: AppComponent
  },
  {
    path: 'booking',
    component: BookingComponent
  }  
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })    
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
