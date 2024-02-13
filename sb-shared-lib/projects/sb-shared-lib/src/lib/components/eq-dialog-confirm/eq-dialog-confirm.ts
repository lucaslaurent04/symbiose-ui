import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


export interface SbDialogConfirmModel {
    title: string,
    message: string,
    no: string,
    yes: string
}

@Component({
    selector: 'eq-dialog-confirm',
    templateUrl: './eq-dialog-confirm.html',
    styleUrls: ['./eq-dialog-confirm.scss']
})
export class EqDialogConfirm  {

    public data: SbDialogConfirmModel;

    constructor(
        public dialogRef: MatDialogRef<EqDialogConfirm>,
        @Inject(MAT_DIALOG_DATA) input: any
    ) {
        this.data = {...{
            title: '',
            message: '',
            no: 'no',
            yes: 'yes',
        }, ...input};
    }
}