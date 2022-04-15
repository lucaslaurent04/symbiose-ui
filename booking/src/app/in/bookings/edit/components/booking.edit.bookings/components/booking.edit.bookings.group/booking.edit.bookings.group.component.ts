import { Component, Inject, OnInit, OnChanges, NgZone, Output, Input, EventEmitter, SimpleChanges } from '@angular/core';
import { AuthService, ApiService, ContextService } from 'sb-shared-lib';
import { BookingApiService } from 'src/app/in/bookings/_services/booking.api.service';
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
  price: {
    value:        number
  }
  name: {
    value:        string,
    display_name: string,
    formControl:  FormControl,
    change:       () => void
  },
  daterange: {
    start: {
      formControl:  FormControl
    },
    end: {
      formControl:  FormControl
    },
    nights_count:   number,
    change:         () => void
  },
  participants_count: {
    value:          number,
    formControl:    FormControl
    change:         () => void
  },
  sojourn_type: {
    value:          'GG',
    change:         (event:any) => void
  },
  pack: {
    name:           string,
    has_pack:       boolean,
    is_locked:      boolean,
    inputClue:      ReplaySubject<any>,
    filteredList:   Observable<any>,
    inputChange:    (event:any) => void,
    change:         (target: string, value:any) => void,
    focus:          () => void,
    restore:        () => void,
    reset:          () => void,
    display:        (type:any) => string
  },
  rate_class: {
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
  lines: {
    add:            () => void,
    remove:         (product:any) => void,
    drop:           (event:CdkDragDrop<any>) => void
  }
}

@Component({
  selector: 'booking-edit-bookings-group',
  templateUrl: 'booking.edit.bookings.group.component.html',
  styleUrls: ['booking.edit.bookings.group.component.scss']
})
export class BookingEditBookingsGroupComponent implements OnInit  {

  // read-only parent booking
  @Input() bookingInput: any;

  //private _groupInput: ReplaySubject<any> = new ReplaySubject(1);
  @Input() groupOutput: ReplaySubject<any>;
  @Input() groupInput:  ReplaySubject<any>;


  @Input() folded:  boolean;
  @Output() toggle = new EventEmitter();

  // observable for updates from children components
  public _lineInput:  ReplaySubject<any> = new ReplaySubject(1);
  // array of observable for children components
  public _lineOutput: Array<ReplaySubject<any>> = [];


  // observable for updates from children components
  public _accomodationInput:  ReplaySubject<any> = new ReplaySubject(1);
  // array of observable for children components
  public _accomodationOutput: Array<ReplaySubject<any>> = [];


  // fields for sub-items
  private model_fields = {
    BookingLine: [
      "id", "name", "product_id", "order", "qty", "price_id", "vat_rate", "unit_price", "price", 
      "booking_id", "booking_line_group_id", "qty_vars",
      "price_adapters_ids", "auto_discounts_ids", "manual_discounts_ids",
      "qty_accounting_method", "is_accomodation", "is_meal"
    ],
    // accomodations are bookinglines with is_accomodation set to true
    Accomodation: [
      "id", "product_id", "rental_unit_assignments_ids"
    ]

  };

  private center: any;

  // current group  
  public group: any;

  // sub-objects (not present in group)
  public pack:any;
  public customer:any;
  public rate_class:any;
  
  public lines: Array<any>;   // bookingLines
  public accomodations: Array<any>;   // bookingLines

  public ready: boolean = false;

  public vm: vmModel;

