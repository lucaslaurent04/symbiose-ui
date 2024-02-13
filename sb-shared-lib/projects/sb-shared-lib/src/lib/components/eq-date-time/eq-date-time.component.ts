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
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MatFormField} from '@angular/material/form-field';

type dateTimeUsage =
    | 'datetime.short'
    | 'datetime.medium'
    | 'datetime.long'
    | 'datetime.full';

@Component({
    selector: 'eq-date-time',
    templateUrl: './eq-date-time.component.html',
    styleUrls: ['./eq-date-time.component.scss']
})
export class EqDateTimeComponent implements OnInit, OnChanges {

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

    @Input() usage: string | dateTimeUsage;

    // used for marking the input as being edited
    public is_active: boolean = false;

    public is_null: boolean = false;

    @ViewChild('eqDateTime') eqDateRange: ElementRef<HTMLDivElement>;
    @ViewChild('matFormField', {static: false}) matFormField: MatFormField;
    @ViewChild('inputDate', {static: false}) inputDate: ElementRef<HTMLInputElement>;
    @ViewChild('inputTime', {static: false}) inputTime: ElementRef<HTMLInputElement>;

    get inputDateValue(): string | null {
        if (this.inputDate.nativeElement instanceof HTMLInputElement) {
            return this.inputDate.nativeElement.value;
        }

        return null;
    }

    get inputTimeValue(): string | null {
        if (this.inputTime.nativeElement instanceof HTMLInputElement) {
            return this.inputTime.nativeElement.value;
        }

        return null;
    }

