import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'sb-shared-lib';
import { Order, OrderLine } from '../../lines.model';

@Component({
  selector: 'session-order-lines-item-selected',
  templateUrl: 'order-lines-item-selected.html',
  styleUrls: ['./order-lines-item-selected.scss']
})
export class ProductsComponent implements OnInit {
  @Output() selectedtTab = new EventEmitter();
  @Output() addedOrderLine = new EventEmitter();
  bookings :any;
  public ready: boolean = false;
  public orderLine: OrderLine = new OrderLine();
  public order: Order = new Order();
  public funding : boolean = false;
  public fundings : any;
  constructor(private api: ApiService,
    private route: ActivatedRoute,) { }

  async ngOnInit() {
  this.bookings = await this.api.collect('lodging\\sale\\booking\\Booking', [],['customer_id', 'center_id', 'total', 'date_from', 'date_to', 'price'])

  this.route.params.subscribe( async (params) => {
    console.log(params)
    if(params && params.hasOwnProperty('order_id')) {
        try {
            await this.load(<number> params['order_id']);
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
        try {
            const result:any = await this.api.read("sale\\pos\\Order", [id], Object.getOwnPropertyNames(new Order()));
            if(result && result.length) {
                this.order = <Order> result[0];
            }
        }
        catch(response) {
            throw 'unable to retrieve given session';
        }
    }
}

  public onSelectedTab(event: any){
    this.selectedtTab.emit(event.tab.textLabel);
    this.funding = false;
  }

  public async getFunding(elem:any){
  this.funding = true;
  
  this.fundings = await this.api.collect('lodging\\sale\\booking\\Funding', [[['booking_id', '=', elem.id], ['is_paid', '=', false]]],['due_amount', 'center_id', 'due_date', 'name'])

  }

  public async createOrderLine(elem:any){
    this.addedOrderLine.emit(elem);
  }
}