  constructor(
              private api: BookingApiService,
              private auth: AuthService,
              private dialog: MatDialog,
              private zone: NgZone,
              private snack: MatSnackBar
              ) {

    this.group = {};
    this.rate_class = null;
    this.pack = null;
    this.lines = [];
    this.accomodations = [];
    this.center = null;

    this.vm = {
      price: {
        value:          0
      },
      name: {
        value:          '',
        display_name:   '',
        formControl:    new FormControl('', Validators.required),
        change:         () => this.nameChange()
      },
      daterange: {
        start:{
          formControl:  new FormControl()
        },
        end:{
          formControl:  new FormControl()
        },
        nights_count:   0,
        change:         () => this.dateRangeChange()
      },
      participants_count: {
        value:          1,
        formControl:    new FormControl('', Validators.required),
        change:         () => this.nbPersChange()
      },
      sojourn_type: {
        value:          'GG',
        change:         (event:any) => this.sojournTypeChange(event)
      },
      pack: {
        name:           '',
        has_pack:       false,
        is_locked:      false,
        inputClue:      new ReplaySubject(1),
        filteredList:   new Observable(),
        change:         (target, value:any) => this.packChange(target, value),
        inputChange:    (event:any) => this.packInputChange(event),
        focus:          () => this.packFocus(),
        restore:        () => this.packRestore(),
        reset:          () => this.packReset(),
        display:        (type:any) => this.packDisplay(type)
      },
      rate_class: {
        name:           '',
        inputClue:      new ReplaySubject(1),
        filteredList:   new Observable(),
        change:         (event:any) => this.rateClassChange(event),
        inputChange:    (event:any) => this.rateClassInputChange(event),
        focus:          () => this.rateClassFocus(),
        restore:        () => this.rateClassRestore(),
        reset:          () => this.rateClassReset(),
        display:        (type:any) => this.rateClassDisplay(type)
      },
      lines: {
        add:            () => this.lineAdd(),
        remove:         (group:any) => this.lineRemove(group),
        drop:           (event:CdkDragDrop<any>) => this.lineDrop(event)
      }
    };

  }


  public ngOnInit() {

    // listen to the parent for changes on group object
    this.groupInput.subscribe( (group: any) => this.load(group) );

    this.bookingInput.subscribe( async (booking: any) => {
      if(booking.center_id) {
        let data:any = await this.api.read("lodging\\identity\\Center", [booking.center_id], ["id", "name", "code", "organisation_id", "product_groups_ids"]);
        if(data && data.length) {
          this.center = data[0];
        }
      }
    });

    // listen to changes relayed by children components
    this._lineInput.subscribe(params => this.updateFromLine(params));

    // listen to changes relayed by children components
    this._accomodationInput.subscribe(params => this.updateFromAccomodation(params));

    /**
     * listen to the changes on FormControl objects
     */

    this.vm.pack.filteredList = this.vm.pack.inputClue.pipe(
      debounceTime(300),
      map( (value:any) => (typeof value === 'string' ? value : (value == null)?'':value.name) ),
      mergeMap( async (name:string) => this.filterPacks(name) )
    );

    this.vm.rate_class.filteredList = this.vm.rate_class.inputClue.pipe(
      debounceTime(300),
      map( (value:any) => (typeof value === 'string' ? value : (value == null)?'':value.name) ),
      mergeMap( async (name:string) => this.filterRateClasses(name) )
    );

    this.vm.daterange.start.formControl.valueChanges.subscribe( (date:Date)  => {
      this.dateRangeUpdate();
    });

    this.vm.daterange.end.formControl.valueChanges.subscribe( (date:Date)  => {
      this.dateRangeUpdate();
    });

    this.vm.participants_count.formControl.valueChanges.subscribe( (value:number)  => {
      this.vm.participants_count.value = value;
    });

    this.vm.name.formControl.valueChanges.subscribe( (value:string)  => {
      this.vm.name.value = value;
    });

  }

  


  public toggleFold() {
    this.folded = !this.folded;
    this.toggle.emit({ group_id: this.group.id, status: this.folded });
  }

