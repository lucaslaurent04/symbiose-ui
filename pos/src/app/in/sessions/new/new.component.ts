import { Component, Inject, OnInit, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'sb-shared-lib';
import { ApiService } from 'sb-shared-lib';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CashdeskSession } from '../sessions.model';

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
  public center_id : number;
  public index: number;
  public total: number = 0;
  public actionType: any = "";
  public coin : any = "";
  public user : any;
  public coins : any;
  ngOnInit(): void {
    //ne s'active pas tjs lorsque l'on refresh la page
    this.user = this.auth.getUser();
    console.log(this.user)
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.user = this.auth.getUser();
    console.log(this.user)
    
  }

  passedNumber(value:any){
  }

  onDisplayCoins() {
    this.displayTablet = true;
    const dialogRef = this.dialog.open(PosClosingCoins, {
    });
    dialogRef.afterClosed().subscribe(
      data =>{
        console.log(data)
        this.coins = data.data.filter((element:any)=>{
          element.number != "";
        });
      }
    )
  }

  public async openSession(){
    if(this.user && this.center_id){
      const dialogRef = this.dialog.open(PosClosingCoins, {
        data: {user : this.user, center_id : this.center_id}
      });
    }
  }


  public onselectCenter(center:any) {
    this.center_id = center.id
}




}


@Component({
  selector: 'pos-closing-coins',
  template: `
  <div mat-dialog-content>
    <div>
      <div>
        <h2 style="text-align: center; text-decoration:underline; margin:2rem">Caisse : Pièces/Billets</h2>
        <mat-error style="text-align: center; margin-bottom: 5px" *ngIf="cashdesk?.length < 1 && clicked == true">Ce centre n'a pas de Caisse</mat-error>
      </div>
      <div style="display: flex; justify-content: space-evenly; align-items: center; width: 75rem">
        <div style="display: grid;
                    grid-auto-flow: column;
                    grid-template-columns: repeat(2, 1fr);
                    grid-template-rows: repeat(8, 1fr); height: 100%">
            <div *ngFor="let coin of coins; index as i" style="margin: 0.2rem;">
              <input style="font-size: 1.2rem" type="number" [value]="coin.number" (focus)="onGetFocusedInput(i)"> <mat-label style="font-size: 1.2rem; font-weight: bold; padding: 0.2rem">{{coin.value}}€</mat-label>
            </div>
        </div>

        <div style="display: flex; border: 1px solid lightgreen">
          <app-pad (newNumberPassed)="onCheckNumberPassed($event)"></app-pad>
          <app-pad-arbitrary-numbers style="margin-bottom: 0.25px;" (OnaddedNumber)="checkActionType($event)" (OnBackspace)="onBackSpace($event)"></app-pad-arbitrary-numbers>
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
    <button mat-raised-button color="primary" style="float:right" mat-raised-button (click)="openSession()" >Ouvrir</button>
    <button mat-raised-button color="primary" style="float:right" mat-raised-button (click)="closeDialog()" >Fermer</button>
  </div>`
})

export class PosClosingCoins {
  constructor(
    public dialogDelete: MatDialogRef<PosClosingCoins>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public auth : AuthService,
    public api : ApiService, 
    private router: Router,
    private dialog: MatDialog
  ) { }
  public deleteConfirmation = false;
  public displayTablet = false;
  public cashdesk : any[] = [];
  public index: number;
  public total: number = 0;
  public actionType: any = "";
  public newSession : any;
  public center_id : number;
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
  ]


  ngOnInit(): void {
    this.user = this.data.user;
    this.center_id = this.data.center_id;
    console.log(this.data)
  }

  onCheckNumberPassed(value: any) {
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

  onGetTotal() {
    this.total = 0;
    this.coins.forEach((element) => {
      if (element.number != "") {
        this.total += element.value * parseFloat(element.number);
      }
    })
  }

  onGetFocusedInput(input: any) {
    this.index = input;
  }

  public closeDialog() {
    this.dialogDelete.close({
      data: this.coins,
      total: this.total
    })
  }

  onBackSpace(element: any) {
    this.onCheckNumberPassed('backspace');
  }

  checkActionType(event: any) {
    this.actionType = event;
    if (this.coins[this.index].number == "") {
      this.coins[this.index].number = (parseFloat(event)).toString();

    } else {
      this.coins[this.index].number = (parseFloat(this.coins[this.index].number) + parseFloat(event)).toString();
    }
    this.onGetTotal();
  }

  async openSession(){
    let pendingSession = await this.api.collect(CashdeskSession.entity, [['status', '=', 'pending'], ['center_id', '=', this.center_id]], []);
    if(pendingSession.length > 0){
      let route = '/session/'+pendingSession[0].id + '/orders';
      this.router.navigate([route]);
      this.dialogDelete.close({
      })
    }else{
      // Un cashdesk est nécessaire par centre !
      this.cashdesk = await this.api.collect('lodging\\sale\\pos\\Cashdesk', ['center_id', '=', this.center_id], []);
      this.clicked = true;
      console.log(this.cashdesk.length, this.clicked)
      if(this.cashdesk.length >= 1){
        this.newSession = await this.api.create(CashdeskSession.entity, {amount: this.total, cashdesk_id: this.cashdesk[0].id, user_id: this.user.id, center_id: this.center_id});
        let route = '/session/'+this.newSession.id + '/orders';
        this.router.navigate([route]);
        this.dialogDelete.close({
        })
      }
    }
  }
}
