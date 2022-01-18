import { transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, ChangeDetectorRef, OnInit, NgZone, Input, SimpleChanges, OnChanges } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ApiService, ContextService } from 'sb-shared-lib';

class Composition {
  constructor(
    public id: number = 0,
    public booking_id: number = 0
  ){}
}

class CompositionItem {
  constructor(
    public id: number = 0,
    public firstname: string = '',
    public lastname: string = '',
    public gender: string = '',
    public date_of_birth: string = '',
    public place_of_birth: string = '',
    public email: string = '',
    public phone: string = '',
    public address: string = '',
    public country: string = '',
    public rental_unit_id: string = ''    
  ) {}
}

class RentalUnit {
  constructor(
    public id: number = 0,
    public name: string = '',
    public code: string = '',
    public capacity: number = 0
  ) {}
}

@Component({
  selector: 'booking-composition-lines',
  templateUrl: './booking.composition.lines.component.html',
  styleUrls: ['./booking.composition.lines.component.scss']
})
export class BookingCompositionLinesComponent implements OnInit, OnChanges {

  @Input() composition_id: number;

  private composition: Composition = new Composition();

  // map of rental_unit_id mapping related composition items
  public composition_items: any = {};

  public rental_units: Array<RentalUnit> = [];

  public selection:any = [];
  public dragging: boolean = false;

  constructor(
    private api: ApiService, 
    private cd: ChangeDetectorRef, 
    private context:ContextService,
    private zone: NgZone,
    private snack:MatSnackBar
  ) {}

  ngOnInit() {

  }

  async ngOnChanges(changes: SimpleChanges) {
    if(changes.composition_id) {

      try {

        // reset view
        this.composition_items = {};
        this.rental_units = [];

        const compositions = await this.api.read("sale\\booking\\Composition", 
          [this.composition_id], 
          Object.getOwnPropertyNames( new Composition() )
        );

        if(compositions.length) {
          this.composition = compositions[0];

          {
            const data = await this.load( Object.getOwnPropertyNames( new CompositionItem() ) );

            for(let item of data) {
              if(!this.composition_items.hasOwnProperty(item['rental_unit_id'])) {
                this.composition_items[item['rental_unit_id']] = [];  
              }
              this.composition_items[item['rental_unit_id']].push(item);
            }
          }

          {
            const data = await this.api.read("lodging\\realestate\\RentalUnit", 
              Object.keys(this.composition_items),
              Object.getOwnPropertyNames( new RentalUnit() ) 
            );

            this.rental_units = data;
          }

        }
      }
      catch(error) {
        console.warn(error);
        this.snack.open('Erreur inconnue', 'Erreur');
      }
      
    }
  }

  public onToggle(event: any, item: any) {
    console.log('selecting', event, item);
    if(!item.hasOwnProperty('selected')) {
      item.selected = false;  
    }
    
    let rental_unit_id = item.rental_unit_id;

    if(item.selected) {
      item.selected = false;
    }
    else {      
      // unselect items from other containers
      for(let r_id of Object.keys(this.composition_items)) {
        if(r_id != rental_unit_id) {
          for(let i in this.composition_items[r_id]) {
            this.composition_items[r_id][i].selected = false;
          }
        }
      }
      item.selected = true;  
    }
    // update current selection
    this.selection = this.composition_items[rental_unit_id].filter( (item:any) => item.selected );

    console.log(this.selection);
  }

  public onDragStart(event: any) {
    this.dragging = true;
  }

  public onDrop(event: any) {
    if (event.previousContainer != event.container) {
      console.log('from', event.previousContainer.data, 'to', event.container.data);

      let current_index = event.currentIndex;
      let target_rental_unit_id = event.container.data;
      let source_rental_unit_id = event.previousContainer.data;

      console.log("nb items", this.selection.length);

      let target_index = this.rental_units.findIndex((a) => a.id == target_rental_unit_id);
      let source_index = this.rental_units.findIndex((a) => a.id == source_rental_unit_id);

      let target_rental_unit = this.rental_units[target_index];
      let source_rental_unit = this.rental_units[source_index];

      if(target_rental_unit.capacity < this.composition_items[target_rental_unit_id].length + this.selection.length) {
        for(let item of this.selection) {
          item.selected = false;      
        }
        // reset selection
        this.selection = []; 
        this.snack.open('Dépassement de la capacité de destination', 'Erreur');
      }

      for(let item of this.selection) {
        let previous_index = this.composition_items[source_rental_unit_id].findIndex( (a:any) => a.id == item.id );
        // move item
        transferArrayItem(
          this.composition_items[source_rental_unit_id],
          this.composition_items[target_rental_unit_id],
          previous_index,
          current_index
        );
        ++current_index; 
        // update item
        item.rental_unit_id = target_rental_unit_id;
        item.selected = false;      
      }
      // reset selection
      this.selection = [];
    }
    this.dragging = false;

  }

  public onOpenRentalUnit(rental_unit_id: number) {

    let descriptor = {
      context: {
        entity:     'lodging\\realestate\\RentalUnit',
        type:       'form',
        name:       'default',
        domain:     ['id', '=', rental_unit_id],
        mode:       'view',
        purpose:    'view',
        target:     '#sb-composition-container',
        callback:   (data:any) => {
          if(data && data.objects && data.objects.length) {
            // received data
          }
        }
      }
    };

    // will trigger #sb-composition-container.on('_open')
    this.context.change(descriptor);
  }

  public onOpenCompositionItem(item_id: number) {

    let descriptor = {
      context: {
        entity:     'sale\\booking\\CompositionItem',
        type:       'form',
        name:       'default',
        domain:     ['id', '=', item_id],
        mode:       'edit',
        purpose:    'view',
        target:     '#sb-composition-container',
        callback:   (data:any) => {
          if(data && data.objects && data.objects.length) {
            // received data
          }
        }
      }
    };

    // will trigger #sb-composition-container.on('_open')
    this.context.change(descriptor);
  }

  private async load(fields: any[]) {
    const result = await this.api.collect("sale\\booking\\CompositionItem", [
        'composition_id', '=', this.composition.id
      ], 
      fields,
      'id','asc',
      0, 500
    );    
    return result;
  }

}