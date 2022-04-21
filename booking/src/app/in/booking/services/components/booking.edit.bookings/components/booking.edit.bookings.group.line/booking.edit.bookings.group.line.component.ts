import { Component, Inject, OnInit, OnChanges, NgZone, Output, Input, EventEmitter, SimpleChanges } from '@angular/core';
import { AuthService, ApiService, ContextService } from 'sb-shared-lib';
import { Router, ActivatedRoute } from '@angular/router';

import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

import {MatSnackBar} from '@angular/material/snack-bar';

import { Observable, ReplaySubject, BehaviorSubject } from 'rxjs';

import { find, map, mergeMap, startWith, debounceTime } from 'rxjs/operators';

import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';


interface vmModel {
  product: {
    name:           string
    inputClue:      ReplaySubject<any>,
    filteredList:   Observable<any>,
    inputChange:    (event:any) => void,
    change:         (event:any) => void,
    focus:          () => void,
    restore:        () => void,
    reset:          () => void,
    display:        (type:any) => string
  },
  qty: {
    value:          number,
    formControl:    FormControl,
    change:         () => void
  },
  qty_vars: {
    values:         any,
    change:         (index:number,event:any) => void,
    reset:          () => void
  },
  free_qty: {
    value:          number
  },
  unit_price: {
    value:          number,
    formControl:    FormControl,
    change:         () => void
  },
  discount: {
    value:          number
  },
  vat: {
    value:          number,
    formControl:    FormControl,
    change:         () => void
  },
  total_price: {
    value:          number
  },
  discounts: {
    add:            () => void,
    remove:         (discount:any) => void
  }
}

@Component({
  selector: 'booking-edit-bookings-group-line',
  templateUrl: 'booking.edit.bookings.group.line.component.html',
  styleUrls: ['booking.edit.bookings.group.line.component.scss']
})
export class BookingEditBookingsGroupLineComponent implements OnInit  {

  // read-only parent booking
  @Input() bookingInput: any;

  // read-only parent group
  @Input() groupInput: any;

  @Input() lineOutput: ReplaySubject<any>;
  @Input() lineInput:  ReplaySubject<any>;

  // observable for updates from children components
  public _discountInput:  ReplaySubject<any> = new ReplaySubject(1);
  // array of observable for children components
  public _discountOutput: Array<ReplaySubject<any>> = [];

  // fields for sub-items
  private model_fields = {
    BookingPriceAdapter: ["id", "type", "value", "discount_id.name", "discount_list_id.name", "discount_list_id.rate_min", "discount_list_id.rate_max", "booking_line_id"]
  };

  private center: any;

  // current line
  public line: any;


  // sub-objects (not present in group)
  public product:any;
  public rate_class:any;
  public price:any;
  public discounts: any;
  public adapters: any;

  public ready: boolean = false;

  public vm: vmModel;

  constructor(
              private api: ApiService,
              private auth: AuthService,
              private dialog: MatDialog,
              private zone: NgZone,
              private snack: MatSnackBar
              ) {

    this.line = {};
    this.product = null;
    this.discounts = [];
    this.center = null;

    this.vm = {
      product: {
        name:           '',
        inputClue:      new ReplaySubject(1),
        filteredList:   new Observable(),
        change:         (event:any) => this.productChange(event),
        inputChange:    (event:any) => this.productInputChange(event),
        focus:          () => this.productFocus(),
        restore:        () => this.productRestore(),
        reset:          () => this.productReset(),
        display:        (type:any) => this.productDisplay(type)
      },
      qty: {
        value:          1,
        formControl:    new FormControl('', Validators.required),
        change:         () => this.qtyChange()
      },
      qty_vars: {
        values:         {},
        change:         (index:number, event:any) => this.qtyVarsChange(index, event),
        reset:          () => this.qtyVarsReset()
      },
      free_qty: {
        value:          0.0
      },
      unit_price: {
        value:          0.0,
        formControl:    new FormControl(''),
        change:         () => this.unitPriceChange()
      },
      discount: {
        value:          0.0
      },
      vat: {
        value:          0.0,
        formControl:    new FormControl(''),
        change:         () => this.vatChange()
      },
      total_price: {
        value:          0.0
      },
      discounts: {
        add:            () => this.discountAdd(),
        remove:         (discount:any) => this.discountRemove(discount)
      }
    };

  }


