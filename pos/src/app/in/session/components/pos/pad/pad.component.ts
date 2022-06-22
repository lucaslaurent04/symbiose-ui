import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
    selector: 'app-pad',
    templateUrl: './pad.component.html',
    styleUrls: ['./pad.component.scss']
})
export class PadComponent implements OnInit {
    @Output() newItemEvent = new EventEmitter();
    @Output() keyPressed = new EventEmitter();

    constructor() { }
    
    public element = '';
    public numberPassed = 0;
    public mouseUp: any;
    public mouseDown: any;
    
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