    public inputsComputedValue = (): string | null => {
        if (this.inputDateValue && this.inputTimeValue) {
            return `${this.inputDateValue} - ${this.inputTimeValue}`;
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

    public initFormGroup(): void {
        if (this.value !== null) {
            const [date, time] = this.splitDateTimeValue(this.value);
            const dateTime = new Date(this.value);

            this.formGroup = new FormGroup({
                date: new FormControl(''),
                time: new FormControl('')
            });


            if (this.checkDateValidity(date) && this.isValidTimeFormat(time)) {
                this.formGroup.setValue({
                    date: new Date(this.value),
                    time: dateTime.getHours() + ':' + dateTime.getMinutes()
                });
            }
        }
        else if (this.nullable) {
            this.updateValue(null, null);
        }

        this.changeDetectorRef.detectChanges();

        if (this.required) {
            this.formGroup.addValidators(Validators.required);
        }

        if (!this.nullable) {
            this.formGroup.value.date.setValidators([
                Validators.minLength(10),
                Validators.maxLength(10)
            ]);

            this.formGroup.value.time.setValidators([
                Validators.minLength(5),
                Validators.maxLength(5)
            ]);
        }

    }

    public activate(): void {
        if (this.mode === 'edit' && !this.disabled) {
            this.is_active = true;
            this.changeDetectorRef.detectChanges();
        }
    }

    public onFocusInputTime(event: any): boolean {
        event.stopPropagation();
        event.preventDefault();
        if (this.matFormField._elementRef.nativeElement instanceof HTMLElement) {
            this.matFormField._elementRef.nativeElement.classList.add('mat-focused');
        }
        this.formGroup.markAsTouched({onlySelf: true});
        this.is_active = true;
        this.changeDetectorRef.detectChanges();
        return false;
    }

    public focusInput(input: HTMLInputElement): void {
        if (input instanceof HTMLInputElement) {
            this.formGroup.markAsTouched({onlySelf: true});
            this.changeDetectorRef.detectChanges();
            input.focus();
            this.changeDetectorRef.detectChanges();
        }
    }

    private toggleActive(editable: boolean): void {
        this.is_active = editable;
        this.changeDetectorRef.detectChanges();
        if (editable && this.inputDate.nativeElement instanceof HTMLInputElement) {
            this.inputDate.nativeElement.focus();
        }
    }

    public toggleIsNull(is_null: boolean): void {
        this.is_null = is_null;
        if (this.is_null) {
            this.updateValue(null, null);
        }
        else {
            this.formGroup.enable();
            this.updateValue('', '');
        }
        this.changeDetectorRef.detectChanges();
    }

    private updateValue(dateValue: string | null, timeValue: string | null): void {
        if (
            dateValue === null &&
            timeValue === null &&
            this.inputDate.nativeElement instanceof HTMLInputElement &&
            this.inputTime.nativeElement instanceof HTMLInputElement
        ) {
            this.is_null = true;
            this.formGroup.setValue({
                date: '[null]',
                time: '[null]',
            });
            this.formGroup.markAsUntouched({onlySelf: true});
        }
        else {
            this.is_null = false;
            if (
                (dateValue && new Date(dateValue).toString() !== 'Invalid Date') &&
                (timeValue && this.isValidTimeFormat(timeValue))
            ) {
                const UTZDate: Date = new Date(dateValue);
                const UTCDate: Date = new Date(UTZDate.getFullYear(), UTZDate.getMonth(), UTZDate.getDate());
                this.formGroup.setValue({
                    date: UTCDate,
                    time: timeValue
                });
            }
            else {
                this.formGroup.setValue({
                    date: '',
                    time: '',
                });
            }
        }
        this.changeDetectorRef.detectChanges();
    }

    public onBlur(event: FocusEvent): void {
        event.preventDefault();
        // we need to discard current instance because onblur event occurs before onSave
        if (
            this.eqDateRange.nativeElement instanceof Element &&
            !this.eqDateRange.nativeElement.contains(event.relatedTarget as Node)
        ) {
            this.toggleIsNull(false);
            if (this.value && ![null, '[null]', ''].includes(this.value)) {
                const dateTime: Date = new Date(this.value);
                this.formGroup.setValue({
                    date: new Date(this.value),
                    time: dateTime.getHours() + ':' + dateTime.getMinutes()
                });

            }

            if (this.matFormField._elementRef.nativeElement instanceof HTMLElement) {
                this.matFormField._elementRef.nativeElement.classList.remove('mat-focused');
            }
            this.toggleActive(false);
        }
    }

    public onCancel(event: MouseEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.toggleIsNull(false);
        if (this.value !== null) {
            const [date, time] = this.splitDateTimeValue(this.value);
            this.updateValue(date, time);
        }
        this.toggleActive(false);
    }

    public onClear(event: MouseEvent): void {
        event.stopImmediatePropagation();
        event.preventDefault();
        this.updateValue('', '');
        this.formGroup.markAsPending({onlySelf: true});
        if (this.inputDate.nativeElement instanceof HTMLInputElement) {
            this.inputDate.nativeElement.focus();
        }
    }

    public onSave(event: MouseEvent): void {
        event.preventDefault();
        event.stopPropagation();
        if (this.is_null) {
            this.valueChange.emit(null);
            this.formGroup.markAsUntouched({onlySelf: true});
            this.toggleActive(false);
        }
        else if (
            this.formGroup.valid ||
            this.inputsComputedValue !== null &&
            this.inputTimeValue &&
            this.isValidTimeFormat(this.inputTimeValue)
        ) {
            const date: string = this.convertToUTC(this.formGroup.value.date, this.formGroup.value.time).slice(0, -5) + '+0000';
            this.valueChange.emit(date);
            this.toggleActive(false);
        }
    }

    public formatDate(): string {

        // autre verification sur base de la validité de la date (après parsing)
        if (this.formGroup.value.date !== '[null]' && this.formGroup.value.time !== '[null]') {
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

            const DateTimeFormats: Record<dateTimeUsage, string> = {
                'datetime.short': 'DD/MM/YY HH:mm',
                'datetime.medium': 'DD/MMM/YYYY HH:mm',
                'datetime.long': 'ddd DD MMM YYYY HH:mm',
                'datetime.full': 'dddd DD MMMM YYYY HH:mm'
            };

            // Converted to UTZ at init, so we need to convert it back to UTC
            const date: Date = new Date(this.convertToUTC(this.formGroup.value.date, this.formGroup.value.time));

            if (DateTimeFormats.hasOwnProperty(this.usage as dateTimeUsage)) {

                const format: string = DateTimeFormats[this.usage as dateTimeUsage];

                const name_month: string = date.toLocaleDateString('en-US', {month: 'long'});
                const name_day: string = date.toLocaleDateString('en-US', {weekday: 'long'});
                const index_day: number = date.getDate();
                const index_month: number = date.getMonth() + 1;
                const index_year: number = date.getFullYear();
                const index_hour: number = date.getHours();
                const index_minute: number = date.getMinutes();
                const index_second: number = date.getSeconds();

                return format
                    .replace('YYYY', index_year.toString().padStart(4, '0'))
                    .replace('YY', (index_year % 100).toString().padStart(2, '0'))
                    .replace('MMMM', dateNameDictionary['month.' + name_month.toLowerCase()])
                    .replace('MMM', dateNameDictionary['month.' + name_month.toLowerCase() + '.short'])
                    .replace('MM', index_month.toString().padStart(2, '0'))
                    .replace('DD', index_day.toString().padStart(2, '0'))
                    .replace('dddd', dateNameDictionary['day.' + name_day.toLowerCase()])
                    .replace('ddd', dateNameDictionary['day.' + name_day.toLowerCase() + '.short'])
                    .replace('HH', index_hour.toString().padStart(2, '0'))
                    .replace('mm', index_minute.toString().padStart(2, '0'))
                    .replace('ss', index_second.toString().padStart(2, '0'));
            }
        }

        return '[null] - [null]';
    }

    public checkDateValidity(date: string): boolean {
        return !isNaN(Date.parse(date));
    }

    public isValidTimeFormat(time: string): boolean {
        const timeRegex: RegExp = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

        if (!timeRegex.test(time)) {
            return false;
        }

        const [hours, minutes] = time.split(':').map(Number);

        return !(hours < 0 || hours > 23 || minutes < 0 || minutes > 59);
    }

    private splitDateTimeValue = (dateTime: string): string[] => {
        const [date, timeWithUtc] = dateTime.split('T');
        const time = timeWithUtc.split('+')[0].slice(0, 5);

        return [date, time];
    }

    private convertToUTC(date: Date, time: string): string {
        const [hours, minutes] = time.split(':');
        const dateObj: Date = new Date(date.getFullYear(), date.getMonth(), date.getDate(), +hours, +minutes);
        return dateObj.toISOString();
    }

    // private convertToUTZ(date: string): Array<any> {
    //     const dateObj: Date = new Date(date);
    //     const str_time: string = dateObj.toISOString().split('T')[1];
    //     const time_parts: string[] = str_time.split(':');
    //     return [dateObj, time_parts[0] + ':' + time_parts[1]];
    // }
}
