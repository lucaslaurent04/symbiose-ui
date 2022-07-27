import { Component, OnInit, OnChanges, AfterViewInit, Input, Output, EventEmitter, ChangeDetectorRef, SimpleChanges, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';

import { ApiService, ContextService, TreeComponent } from 'sb-shared-lib';
import { Order, OrderLine } from '../../lines.model';


// declaration of the interface for the map associating relational Model fields with their components
interface OrderLineComponentsMap {
};

@Component({
    selector: 'session-order-lines-orderline',
    templateUrl: 'order-line.component.html',
    styleUrls: ['order-line.component.scss']
})
export class SessionOrderLinesOrderLineComponent extends TreeComponent<OrderLine, OrderLineComponentsMap> implements OnInit, OnChanges, AfterViewInit {
    // servel-model relayed by parent
    @Input() set model(values: any) { this.update(values) }
    @Input() selected: any;
    @Input() product: any;
    @Output() updated = new EventEmitter();
    @Output() deleted = new EventEmitter();

    public ready: boolean = false;

    public qty: FormControl = new FormControl();
    public unit_price: FormControl = new FormControl();


    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private cd: ChangeDetectorRef,
        private api: ApiService,
        private context: ContextService,
        private dialog: MatDialog
    ) {
        super(new OrderLine())
    }

    public ngOnChanges(changes: SimpleChanges): void {
    }

    public ngAfterViewInit() { }

    public ngOnInit() {
        // init componentsMap
        this.componentsMap = {
        };
        this.qty.valueChanges.subscribe((value: number) => this.instance.qty = value);
        this.unit_price.valueChanges.subscribe((value: number) => this.instance.unit_price = value);
    }

    public update(values: any) {
        console.log('SessionOrderLinesOrderLineComponent:: update', values);
        super.update(values);
        // update widgets and sub-components, if necessary
    }

    public async onDelete() {
        await this.api.update((new Order()).entity, [this.instance.order_id], { order_lines_ids: [-this.instance.id] });
        // await this.api.remove(this.instance.entity, [this.instance.id]);
        this.deleted.emit();
    }

    public async onChange() {
        await this.api.update(this.instance.entity, [this.instance.id], { 
            qty: this.instance.qty, 
            unit_price: this.instance.unit_price, 
            discount: this.instance.discount, 
            free_qty: this.instance.free_qty, 
            vat_rate: this.instance.vat_rate 
        });

        this.updated.emit();
    }

    public async onDisplayInfo() {
        this.product = await this.api.collect('sale\\catalog\\Product', ['sku', '=', this.instance.name], ['customer_id', 'center_id', 'total', 'date_from', 'date_to', 'price', 'sku']);
        if (this.product.length > 0) {
            const dialogRef = this.dialog.open(ProductInfo, {
                data: this.product
            });
            dialogRef.afterClosed().subscribe();
        }
    }
}

@Component({
  selector: 'product-info',
  template: `
    <h2 style="background-color: white; text-align: center" mat-dialog-title>Informations de l'article</h2>
    <div style="background-color: #F5F5F5; width: 40rem; padding:0.5rem" mat-dialog-content>
      <div style="display: flex; justify-content:space-between; padding: 0.5rem; font-weight:bolder; padding:0.2rem;">
        <div>
          {{data[0].name}}
        </div>
        <div style="display: flex; flex-direction:column">
          <span>
            {{data.price}}
          </span>
          <span>
            Taxe
          </span>
        </div>
      </div>
  
      <div style="margin-top: 0.25rem;">
        <h4 style="border-bottom: 1px solid black; font-weight:bolder; padding:0.2rem;">Éléments comptables</h4>
        <div>
          <span>Prix HT</span> <span></span>
        </div>
        <div>
          <span>Coût</span> <span></span>
        </div>
        <div>
          <span>Marge</span> <span></span>
        </div>
      </div>
  
      <div style="margin-top: 0.25rem;">
        <h4 style="border-bottom: 1px solid black; font-weight:bolder; padding:0.2rem;">Stock</h4>
        <div>
          <span>Restant</span> <span></span>
        </div>
      </div>
  
      <div style="margin-top: 0.25rem;">
        <h4 style="border-bottom: 1px solid black; font-weight:bolder; padding:0.2rem;">Commande</h4>
        <div>
          <span>Restant</span> <span></span>
        </div>
      </div>
      <div mat-dialog-actions style="display: flex; justify-content: flex-end; padding: 1rem">
      <button  mat-raised-button (click)="closeDialog()"  color="primary">Fermer</button>
      </div>
    </div>
   
    `
})
export class ProductInfo {

  constructor(
    public dialogDelete: MatDialogRef<ProductInfo>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }
  public deleteConfirmation = false;
  ngOnInit(): void {
    console.log(this.data);
  }
  public closeDialog() {
    this.dialogDelete.close({
    })
  }
}