import { Component, OnInit, AfterViewInit, ChangeDetectorRef, ViewChildren, QueryList, Input, SimpleChanges, ViewChild } from '@angular/core';
import { ActivatedRoute, BaseRouteReuseStrategy, Router } from '@angular/router';
import { ApiService, ContextService, TreeComponent, RootTreeComponent } from 'sb-shared-lib';
import { CashdeskSession } from '../../_models/session.model';
import { Order, OrderLine, OrderPayment, OrderPaymentPart } from './ticket.model';

import { SessionOrderLinesComponent } from '../lines/lines.component';
import { OrderService } from 'src/app/in/orderService';
import { BookingLineClass } from 'src/app/model';

import { MatTableDataSource } from '@angular/material/table';
import {DataSource, SelectionModel} from '@angular/cdk/collections';
import { JSPrintManager, ClientPrintJob, InstalledPrinter, PrintFilePDF, FileSourceType, WSStatus, DefaultPrinter } from 'jsprintmanager';
import {jsPDF} from "jspdf";
import * as html2canvas from "html2canvas";
import * as qz from 'qz-tray';







// declaration of the interface for the map associating relational Model fields with their components
interface OrderComponentsMap {

};


@Component({
    selector: 'session-order-ticket',
    templateUrl: 'ticket.component.html',
    styleUrls: ['ticket.component.scss']
})
export class SessionOrderTicketComponent extends TreeComponent<Order, OrderComponentsMap> implements RootTreeComponent, OnInit, AfterViewInit {
    // @ViewChildren(SessionOrderPaymentsOrderPaymentComponent) SessionOrderPaymentsOrderPaymentComponents: QueryList<SessionOrderPaymentsOrderPaymentComponent>;
    // @ViewChildren(SessionOrderLinesComponent) SessionOrderLinesComponents: QueryList<SessionOrderLinesComponent>;


    public ready: boolean = false;

    public focus: string;

