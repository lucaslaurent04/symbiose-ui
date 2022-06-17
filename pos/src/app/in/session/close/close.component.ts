import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { CashdeskSession } from '../session.model';
import { ApiService, ContextService } from 'sb-shared-lib';
import { OrderPaymentPart } from '../order/payments/payments.model';
@Component({
  selector: 'app-close',
  templateUrl: './close.component.html',
  styleUrls: ['./close.component.scss']
})
export class CloseComponent implements OnInit {

  public session: CashdeskSession = new CashdeskSession();
  public ready : boolean = false;
  public resultPayments : any;
  public resultLines : any;
  constructor(private dialog: MatDialog, private route: ActivatedRoute, private api: ApiService) { }

  public ngOnInit() {
    // fetch the ID from the route

    this.route.params.subscribe(async (params) => {
        if (params && params.hasOwnProperty('session_id') && params.hasOwnProperty('order_id')) {
            try {
                await this.loadSession(<number>params['session_id']);
                await this.load(<number>params['session_id']);
                this.ready = true;
            }
            catch (error) {
                console.warn(error);
            }
        }
    });
}

private async loadSession(session_id: number) {

    if (session_id > 0) {
        try {
            const result: any = await this.api.read(CashdeskSession.entity, [session_id], Object.getOwnPropertyNames(new CashdeskSession()));
            if (result && result.length) {
                this.session = <CashdeskSession>result[0];
            }
        }
        catch (response) {
            throw 'unable to retrieve given session';
        }
    }
}


/**
 * Load an Order object using the sale_pos_order_tree controller
 * @param session_id
 */
async load(session_id: number) {
    if (session_id > 0) {
        try {
            this.session = await this.api.fetch('/?get=sale_pos_session_tree', { id: session_id, variant: 'payments' });
            let session = await this.api.fetch('/?get=sale_pos_session_tree', { id: session_id, variant: 'lines' });
        }
        catch (response) {
            console.log(response);
            throw 'unable to retrieve given order';
        }
    }
}
  public closeSession(){
    const dialogRef = this.dialog.open(PosClosing, {
      data: this.session,
      panelClass : ['difference']
    });
  }
  

}

@Component({
  selector: 'pos-closing',
  template: `
  <h2 mat-dialog-title style="text-align:center">Contrôle de fermeture</h2>
  <div mat-dialog-content style="background-color:#F5F5F5; padding: 3rem">
    <div style="display: flex; justify-content: space-between; align-items:center; border-bottom: 1px solid lightgray">
      <div style="display: flex; flex-direction:column">
       <p>Total de {{data.orders_ids.length - 1}} commandes <span> {{ordersTotal}} € </span></p> 
       <p>Paiements <span> {{totalPaid}} € </span></p> 
      </div>
      <div style="border-left: light-grey 1px solid;">
        Money details:
        x x x €
      </div>
    </div>
    <div>
      <div style="display:grid; grid-template-columns: repeat(4,1fr);">
        <div>
            <h4>Moyen de Paiement</h4>
            <div>
              Espèces
            </div>
            <div>
              Ouverture
            </div>
            <div>
              Paiement en espèces
            </div>
            <div>
              Banque
            </div>
            <div>
              Voucher
            </div>
            <div>
              Réservation
            </div>
        </div>
        
        <div>
            <h4>Attendu</h4>
            <div>
                {{totalCash + data.amount}}
            </div>
            <div>
                {{data.amount}}
            </div>
            <div>
                {{totalCash}}
            </div>
            <div>
                {{totalBank}}
            </div>
            <div>
                {{totalVoucher}}
            </div>
            <div>
                {{totalBooking}}
            </div>
        </div>
        <div>
            <h4>Compté</h4>
            <div style="display: flex; border-bottom: 1px solid black;">
              <p style="padding-right: 0.4rem;">{{total?.toFixed(2)}}</p>
              <button  (click)="onDisplayCoins()" ><mat-icon>tablet_android</mat-icon></button>
            </div>
        </div>
        <div>
            <h4>Différence</h4>
            <p [class.difference]="difference < 0">{{difference}} €</p>
        </div>
      </div> 
      <div style="display: flex; justify-content:center">
        <div *ngIf= displayTablet style="display: flex; justify-content:center">
          <!-- <app-pad ></app-pad>
          <app-pad-arbitrary-numbers></app-pad-arbitrary-numbers> -->
        </div>
        <textarea style="width: 100%;" name="" id="" cols="30" rows="10" placeholder="Notes">
          
        </textarea>
      </div>
      <div style="display: flex; margin-top: 0.4rem ">
         <mat-checkbox [(ngModel)]="checked" class="example-margin" ></mat-checkbox>
         <span style="margin-left: 0.4rem;">Accepter la différence de paiement et l'enregistrer au journal des pertes et des profits</span>
      </div>
    </div>
    <div mat-dialog-actions style="display: flex; justify-content: flex-end;">
    <button mat-raised-button color="primary" (click)="closeSession()" >Fermer la Session</button>
    <button mat-raised-button color="primary" (click)="closeDialog()" >Fermer</button>
    </div>
  </div>
  `
})

