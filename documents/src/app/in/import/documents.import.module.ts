import { NgModule } from '@angular/core';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { Platform } from '@angular/cdk/platform';
import { FormsModule } from '@angular/forms';
import { SharedLibModule, AuthInterceptorService, DateAdapter } from 'sb-shared-lib';

import { DocumentsRoutingModule } from './documents-routing.module';

import { DocumentsImportComponent, DialogDocumentRename, DialogDeleteConfirmation } from './documents.import.component';

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
    DialogDocumentRename,
    DialogDeleteConfirmation
  ],
 
  // , PaymentsImportDialogConfirm
  providers: [
    { provide: DateAdapter, useClass: DateAdapter, deps: [MAT_DATE_LOCALE, Platform] }
  ]
})
export class AppInDocumentsModule { }
