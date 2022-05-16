import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ModelEditComponent } from './edit/edit.component';
import { ModelVisualizeComponent } from './visualize/visualize.component';

const routes: Routes = [
    {
        path: 'edit',
        component: ModelEditComponent
    },
    {
        path: 'visualize',
        component: ModelVisualizeComponent
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ModelRoutingModule {}