export class PosClosing {
  constructor(
    public dialogDelete: MatDialogRef<PosClosing>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog,
    private api:  ApiService
  ) { }
  public deleteConfirmation = false;
  public displayTablet = false;
  public ordersTotal : number = 0;
  public totalPaid : number = 0;
  public totalCash : number = 0;
  public totalBooking : number = 0;
  public totalBank : number = 0;
  public totalVoucher : number = 0;
  public total : number = 0;
  public difference : number = 0;
  public checked = false;
  ngOnInit(): void {
    this.data.orders_ids.forEach((order:any)=>{
      console.log(order)
      this.ordersTotal += order.total
      
      order.order_payments_ids.forEach((orderPayment:any)=> {
        this.totalPaid += orderPayment.total_paid
          orderPayment.order_payment_parts_ids.forEach((orderPaymentPart : any)=> {
            switch (orderPaymentPart.payment_method) {
              case 'cash':
                this.totalCash += orderPaymentPart.amount;
                break;
              case 'bank':
                this.totalBank += orderPaymentPart.amount;
                break;
              case 'booking':
                this.totalBooking += orderPaymentPart.amount;
                // expected output: "Mangoes and papayas are $2.79 a pound."
                break;
              default:
                this.totalVoucher += orderPaymentPart.amount;
            }
          })
      })
    })
    this.difference =  this.total - (this.totalPaid + this.data.amount) 
  }

  onDisplayCoins() {
    const dialogRef = this.dialog.open(PosClosingCoins, {
    });
    dialogRef.afterClosed().subscribe(
      value =>{
        this.total = value.total;
      }
    )
    
  }
  onDisplayTablet() {
  }

  public closeDialog() {
    this.dialogDelete.close({
    })
  }
  public closeSession(){
    this.api.update(CashdeskSession.entity, [this.data.id], {
      status : 'closed'
    })
    if(this.total > this.totalPaid + this.data.amount){
      this.api.create('sale\\pos\\OrderPaymentPart', {
        payment_method : 'cash',
        amount : this.difference
      })
    }
    // Où indiquer les pertes d'argent
    this.dialogDelete.close({
    })
  }
}




// Checking des pièces/billets

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
              <input style="font-size: 1.2rem" type="number" [value]="coin.number" (focus)="onGetFocusedInput(i)"> <mat-label style="font-size: 1.2rem; font-weight: bold; padding: 0.2rem">{{coin.value}}€</mat-label>
            </div>
        </div>
        <!-- <div style="display: flex; border-bottom: 1px solid black;" *ngIf = "!displayTablet">
            <p style="padding-right: 0.4rem;">{{data.name}}</p>
            <button  (click)="displayTablet = !displayTablet" ><mat-icon>tablet_android</mat-icon></button>
        </div> -->
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
    <!-- <button mat-raised-button color="primary" style="float:right" mat-raised-button (click)="openSession()" >Ouvrir</button> -->
    <button mat-raised-button color="primary" style="float:right" mat-raised-button (click)="closeDialog()" >Fermer</button>
  </div>`
})

export class PosClosingCoins {
  constructor(
    public dialogDelete: MatDialogRef<PosClosingCoins>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    // public auth : AuthService,
    // public api : ApiService, 
    // private router: Router,
    private dialog: MatDialog
  ) { }
  public deleteConfirmation = false;
  public displayTablet = false;
  public index: number;
  public total: number = 0;
  public actionType: any = "";
  public newSession : any;
  public center_id : number;
  public user : any;
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
      cash: this.coins,
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
    // let pendingSession = await this.api.collect(CashdeskSession.entity, [['status', '=', 'pending'], ['center_id', '=', this.center_id]], []);
    // if(pendingSession.length > 0){
    //   let route = '/session/'+pendingSession[0].id + '/orders';
    //   this.router.navigate([route]);
    //   this.dialogDelete.close({
    //   })
    // }else{
    //   // Un cashdesk est nécessaire par centre !
    //   let cashdesk = await this.api.collect('lodging\\sale\\pos\\Cashdesk', ['center_id', '=', this.center_id], []);
    //   console.log(cashdesk)
    //   this.newSession = await this.api.create(CashdeskSession.entity, {amount: this.total, cashdesk_id: cashdesk[0].id, user_id: this.user.id, center_id: this.center_id});
    //   let route = '/session/'+this.newSession.id + '/orders';
    //   this.router.navigate([route]);
    //   this.dialogDelete.close({
    //   })
    // }
  }
}
