import {
    AfterViewChecked,
    ChangeDetectorRef,
    Component, DoCheck,
    ElementRef,
    EventEmitter,
    Input,
    OnInit,
    Output,
    ViewChild
} from '@angular/core';
import {FormControl, ValidatorFn, Validators} from '@angular/forms';

type size = 'small' | 'normal' | 'large' | 'extra';

@Component({
    selector: 'eq-text',
    templateUrl: './eq-text.component.html',
    styleUrls: ['./eq-text.component.scss'],
})
export class EqTextComponent implements OnInit, DoCheck, AfterViewChecked {
    @Output() valueChange: EventEmitter<string | null> = new EventEmitter<string | null>();

    @Input() value: string | null;

    @Input() placeholder: string = '';

    // used for forcing the component as disabled
    @Input() disabled: boolean = false;

    @Input() required: boolean = false;

    @Input() nullable: boolean = false;

    @Input() mode: 'view' | 'edit' = 'view';

    @Input() title?: string;

    @Input() hint: string = '';


    @Input() size: size = 'normal';

    @Input() error?: string;
    @Input() hasError: boolean = false;

    @Input() minHeight: number;

    @Input() maxHeight?: number;

    @Input() autoGrow: boolean = false;

    @ViewChild('eqText') eqText: ElementRef<HTMLDivElement>;
    @ViewChild('textarea') textarea: ElementRef<HTMLTextAreaElement>;

    // used for marking the textarea as being edited
    public is_active: boolean = false;

    public formControl: FormControl;

    public is_null: boolean = false;

    // // * For two lines of text if minHeight is not set
    // public textMinHeightSizing: Record<size, number> = {
    //   small: 35,
    //   normal: 40,
    //   large: 49,
    //   extra: 58
    // };

    // ! Do i need to add padding bottom to the view mode for equal the height of the mode edit ?
    public paddingBottomModeView: number = 66.83;

    constructor(
        private changeDetector: ChangeDetectorRef,
        private elementRef: ElementRef,
    ) {
    }

    ngAfterViewChecked(): void {
        if (this.mode == 'edit') {
            if(this.textarea.nativeElement instanceof HTMLTextAreaElement) {
                this.textarea.nativeElement.style.minHeight = this.minHeight + 'px';

                if (this.maxHeight) {
                    this.textarea.nativeElement.style.maxHeight = this.maxHeight + 'px';
                }

                if (this.autoGrow && !this.maxHeight) {
                }
                else if (this.autoGrow && this.maxHeight) {
                    if (this.textarea.nativeElement.clientHeight < this.maxHeight) {
                    }
                }
            }
        }
        else {
            if(this.minHeight) {
                this.elementRef.nativeElement.style.setProperty('--min-height', this.minHeight+'px');
            }
            if(this.maxHeight) {
                this.elementRef.nativeElement.style.setProperty('--max-height', this.maxHeight+'px');
            }
            else {
                this.elementRef.nativeElement.style.setProperty('--max-height', 'none');
            }
        }
    }

    ngOnInit(): void {
        this.initFormControl();
    }

    ngDoCheck(): void {
        this.setFormControlState();
    }

    private setFormControlState(): void {
        if (this.mode === 'view' || this.disabled) {
            this.formControl.disable();
        }

        if (this.mode === 'edit' && !this.disabled) {
            this.formControl.enable();
        }

    }

    private setFormControlToError(): void {
        if (this.hasError && !this.formControl.dirty) {
            this.formControl.setErrors({invalid: true});
            this.formControl.markAsTouched({onlySelf: true});
            this.formControl.markAsDirty({onlySelf: true});
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
        if (this.error && this.formControl.invalid) {
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
        this.textarea.nativeElement.focus();
    }

    public activate(): void {
        if (this.mode === 'edit' && !this.disabled) {
            this.toggleActive(true);
            this.textarea.nativeElement.focus();
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
        if( this.eqText.nativeElement instanceof Element &&
            !this.eqText.nativeElement.contains(event.relatedTarget as Node) ) {
            this.toggleIsNull(false);
            this.updateValue(this.value);
            this.toggleActive(false);
        }
    }

    private toggleActive(editable: boolean): void {
        this.is_active = editable;
        if (this.mode == 'edit' && editable) {
            this.textarea.nativeElement.focus();
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
