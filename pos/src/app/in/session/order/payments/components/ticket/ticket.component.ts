import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'sb-shared-lib';

@Component({
  selector: 'app-ticket',
  templateUrl: './ticket.component.html',
  styleUrls: ['./ticket.component.scss']
})
export class TicketComponent implements OnInit {
  public order : any;
  public order_id : any;
  constructor(private api: ApiService, private route: ActivatedRoute) { }

  public ngOnInit() {
    // fetch the ID from the route
    this.route.params.subscribe(async (params) => {
      if (params && params.hasOwnProperty('session_id')) {
        try {
          this.order_id = <number>params['order_id']
          await this.loadSession(<number>params['session_id']);
          await this.load();
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
  async load() {
    
    if (this.order_id > 0) {
      try {
        this.order = await this.api.fetch('/?get=sale_pos_order_tree', { id: this.order_id, variant: 'payments' });
        console.log(this.order);
      }
      catch (response) {
        throw 'unable to retrieve given order';
      }
    }
  }
  async ngOnChanges(changeDetector: SimpleChanges) {
    // this.orders = await this.api.collect("sale\\pos\\OrderLine", ['order_id', '=', this.item?.id], ['order_id', 'price', 'name']);
    // this.payments = await this.api.collect("sale\\pos\\OrderPayment", ['order_id', '=', this.item?.id], ['order_payment_parts_ids', 'total_due', 'total_paid']);
    // this.totalPaid = 0;
    // if(this.payments.length > 0)this.payments.forEach((element:any)=>this.totalPaid += element.total_paid);
    // this.paymentsParts = await this.api.collect("sale\\pos\\OrderPaymentPart", ['order_id', '=', this.item?.id], ['order_payment_parts_ids', 'payment_method', 'amount', 'order_id']);

  }

}