    public printers : any [] = [];
    public selectedPrinter : any;
    public realPrinter : any = "";
    isDefaultPrinterSelected = false;


    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private api: ApiService,
        private context: ContextService,
        public orderservice: OrderService,
    ) {
        super(new Order());
    }

    public ngAfterViewInit() {
        // init local componentsMap
        let map: OrderComponentsMap = {
        };
        this.componentsMap = map;
    }

    public ngOnInit() {

        // qz.websocket.connect().then(function(){
        //     alert("Connected");
        // })
    
        // let realPrinter;

        // qz.printers.find("Microsoft Print").then(function(found:any) {
        //     realPrinter = found;
        //     console.log(realPrinter);
        //  });
         
        //  this.realPrinter = realPrinter;

        // JSPrintManager.auto_reconnect = true;
        // JSPrintManager.start();
        // JSPrintManager.WS.onStatusChanged = () => {
        //     if (this.jspmWSStatus()) {
        //         // get client installed printers
        //         JSPrintManager.getPrinters().then((myPrinters: any) => {
        //           this.printers = myPrinters;
        //           console.log(this.printers);
        //         });
        //     }
        // };


        // fetch the IDs from the route
        this.route.params.subscribe(async (params) => {
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

    /**
     * Load an Order object using the sale_pos_order_tree controller
     * @param order_id
     */
    async load(order_id: number) {
        if (order_id > 0) {
            try {
                const data = await this.api.fetch('/?get=lodging_sale_pos_order_tree', { id: order_id, variant: 'ticket' });
                if (data) {
                    this.update(data);
                }
            }
            catch (response) {
               throw 'unable to retrieve given order';
            }
        }
    }


    public getPaymentModesMap() : {[key: string]: number} {
        let payments_map: any = {};
        for(let part of this.instance.order_payment_parts_ids) {
            let mode = part.payment_method;
            if(!payments_map.hasOwnProperty(mode)) {
                payments_map[mode] = 0.0;
            }
            payments_map[mode] += part.amount;
        }
        return payments_map;
    }

    public getVatMap() : {[key: number]: number} {
        let vat_map: any = {};
        for(let line of this.instance.order_lines_ids) {
            let vat = parseFloat( (line.total * line.vat_rate).toFixed(2) );
            if(vat <= 0) {
                continue;
            }
            let vat_rate = line.vat_rate * 100;
            if(!vat_map.hasOwnProperty(vat_rate)) {
                vat_map[vat_rate] = 0.0;
            }
            vat_map[vat_rate] += vat;
        }
        return vat_map;
    }

    public onclickCloseSession() {
        this.router.navigate(['/session/'+this.instance.session_id.id+'/close']);
    }

    public onclickFullscreen() {
        const elem:any = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        }
        else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
        }
        else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        }
        else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        }
    }

    public async onPrint() {

        window.print();
        // this.selectedPrinter = this.printers[0];
        // console.log(this.printers);
        // if (this.selectedPrinter !== 'undefined' && this.jspmWSStatus()) {
        //     // Create a ClientPrintJob
        //     const cpj = new ClientPrintJob();
        //     // Set Printer type (Refer to the help, there many of them!)
        //     if ( this.isDefaultPrinterSelected ) {
        //     cpj.clientPrinter = new DefaultPrinter();
        //     } else {
        //     cpj.clientPrinter = new InstalledPrinter(this.selectedPrinter);
        //     }

        //     // Set content to print...
        //     //Set PDF file... for more advanced PDF settings please refer to
        //     //https://www.neodynamic.com/Products/Help/JSPrintManager4.0/apiref/classes/jspm.printfilepdf.html
        //     const h2c : any = html2canvas;
        //     //getting the pdf with css and html and good size
        //     h2c(document.querySelector('.view')).then(function (canvas:any) {
        //         var img = canvas.toDataURL("image/png");
        //         const doc = new jsPDF('p', 'mm', [canvas.height/canvas.width*105,105]);
        //         // var width = doc.internal.pageSize.getWidth();
        //         // var height = doc.internal.pageSize.getHeight();
        //         var wid: number
        //         var hgt: number
        //         var img = canvas.toDataURL("image/png", wid = canvas.width, hgt = canvas.height);
        //         var hratio = hgt/wid

        //         var width = doc.internal.pageSize.width;    
        //         var height = width * hratio
        //         doc.addImage(img,'JPEG',0,0, width, height);


        //         var config = qz.configs.create("Printer Name");
                
                
        //         var end = doc.output();

        //         var data = [{
        //             type: 'pixel',
        //             format: 'pdf',
        //             flavor: 'base64',
        //             data: end 
        //         }]

        //         qz.print(config, data).catch(function(e :any) { console.error(e); });
        //         // doc.addImage(img, 'JPEG', 0, 0, width ,height );
        //         // doc.save('test.pdf');        
        //     });
            
            
            
            // doc.html(pdfjs, {
            //     callback: function(doc) {
            //         // console.log(doc.output());
            //         var my_file = new PrintFilePDF(doc.output(), FileSourceType.URL, 'MyFile.pdf', 1);

            //         cpj.files.push(my_file);

            //         // Send print job to printer!
            //         cpj.sendToClient();
            //         doc.save("ok.pdf");
            //     },
            //     x: 100,
            //     y: 100
            // });

           
            // console.log(doc);
            
        // }
    }

    // public jspmWSStatus() {
    //     if (JSPrintManager.websocket_status === WSStatus.Open) {
    //         return true;
    //     } else if (JSPrintManager.websocket_status === WSStatus.Closed) {
    //         alert('JSPrintManager (JSPM) is not installed or not running! Download JSPM Client App from https://neodynamic.com/downloads/jspm');
    //         return false;
    //     } else if (JSPrintManager.websocket_status === WSStatus.Blocked) {
    //         alert('JSPM has blocked this website!');
    //         return false;
    //     }else{
    //         return false;
    //     }
    //   }

    public async customer_change(event: any){
        await this.api.update(this.instance.entity, [this.instance.id], { customer_id: event.id });
        this.load(this.instance.id);
    }

}


