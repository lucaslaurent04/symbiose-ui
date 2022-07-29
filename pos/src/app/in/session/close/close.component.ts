import { Component, OnInit, AfterViewInit, NgZone } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService, ContextService } from 'sb-shared-lib';

import { CashdeskSession } from 'src/app/in/session/session.model';
import { SessionCloseVerificationDialog } from './_components/verification.dialog/verification.component';

@Component({
  selector: 'session-close',
  templateUrl: 'close.component.html',
  styleUrls: ['close.component.scss']
})
export class SessionCloseComponent implements OnInit, AfterViewInit {

    public ready: boolean = false;

    public session: CashdeskSession = new CashdeskSession();



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


    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private dialog: MatDialog,
        private zone: NgZone,
        private api: ApiService,
        private context: ContextService
    ) {}


    public ngAfterViewInit() {

    }

    public ngOnInit() {
        console.log('#####################');
        // fetch the ID from the route
        this.route.params.subscribe( async (params) => {
            if(params && params.hasOwnProperty('session_id')) {
                try {
                    await this.load(<number> params['session_id']);
                    this.ready = true;
                }
                catch(error) {
                    console.warn(error);
                }
            }
        });
    }


    private async load(id: number) {
        if(id > 0) {
            console.log('######', id);
            try {
                const data = await this.api.fetch('/?get=sale_pos_session_tree', { id: id });
                
                if(data) {
                    this.session = <CashdeskSession> data;
                    console.log('{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{')
console.log(this.session);
                    this.session.orders_ids.forEach((order: any) => {

                        this.ordersTotal += order.total

                        order.order_payments_ids.forEach((orderPayment: any) => {
                            // this.totalPaid += orderPayment.total_paid
                            orderPayment.order_payment_parts_ids.forEach((orderPaymentPart: any) => {
                                switch (orderPaymentPart.payment_method) {
                                    case 'cash':
                                        this.totalCash += orderPaymentPart.amount;
                                        break;
                                    // case 'bank_card':
                                    //   this.totalBank += orderPaymentPart.amount;
                                    //   break;
                                    // case 'booking':
                                    //   this.totalBooking += orderPaymentPart.amount;
                                    //   break;
                                    // default:
                                    //   this.totalVoucher += orderPaymentPart.amount;
                                }
                            })
                        })
                    })
                    this.calculateDifference();
                }
            }
            catch(response) {
                console.log(response);
                throw 'unable to retrieve given session';
            }
        }
    }


    public onDisplayCoins() {
        const dialogRef = this.dialog.open(SessionCloseVerificationDialog, {});

        dialogRef.afterClosed().subscribe(
            value => {
                this.total = value.total;
                this.coins = value.cash;
                this.calculateDifference();
            }
        );
    }


    public onDisplayTablet() {
    }

    public calculateDifference() {
        this.difference = this.total - (this.totalCash + this.session.amount);
    }

    public closeDialog() {

    }

    public closeSession() {
        if (this.difference < 0) {
            this.matCheckboxError = true;
        }
        if (this.checked) {
            this.api.create('sale\\pos\\Operation', { cashdesk_id: this.session.cashdesk_id, user_id: this.session.user_id, type: 'move', amount: this.difference })
            this.api.update(CashdeskSession.entity, [this.session.id], {
                status: 'closed',
                description: this.textareaValue
            });
            this.router.navigate(['sessions/new'])
        }
    }

}