  public ngOnInit() {

    this.lineInput.subscribe( (line: any) => this.load(line) );

    this.bookingInput.subscribe( async (booking: any) => {
      if(booking.center_id) {
        let data:any = await this.api.read("lodging\\identity\\Center", [booking.center_id], ["id", "name", "code", "organisation_id", "product_groups_ids"]);
        if(data && data.length) {
          this.center = data[0];
        }
      }
    });

    // listen to changes relayed by children component on the _bookingInput observable
    this._discountInput.subscribe(params => this.updateFromDiscount(params));

    /**
     * listen to the changes on FormControl objects
     */
    this.vm.product.filteredList = this.vm.product.inputClue.pipe(
      debounceTime(300),
      map( (value:any) => (typeof value === 'string' ? value : (value == null)?'':value.name) ),
      mergeMap( async (name:string) => this.filterProducts(name) )
    );

    this.vm.qty.formControl.valueChanges.subscribe( (value:number)  => {
      this.vm.qty.value = value;
    });

    this.vm.unit_price.formControl.valueChanges.subscribe( (value:number)  => {
      this.vm.unit_price.value = value;
    });

    this.vm.vat.formControl.valueChanges.subscribe( (value:number)  => {
      this.vm.vat.value = value;
    });

  }

  public daysCounter() {
    return new Array(this.groupInput.nb_nights);
  }

  /**
   * Assign values from parent and load sub-objects required by the view.
   *
   * @param line
   */
  private async load(line:any) {
    this.zone.run( () => {
      this.ready = false;
    });

    this.zone.run( async () => {
      try {
        console.log("BookingEditBookingsGroupLineComponent: received changes from parent", line.id, line);

        // update local group object
        for(let field of Object.keys(line)) {
          this.line[field] = line[field];
        }

        if(line.product_id) {
          let data:any = await this.api.read("lodging\\sale\\catalog\\Product", [line.product_id], ["id", "name", "sku", "product_model_id.has_duration", "product_model_id.duration"]);
          if(data && data.length) {
            let product = data[0];
            this.product = product;
            this.vm.product.name = product.name;
          }
        }

        if(line.hasOwnProperty('price_id')) {
          let data:any = await this.api.read("sale\\price\\Price", [line.price_id], ["id", "price"]);
          if(data && data.length) {
            let price = data[0];
            this.price = price;
            // #memo : price is a computed field set server-side, according to price adapters
            this.vm.unit_price.value = price.price;
          }
          else {
            this.price = null;
            this.vm.unit_price.value = 0;
            this.vm.vat.value = 0;
          }
        }

        if(line.hasOwnProperty('unit_price')) {
          this.vm.unit_price.value = line.unit_price;
          this.vm.unit_price.formControl.setValue(line.unit_price);
        }

        if(line.hasOwnProperty('vat_rate')) {
          this.vm.vat.value = line.vat_rate;
          this.vm.vat.formControl.setValue(line.vat_rate);
        }

        if(line.hasOwnProperty('price')) {
          this.vm.total_price.value = line.price;
        }

        if(line.hasOwnProperty('qty')) {
          this.vm.qty.value = line.qty;
          this.vm.qty.formControl.setValue(line.qty);
        }



        if(line.hasOwnProperty('qty_vars')) {
          let factor = this.groupInput.nb_nights
          if(this.product.hasOwnProperty('product_model_id')) {
            if(this.product.product_model_id.hasOwnProperty('has_duration') && this.product.product_model_id.has_duration) {
              factor = this.product.product_model_id.duration;
            }
          }
          let values = new Array(factor);

          values.fill(0);
          if(line.qty_vars) {
            values = JSON.parse(line.qty_vars);
          }
          let i = 0;
          for(let val of values) {
            this.vm.qty_vars.values[i] = val;
            ++i;
          }
        }

        if(line.manual_discounts_ids) {
          let data:any = await this.loadManualDiscounts(line.manual_discounts_ids, this.model_fields['BookingPriceAdapter']);
          if(data) {
            for(let [index, discount] of data.entries()) {
              // add new discounts (indexes from this.discount and this._lineOutput are synced)
              if(index >= this.discounts.length) {
                let item = new ReplaySubject(1);
                this._discountOutput.push(item);
                item.next(discount);
                this.discounts.push(discount);
              }
              // if discount differ, overwrite previsously assigned discount
              else if(JSON.stringify(this.discounts[index]) != JSON.stringify(discount) ) {
                let item = new ReplaySubject(1);
                this._discountOutput[index] = item;
                this.discounts[index] = discount;
                item.next(discount);
              }
            }
            // remove remaining discounts, if any
            if(this.discounts.length > data.length) {
              this.discounts.splice(data.length);
              this._discountOutput.splice(data.length);
            }
          }
          let discount = 0.0;
          for(let item of this.discounts) {
            if(item['type'] == 'percent') {
              discount += item['value'];
            }
          }
          this.vm.discount.value = discount;
        }

        // allways load price adapters
        if(line.auto_discounts_ids) {
          let free_qty = 0;
          const adapters:any = await this.loadAutoDiscounts(line.auto_discounts_ids, this.model_fields['BookingPriceAdapter']);
          this.adapters = adapters;
          for(let adapter of this.adapters) {
            if(adapter['type'] == 'freebie') {
              free_qty += adapter['value'];
            }
          }

          this.vm.free_qty.value = free_qty;
        }


      }
      catch(response) {console.warn(response);}
      this.ready = true;
    });
  }