  /**
   * Assign values from parent and load sub-objects required by the view.
   * 
   * @param group
   */
  private async load(group:any) {

    this.zone.run( async () => {
      this.ready = false;
      try {
        console.log("BookingEditBookingsGroupComponent: received changes from parent", group.id, group);

        // update local group object
        for(let field of Object.keys(group)) {
          this.group[field] = group[field];
        }

        if(group.name) {
          this.vm.name.value = group.name;
          this.vm.name.display_name = group.name;
          this.vm.name.formControl.setValue(group.name);
        }

        if(group.hasOwnProperty('price')) {
          this.vm.price.value = group.price;
        }

        if(group.rate_class_id) {
          let data:any = await this.api.read("sale\\customer\\RateClass", [group.rate_class_id], ["id", "name", "description"]);
          if(data && data.length) {
            let rate_class = data[0];
            this.rate_class = rate_class;
            this.vm.rate_class.name = rate_class.name + ' - ' + this.rate_class.description;
          }  
        }

        if(group.pack_id) {
          let data:any = await this.api.read("lodging\\sale\\catalog\\Product", [group.pack_id], ["id", "name", "sku"]);
          if(data && data.length) {
            let pack = data[0];
            this.pack = pack;
            this.vm.pack.name = pack.name;
            this.vm.name.display_name = pack.name;
          }

          // we need to load related is_lock value
        }

        if(group.hasOwnProperty('has_pack')) {
          this.vm.pack.has_pack = group.has_pack;
        }

        if(group.hasOwnProperty('is_locked')) {
          this.vm.pack.is_locked = group.is_locked;
        }

        if(group.hasOwnProperty('nb_pers')) {
          this.vm.participants_count.formControl.setValue(group.nb_pers);
        }

        if(group.sojourn_type) {
          this.vm.sojourn_type.value = group.sojourn_type;
        }

        if(group.date_from) {
          this.vm.daterange.start.formControl.setValue(group.date_from);
        }
        
        if(group.date_to) {
          this.vm.daterange.end.formControl.setValue(group.date_to);
        }

        if(group.booking_lines_ids) {
          let data:any = await this.loadLines(group.booking_lines_ids, this.model_fields['BookingLine']);
          if(data) {
            for(let [index, line] of data.entries()) {
              // add new lines (indexes from this.lines and this._lineOutput are synced)
              if(index >= this.lines.length) {
                let item = new ReplaySubject(1);
                this._lineOutput.push(item);
                item.next(line);
                this.lines.push(line);
              }
              // if lines differ, overwrite previsously assigned line
              else if(JSON.stringify(this.lines[index]) != JSON.stringify(line) ) {
                let item = new ReplaySubject(1);
                this._lineOutput[index] = item;
                this.lines[index] = line;
                item.next(line);
              }
            }
            if(data.length == 1) {
              // if there is only one line use its name (produtct) as group (display_)name
              this.vm.name.display_name = data[0].name;
            }
            // remove remaining lines, if any
            if(this.lines.length > data.length) {
              this.lines.splice(data.length);
              this._lineOutput.splice(data.length);
            }
          }
        }


        if(group.accomodations_ids) {
          // booking lines relating to accomodations (is_accomodation = true)
          let data:any = await this.loadAccomodations(group.accomodations_ids, this.model_fields['Accomodation']);
          if(data) {
            for(let [index, accomodation] of data.entries()) {
              // add new lines (indexes from this.lines and this._lineOutput are synced)
              if(index >= this.accomodations.length) {
                let item = new ReplaySubject(1);
                this._accomodationOutput.push(item);
                item.next(accomodation);
                this.accomodations.push(accomodation);
              }
              // if accomodations differ, overwrite previsously assigned line
              else if(JSON.stringify(this.accomodations[index]) != JSON.stringify(accomodation) ) {
                let item = new ReplaySubject(1);
                this._accomodationOutput[index] = item;
                this.accomodations[index] = accomodation;
                item.next(accomodation);
              }
            }
            // remove remaining accomodations, if any
            if(this.accomodations.length > data.length) {
              this.accomodations.splice(data.length);
              this._accomodationOutput.splice(data.length);
            }
          }
        }        
      }
      catch(response) {console.warn(response);}
      this.ready = true;
    });
  }

