import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'pos-pad-generic',
    templateUrl: './generic.component.html',
    styleUrls: ['./generic.component.scss']
})
export class PosPadGenericComponent implements OnInit {
    @Output() newItemEvent = new EventEmitter();
    @Output() keyPressed = new EventEmitter();
    @Input() disabled_key: any; 

    constructor(private router: Router) { }
    
    public element = '';
    public numberPassed = 0;
    public mouseUp: any;
    public mouseDown: any;
    public good_route: boolean = true;
    public operator: string = '+';


    ngOnInit(): void {
        
    }

    checkActionType(event: any) {
        this.newItemEvent.emit(event);
    }

    onKeypress(value: any) {
        this.numberPassed = value;
        this.keyPressed.emit(value);
    }

    onDoubleClick() {
        if (this.operator == '+') {
            this.operator = '-'
        } else {
            this.operator = '+';
        }
    }
}
