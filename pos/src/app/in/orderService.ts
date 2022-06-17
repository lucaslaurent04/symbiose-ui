import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, Subject } from 'rxjs';
import { ApiService } from 'sb-shared-lib';

@Injectable({
    providedIn: 'root'
})

export class OrderService {

    // booking object for conditionning API calls  
    public order: number;
    public fundings : number[]= [];

    constructor(
        private api: ApiService,
        private snackBar: MatSnackBar) { }

    public toQueue(idFunding: number, idOrder: any) {
        if(this.order == idOrder && !this.fundings.includes(idFunding)){
            this.fundings.push(idFunding);
        }else{
            this.order = idOrder;
            this.fundings = [];
            this.fundings.push(idFunding);
        }
        return 'ok';
    }

    public async getQueue(){
        return {fundings: this.fundings, order: this.order}
    }

    public async removeQueue(){

    }
}