  /**
   * Handle update events received from BookingLine children.
   *
   */
  private async updateFromDiscount(discount: any) {
    console.log("BookingEditBookingsGroupLineComponent: received changes from child", discount);

    console.log(this.discounts);

    try {

      let has_change = false;
      let index = this.discounts.findIndex( (element:any) => element.id == discount.id);
      let t_line = this.discounts.find( (element:any) => element.id == discount.id);

      if(discount.hasOwnProperty('value') && discount.value != t_line.value) {
        await this.updateDiscount(discount);
        has_change = true;
      }

      if(discount.hasOwnProperty('type') && discount.type != t_line.type) {
        await this.updateDiscount(discount);
        has_change = true;
      }

      if(has_change) {
        this.lineOutput.next({id: this.line.id, price_adapters_ids: true});
      }

    }
    catch(error) {
      console.warn('some changes could not be stored', error);
      this.snack.open("Erreur - certains changements n'ont pas pu être enregistrés.");
    }
  }

  private productInputChange(event:any) {
    this.vm.product.inputClue.next(event.target.value);
  }

  private productFocus() {
    this.vm.product.inputClue.next("");
  }

  private productDisplay(product:any): string {
    return product ? product.name: '';
  }

  private productReset() {
    setTimeout( () => {
      this.vm.product.name = '';
    }, 100);
  }

  private productRestore() {
    if(this.product) {
      this.vm.product.name = this.product.name;
    }
    else {
      this.vm.product.name = '';
    }
  }


  private productChange(event:any) {
    console.log('BookingEditCustomerComponent::productChange', event)

    // from mat-autocomplete
    if(event && event.option && event.option.value) {
      let product = event.option.value;
      this.product = product;
      this.vm.product.name = product.name;
      // relay change to parent component
      this.lineOutput.next({id: this.line.id, product_id: product.id, refresh: {self: ['qty', 'qty_accounting_method', 'is_accomodation', 'is_meal', 'price', 'vat_rate', 'unit_price']}});
    }

  }

