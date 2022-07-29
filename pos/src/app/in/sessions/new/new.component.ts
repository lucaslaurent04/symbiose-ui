import { Component, Inject, OnInit, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, ApiService } from 'sb-shared-lib';
import { UserClass } from 'sb-shared-lib/lib/classes/user.class';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CashdeskSession } from 'src/app/in/sessions/sessions.model';

@Component({
    selector: 'sessions-new',
    templateUrl: './new.component.html',
    styleUrls: ['./new.component.scss']
})
export class SessionsNewComponent implements OnInit {

    constructor( public auth : AuthService,public api : ApiService, private router: Router,private dialog: MatDialog) { }

    public deleteConfirmation = false;
    public displayTablet = false;
    public newSession : any;

    public index: number;
    public total: number = 0;
    public actionType: any = "";
    public coin : any = "";

    public coins : any;

    public cashdesk_id : number;
    public user : UserClass;

    ngOnInit(): void {
        this.auth.getObservable().subscribe( (user: UserClass) => {
            this.user = user;
            console.log('#####', this.user);
        });
    }

    ngOnChanges(changes: SimpleChanges): void {

    }

    passedNumber(value:any){
    }

    public onDisplayCoins() {
        this.displayTablet = true;
        const dialogRef = this.dialog.open(PosClosingCoins, {});
    
        dialogRef.afterClosed().subscribe(
            data => {
                console.log(data)
                this.coins = data.data.filter((element:any) => {
                    element.number != "";
                });
            }
        );
    }

    public async onclickOpenSession() {
        // if a session already exists, resume it
        const result = await this.api.collect(CashdeskSession.entity, [['status', '=', 'pending'], ['cashdesk_id', '=', this.cashdesk_id]], []);

        // show pending orders for the targeted session
        if(result.length > 0) {
            this.router.navigate(['/session/' + result[0].id + '/orders']);
            return;
        }

        // otherwise open a new session
        if(this.user && this.cashdesk_id){
            const dialogRef = this.dialog.open(PosClosingCoins, {
                data: {user : this.user, cashdesk_id : this.cashdesk_id}
            });
            dialogRef.afterClosed().subscribe( async (cash_inventory: any) => {
                if(cash_inventory) {
                    // #todo - add inventory as note
                    try {
                        const session = await this.api.create(CashdeskSession.entity, {amount: cash_inventory.total, cashdesk_id: this.cashdesk_id, user_id: this.user.id, });        
                        this.router.navigate(['/session/' + session.id + '/orders']);
                    }
                    catch(response) {
                        console.log(response);
                    }
                }
            });            
        }
    }


    public onselectCashdesk(cashdesk:any) {
        this.cashdesk_id = cashdesk.id;        
    }

}


@Component({
  selector: 'pos-closing-coins',
  template: `
  <div mat-dialog-content>
    <div>
      <div>
        <h2 style="text-align: center; text-decoration:underline; margin:2rem">Caisse : Pièces/Billets</h2>
      </div>
      <div style="display: flex; justify-content: space-evenly; align-items: center; width: 75rem">
        <div style="display: grid;
                    grid-auto-flow: column;
                    grid-template-columns: repeat(2, 1fr);
                    grid-template-rows: repeat(8, 1fr); height: 100%">
            <div *ngFor="let coin of coins; index as i" style="margin: 0.2rem;">
              <input (input)="onKeyboardNumberPressed($event)" style="font-size: 1.2rem" type="number" [value]="coin.number" (focus)="onGetFocusedInput(i)"> <mat-label style="font-size: 1.2rem; font-weight: bold; padding: 0.2rem">{{coin.value}}€</mat-label>
            </div>
        </div>

        <div style="display: flex; border: 0; background-color: #ededed; padding: 10px;">
          <app-pad-generic [disabled_key]="['+', ',']" (keyPressed)="onCheckNumberPassed($event)"></app-pad-generic>
          <app-pad-value-increments style="margin-bottom: 0.25px;" (OnaddedNumber)="checkActionType($event)" (OnBackspace)="onBackSpace($event)"></app-pad-value-increments>
        </div>
      </div>    
    </div>
  </div>
  <div>
    <p style="background-color: white; border: 2px solid lightgreen; margin: 0.2rem; margin-top: 20px; padding: 0.2rem; width:100%; min-height: 50px" name="" id="" cols="30" rows="10" placeholder="Espèces" >
      <span> <b>  Montant : </b> <br></span>
      <span *ngFor="let coin of coins"> 
        <span  *ngIf="coin.number != ''">{{coin.value}} x {{coin.number}} € <br></span>
      </span>
    </p>
  
    <h3 style="margin-top: 0.5rem; margin-left:6rem; font-weight: bold">TOTAL: {{total.toFixed(2)}} €</h3>
  </div>
  <div mat-dialog-actions style="display: flex; justify-content: flex-end">
    <button mat-raised-button color="primary" style="float:right" mat-raised-button (click)="onclickOk()">Ouvrir</button>
    <button mat-raised-button color="primary" style="float:right" mat-raised-button (click)="onclickCancel()">Annuler</button>
  </div>`
})

