import { Component, OnInit, AfterViewInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ContextService } from 'sb-shared-lib';


@Component({
  selector: 'model',
  templateUrl: 'model.component.html',
  styleUrls: ['model.component.scss']
})
export class ModelComponent implements OnInit, AfterViewInit, OnDestroy {
    @HostListener('unloaded')
    ngOnDestroy() {
        console.log('ModelComponent::ngOnDestroy');
        this.active = false;
    }

    public ready: boolean = false;

    // flag telling if the route to which the component is associated with is currently active (amongst routes defined in first parent routing module)
    private active = false;

    constructor(
        private route: ActivatedRoute,
        private context: ContextService
    ) {}


    public ngAfterViewInit() {
        console.log('ModelComponent::ngAfterViewInit');
        this.active = true;
    }

    public ngOnInit() {
        console.log('ModelComponent::ngOnInit');

        this.context.ready.subscribe( (ready:boolean) => {
            console.log('ModelComponent:: received context ready', ready);
            this.ready = ready;
        });

    }

}