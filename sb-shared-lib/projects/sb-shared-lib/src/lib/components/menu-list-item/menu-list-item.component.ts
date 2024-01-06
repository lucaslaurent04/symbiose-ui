import { ReplaySubject, Subject } from 'rxjs';
import { Injectable, Component, EventEmitter, Output, Input, OnInit, OnDestroy } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-menu-list-item',
    templateUrl: './menu-list-item.component.html',
    styleUrls: ['./menu-list-item.component.scss'],
    animations: [
        trigger('indicatorRotate', [
                state('collapsed', style({transform: 'rotate(-90deg)'})),
                state('expanded', style({transform: 'rotate(90deg)'})),
                transition('expanded <=> collapsed',
                    animate('225ms cubic-bezier(0.4,0.0,0.2,1)')
                )
            ])
    ]
})
export class MenuListItemComponent implements OnInit, OnDestroy {
    @Input() item: any = {};
    @Input() depth: number;
    @Input() i18n: any;
    @Output() select = new EventEmitter<any>();
    @Output() toggle = new EventEmitter<any>();

    private ngUnsubscribe = new Subject<void>();

    constructor(private menu:MenuService) {
        if (this.depth === undefined) {
            this.depth = 0;
        }
    }

    ngOnInit() {
        this.menu.getObservable()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe( (item:any) => {
                this.item.selected = (item.id === this.item.id);
            });
    }

    ngOnDestroy() {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    public onItemToggle(item: any) {
        console.debug('MenuListItemComponent::onItemToggle', item);
        // if item is expanded, fold siblings, if any
        if(item.expanded) {
            // make sure item is visible
            item.hidden = false;
            if(this.item.children) {
                for(let child of this.item.children) {
                    if(item != child) {
                        child.hidden = true;
                        child.expanded = false;
                    }
                }
            }
            // and that children are visible but not expanded
            if(item.children) {
                for(let child of item.children) {
                    child.hidden = false;
                    child.expanded = false;
                }
            }
        }
        // if item is folded, make sure all sibling are visible
        else {
            if(this.item.children) {
                for(let child of this.item.children) {
                    child.hidden = false;
                    if(child.children) {
                        for(let subitem of child.children) {
                            subitem.expanded = false;
                            subitem.hidden = true;
                        }
                    }
                }
            }
        }
    }

    public onclickParentItem(item: any) {
        // relay selection
        this.onItemSelect(item);

        let is_child_open = false;
        for(let child of item.children) {
            if(child.expanded) {
                is_child_open = true;
            }
        }
        if(!is_child_open) {
            item.expanded = !item.expanded;
            this.toggle.emit(item);
        }
        else {
            this.onItemToggle(item);
        }
    }

    public onclickChildItem(item: any) {
        // relay selection
        this.onItemSelect(item);
        // mark item as selected and unselect all others
        this.menu.selectItem(item);
    }

    public onItemSelect(item: any) {
        // relay selection
        this.select.emit(item);
    }

}

/**
 * MenuService offers a getObservable() method allowing to access an Observable that any component can subscribe to.
 * Subscribers will always receive the latest emitted value as a menu item object.
 *
 */
@Injectable({
  providedIn: 'root'
})
export class MenuService {

    private observable: ReplaySubject<any>;

    /**
     * Provide observable for subscribing on item selections and expansions.
     * #memo - New subscribers will receive latest value set (history depth of 1).
     */
    public getObservable() {
        return this.observable;
    }

    constructor() {
        this.observable = new ReplaySubject<any>(1);
    }

    /**
     * Handle the selection of a menu item.
     * This method is made to propagate the change amongst the whole menu.
     */
    public async selectItem(item: any) {
        this.observable.next(item);
    }

}
