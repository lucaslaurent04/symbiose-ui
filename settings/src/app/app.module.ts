import { NgModule, LOCALE_ID } from '@angular/core';

import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatNativeDateModule, DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { Platform, PlatformModule } from '@angular/cdk/platform';
import { CustomDateAdapter } from './customDateAdapter';

import { SharedLibModule, AuthInterceptorService } from 'sb-shared-lib';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';

import { AppRoutingModule } from './app-routing.module';
import { AppRootComponent } from './app.root.component';

import { MatTableModule} from '@angular/material/table'
/* HTTP requests interception dependencies */
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';

import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { AccountingChartLinesComponent } from './in/AccountingChartLines/AccountingChartLines.component';
import { AccountingChartLines2Component } from './in/AccountingChartLines/AccountingChartLines2/AccountingChartLines2.component';

import { SettingsComponent } from './in/settings/settings.component';
import { WidgetToggleComponent } from './in/settings/sections/widget-toggle/widget-toggle.component';
import { SnackUndoComponent } from './in/settings/sections/snack-undo/snack-undo.component';
import { ContainerComponent } from './in/settings/sections/container/container.component';
import {WidgetSelectComponent} from './in/settings/sections/widget-select/widget-select.component';
import { SaleSettingsComponent } from './in/settings/sale-settings/sale-settings.component'



registerLocaleData(localeFr);

@NgModule({
  declarations: [
    AppRootComponent,
    AccountingChartLinesComponent,
    AccountingChartLines2Component,
    SettingsComponent,
    WidgetToggleComponent,
    SnackUndoComponent,
    ContainerComponent,
    WidgetSelectComponent,
    SaleSettingsComponent,

  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    SharedLibModule,
    MatNativeDateModule,
    PlatformModule,
    NgxMaterialTimepickerModule.setLocale('fr-BE'),
    MatTableModule
  ],
  providers: [
    // add HTTP interceptor to inject AUTH header to any outgoing request
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptorService, multi: true },
    { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: { duration: 4000 } },    
    { provide: MAT_DATE_LOCALE, useValue: 'fr-BE' },
    { provide: LOCALE_ID, useValue: 'fr-BE' },
    { provide: DateAdapter, useClass: CustomDateAdapter, deps: [MAT_DATE_LOCALE, Platform] }
  ],
  bootstrap: [AppRootComponent]
})
export class AppModule { }
