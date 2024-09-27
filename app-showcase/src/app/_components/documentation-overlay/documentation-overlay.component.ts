import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Documentation } from '../../_types/showcaseType';

@Component({
    selector: 'app-documentation-overlay',
    templateUrl: './documentation-overlay.component.html',
    styleUrls: ['./documentation-overlay.component.scss'],
})
export class DocumentationOverlayComponent implements OnInit {
    @Input() public documentation: Documentation;
    @Input() public isOpen = false;
    @Output() public isOpenChange = new EventEmitter<boolean>();

    constructor() {}

    public onClose(): void {
        this.isOpen = false;
        this.isOpenChange.emit(false);
    }

    get documentationKeys(): string[] {
        return Object.keys(this.documentation);
    }

    public renderCamelCaseToLiteral(text: string): string {
        return text.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    }

    public componentPropertyDescription(description: string | (() => string)): string {
        return typeof description === 'function' ? description() : description;
    }

    ngOnInit(): void {}
}
