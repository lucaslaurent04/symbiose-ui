import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'sb-shared-lib';
import { Order, OrderLine } from '../../lines.model';
import {MatTableDataSource} from '@angular/material/table';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';

@Component({
  selector: 'app-order-items',
  templateUrl: './order-items.component.html',
  styleUrls: ['./order-items.component.scss']
})
export class OrderItemsComponent implements OnInit {

    @Output() selectedtTab = new EventEmitter();
    @Output() addedBookingOrderLine = new EventEmitter();
    @Output() addedProduct = new EventEmitter();
    @ViewChild(MatPaginator) paginator: MatPaginator;

    public bookings: any;
    public ready: boolean = false;
    public orderLine: OrderLine = new OrderLine();
    public order: Order = new Order();
    public funding: boolean = false;
    public fundings: any;
    public products : any;
    public dataSource: any;

    constructor(
        private api: ApiService,
        private route: ActivatedRoute
    ) { }

    async ngOnInit() {
        this.bookings = await this.api.collect('lodging\\sale\\booking\\Booking', [], ['customer_id', 'center_id', 'total', 'date_from', 'date_to', 'price']);
        this.bookings = new MatTableDataSource(this.bookings);
        this.bookings.paginator = this.paginator;
        this.products = await this.api.collect('sale\\catalog\\Product', ['can_sell', '=', true], ['customer_id', 'center_id', 'total', 'date_from', 'date_to', 'price', 'sku']);
        this.dataSource = new MatTableDataSource(this.products);
        this.dataSource.paginator = this.paginator; 

        this.route.params.subscribe(async (params) => {
            console.log(params)
            if (params && params.hasOwnProperty('order_id')) {
                try {
                    await this.load(<number>params['order_id']);
                    this.ready = true;
                }
                catch (error) {
                    console.warn(error);
                }
            }
        });
    }

    private async load(id: number) {
        if (id > 0) {
            try {
                const result: any = await this.api.read("sale\\pos\\Order", [id], Object.getOwnPropertyNames(new Order()));
                if (result && result.length) {
                    this.order = <Order>result[0];
                }
            }
            catch (response) {
                throw 'unable to retrieve given session';
            }
        }
    }

    public onSelectedTab(event: any) {
        this.selectedtTab.emit(event.tab.textLabel);
        this.funding = false;
    }

    public async getFunding(elem: any) {
        this.funding = true;
        this.fundings = await this.api.collect('lodging\\sale\\booking\\Funding', [[['booking_id', '=', elem.id], ['is_paid', '=', false]]], ['due_amount', 'center_id', 'due_date', 'name']);
        this.fundings = new MatTableDataSource(this.fundings);
        this.fundings.paginator = this.paginator;
    }

    public async createBookingOrderLine(elem: any, orderType: string) {

        if(orderType == "product"){
            this.addedProduct.emit(elem);
        }
        else {
            console.log(orderType)
            this.addedBookingOrderLine.emit(elem);
        }

    }

    public async createProductOrderLine(elem: any) {
        this.addedProduct.emit(elem);
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

}
