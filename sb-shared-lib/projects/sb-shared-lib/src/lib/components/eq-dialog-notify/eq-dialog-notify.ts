import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


export interface SbDialogNotifyModel {
    title: string,
    message: string,
    ok: string
}

@Component({
    selector: 'eq-dialog-notify',
    templateUrl: './eq-dialog-notify.html',
    styleUrls: ['./eq-dialog-notify.scss']
})
export class EqDialogNotify {

    public data: SbDialogNotifyModel;

    constructor(
        public dialogRef: MatDialogRef<EqDialogNotify>,
        @Inject(MAT_DIALOG_DATA) input: any
    ) {
        this.data = {...{
            title: '',
            message: '',
            ok: 'ok',
        }, ...input};
    }
}