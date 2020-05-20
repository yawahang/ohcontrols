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

  // @ViewChild('datePickerInput', { static: false }) datePickerInput: ElementRef;
  @ViewChild('ohDateAutoTrigger', { static: false }) ohDateAutoTrigger: MatAutocompleteTrigger;

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

  hourFormat = 12; // hours format : 12 or 24
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

  hours = { start: 0, end: 0 };
  minutes = { start: 0, end: 0 };
  seconds = { start: 0, end: 0 };
  meridian = { start: 'AM', end: 'AM' };

  toggledInput = false; // show toggled textbox input instead of main input
  datePickerInputModel: string;

  valueReturn = {
    start: {
      value: null,
      date: null,
      hours: null,
      minutes: null,
      seconds: null,
      meridian: null
    },
    end: {
      value: null,
      date: null,
      hours: null,
      minutes: null,
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

      // hideMeridian if hours is hidden / hourFormat === 24
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
      let maxSD: any;
      let maxED: any;

      if (prop.maxDate) {

        if (prop.maxDate.start) {

          maxSD = this.toJsDate(prop.maxDate.start, 'JsDate');
          this.maxDate.start = new FormControl(maxSD);
        }

        if (prop.maxDate.end) {

          maxED = this.toJsDate(prop.maxDate.end, 'JsDate');
          this.maxDate.end = new FormControl(maxED);
        }
      }

      if (prop.minDate) {

        if (prop.minDate.start) {

          const start = this.toJsDate(prop.minDate.start, 'JsDate');
          this.minDate.start = new FormControl(start > maxSD ? maxSD : start); // replace min start date with max start date if greater
        }

        if (prop.minDate.end) {

          const end = this.toJsDate(prop.minDate.end, 'JsDate');
          this.minDate.end = new FormControl(end > maxSD ? maxSD : end);
        }
      }

      if (prop.startAt) {

        if (prop.startAt.start) {

          const start = this.toJsDate(prop.startAt.start, 'JsDate');

          let max: any;
          if (prop.maxDate.start) {

            max = this.toJsDate(prop.maxDate.start, 'JsDate');
          }

          this.startAt.start = (start < max) ? max : start;  // replace startAt.start with maxDate.start if < startAt.start
        }

        if (prop.startAt.end) {

          const end = this.toJsDate(prop.startAt.end, 'JsDate');

          let max: any;
          if (prop.maxDate.end) {

            max = this.toJsDate(prop.maxDate.end, 'JsDate');
          }

          this.startAt.end = (end < max) ? max : end;  // replace startAt.end with maxDate.end if < startAt.end
        }
      }

      if ((this.type === 'date' || this.type === 'date-time') && prop.defaultDate) {

        if (prop.defaultDate.start && this.isValidDate(prop.defaultDate.start)) {

          this.defaultDate.start = new FormControl(this.toJsDate(prop.defaultDate.start, 'JsDate'));
          this.valueReturn.start.date = prop.defaultDate.start;
        }

        if (prop.defaultDate.end && this.isValidDate(prop.defaultDate.end)) {

          this.defaultDate.end = new FormControl(this.toJsDate(prop.defaultDate.end, 'JsDate'));
          this.valueReturn.end.date = prop.defaultDate.end;
        }
      }

      if ((this.type === 'time' || this.type === 'date-time') && prop.defaultDate) {

        if (this.defaultDate.start) {

          const timeStart = this.toJsDate(this.defaultDate.start, 'DateParts');

          this.hours.start = timeStart.hours;
          this.minutes.start = timeStart.minutes;
          this.seconds.start = timeStart.seconds;
          this.meridian.start = timeStart.meridian;

          this.valueReturn.start.hours = this.hours.start;
          this.valueReturn.start.minutes = this.minutes.start;
          this.valueReturn.start.seconds = this.seconds.start;
          this.valueReturn.start.meridian = this.meridian.start;
        }

        if (this.defaultDate.end) {

          const timeEnd = this.toJsDate(this.defaultDate.end, 'DateParts');

          this.hours.end = timeEnd.hours;
          this.minutes.end = timeEnd.minutes;
          this.seconds.end = timeEnd.seconds;
          this.meridian.end = timeEnd.meridian;

          this.valueReturn.end.hours = this.hours.end;
          this.valueReturn.end.minutes = this.minutes.end;
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

      this.valueReturn[control].date = this.isInline ? e.targetElement.value : this.toJsDate(e, 'ISOString');
      this.ohDateAutoTrigger.openPanel(); // date calander closes the dialog, so reopen autocomplete
    }

    this.setAndReturnDateTimeValue();
  }

  onHourChange(e: any, control: string) {

    if (e) {

      this.hours[control] = Number(e.srcElement.value);
      if (this.hours[control] === this.hourFormat) {

        this.hours[control] = 0;
      } else if (this.hours[control] === -1) {

        this.hours[control] = this.hourFormat;
      }

      // if (this.hourInputStart) {

      //   if (control === 'start') {

      //     this.hourInputStart.nativeElement.value = this.hours;
      //   } else {

      //     this.hourInputEnd.nativeElement.value = this.hours;
      //   }
      // }
    }

    this.setAndReturnDateTimeValue();
  }

  onMinuteChange(e: any, control: string) {

    if (e) {

      let type: string;
      type = (this.minutes[control] < Number(e.srcElement.value) ? 'inCMin' : 'decMin');
      this.minutes[control] = Number(e.srcElement.value);
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

    // if (this.meridianInputStart) {
    //   this.meridianInputStart.nativeElement.value = this.meridian.start;
    // }

    // if (this.meridianInputEnd) {
    //   this.meridianInputEnd.nativeElement.value = this.meridian.end;
    // }

    this.setAndReturnDateTimeValue();
  }

  reConfigureTime(type: string, control: string) {

    const currSec = control === 'start' ? this.seconds.start : this.seconds.end;

    if (type === 'inCMin' || type === 'inCSec' || type === 'inCMin' || type === 'inCSec') {

      if (this.seconds[control] === 60) { // increment min

        if (this.minutes[control] < 60) {

          this.minutes[control]++;
          this.seconds[control] = 0;
        } else {

          this.seconds[control]--;
        }
      }

      if (this.minutes[control] === 60) { // increment hours

        if (this.hours[control] < this.hourFormat) {

          this.hours[control]++;
          this.minutes[control] = 0;
        } else {

          this.minutes[control]--;
        }
      }

      // if all hours, minutes are in its max limit, set seconds to its max limit if is increased by user
      if ((type === 'inCSec' && currSec === 60 && this.minutes[control] === 59 && this.hours[control] === this.hourFormat)) {
        this.seconds[control] = 59;
      }

      if (type === 'inCSec' && this.seconds[control] > 60) { // calculate and set minutes if seconds is typed and more than 60

        const minuteCalc = (this.seconds[control] / 60).toString();
        const time = minuteCalc.split('.');
        const min = Number(time[0]);
        const sec = (this.seconds[control] - (min * 60));

        this.seconds[control] = sec > 0 ? sec : 0;
        this.minutes[control] = (this.minutes[control] + min);

        // calculate and set hours if minutes is typed and more than 60 from Above calculations
        if (this.minutes[control] + min > 60) {
          this.calculateHour(control);
        }
      }

      // calculate and set hours if minutes is typed and more than 60
      if (type === 'inCMin' && this.minutes[control] > 60) {
        this.calculateHour(control);
      }

    } else {

      if (this.seconds[control] === -1) {  // check seconds and decrement minutes

        if (this.minutes[control] > 0 || this.minutes[control] > 0) {

          this.minutes[control]--;
          this.seconds[control] = 59;
        } else {

          this.seconds[control] = 0;
        }
      }

      if (this.minutes[control] === -1) { // check minutes and decrement hours

        if (this.hours[control] > 0 || this.hours[control] > 0) {

          this.hours[control]--;
          this.minutes[control] = 59;
        } else {

          this.minutes[control] = 0;
        }
      }
    }

    // if (this.hourInputStart) {
    //   this.hourInputStart.nativeElement.value = this.hours.start;
    // }

    // if (this.minuteInputStart) {
    //   this.minuteInputStart.nativeElement.value = this.minutes.start;
    // }

    // if (this.secondsInputStart) {
    //   this.secondsInputStart.nativeElement.value = this.seconds.start;
    // }

    // if (this.hourInputEnd) {
    //   this.hourInputEnd.nativeElement.value = this.hours.start;
    // }

    // if (this.minuteInputEnd) {
    //   this.minuteInputEnd.nativeElement.value = this.minutes.end;
    // }

    // if (this.secondsInputEnd) {
    //   this.secondsInputEnd.nativeElement.value = this.seconds.end;
    // }

    this.setAndReturnDateTimeValue();
  }

  calculateHour(control: string) {

    const hourCalc = (this.minutes[control] / 60).toString();
    const time = hourCalc.split('.');
    const hours = Number(time[0]);
    const min = (this.minutes[control] - (hours * 60));

    if ((this.hours[control] + hours) <= this.hourFormat) {

      this.minutes[control] = min > 0 ? min : 0;
      this.hours[control] = (this.hours[control] + hours);
    } else {

      this.minutes[control] = 0;
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

    if (this.valueReturn.start) {

      this.datePickerInputModel = this.valueReturn.start.value;
    }

    if (this.isRange) {

      this.valueChange.emit(this.valueReturn);

      if (this.valueReturn.end) {

        this.datePickerInputModel = ` - ${this.valueReturn.end.value}`;
      }

    } else {

      this.valueChange.emit(this.valueReturn.start);
    }

    // if (this.datePickerInput) {
    //   this.datePickerInput.nativeElement.value = val;
    // }
  }

  resetTimeValue() {

    this.valueReturn.start.hours = null;
    this.valueReturn.start.minutes = null;
    this.valueReturn.start.seconds = null;
    this.valueReturn.start.meridian = null;

    this.valueReturn.end.hours = null;
    this.valueReturn.end.minutes = null;
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

      if (this.hours.start) {
        this.valueReturn.start.value = `${this.valueReturn.start.value}, ${this.hours.start}`;
      }

      if (this.hours.end) {
        this.valueReturn.end.value = `${this.valueReturn.end.value}, ${this.hours.end}`;
      }
    }

    if (!this.hideMinute) {

      if (this.minutes.start) {
        this.valueReturn.start.value = `${this.valueReturn.start.value}:${this.minutes.start}`;
      }

      if (this.minutes.end) {
        this.valueReturn.end.value = `${this.valueReturn.end.value}:${this.minutes.end}`;
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

      if (this.hours.start) {
        this.valueReturn.start.value = `${this.valueReturn.start.value} ${this.meridian.start}`;
      }

      if (this.hours.end) {
        this.valueReturn.end.value = `${this.valueReturn.end.value} ${this.meridian.end}`;
      }
    }

    this.valueReturn.start.hours = this.hours.start;
    this.valueReturn.start.minutes = this.minutes.start;
    this.valueReturn.start.seconds = this.seconds.start;
    this.valueReturn.start.meridian = this.meridian.start;

    this.valueReturn.end.hours = this.hours.end;
    this.valueReturn.end.minutes = this.minutes.end;
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

  // Returns JS Date Object => input ISODate string eg: 2019-12-13T06:45:23.370 for dateTime & 2019-12-13 for date
  // Returns JS Date Object => input LocalDate string eg: 12/13/2019T06:45:23.370 for dateTime & 12/13/2019 for date
  // Returns ISOString => input JS Date Object
  // ! Note: ISOString format  (2019-12-13T06:45:23.370) as output taken for preventing date conversion due to timezone
  // ! Time part "T06:45:23.370" for two allowed time format is mandatory for datetime input
  toJsDate(date: any, returnType: string): any {

    if (!date && !this.isValidDate(date)) {
      return date;
    }

    try {

      let year: number, month: number, day: number, datePart: any;

      if (returnType.toLowerCase() === 'jsdate') {

        const iSOSeperator = date.includes('-');
        datePart = date.split(iSOSeperator ? '-' : '/'); // Split DateParts => Output: ["2019", "12", "13T06:45:23.370"] or ["12",  "13","2019T06:45:23.370"]

        const dayOrYearAndTime = datePart[2].split('T');  // Split Day & Time from DateParts 13T06:45:23.370 => Output: ["13", "06:45:23.370"]
        datePart[2] = dayOrYearAndTime[0]; // Replace Day value "13T06:45:23.370" with "13" or "2019T06:45:23.370" with "2019"

        year = datePart[iSOSeperator ? 0 : 2];
        month = datePart[iSOSeperator ? 1 : 0];
        day = datePart[iSOSeperator ? 2 : 1];

        const timePart = dayOrYearAndTime[1] ? dayOrYearAndTime[1].split(':') : null; // Split TimeParts from Time => Output: ["06", "45", "23.370"]
        const secondMilliSec = (timePart && timePart[2]) ? timePart[2].split('.') : null; // Split millisec from sec => Output:  ["23", "370"]

        const hh = Number((timePart && timePart[0]) ? timePart[0] : 0);
        const mm = Number((timePart && timePart[1]) ? timePart[1] : 0);
        const ss = Number((secondMilliSec && secondMilliSec[2]) ? secondMilliSec[0] : 0);
        const ms = Number((timePart && timePart[0]) ? timePart[0] : 0);

        date = new Date(year, month - 1, day, hh, mm, ss, ms);

      } else if (returnType.toLowerCase() === 'isostring') { // ISO Date String

        const localDate = date.toLocaleDateString();
        datePart = localDate.split('/');
        year = datePart[2];
        month = datePart[0];
        day = datePart[1];

        const mm = month < 10 ? `0${month}` : month;
        const dd = day < 10 ? `0${day}` : day;

        const time = date.toTimeString();
        const zone = date.toISOString();
        date = `${year}-${mm}-${dd}T${time.split(' ')[0]}.${zone.split('.')[1]}`;
      }

      return date;

    } catch (err) {
      return date;
    }
  }

  isValidDate(date: any) {

    let isValid = true;
    if (isNaN(date) && new Date(date).toString() !== 'Invalid Date') {

      isValid = true;
    } else {

      isValid = false;
    }

    return isValid;
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
  minDate: { start: any, end: any };
  maxDate: { start: any, end: any };
  filteredDays: string[];
}
