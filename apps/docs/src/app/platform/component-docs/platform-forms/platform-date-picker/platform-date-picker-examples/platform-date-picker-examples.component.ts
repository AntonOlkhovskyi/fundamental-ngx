/**
 * This approach has been taken from core/datepicker implementation.
 * Some part of code has been modified to integrate platform capabilities.
 */
import { Component } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { FdDate, FdRangeDate } from '@fundamental-ngx/core';

@Component({
    selector: 'fdp-platform-date-picker-example',
    templateUrl: './platform-date-picker-example.component.html'
})
export class PlatformDatePickerExampleComponent {
    public birthday: FdDate = new FdDate(1990, 1, 2);
    public holiday: FdRangeDate = {
        start: new FdDate(2020, 5, 14),
        end: new FdDate(2020, 5, 24)
    };
    public datePickerForm = new FormGroup({
        holiday: new FormControl(this.holiday)
    });

    public data = {
        birthday: this.birthday
    };

    // Template driven form
    disableddate = '';
    birthdayPicker = '';
    holidayPicker = '';
    dateOutsideForm = '';
    rangedateOutsideForm = '';

    constructor() {}

    public save(value: any): void {
        alert('Form Value: ' + value);
    }
}