  private async updateFromAccomodation(line: any) {
    console.log("BookingEditBookingsGroupComponent: received changes from child", line);

    let has_change:boolean = false;

    try {
      let index = this.lines.findIndex( (element) => element.id == line.id);
      let t_line = this.lines.find( (element) => element.id == line.id);

      if(line.hasOwnProperty('rental_unit_id') && line.rental_unit_id != t_line.rental_unit_id) {
        has_change = true;
        await this.updateRentalUnit(line);
      }


      if(has_change) {        
        let data = await this.loadAccomodations([line.id], this.model_fields['Accomodation']);
        let object = data[0];
        for(let field of Object.keys(object)) {
          this.accomodations[index][field] = object[field];
        }
        // relay changes to children components
        this._accomodationOutput[index].next(this.accomodations[index]);
        // notify User
        this.snack.open("Logement mis à jour");
      }
    }
    catch(error) {
      console.warn(error);
    }
  }

  /**
   * Handle update events received from BookingLine children.
   * 
   */
  private async updateFromLine(line: any) {
    console.log("BookingEditBookingsGroupComponent: received changes from child", line);

    try {
      let has_change = false;
      let refresh_requests:any = {};

      let index = this.lines.findIndex( (element) => element.id == line.id);
      let t_line = this.lines.find( (element) => element.id == line.id);

      if(line.hasOwnProperty('product_id') && line.product_id != t_line.product_id) {
        await this.updateProduct(line);
        has_change = true;
        // this implies reloading current group price and booking price        
        refresh_requests['booking_id'] = ['price'];
        refresh_requests['self'] = ['price'];
      }

      if(line.hasOwnProperty('qty') && line.qty != t_line.qty) {
        await this.updateQuantity(line);
        has_change = true;
        refresh_requests['booking_id'] = ['price'];
        refresh_requests['self'] = ['price'];
      }

      if(line.hasOwnProperty('unit_price') && line.qty != t_line.qty) {
        await this.updateUnitPrice(line);
        has_change = true;
        refresh_requests['booking_id'] = ['price'];
        refresh_requests['self'] = ['price'];
      }

      if(line.hasOwnProperty('vat_rate') && line.qty != t_line.qty) {
        await this.updateVatRate(line);
        has_change = true;
        refresh_requests['booking_id'] = ['price'];
        refresh_requests['self'] = ['price'];
      }

      if(line.hasOwnProperty('price_adapters_ids')) {
        has_change = true;
        refresh_requests['booking_id'] = ['price'];
        refresh_requests['self'] = ['price'];
      }

      if(line.hasOwnProperty('qty_vars')) {
        await this.updateQtyVars(line);
        has_change = true;
        refresh_requests['booking_id'] = ['price'];
        refresh_requests['self'] = ['price'];
      }


      // handle explicit requests for updating single fields (reload partial object)
      if(line.hasOwnProperty('refresh')) {
        // some changes have been done that might impact current object
        // refresh property specifies which fields have to be re-loaded
        let model_fields = this.model_fields['BookingLine'];

        if(line.refresh.hasOwnProperty('self')) {
          if(Array.isArray(line.refresh.self)) {
            model_fields = line.refresh.self;
          }          
          // reload object from server
          let data = await this.loadLines([line.id], model_fields);
          this._lineOutput[index].next(data[0]);
        }

        // handle requests to relay to parent
        if(line.refresh.hasOwnProperty('booking_line_group_id')) {
          // line.refresh.booking_line_group_id is an array of fields from sale\booking\BookingLineGroup to be updated
          if(refresh_requests.hasOwnPropertyKey('self')) {
            refresh_requests['self'] = [...refresh_requests['self'], ...line.refresh.booking_line_group_id];
          }
          else {
            refresh_requests['self'] = line.refresh.booking_line_group_id;
          }
        }
      }
      // reload whole object from server
      else if(has_change) {        
        let data = await this.loadLines([line.id], this.model_fields['BookingLine']);
        let object = data[0];
        for(let field of Object.keys(object)) {
          this.lines[index][field] = object[field];
        }
        if(this.lines.length == 1) {
          // if there is only one line use its name (produtct) as group (display_)name
          //this.vm.name.display_name = object.name;
        }
        // relay changes to children components
        this._lineOutput[index].next(this.lines[index]);
        // notify User
        this.snack.open("Regroupement mis à jour");
      }

      // relay refresh request to parent, if any
      if(Object.keys(refresh_requests).length) {
        this.groupOutput.next({id: this.group.id, refresh: refresh_requests});
      }

    }
    catch(response:any) {
      this.api.errorFeedback(response);
    }
  }

