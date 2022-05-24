import { Component, OnInit, OnChanges, Output, Input, EventEmitter, SimpleChanges, SimpleChange } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

import { Observable, ReplaySubject } from 'rxjs';
import { map, mergeMap, debounceTime } from 'rxjs/operators';

import { ApiService } from '../../services/api.service';

@Component({
  selector: 'sb-m2o-select',
  templateUrl: './sb-m2o-select.component.html',
  styleUrls: ['./sb-m2o-select.component.scss']
})
export class SbMany2OneSelectComponent implements OnInit, OnChanges {
    @Input() entity: string = '';
    @Input() id: number = 0;
    @Input() domain?: [] = [];
    @Input() required?: boolean = false;
    @Input() placeholder?: string = '';
    @Input() hint?: string = '';
    @Input() noResult?: string = '';
    @Input() disabled?: boolean = false;

    @Output() itemSelected:EventEmitter<number> = new EventEmitter<number>();

    // currently selected item
    public item: any = null;

    public inputFormControl: FormControl;
    public resultList: Observable<any>;

    private inputQuery: ReplaySubject<any>;

    constructor(private api: ApiService) { 
        this.inputFormControl = new FormControl();
        this.inputQuery = new ReplaySubject(1);        
    }


    ngOnInit(): void {

        // watch changes made on input
        this.inputFormControl.valueChanges.subscribe( (value:string)  => {
            if(!this.item || this.item != value) {
                this.inputQuery.next(value);
            }
        });

        // update autocomplete result list
        this.resultList = this.inputQuery.pipe(
            debounceTime(300),
            map( (value:any) => (typeof value === 'string' ? value : ( (value == null)?'':value.name ) )),
            mergeMap( async (name:string) => await this.filterResults(name) )
        );

    }

  /**
   * Update component based on changes received from parent.
   *
   * @param changes
   */
    ngOnChanges(changes: SimpleChanges) {
        let has_changed = false;

        const currentId: SimpleChange = changes.id;
        const currentEntity: SimpleChange = changes.entity;

        if(changes.required) {
            if(this.required) {
                this.inputFormControl.setValidators([Validators.required]);
                this.inputFormControl.markAsTouched();
            }
            this.inputFormControl.updateValueAndValidity();
        }

        if(currentId && currentId.currentValue && currentId.currentValue != currentId.previousValue) {
            has_changed = true;
        }

        if(currentEntity && currentEntity.currentValue && currentEntity.currentValue != currentEntity.previousValue) {
            has_changed = true;
        }

        if(has_changed) {
            this.load();
        }
    }


  /**
   * Load initial values, based on inputs assigned by parent component.
   *
   */
    private async load() {
        if(this.id && this.id > 0 && this.entity && this.entity.length) {
            try {
                const result:Array<any> = <Array<any>> await this.api.read(this.entity, [this.id], ['id', 'name']);
                if(result && result.length) {
                    this.item = result[0];
                    this.inputFormControl.setValue(this.item);
                }
            }
            catch(error:any) {

            }
        }
    }


    private async filterResults(name: string) {
        let filtered:any[] = [];
        if(this.entity.length && (!this.item || this.item.name != name) ) {
            try {
                let data:any[] = await this.api.collect(this.entity, [["name", "ilike", '%'+name+'%']], ["id", "name"], 'name', 'asc', 0, 25);
                filtered = data;
            }
            catch(error:any) {
                console.log(error);
            }
        }
        return filtered;
    }


    public itemDisplay = (item:any): string => {
        if(item != this.item) return '';
        return (item)?item.name:'';
    }

    public onChange(event:any) {
        if(event && event.option && event.option.value) {
            this.item = event.option.value;
            this.inputFormControl.setValue(this.item);
            this.itemSelected.emit(this.item);
        }
    }

    public onFocus() {
        /* this.inputFormControl.setValue(''); */
    }

    public onReset() {
        this.inputFormControl.setValue(null);
    }

    public onRestore() {
        if(this.item) {
            this.inputFormControl.setValue(this.item);
        }
        else {
            this.inputFormControl.setValue(null);
        }
    }

}