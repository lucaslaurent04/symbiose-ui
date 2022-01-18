import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


import { DocumentsImportComponent } from './documents.import.component';


const routes: Routes = [

    {
        path: 'import',
        component: DocumentsImportComponent
    },
    {
        path: 'email'
    }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DocumentsRoutingModule {}