  private async loadLines(ids:Array<any>, fields:any) {
    let data:any = await this.api.read("lodging\\sale\\booking\\BookingLine",
                                      ids,
                                      fields,
                                      'order'
                                      );
    return data;
  }

  private async loadAccomodations(ids:Array<any>, fields:any) {
    let data:any = await this.api.read("lodging\\sale\\booking\\BookingLine",
                                      ids,
                                      fields
                                      );
    return data;
  }

  private dateRangeUpdate() {
    let start = this.vm.daterange.start.formControl.value;
    let end = this.vm.daterange.end.formControl.value;
    if(start && end) {
      let diff = Math.floor((Date.parse(end.toString()) - Date.parse(start.toString())) / (60*60*24*1000));
      this.vm.daterange.nights_count = (diff < 0)?0:diff;
    }
  }

  private nbPersChange() {
    console.log('BookingEditCustomerComponent::nbPersChange');
    // relay change to parent component
    this.groupOutput.next({id: this.group.id, nb_pers: this.vm.participants_count.value, refresh: { self: ['price', 'booking_lines_ids'], booking_id: ['price'] }});
  }

  private nameChange() {
    console.log('BookingEditCustomerComponent::nameChange');
    // relay change to parent component
    this.groupOutput.next({id: this.group.id, name: this.vm.name.value})
  }

  private dateRangeChange() {
    console.log('BookingEditCustomerComponent::dateRangeChange');
    // relay change to parent component
    this.groupOutput.next({id: this.group.id, date_from: this.vm.daterange.start.formControl.value, date_to: this.vm.daterange.end.formControl.value})
  }

  private packChange(target:string, value:any) {
    console.log('BookingEditCustomerComponent::packChange', value)

    switch(target) {
      case 'name':
        let pack = value;
        this.pack = pack;
        this.vm.pack.name = pack.name;
        // relay change to parent component
        this.groupOutput.next({id: this.group.id, pack_id: pack.id})
        break;
      case 'has_pack':
        this.vm.pack.has_pack = value;
        if(value === false) {
          this.pack = null;
          this.vm.pack.name = '';
        }
        // relay change to parent component
        this.groupOutput.next({id: this.group.id, has_pack: value})
        break;        
      case 'is_locked':
        this.vm.pack.is_locked = value;
        // relay change to parent component
        this.groupOutput.next({id: this.group.id, is_locked: value})
        break;
    }
  }

  private packInputChange(event:any) {
    this.vm.pack.inputClue.next(event.target.value);
  }

  private packFocus() {
    this.vm.pack.inputClue.next("");
  }

  private packDisplay(pack:any): string {
    return pack ? pack.name: '';
  }

  private packReset() {
    setTimeout( () => {
      this.vm.pack.name = '';
    }, 100);
  }

  private packRestore() {
    if(this.pack) {
      this.vm.pack.name = this.pack.name;
    }
    else {
      this.vm.pack.name = '';
    }
  }



  private sojournTypeChange(event:any) {
    this.vm.sojourn_type.value = event.value;
    // relay change to parent component
    this.groupOutput.next({id: this.group.id, sojourn_type: this.vm.sojourn_type.value, refresh: { self: ['price', 'booking_lines_ids'], booking_id: ['price'] }});
  }