  private qtyChange() {
    // relay change to parent component
    this.lineOutput.next({id: this.line.id, qty: this.vm.qty.value, refresh: {self: ['price']}});
  }

  private qtyVarsChange(index:number, $event:any) {
    let value:number = parseInt($event.srcElement.value, 10);

    this.vm.qty_vars.values[index] = (value-this.groupInput.nb_pers);
    // update line
    let qty_vars = JSON.stringify(Object.values(this.vm.qty_vars.values));
    this.lineOutput.next({id: this.line.id, qty_vars: qty_vars, refresh: {self: ['price', 'qty']}});
  }

  private qtyVarsReset() {

    let values = new Array(this.groupInput.nb_nights);
    values.fill(0);
    let qty_vars = JSON.stringify(Object.values(values));
    this.lineOutput.next({id: this.line.id, qty_vars: qty_vars, refresh: {self: ['price', 'qty']}});
  }

  private unitPriceChange() {
    // relay change to parent component
    this.lineOutput.next({id: this.line.id, unit_price: this.vm.unit_price.value, refresh: {self: ['price']}});
  }

  private vatChange() {
    // relay change to parent component
    this.lineOutput.next({id: this.line.id, vat_rate: this.vm.vat.value, refresh: {self: ['price']}});
  }

  /**
   * Limit products to the ones available for currently selected center (groups of the product matches the product groups of the center)
   */
  private async filterProducts(name: string) {

    let filtered:any[] = [];
    try {

      let domain = [
        ["name", "ilike", '%'+name+'%'],
        ["can_sell", "=", true]
      ];

      if(this.center && this.center.hasOwnProperty('product_groups_ids') && this.center.product_groups_ids.length) {
        domain.push(["groups_ids", "contains", this.center.product_groups_ids[0]]);
      }

      let data:any[] = await this.api.collect(
        "lodging\\sale\\catalog\\Product",
        domain,
        ["id", "name", "sku"],
        'name', 'asc', 0, 25
      );
      filtered = data;
    }
    catch(response) {
      console.log(response);
    }
    return filtered;
  }


  private async loadAutoDiscounts(ids:Array<any>, fields:any) {
    let data:any[] = <Array<any>> await this.api.read("lodging\\sale\\booking\\BookingPriceAdapter", ids, fields);
    return data;
  }

  private async loadManualDiscounts(ids:Array<any>, fields:any) {
    let data:any[] = <Array<any>> await this.api.read("lodging\\sale\\booking\\BookingPriceAdapter", ids, fields);
    return data;
  }


  private async discountAdd() {

    try {
      const adapter = await this.api.create("lodging\\sale\\booking\\BookingPriceAdapter", {
        booking_id: this.line.booking_id,
        booking_line_group_id: this.line.booking_line_group_id,
        booking_line_id: this.line.id
      });

      // emit change to parent
      // this.lineOutput.next({id: this.line.id, price_adapters_ids: [adapter.id]});

      let discount = {id: adapter.id, type: 'percent', value: 0};

      let item = new ReplaySubject(1);
      this._discountOutput.push(item);
      item.next(discount);
      this.discounts.push(discount);

    }
    catch(error) {
      console.log(error);
    }

  }

  private async discountRemove(discount: any) {
    // await this.api.remove("lodging\\sale\\booking\\BookingPriceAdapter", [discount.id], true);
    await this.api.update("lodging\\sale\\booking\\BookingLine", [this.line.id], {price_adapters_ids: [-discount.id]}, discount);
    this.lineOutput.next({id: this.line.id, price_adapters_ids: true});
  }

  private async updateDiscount(discount:any) {
    await this.api.update("lodging\\sale\\booking\\BookingPriceAdapter", [discount.id], discount);
  }
}