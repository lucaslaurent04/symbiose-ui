import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { ApiService } from 'sb-shared-lib';

@Component({
  selector: 'app-ticket',
  templateUrl: './ticket.component.html',
  styleUrls: ['./ticket.component.scss']
})
export class TicketComponent implements OnInit {
  @Input() item : any;
  @Input() changeDetector : any;
  public orders : any;
  public paymentsParts : any;
  public payments : any;
  public totalPaid : any = 0;
  constructor(private api: ApiService) { }

  async ngOnInit() {
  }
  async ngOnChanges(changes: SimpleChanges) {
    this.orders = await this.api.collect("sale\\pos\\OrderLine", ['order_id', '=', this.item?.id], ['order_id', 'price', 'name']);
    this.payments = await this.api.collect("sale\\pos\\OrderPayment", ['order_id', '=', this.item?.id], ['order_payment_parts_ids', 'total_due', 'total_paid']);
    if(this.payments.length > 0)this.payments.forEach((element:any)=>this.totalPaid += element.total_paid);
    this.paymentsParts = await this.api.collect("sale\\pos\\OrderPaymentPart", ['order_id', '=', this.item?.id], ['order_payment_parts_ids', 'payment_method', 'amount', 'order_id']);
    
  }
}