export class PosClosingCoins {
    constructor(
        public dialogRef: MatDialogRef<PosClosingCoins>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        public auth : AuthService,
        public api : ApiService, 
        private router: Router,
        private dialog: MatDialog
    ) { }

    public deleteConfirmation = false;
    public displayTablet = false;
    
    public index: number;
    public total: number = 0;
    public actionType: any = "";
    public newSession : any;
    public cashdesk_id : number;
    public user : any;
    public clicked : boolean = false;


    public coins = [
        {
            value: 0.01, number: ""
        },
        {
            value: 0.02, number: ""
        },
        {
            value: 0.05, number: ""
        },
        {
            value: 0.1, number: ""
        },
        {
            value: 0.2, number: ""
        },
        {
            value: 0.5, number: ""
        },
        {
            value: 1, number: ""
        },
        {
            value: 2, number: ""
        },
        {
            value: 5, number: ""
        },
        {
            value: 10, number: ""
        },
        {
            value: 20, number: ""
        },
        {
            value: 50, number: ""
        },
        {
            value: 100, number: ""
        },
        {
            value: 200, number: ""
        },
        {
            value: 500, number: ""
        }
    ];


    ngOnInit(): void {
        this.user = this.data.user;
        this.cashdesk_id = this.data.cashdesk_id;
        console.log(this.data)
    }

    public onKeyboardNumberPressed(event: any){
        // check if backspace, otherwise add number
        if(event.inputType == "deleteContentBackward") {
            let test = this.coins[this.index].number.slice(0, -1);
            this.coins[this.index].number = test;
            this.onGetTotal();
        }
        else {
            this.coins[this.index].number += event.target.value[event.target.value.length - 1];
            this.onGetTotal();
        }
    }

    public onCheckNumberPassed(value: any) {
        if (value != 'backspace' && value != ',' && value != '+/-') {
            this.coins[this.index].number += value;
            this.onGetTotal();
        }

        if (value == 'backspace') {
            let test = this.coins[this.index].number.slice(0, -1);
            this.coins[this.index].number = test;
            this.onGetTotal();
        }
    }

    public onGetTotal() {
        this.total = 0;
        this.coins.forEach((element) => {
            if (element.number != "") {
                this.total += element.value * parseFloat(element.number);
            }
        });
    }

    public onGetFocusedInput(input: any) {
        this.index = input;
    }


    public onBackSpace(element: any) {
        this.onCheckNumberPassed('backspace');
    }

    public checkActionType(event: any) {
        this.actionType = event;
        if (this.coins[this.index].number == "") {
            this.coins[this.index].number = (parseFloat(event)).toString();
        } 
        else {
            this.coins[this.index].number = (parseFloat(this.coins[this.index].number) + parseFloat(event)).toString();
        }
        this.onGetTotal();
    }

    public onclickCancel() {
        this.dialogRef.close(false);
    }

    public async onclickOk(){
        this.dialogRef.close({
            data: this.coins,
            total: this.total
        });
    }

}