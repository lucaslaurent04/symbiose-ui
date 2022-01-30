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

    public fillQueue (idSetting: number, fieldsSetting: any) :Observable<string> {
        console.log(fieldsSetting);
        let subject = new Subject <string>();
        this.queue.push({ id: idSetting, fields: fieldsSetting });

            let snackBarRef = this._snackBar.open(' changes confirmed ?', 'Undo', {
            duration: 3000,
            verticalPosition: 'bottom', // 'top' | 'bottom'
            horizontalPosition: 'start',
        });
        
         snackBarRef.onAction().subscribe(() => {
            this.queue.pop();
            console.log(fieldsSetting.oldValue); 
            console.log(fieldsSetting.oldValue);
            subject.next(fieldsSetting.oldValue);
        })  
        
        snackBarRef.afterDismissed().subscribe(() => {
           
            this.queue.forEach(element => {
                console.log(element.fields.newValue);
                this.api.update('core\\SettingValue', [element.id], { value: element.fields.newValue }, true);
                subject.next(fieldsSetting.newValue);

            }); 
            this.queue = [];
        });
               
        return subject.asObservable();
    }


    /**
     *  Sends a direct GET request to the backend without using API URL
     */


    /**
     *  Sends a direct POST request to the backend without using API URL
     */


    /**
     * 
     * @param entity 
     * @param fields 
     * @returns Promise
     */

    /**
     * 
     * @param entity 
     * @param ids 
     * @param fields 
     * @returns Promise
     */

    /**
     * 
     * @param entity 
     * @param ids 
     * @param permanent 
     * @returns Promise
     */

    /**
     * 
     * @param entity 
     * @param domain 
     * @param fields 
     * @param order 
     * @param sort 
     * @param start 
     * @param limit 
     * @returns Promise
     */

    /*
      All methods using API return a Promise object.
      They can ben invoked either by chaing .then() and .catch() methods, or with await prefix (assuming parent function is declared as async).
    */

    /**
     * Send a GET request to the API.
     *
     * @param route
     * @param body
     * @returns Promise
     */


}