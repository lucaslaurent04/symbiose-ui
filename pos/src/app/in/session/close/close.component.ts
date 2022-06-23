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
  public ready: boolean = false;
  public resultPayments: any;
  public resultLines: any;
  public session_id : number;
  constructor(private dialog: MatDialog, private route: ActivatedRoute, private api: ApiService) { }

  public ngOnInit() {
    // fetch the ID from the route
    this.route.params.subscribe(async (params) => {
      if (params && params.hasOwnProperty('session_id')) {
        try {
          this.session_id = <number>params['session_id'];
          await this.loadSession(this.session_id);
          await this.load(this.session_id);
          this.ready = true;

        }
        catch (error) {
          console.warn(error);
        }
      }
    });
  }

  private async loadSession(session_id: number) {

    // if (session_id > 0) {
    //   try {
    //     const result: any = await this.api.read(CashdeskSession.entity, [session_id], Object.getOwnPropertyNames(new CashdeskSession()));
    //     if (result && result.length) {
    //       this.session = <CashdeskSession>result[0];
    //     }
    //   }
    //   catch (response) {
    //     throw 'unable to retrieve given session';
    //   }
    // }
  }


  /**
   * Load an Order object using the sale_pos_order_tree controller
   * @param session_id
   */
  async load(session_id: number) {
    if (session_id > 0) {
      try {
        this.session = await this.api.fetch('/?get=sale_pos_session_tree', { id: session_id, variant: 'session' });
        // let session = await this.api.fetch('/?get=sale_pos_session_tree', { id: session_id, variant: 'lines' });

      }
      catch (response) {
        throw 'unable to retrieve given order';
      }
    }
  }
  public closeSession() {
    const dialogRef = this.dialog.open(PosClosing, {
      data: this.session,
      panelClass: ['difference']
    });
    this.load(this.session_id);
  }
}

@Component({
  selector: 'pos-closing',
  template: `
  <h2 mat-dialog-title style="text-align:center">Contrôle de fermeture</h2>
  <div mat-dialog-content style="background-color:#F5F5F5; padding: 3rem">
    <div style="display: flex; justify-content: space-between; align-items:center; border-bottom: 1px solid lightgray">
      <div style="display: flex; flex-direction:column">
       <p>Total de {{data.orders_ids.length - 1}} commandes <span>d'une valeur de {{ordersTotal}} € </span></p> 
       <p>Paiements <span> {{totalPaid}} € </span></p> 
      </div>
      <!-- <div style="border-left: light-grey 1px solid;">
        Money details:
        x x x €
      </div> -->
    </div>
    <div>
      <div style="display:grid; grid-template-columns: repeat(4,1fr);">
        <div style="text-align:center;">
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
        
        <div style="text-align:center;">
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
        <div style="text-align:center;">
            <h4>Compté</h4>
            <div style="display: flex; border-bottom: 1px solid black; justify-content:center;">
              <p style="padding-right: 0.4rem;">{{total?.toFixed(2)}}</p>
              <button  (click)="onDisplayCoins()" ><mat-icon>tablet_android</mat-icon></button>
            </div>
        </div>
        <div style="text-align:center;">
            <h4>Différence</h4>
            <div [class.difference]="difference < 0">{{difference}} €</div>
        </div>
      </div> 
      <div style="display: flex; justify-content:center;">
          <p contenteditable="true" style="background-color: white; border: 1px solid black; margin: 0.2rem; margin-top: 20px; padding: 0.2rem; width:100%; min-height: 50px" name="" id="" cols="30" rows="10" placeholder="Espèces" >
              <span>Note :</span>
              <span *ngFor="let coin of coins"> 
                <span  *ngIf="coin.number != ''">{{coin.value}} x {{coin.number}} € <br></span>
              </span>
          </p>
      </div>
      <div style="display: flex; margin-top: 0.4rem">
         <mat-checkbox [(ngModel)]="checked" class="example-margin" ></mat-checkbox>
         <div style="display:flex; flex-direction:column;">
         <mat-error *ngIf="matCheckboxError && !checked">
            Cocher pour fermer la session
         </mat-error>
         <span style="margin-left: 0.4rem;">Accepter la différence de paiement et l'enregistrer au journal des pertes et des profits</span>
         </div>

        
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
    @Inject(MAT_DIALOG_DATA)
    public data: any,
    private dialog: MatDialog,
    private api: ApiService,
    private router: Router
  ) { }
  public deleteConfirmation = false;
  public displayTablet = false;
  public ordersTotal: number = 0;
  public totalPaid: number = 0;
  public totalCash: number = 0;
  public totalBooking: number = 0;
  public totalBank: number = 0;
  public totalVoucher: number = 0;
  public total: number = 0;
  public difference: number = 0;
  public coins: any;
  public checked = false;
  public matCheckboxError: boolean = false;
  public textareaValue: any;
  ngOnInit(): void {
    console.log(this.data);
    this.data.orders_ids.forEach((order: any) => {

      this.ordersTotal += order.total

      order.order_payments_ids.forEach((orderPayment: any) => {
        this.totalPaid += orderPayment.total_paid
        orderPayment.order_payment_parts_ids.forEach((orderPaymentPart: any) => {
          console.log(orderPaymentPart.payment_method, "méthoooode")
          switch (orderPaymentPart.payment_method) {
            case 'cash':
              this.totalCash += orderPaymentPart.amount;
              break;
            case 'bank_card':
              this.totalBank += orderPaymentPart.amount;
              break;
            case 'booking':
              this.totalBooking += orderPaymentPart.amount;
              break;
            default:
              this.totalVoucher += orderPaymentPart.amount;
          }
        })
      })
    })
    this.calculateDifference();
  }

  onDisplayCoins() {
    const dialogRef = this.dialog.open(PosClosingCoins, {
    });
    dialogRef.afterClosed().subscribe(
      value => {
        this.total = value.total;
        this.coins = value.cash;
        console.log(this.coins);
        this.calculateDifference();
      }
    );
  }
  onDisplayTablet() {
  }

  public calculateDifference() {
    this.difference = this.total - (this.totalPaid + this.data.amount);
  }

  public closeDialog() {
    this.dialogDelete.close({
    })
  }
  public closeSession() {

    if (this.difference < 0) {
      this.matCheckboxError = true;
    }
    if (this.checked) {
      this.api.create('sale\\pos\\Operation', { cashdesk_id: this.data.cashdesk_id, user_id: this.data.user_id, type: 'move', amount: this.difference })
      this.api.update(CashdeskSession.entity, [this.data.id], {
        status: 'closed',
        description: this.textareaValue
      });
      this.dialogDelete.close({
      });
      this.router.navigate(['sessions/new'])
    }
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
  public newSession: any;
  public center_id: number;
  public user: any;
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
}
