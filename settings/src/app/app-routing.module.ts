import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AppComponent } from './in/app.component';

import { AccountingChartLinesComponent } from './in/AccountingChartLines/AccountingChartLines.component';
import { AccountingChartLines2Component } from './in/AccountingChartLines/AccountingChartLines2/AccountingChartLines2.component';
import { SettingsComponent } from './in/settings/settings.component';


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
    path: 'AccountingChartLines',
    component: AccountingChartLinesComponent
  },
  {
    path: 'AccountingChartLines2',
    component: AccountingChartLines2Component
  },
  {
    path: 'settings/:package',
    component: SettingsComponent
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })    
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
