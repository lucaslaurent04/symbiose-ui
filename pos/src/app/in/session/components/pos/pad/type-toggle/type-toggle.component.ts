import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-type-toggle',
  templateUrl: './type-toggle.component.html',
  styleUrls: ['./type-toggle.component.scss']
})
export class TypeToggleComponent implements OnInit {

    @Output() newItemEvent = new EventEmitter();
    @Output() newOnBackspace = new EventEmitter();

    public value = "qty";

    constructor() { }

    onSelectionChange(value: string) {
        this.newItemEvent.emit(value);
    }

    onKeypress(value: string) {
        this.newOnBackspace.emit(value);
    }

    ngOnInit(): void {
    }

    onDelete() {
    }
}
