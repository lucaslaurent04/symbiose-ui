import {
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnInit,
    Output,
    ViewChild,
    DoCheck
} from '@angular/core';
import {FormControl, ValidatorFn, Validators} from '@angular/forms';

@Component({
    selector: 'eq-string',
    templateUrl: './eq-string.component.html',
    styleUrls: ['./eq-string.component.scss']
})
export class EqStringComponent implements OnInit, DoCheck {
    @Output() valueChange: EventEmitter<string | null> = new EventEmitter<string | null>();

    @Input() value: string | null;

    @Input() placeholder: string = '';

    // used for forcing the component as disabled
    @Input() disabled: boolean = false;

    @Input() required: boolean = false;

    @Input() nullable: boolean = false;

    @Input() hint_always: boolean = false;

    @Input() mode: 'view' | 'edit' = 'view';

    @Input() title?: string;

    @Input() hint: string = '';

    @Input() size?: 'small' | 'normal' | 'large' | 'extra' = 'normal';

    @Input() error?: string;

    @ViewChild('eqString') eqString: ElementRef<HTMLDivElement>;
    @ViewChild('input') input: ElementRef<HTMLInputElement>;

    // flag for marking the input as being edited
    public is_active: boolean = false;

    public formControl: FormControl;

    public is_null: boolean = false;

    ngOnInit(): void {
        this.initFormControl();
        this.initNullableValue();
    }

    ngDoCheck(): void {
        if (this.mode === 'view' || this.disabled) {
            this.formControl.disable();
        }

        if (this.mode === 'edit' && !this.disabled) {
            // Angular does not detect changes on disabled form controls
            this.formControl.markAsTouched({onlySelf: true});

            this.formControl.enable();
        }
    }

    public initNullableValue(): void {
        if (this.value === null || this.value === '[null]') {
            this.toggleIsNull(true);
        }
    }

    public initFormControl(): void {
        this.formControl = new FormControl(this.value);
        const validators: ValidatorFn[] = [];

        if (this.required) {
            validators.push(Validators.required);
        }

        if (!this.nullable) {
            validators.push(Validators.minLength(1));
        }

        this.formControl.setValidators(validators);
    }

    public getErrorMessage(): string {
        if (this.error) {
            return this.error;
        }
        return '';
    }

    private updateValue(value: string | null): void {
        if (value === null) {
            this.is_null = true;
            this.formControl.setValue('[null]');
        }
        else {
            this.is_null = false;
            this.formControl.setValue(value);
        }
    }

    public onClear(event: MouseEvent): void {
        event.stopImmediatePropagation();
        event.preventDefault();
        this.updateValue('');
        this.formControl.markAsPending({onlySelf: true});
    }

    public activate(): void {
        if (this.mode === 'edit' && !this.disabled) {
            this.toggleActive(true);
            this.input.nativeElement.focus();
        }
    }

    public onCancel(event: MouseEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.toggleIsNull(false);
        this.updateValue(this.value);
        this.toggleActive(false);
    }

    public onSave(event: MouseEvent): void {
        event.preventDefault();
        event.stopPropagation();
        if (this.is_null) {
            this.valueChange.emit(null);
        }
        else if (this.formControl.valid) {
            this.valueChange.emit(this.formControl.value);
        }
        this.toggleActive(false);
    }

    public onBlur(event: FocusEvent): void {
        event.preventDefault();
        // we need to discard current instance because onblur event occurs before onSave
        if (
            this.eqString.nativeElement instanceof Element &&
            !this.eqString.nativeElement.contains(event.relatedTarget as Node)
        ) {
            this.toggleIsNull(false);
            this.updateValue(this.value);
            this.toggleActive(false);
        }
    }

    private toggleActive(editable: boolean): void {
        this.is_active = editable;
        if (this.mode === 'edit' && editable) {
            this.input.nativeElement.focus();
        }
    }

    public toggleIsNull(is_null: boolean): void {
        this.is_null = is_null;
        if (this.is_null) {
            this.updateValue(null);
        }
        else {
            this.updateValue('');
        }
    }
}
