import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, Subject } from 'rxjs';
import { ApiService } from 'sb-shared-lib';

@Injectable({
    providedIn: 'root'
})

export class SettingService {

    // booking object for conditionning API calls  
    public queue: any[] = [];

    constructor(private api: ApiService,
        private _snackBar: MatSnackBar) { }

    public toQueue(idSetting: number, fieldsSetting: any): Observable<string> {
        
        let subject = new Subject<string>();
        //adding the elements to the queue
        this.queue.push({ id: idSetting, fields: fieldsSetting });

        let snackBarRef = this._snackBar.open(' changes confirmed ?', 'Undo', {
            duration: 3000,
            verticalPosition: 'bottom',
            horizontalPosition: 'start',
        });
        console.log(this.queue);
        snackBarRef.onAction().subscribe(() => {
            console.log('action', this.queue);
        // if undo, remove from the queue and send the old value back
            this.queue.shift();
            subject.next(fieldsSetting.oldValue);
        })
       
        snackBarRef.afterDismissed().subscribe(() => {
            console.log('dismissed', this.queue);
        // if didn't do anything, sends the new value back
            this.api.update('core\\SettingValue', [this.queue[0].id], { value: this.queue[0].fields.newValue }, true);
            subject.next(fieldsSetting.newValue);
   
            this.queue.shift();
        });

        return subject.asObservable();
    }
}