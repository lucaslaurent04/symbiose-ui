import { NgModule } from '@angular/core';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { Platform } from '@angular/cdk/platform';


import { SharedLibModule, AuthInterceptorService, CustomDateAdapter } from 'sb-shared-lib';

import { ModelRoutingModule } from './model-routing.module';

import { ModelComponent } from './model.component';
import { ModelEditComponent } from './edit/edit.component';
import { ModelVisualizeComponent } from './visualize/visualize.component';


@NgModule({
  imports: [
    SharedLibModule,
    ModelRoutingModule
  ],
  declarations: [
    ModelComponent, ModelEditComponent, ModelVisualizeComponent
  ],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter, deps: [MAT_DATE_LOCALE, Platform] }
  ]
})
export class AppInModelModule { }
