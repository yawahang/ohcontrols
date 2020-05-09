import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material';

@Component({
  selector: 'oh-date-picker',
  templateUrl: './oh-date-picker.component.html',
  styleUrls: ['./oh-date-picker.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class OHDatePickerComponent implements OnInit {

  @Output() valueChange = new EventEmitter<any>();

  @ViewChild('datePickerInput', { static: false }) datePickerInput: ElementRef;
  @ViewChild('ohDateAutoTrigger', { static: false }) ohDateAutoTrigger: MatAutocompleteTrigger;

  @ViewChild('hourInputStart', { static: false }) hourInputStart: any;
  @ViewChild('minuteInputStart', { static: false }) minuteInputStart: any;
  @ViewChild('secondsInputStart', { static: false }) secondsInputStart: any;
  @ViewChild('meridianInputStart', { static: false }) meridianInputStart: any;

  @ViewChild('hourInputEnd', { static: false }) hourInputEnd: any;
  @ViewChild('minuteInputEnd', { static: false }) minuteInputEnd: any;
  @ViewChild('secondsInputEnd', { static: false }) secondsInputEnd: any;
  @ViewChild('meridianInputEnd', { static: false }) meridianInputEnd: any;

  /* Input properties for calendar control */
  name: string; // form control name for the date picker
  placeholder: string; // display or place holder for the date picker
  type = 'date-time'; // control type, 'date', 'time', 'date-time'
  width = ''; // width of datepicker control default is 200px
  panelWidth = ''; // width of datepicker panel

  disabled = false; // disabled whole control, has highest priority
  dateDisabled = false; // disabled date picker
  datePickerIconDisabled = false; // popup calendar disabled
  dateInputDisabled = false; // input text disabled
  datePickerPopupDisabled = false; // calendar window disabled
  filteredDays: string[]; // list of week day index to prevent eg: ['Sun','Mon','Tue'] to disable

  required = false; // required field or not
  isRange = false; // is range picker or not
  controlAlign = 'horizontal'; // range picker control alignment
  isInline = false; // is date picker inline calendar or toggle view

  hourFormat = 12; // hour format : 12 or 24
  timeDisabled = false; // disable time controls
  hideHour = false;
  hideMinute = false;
  hideSeconds = false;
  hideMeridian = false;
  disableHour = false;
  disableMinute = false;
  disableSeconds = false;
  disableMeridian = false;

  startView = { start: null, end: null }; // calendar view start for start and end date: "month" ,"year"  or "multi-year"
  defaultDate = { start: null, end: null }; // default start and end value for date picker
  minDate = { start: null, end: null }; // minimum start and end date for date picker
  maxDate = { start: null, end: null }; // maximum start and end date for date picker
  startAt = { start: null, end: null }; // date to start value for start and end date for date picker

  hour = { start: 0, end: 0 };
  minute = { start: 0, end: 0 };
  seconds = { start: 0, end: 0 };
  meridian = { start: 'AM', end: 'AM' };

  toggledInput = false; // show toggled textbox input instead of main input

  valueReturn = {
    start: {
      value: null,
      date: null,
      hour: null,
      minute: null,
      seconds: null,
      meridian: null
    },
    end: {
      value: null,
      date: null,
      hour: null,
      minute: null,
      seconds: null,
      meridian: null
    }
  };

  @Input('config') set config(prop: MvPickerConfig) {

    if (prop) {

      this.name = prop.name;
      this.placeholder = prop.placeholder ? prop.placeholder : prop.name;
      this.width = prop.width ? prop.width : '200px';
      this.hourFormat = prop.hourFormat ? prop.hourFormat : 12;
      this.disabled = prop.disabled ? prop.disabled : false;
      this.dateDisabled = prop.dateDisabled ? prop.dateDisabled : false;
      this.datePickerIconDisabled = prop.datePickerIconDisabled ? prop.datePickerIconDisabled : false;
      this.dateInputDisabled = prop.dateInputDisabled ? prop.dateInputDisabled : false;
      this.timeDisabled = prop.timeDisabled ? prop.timeDisabled : false;
      this.datePickerPopupDisabled = prop.datePickerPopupDisabled ? prop.datePickerPopupDisabled : false;
      this.filteredDays = prop.filteredDays ? prop.filteredDays : [];
      this.required = prop.required ? prop.required : false;
      this.isInline = prop.isInline ? prop.isInline : false;
      this.isRange = prop.isRange ? prop.isRange : false;
      this.hideHour = prop.hideHour ? prop.hideHour : false;
      this.hideMinute = prop.hideMinute ? prop.hideMinute : false;
      this.hideSeconds = prop.hideSeconds ? prop.hideSeconds : false;

      // hideMeridian if hour is hidden / hourFormat === 24
      this.hideMeridian = (prop.hideMeridian || this.hourFormat === 24 || this.hideHour) ? true : false;
      this.disableHour = prop.disableHour ? prop.disableHour : false;
      this.disableMinute = prop.disableMinute ? prop.disableMinute : false;
      this.disableSeconds = prop.disableSeconds ? prop.disableSeconds : false;
      this.disableMeridian = prop.disableMeridian ? prop.disableMeridian : false;
      this.type = prop.type ? prop.type : 'date-time';
      this.controlAlign = prop.controlAlign ? prop.controlAlign : 'horizontal';

      if (this.type === 'date' && !this.isRange) {

        this.toggledInput = true;
      } else {

        this.toggledInput = false;
      }

      const vType = prop.startView.start ? prop.startView.start : 'month';
      this.startView.start = vType;
      if (this.isRange) {
        this.startView.end = prop.startView.end ? prop.startView.end : vType;
      }

      // For date conversion
      // ISO format : "2019-10-24T16:33:02.477Z"
      // Local format :"10/24/2019, 10:17:44 PM"
      let year: number;
      let month: number;
      let day: number;
      let dd: number;
      let iSOSeperator: boolean;
      let maxSD: any;
      let maxED: any;

      if (prop.maxDate) {

        if (prop.maxDate.start) {

          iSOSeperator = prop.maxDate.start.includes('-');
          dd = iSOSeperator ? prop.maxDate.start.split('-') : prop.maxDate.start.split('/');
          year = dd[iSOSeperator ? 0 : 2];
          month = dd[iSOSeperator ? 1 : 0];
          day = dd[iSOSeperator ? 2 : 1];
          // time set to 0 for handling time zone difference issue
          maxSD = new Date(Number(year), Number(month) - 1, Number(day), 0, 0, 0, 0);
          this.maxDate.start = new FormControl(maxSD);
        }

        if (prop.maxDate.end) {

          iSOSeperator = prop.maxDate.end.includes('-');
          dd = iSOSeperator ? prop.maxDate.end.split('-') : prop.maxDate.end.split('/');
          year = dd[iSOSeperator ? 0 : 2];
          month = dd[iSOSeperator ? 1 : 0];
          day = dd[iSOSeperator ? 2 : 1];
          maxED = new Date(Number(year), Number(month) - 1, Number(day), 0, 0, 0, 0);
          this.maxDate.end = new FormControl(maxED);
        }
      }

      if (prop.minDate) {

        if (prop.minDate.start) {

          iSOSeperator = prop.minDate.start.includes('-');
          dd = iSOSeperator ? prop.minDate.start.split('-') : prop.minDate.start.split('/');
          year = dd[iSOSeperator ? 0 : 2];
          month = dd[iSOSeperator ? 1 : 0];
          day = dd[iSOSeperator ? 2 : 1];

          const start = new Date(Number(year), Number(month) - 1, Number(day), 0, 0, 0, 0);
          this.minDate.start = new FormControl(start > maxSD ? maxSD : start); // replace min start date with max start date if greater
        }

        if (prop.minDate.end) {

          iSOSeperator = prop.minDate.end.includes('-');
          dd = iSOSeperator ? prop.minDate.end.split('-') : prop.minDate.end.split('/');
          year = dd[iSOSeperator ? 0 : 2];
          month = dd[iSOSeperator ? 1 : 0];
          day = dd[iSOSeperator ? 2 : 1];

          const end = new Date(Number(year), Number(month) - 1, Number(day), 0, 0, 0, 0);
          this.minDate.end = new FormControl(end > maxSD ? maxSD : end);
        }
      }

      if (prop.startAt) {

        if (prop.startAt.start) {

          iSOSeperator = prop.startAt.start.includes('-');
          dd = iSOSeperator ? prop.startAt.start.split('-') : prop.startAt.start.split('/');
          year = dd[iSOSeperator ? 0 : 2];
          month = dd[iSOSeperator ? 1 : 0];
          day = dd[iSOSeperator ? 2 : 1];

          const start = new Date(Number(year), Number(month) - 1, Number(day), 0, 0, 0, 0);

          if (prop.maxDate.start) {

            iSOSeperator = prop.maxDate.start.includes('-');
            dd = iSOSeperator ? prop.maxDate.start.split('-') : prop.maxDate.start.split('/');
            year = dd[iSOSeperator ? 0 : 2];
            month = dd[iSOSeperator ? 1 : 0];
            day = dd[iSOSeperator ? 2 : 1];
          }

          const max = new Date(Number(year), Number(month) - 1, Number(day), 0, 0, 0, 0);

          this.startAt.start = (start < max) ? max : start;  // replace startAt.start with maxDate.start if < startAt.start
        }

        if (prop.startAt.end) {

          iSOSeperator = prop.startAt.end.includes('-');
          dd = iSOSeperator ? prop.startAt.end.split('-') : prop.startAt.end.split('/');
          year = dd[iSOSeperator ? 0 : 2];
          month = dd[iSOSeperator ? 1 : 0];
          day = dd[iSOSeperator ? 2 : 1];

          const end = new Date(Number(year), Number(month) - 1, Number(day), 0, 0, 0, 0);

          if (prop.maxDate.end) {

            iSOSeperator = prop.maxDate.end.includes('-');
            dd = iSOSeperator ? prop.maxDate.end.split('-') : prop.maxDate.end.split('/');
            year = dd[iSOSeperator ? 0 : 2];
            month = dd[iSOSeperator ? 1 : 0];
            day = dd[iSOSeperator ? 2 : 1];
          }

          const max = new Date(Number(year), Number(month) - 1, Number(day), 0, 0, 0, 0);

          this.startAt.end = (end < max) ? max : end;  // replace startAt.end with maxDate.end if < startAt.end
        }
      }

      if ((this.type === 'date' || this.type === 'date-time') && prop.defaultDate) {

        if (prop.defaultDate.start && new Date(prop.defaultDate.start).toString() !== 'Invalid Date') {

          iSOSeperator = prop.defaultDate.start.includes('-');
          dd = iSOSeperator ? prop.defaultDate.start.split('-') : prop.defaultDate.start.split('/');
          year = dd[iSOSeperator ? 0 : 2];
          month = dd[iSOSeperator ? 1 : 0];
          day = dd[iSOSeperator ? 2 : 1];

          this.defaultDate.start = new FormControl(new Date(Number(year), Number(month) - 1, Number(day), 0, 0, 0, 0));
          this.valueReturn.start.date = prop.defaultDate.start;
        }

        if (prop.defaultDate.end && new Date(prop.defaultDate.end).toString() !== 'Invalid Date') {

          iSOSeperator = prop.defaultDate.start.includes('-');
          dd = iSOSeperator ? prop.defaultDate.start.split('-') : prop.defaultDate.start.split('/');
          year = dd[iSOSeperator ? 0 : 2];
          month = dd[iSOSeperator ? 1 : 0];
          day = dd[iSOSeperator ? 2 : 1];

          this.defaultDate.end = new FormControl(new Date(Number(year), Number(month) - 1, Number(day), 0, 0, 0, 0));
          this.valueReturn.end.date = prop.defaultDate.end;
        }
      }

      if ((this.type === 'time' || this.type === 'date-time') && prop.defaultTime) {

        const timeStart = prop.defaultTime.start ? prop.defaultTime.start.split(':') : null;
        const timeEnd = prop.defaultTime.end ? prop.defaultTime.end.split(':') : null;

        if (timeStart) {

          this.hour.start = timeStart[0] ? Number(timeStart[0]) : 0;
          this.minute.start = timeStart[1] ? Number(timeStart[1]) : 0;
          this.seconds.start = (timeStart[2] && timeStart[2].split(' ')[0]) ? Number(timeStart[2].split(' ')[0]) : 0;
          this.meridian.start = (timeStart[2] && timeStart[2].split(' ')[1]) ? timeStart[2].split(' ')[1] : 'AM';

          this.valueReturn.start.hour = this.hour.start;
          this.valueReturn.start.minute = this.minute.start;
          this.valueReturn.start.seconds = this.seconds.start;
          this.valueReturn.start.meridian = this.meridian.start;
        }

        if (timeEnd) {

          this.hour.end = timeEnd[0] ? Number(timeEnd[0]) : 0;
          this.minute.end = timeEnd[1] ? Number(timeEnd[1]) : 0;
          this.seconds.end = (timeEnd[2] && timeEnd[2].split(' ')[0]) ? Number(timeEnd[2].split(' ')[0]) : 0;
          this.meridian.end = (timeEnd[2] && timeEnd[2].split(' ')[1]) ? timeEnd[2].split(' ')[1] : 'AM';

          this.valueReturn.end.hour = this.hour.end;
          this.valueReturn.end.minute = this.minute.end;
          this.valueReturn.end.seconds = this.seconds.end;
          this.valueReturn.end.meridian = this.meridian.end;
        }
      }

      this.setAndReturnDateTimeValue();
    }
  }

  constructor() {
  }

  ngOnInit() {

  }

  onClosed() { // autocomplete closed

  }

  onOpened() { // autocomplete opened

  }

  handleScroll(e: any) {
    console.log('handleScroll', e);
  }

  datePickerInputChange(e: any) { // assign value to autocomplete controls and return
    console.log('datePickerInputChange', e);
  }

  validateSDAndED(): boolean {

    if (!this.valueReturn.start.date && (this.valueReturn.start.date || this.valueReturn.start.date === '')) {
      return true;
    } else {
      return (new Date(this.valueReturn.start.date) <= new Date(this.valueReturn.start.date));
    }
  }

  panelFn(e: any) {

    if (e) {

      e.stopPropagation();

      if (e.code === 'ArrowDown' || e.code === 'Space' || e.code === 'Enter') {
        this.ohDateAutoTrigger.openPanel();
      } else if (e.code === 'Escape') {
        this.ohDateAutoTrigger.closePanel();
      }
    }
  }

  openAutoCompletePanel(e: any) {

    if (e) {

      e.stopPropagation();
      this.ohDateAutoTrigger.openPanel();
    }
  }

  onDateChange(e: any, control: string) {

    if (e) {

      this.valueReturn[control].date = e.targetElement.value;
      this.ohDateAutoTrigger.openPanel(); // date calander closes the dialog, so reopen autocomplete
    }

    this.setAndReturnDateTimeValue();
  }

  onHourChange(e: any, control: string) {

    if (e) {

      this.hour[control] = Number(e.srcElement.value);
      if (this.hour[control] === this.hourFormat) {

        this.hour[control] = 0;
      } else if (this.hour[control] === -1) {

        this.hour[control] = this.hourFormat;
      }

      if (this.hourInputStart) {

        if (control === 'start') {

          this.hourInputStart.nativeElement.value = this.hour;
        } else {

          this.hourInputEnd.nativeElement.value = this.hour;
        }
      }
    }

    this.setAndReturnDateTimeValue();
  }

  onMinuteChange(e: any, control: string) {

    if (e) {

      let type: string;
      type = (this.minute[control] < Number(e.srcElement.value) ? 'inCMin' : 'decMin');
      this.minute[control] = Number(e.srcElement.value);
      this.reConfigureTime(type, control);
    }
  }

  onSecondsChange(e: any, control: string) {

    if (e) {

      let type: string;
      type = (this.seconds[control] < Number(e.srcElement.value) ? 'inCSec' : 'decSec');
      this.seconds[control] = Number(e.srcElement.value);
      this.reConfigureTime(type, control);
    }
  }

  onMeridianChange(e: any, control: string) {

    if (e) {

      if ((e.code === 'Enter' || e.code === 'Space' || e.code === 'ArrowDown' || e.code === 'ArrowUp')) {

        this.meridian[control] = this.meridian[control] === 'AM' ? 'PM' : 'AM';
      } else if (e.srcElement && (e.srcElement.id === 'meridianstart' || e.srcElement.id === 'meridianend')) {
        // keydown in meridian input, other than above keys
        e.stopPropagation();
        this.meridian[control] = this.meridian[control] === 'AM' ? 'PM' : 'AM';
      } else {

        e.preventDefault();
      }
    }

    if (this.meridianInputStart) {
      this.meridianInputStart.nativeElement.value = this.meridian.start;
    }

    if (this.meridianInputEnd) {
      this.meridianInputEnd.nativeElement.value = this.meridian.end;
    }

    this.setAndReturnDateTimeValue();
  }

  reConfigureTime(type: string, control: string) {

    const currSec = control === 'start' ? this.seconds.start : this.seconds.end;

    if (type === 'inCMin' || type === 'inCSec' || type === 'inCMin' || type === 'inCSec') {

      if (this.seconds[control] === 60) { // increment min

        if (this.minute[control] < 60) {

          this.minute[control]++;
          this.seconds[control] = 0;
        } else {

          this.seconds[control]--;
        }
      }

      if (this.minute[control] === 60) { // increment hour

        if (this.hour[control] < this.hourFormat) {

          this.hour[control]++;
          this.minute[control] = 0;
        } else {

          this.minute[control]--;
        }
      }

      // if all hour, minute are in its max limit, set seconds to its max limit if is increased by user
      if ((type === 'inCSec' && currSec === 60 && this.minute[control] === 59 && this.hour[control] === this.hourFormat)) {
        this.seconds[control] = 59;
      }

      if (type === 'inCSec' && this.seconds[control] > 60) { // calculate and set minute if seconds is typed and more than 60

        const minuteCalc = (this.seconds[control] / 60).toString();
        const time = minuteCalc.split('.');
        const min = Number(time[0]);
        const sec = (this.seconds[control] - (min * 60));

        this.seconds[control] = sec > 0 ? sec : 0;
        this.minute[control] = (this.minute[control] + min);

        // calculate and set hour if minute is typed and more than 60 from Above calculations
        if (this.minute[control] + min > 60) {
          this.calculateHour(control);
        }
      }

      // calculate and set hour if minute is typed and more than 60
      if (type === 'inCMin' && this.minute[control] > 60) {
        this.calculateHour(control);
      }

    } else {

      if (this.seconds[control] === -1) {  // check seconds and decrement minute

        if (this.minute[control] > 0 || this.minute[control] > 0) {

          this.minute[control]--;
          this.seconds[control] = 59;
        } else {

          this.seconds[control] = 0;
        }
      }

      if (this.minute[control] === -1) { // check minute and decrement hour

        if (this.hour[control] > 0 || this.hour[control] > 0) {

          this.hour[control]--;
          this.minute[control] = 59;
        } else {

          this.minute[control] = 0;
        }
      }
    }

    if (this.hourInputStart) {
      this.hourInputStart.nativeElement.value = this.hour.start;
    }

    if (this.minuteInputStart) {
      this.minuteInputStart.nativeElement.value = this.minute.start;
    }

    if (this.secondsInputStart) {
      this.secondsInputStart.nativeElement.value = this.seconds.start;
    }

    if (this.hourInputEnd) {
      this.hourInputEnd.nativeElement.value = this.hour.start;
    }

    if (this.minuteInputEnd) {
      this.minuteInputEnd.nativeElement.value = this.minute.end;
    }

    if (this.secondsInputEnd) {
      this.secondsInputEnd.nativeElement.value = this.seconds.end;
    }

    this.setAndReturnDateTimeValue();
  }

  calculateHour(control: string) {

    const hourCalc = (this.minute[control] / 60).toString();
    const time = hourCalc.split('.');
    const hour = Number(time[0]);
    const min = (this.minute[control] - (hour * 60));

    if ((this.hour[control] + hour) <= this.hourFormat) {

      this.minute[control] = min > 0 ? min : 0;
      this.hour[control] = (this.hour[control] + hour);
    } else {

      this.minute[control] = 0;
    }
  }

  setAndReturnDateTimeValue() {

    this.valueReturn.start.value = null;
    this.valueReturn.end.value = null;

    if (this.type === 'date-time') {

      this.setDateValue();
      this.setTimeValue();

    } else if (this.type === 'time') {

      this.valueReturn.start.date = null;
      this.valueReturn.end.date = null;
      this.setTimeValue();

    } else if (this.type === 'date') {

      this.setDateValue();
      this.resetTimeValue();
    }

    let val = '';
    if (this.valueReturn.start) {
      val = this.valueReturn.start.value;
    }

    if (this.isRange) {

      this.valueChange.emit(this.valueReturn);

      if (this.valueReturn.end) {
        val = ` - ${this.valueReturn.end.value}`;
      }

    } else {

      this.valueChange.emit(this.valueReturn.start);
    }

    if (this.datePickerInput) {
      this.datePickerInput.nativeElement.value = val;
    }
  }

  resetTimeValue() {

    this.valueReturn.start.hour = null;
    this.valueReturn.start.minute = null;
    this.valueReturn.start.seconds = null;
    this.valueReturn.start.meridian = null;

    this.valueReturn.end.hour = null;
    this.valueReturn.end.minute = null;
    this.valueReturn.end.seconds = null;
    this.valueReturn.end.meridian = null;
  }

  setDateValue() {

    if (this.valueReturn.start.date && new Date(this.valueReturn.start.date).toString() !== 'Invalid Date') {
      this.valueReturn.start.value = this.valueReturn.start.date;
    }

    if (this.valueReturn.end.date && new Date(this.valueReturn.end.date).toString() !== 'Invalid Date') {
      this.valueReturn.end.value = this.valueReturn.end.date;
    }
  }

  setTimeValue() {

    if (!this.hideHour) {

      if (this.hour.start) {
        this.valueReturn.start.value = `${this.valueReturn.start.value}, ${this.hour.start}`;
      }

      if (this.hour.end) {
        this.valueReturn.end.value = `${this.valueReturn.end.value}, ${this.hour.end}`;
      }
    }

    if (!this.hideMinute) {

      if (this.minute.start) {
        this.valueReturn.start.value = `${this.valueReturn.start.value}:${this.minute.start}`;
      }

      if (this.minute.end) {
        this.valueReturn.end.value = `${this.valueReturn.end.value}:${this.minute.end}`;
      }
    }

    if (!this.hideSeconds) {

      if (this.seconds.start) {
        this.valueReturn.start.value = `${this.valueReturn.start.value}:${this.seconds.start}`;
      }

      if (this.seconds.end) {
        this.valueReturn.end.value = `${this.valueReturn.end.value}:${this.seconds.end}`;
      }
    }

    if (!this.hideMeridian) {

      if (this.hour.start) {
        this.valueReturn.start.value = `${this.valueReturn.start.value} ${this.meridian.start}`;
      }

      if (this.hour.end) {
        this.valueReturn.end.value = `${this.valueReturn.end.value} ${this.meridian.end}`;
      }
    }

    this.valueReturn.start.hour = this.hour.start;
    this.valueReturn.start.minute = this.minute.start;
    this.valueReturn.start.seconds = this.seconds.start;
    this.valueReturn.start.meridian = this.meridian.start;

    this.valueReturn.end.hour = this.hour.end;
    this.valueReturn.end.minute = this.minute.end;
    this.valueReturn.end.seconds = this.seconds.end;
    this.valueReturn.end.meridian = this.meridian.end;
  }

  dateFilter = (d: Date): boolean => { // Prevent days from being selected.

    let returnDay = true;
    const day = d.getDay();

    if (this.filteredDays && this.filteredDays.length > 0) {
      for (const dd of this.filteredDays) {
        if (this.getIndexOfDay(dd) === day) {
          returnDay = false; // dont return day of day is in filter list
          break;
        } else {
          returnDay = true;
        }
      }
    }

    return returnDay;
  }

  getIndexOfDay(day: string): number {

    switch (day) {

      case 'Sun':
        return 0;
        break;

      case 'Mon':
        return 1;
        break;

      case 'Tue':
        return 2;
        break;

      case 'Wed':
        return 3;
        break;

      case 'Thu':
        return 4;
        break;

      case 'Fri':
        return 5;
        break;

      case 'Sat':
        return 6;
        break;
    }
  }

}

export interface MvPickerConfig {
  name: string;
  placeholder: string;
  tooltip: string;
  type: string;
  isRange: boolean;
  controlAlign: string;
  isInline: boolean;
  width: string;
  datePickerPopupDisabled: boolean;
  datePickerIconDisabled: boolean;
  dateInputDisabled: boolean;
  timeDisabled: boolean;
  hideHour: boolean;
  hideMinute: boolean;
  hideSeconds: boolean;
  hideMeridian: boolean;
  disabled: boolean;
  dateDisabled: boolean;
  disableHour: boolean;
  disableMinute: boolean;
  disableSeconds: boolean;
  disableMeridian: boolean;
  required: boolean;
  hourFormat: number;
  startAt: { start: any, end: any };
  startView: { start: any, end: any };
  defaultDate: { start: any, end: any };
  defaultTime: { start: any, end: any };
  minDate: { start: any, end: any };
  maxDate: { start: any, end: any };
  filteredDays: string[];
}
