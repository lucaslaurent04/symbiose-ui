import { NgModule } from '@angular/core';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { Platform } from '@angular/cdk/platform';
import { CustomDateAdapter } from '../../customDateAdapter';
import { FormsModule } from '@angular/forms';
import { SharedLibModule, AuthInterceptorService,  } from 'sb-shared-lib';

import { DocumentsRoutingModule } from './documents-routing.module';

import { DocumentsImportComponent, DialogDocumentRename } from './documents.import.component';

import { NgxDropzoneModule } from 'ngx-dropzone';

import { NgxDocViewerModule } from 'ngx-doc-viewer';

@NgModule({
  imports: [
    SharedLibModule,
    DocumentsRoutingModule,
    NgxDropzoneModule,
    FormsModule,
    NgxDocViewerModule
  ],
  declarations: [
    DocumentsImportComponent,
    DialogDocumentRename
  ],
  // , PaymentsImportDialogConfirm
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter, deps: [MAT_DATE_LOCALE, Platform] }
  ]
})
export class AppInDocumentsModule { }
