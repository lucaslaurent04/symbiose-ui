import {
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
    ViewChild
} from '@angular/core';
import {FormControl, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {DateRange, MatDateRangeInput} from '@angular/material/datepicker';

type dateUsage = 'date.short.day' | 'date.short' | 'date.medium' | 'date.long' | 'date.full';

@Component({
    selector: 'eq-date-range',
    templateUrl: './eq-date-range.component.html',
    styleUrls: ['./eq-date-range.component.scss']
})
export class EqDateRangeComponent implements OnInit, OnChanges {

    @Output() valueChange: EventEmitter<string | null> = new EventEmitter<string | null>();

    @Input() value: string | null;

    public formGroup: FormGroup;

    @Input() placeholder: string = '';

    // used for forcing the component as disabled
    @Input() disabled: boolean = false;

    @Input() required: boolean = false;

    @Input() nullable: boolean = false;

    @Input() mode: 'view' | 'edit' = 'view';

    @Input() title?: string;

    @Input() hint: string = '';

    @Input() size?: 'small' | 'normal' | 'large' | 'extra' = 'normal';

    @Input() error?: string;

    @Input() usage: string | dateUsage;

    // used for marking the input as being edited
    public is_active: boolean = false;

    public is_null: boolean = false;

    @ViewChild('eqDateRange') eqDateRange: ElementRef<HTMLDivElement>;
    @ViewChild('inputRange') inputRange: MatDateRangeInput<string>;
    @ViewChild('inputStart') inputStart: ElementRef<HTMLInputElement>;
    @ViewChild('inputEnd') inputEnd: ElementRef<HTMLInputElement>;

    get inputStartValue(): string | null {
        if (this.inputRange && this.inputRange.value instanceof DateRange) {
            const inputsValue: string | null = this.inputRange.value.start;
            if (inputsValue) {
                const date: string = new Date(inputsValue).toLocaleDateString();
                if (date) {
                    return date;
                }
            }
        }

        return null;
    }

    get inputEndValue(): string | null {
        if (this.inputRange && this.inputRange.value instanceof DateRange) {
            const inputsValue: string | null = this.inputRange.value.end;
            if (inputsValue) {
                const date: string = new Date(inputsValue).toLocaleDateString();
                if (date) {
                    return date;
                }
            }
        }

        return null;
    }

    public inputsComputedValue = (): string | null => {
        if (this.inputStartValue && this.inputEndValue) {
            return `${this.inputStartValue} - ${this.inputEndValue}`;
        }

        return null;
    }

    constructor(
        private changeDetectorRef: ChangeDetectorRef,
    ) {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.hasOwnProperty('mode') && !changes.mode.firstChange && this.value === null) {
            this.updateValue(null, null);
        }
    }

    ngOnInit(): void {
        this.initFormGroup();
    }

    private splitDateRange = (dateRange: string): string[] => dateRange.split(' - ');

    public initFormGroup(): void {
        if (this.value !== null) {
            const [dateStart, dateEnd] = this.splitDateRange(this.value);

            this.formGroup = new FormGroup({
                start: new FormControl(''),
                end: new FormControl('')
            });

            if (this.checkDateValidity(dateStart) && this.checkDateValidity(dateEnd)) {
                this.formGroup.setValue({
                    start: this.convertToUTC(new Date(dateStart)),
                    end: this.convertToUTC(new Date(dateEnd))
                });
            }
        }

        else if (this.nullable && [null, '[null]'].includes(this.value)) {
            this.updateValue(null, null);
        }

        else {
            this.formGroup.setValue({
                start: '',
                end: ''
            });
        }

        this.changeDetectorRef.detectChanges();

        const validators: ValidatorFn[] = [];

        if (this.required) {
            validators.push(Validators.required);
        }

        if (!this.nullable) {
            validators.push(
                Validators.minLength(10),
                Validators.maxLength(10)
            );
        }

        this.formGroup.setValidators(validators);
    }

    public activate(): void {
        if (this.mode === 'edit' && !this.disabled) {
            this.toggleActive(true);
        }
    }

    private toggleActive(editable: boolean): void {
        this.is_active = editable;
        this.changeDetectorRef.detectChanges();
        if (editable && this.inputRange) {
            this.inputRange._startInput.focus();
        }
    }

    public toggleIsNull(is_null: boolean): void {
        this.is_null = is_null;
        if (this.is_null) {
            this.updateValue(null, null);
        }
        else {
            this.updateValue('', '');
            this.formGroup.enable();
        }
        this.changeDetectorRef.detectChanges();
    }

    private updateValue(valueStart: string | null, valueEnd: string | null): void {
        if (
            valueStart === null &&
            valueEnd === null &&
            this.inputStart.nativeElement instanceof HTMLInputElement &&
            this.inputEnd.nativeElement instanceof HTMLInputElement
        ) {
            this.is_null = true;
            this.formGroup.setValue({
                start: '[null]',
                end: '[null]',
            });
            this.inputStart.nativeElement.value = '[null]';
            this.inputEnd.nativeElement.value = '[null]';
            this.formGroup.markAsUntouched({onlySelf: true});
        }
        else {
            this.is_null = false;
            if (
                (valueStart && new Date(valueStart).toString() !== 'Invalid Date') &&
                (valueEnd && new Date(valueEnd).toString() !== 'Invalid Date')
            ) {
                const UTZDateStart: Date = new Date(valueStart);
                const UTCDateStart: Date = new Date(UTZDateStart.getUTCFullYear(), UTZDateStart.getUTCMonth(), UTZDateStart.getUTCDate());

                const UTZDateEnd: Date = new Date(valueEnd);
                const UTCDateEnd: Date = new Date(UTZDateEnd.getUTCFullYear(), UTZDateEnd.getUTCMonth(), UTZDateEnd.getUTCDate());
                this.formGroup.setValue({
                    start: UTCDateStart,
                    end: UTCDateEnd
                });
            }
            else {
                this.formGroup.setValue({
                    start: '',
                    end: '',
                });
            }
        }
    }

    public onBlur(event: FocusEvent): void {
        event.preventDefault();
        // we need to discard current instance because onblur event occurs before onSave
        if (
            this.eqDateRange.nativeElement instanceof Element &&
            !this.eqDateRange.nativeElement.contains(event.relatedTarget as Node)
        ) {
            this.toggleIsNull(false);
            if (![null, '[null]', ''].includes(this.value)) {
                const [dateStart, dateEnd] = this.splitDateRange(this.value as string);
                this.updateValue(dateStart, dateEnd);
            }
            this.toggleActive(false);
        }
    }

    public onCancel(event: MouseEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.toggleIsNull(false);
        if (this.value !== null) {
            const [dateStart, dateEnd] = this.splitDateRange(this.value);
            this.updateValue(dateStart, dateEnd);
        }
        this.toggleActive(false);
    }

    public onClear(event: MouseEvent): void {
        event.stopImmediatePropagation();
        event.preventDefault();
        this.updateValue('', '');
        this.formGroup.markAsPending({onlySelf: true});
        this.inputRange._startInput.focus();
    }

    public onSave(event: MouseEvent): void {
        event.preventDefault();
        event.stopPropagation();
        if (this.is_null) {
            this.valueChange.emit(null);
            this.formGroup.markAsUntouched({onlySelf: true});
            this.toggleActive(false);
        }
        else if (this.formGroup.valid || this.inputsComputedValue !== null) {
            const date: string = `${this.sanitizeDate(this.formGroup.value.start)} - ${this.sanitizeDate(this.formGroup.value.end)}`;
            this.valueChange.emit(date);
            this.toggleActive(false);
        }
    }

    public formatDate(dateValue: string): string {
        if (dateValue !== '[null]') {
            const dateNameDictionary: Record<string, string> = {
                'day.monday': 'lundi',
                'day.tuesday': 'mardi',
                'day.wednesday': 'mercredi',
                'day.thursday': 'jeudi',
                'day.friday': 'vendredi',
                'day.saturday': 'samedi',
                'day.sunday': 'dimanche',
                'day.monday.short': 'lun',
                'day.tuesday.short': 'mar',
                'day.wednesday.short': 'mer',
                'day.thursday.short': 'jeu',
                'day.friday.short': 'ven',
                'day.saturday.short': 'sam',
                'day.sunday.short': 'dim',
                'month.january': 'janvier',
                'month.february': 'février',
                'month.march': 'mars',
                'month.april': 'avril',
                'month.may': 'mai',
                'month.june': 'juin',
                'month.july': 'juillet',
                'month.august': 'aout',
                'month.september': 'septembre',
                'month.october': 'octobre',
                'month.november': 'novembre',
                'month.december': 'décembre',
                'month.january.short': 'jan',
                'month.february.short': 'fév',
                'month.march.short': 'mar',
                'month.april.short': 'avr',
                'month.may.short': 'mai',
                'month.june.short': 'juin',
                'month.july.short': 'juil',
                'month.august.short': 'aou',
                'month.september.short': 'sep',
                'month.october.short': 'oct',
                'month.november.short': 'nov',
                'month.december.short': 'déc'
            };

            const DateFormats: Record<dateUsage, string> = {
                'date.short.day': 'ddd DD/MM/YY',
                'date.short': 'DD/MM/YY',
                'date.medium': 'DD/MM/YYYY',
                'date.long': 'ddd DD MMM YYYY',
                'date.full': 'dddd DD MMMM YYYY',
            };

            const date: Date = new Date(this.sanitizeDate(dateValue));

            if (DateFormats.hasOwnProperty(this.usage as dateUsage)) {

                const format: string = DateFormats[this.usage as dateUsage];

                const name_month: string = date.toLocaleDateString('en-US', {month: 'long'});
                const name_day: string = date.toLocaleDateString('en-US', {weekday: 'long'});
                const index_day: number = date.getUTCDate();
                const index_month: number = date.getMonth() + 1;
                const index_year: number = date.getFullYear();

                return format
                    .replace('YYYY', index_year.toString().padStart(4, '0'))
                    .replace('YY', (index_year % 100).toString().padStart(2, '0'))
                    .replace('MMMM', dateNameDictionary['month.' + name_month.toLowerCase()])
                    .replace('MMM', dateNameDictionary['month.' + name_month.toLowerCase() + '.short'])
                    .replace('MM', index_month.toString().padStart(2, '0'))
                    .replace('DD', index_day.toString().padStart(2, '0'))
                    .replace('dddd', dateNameDictionary['day.' + name_day.toLowerCase()])
                    .replace('ddd', dateNameDictionary['day.' + name_day.toLowerCase() + '.short']);
            }
        }

        return '[null]';
    }

    public checkDateValidity(date: string): boolean {
        return !isNaN(Date.parse(date));
    }

    private sanitizeDate(date: string): string {
        const newDate: Date = new Date(date);
        const timestamp: number = newDate.getTime();
        const offsetTz: number = newDate.getTimezoneOffset() * 60 * 1000;
        return new Date(timestamp - offsetTz).toISOString().substring(0, 10) + 'T00:00:00+0000';
    }

    private convertToUTC(date: Date): Date {
        return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    }
}