  private rateClassChange(event:any) {
    console.log('BookingEditCustomerComponent::rateClassChange', event)

    // from mat-autocomplete
    if(event && event.option && event.option.value) {
      let rate_class = event.option.value;
      this.rate_class = rate_class;
      this.vm.rate_class.name = rate_class.name + ' - ' + rate_class.description;
      // relay change to parent component
      // this.bookingOutput.next({type_id: type.id});
      this.groupOutput.next({id: this.group.id, rate_class_id: rate_class.id, refresh: { self: ['price', 'booking_lines_ids'], booking_id: ['price'] }});
    }

  }

  private rateClassInputChange(event:any) {
    this.vm.rate_class.inputClue.next(event.target.value);
  }

  private rateClassFocus() {
    this.vm.rate_class.inputClue.next("");
  }

  private rateClassDisplay(rate_class:any): string {
    return rate_class ? (rate_class.name + ' - ' + rate_class.description): '';
  }

  private rateClassReset() {
    setTimeout( () => {
      this.vm.rate_class.name = '';
    }, 100);
  }

  private rateClassRestore() {
    if(this.rate_class) {
      this.vm.rate_class.name = this.rate_class.name + ' - ' + this.rate_class.description;
    }
    else {
      this.vm.rate_class.name = '';
    }
  }

  private async filterPacks(name: string) {
/*
#todo - limit packages to the ones available for currently selected center
$families_ids = center.product_families_ids
$products = sale\catalog\Product::search(['family_id', 'in', $families_ids])
*/
    let filtered:any[] = [];
    try {

      let domain = [
        ["name", "ilike", '%'+name+'%'],
        ["is_pack", "=", "true"],
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

  private async filterRateClasses(name: string) {
    let filtered:any[] = [];
    try {
      let data:any[] = await this.api.collect("sale\\customer\\RateClass", [["name", "ilike", '%'+name+'%']], ["id", "name", "description"], 'name', 'asc', 0, 25);
      filtered = data;
    }
    catch(response) {
      console.log(response);
    }
    return filtered;
  }

  private async lineAdd() {
    try {
      const line = await this.api.create("lodging\\sale\\booking\\BookingLine", {
        order: this.lines.length + 1,
        booking_id: this.group.booking_id,
        booking_line_group_id: this.group.id
      });

      // emit change to parent
      this.groupOutput.next({id: this.group.id, booking_lines_ids: [line.id]});
    }
    catch(error) {
      console.log(error);
    }
  }

  /**
   * Emit change to parent for partial update.
   * @param line 
   */
  private async lineRemove(line: any) {
    this.groupOutput.next({id: this.group.id, booking_lines_ids: [-line.id], refresh: {self: ['price'], booking_id: ['price']}});    
  }

  private lineDrop(event:CdkDragDrop<any>) {
    moveItemInArray(this.lines, event.previousIndex, event.currentIndex);
    moveItemInArray(this._lineOutput, event.previousIndex, event.currentIndex);

    // adapt new values for 'order' field
    for(let index in this.lines) {
      let item = this.lines[index];
      this.updateFromLine({id: item.id, order: parseInt(index) + 1});
    }

  }

  private async updateProduct(line:any) {
    await this.api.update("lodging\\sale\\booking\\BookingLine", [line.id], <any>{"product_id": line.product_id});
  }

  private async updateQuantity(line:any) {
    await this.api.update("lodging\\sale\\booking\\BookingLine", [line.id], <any>{"qty": line.qty});
  }

  private async updateUnitPrice(line:any) {
    await this.api.update("lodging\\sale\\booking\\BookingLine", [line.id], <any>{"unit_price": line.unit_price});
  }

  private async updateVatRate(line:any) {
    await this.api.update("lodging\\sale\\booking\\BookingLine", [line.id], <any>{"vat_rate": line.vat_rate});
  }

  private async updateRentalUnit(line:any) {
    await this.api.update("lodging\\sale\\booking\\BookingLine", [line.id], <any>{"rental_unit_id": line.rental_unit_id});
  }
  
  private async updateQtyVars(line:any) {
    await this.api.update("lodging\\sale\\booking\\BookingLine", [line.id], <any>{"qty_vars": line.qty_vars});
  }

}