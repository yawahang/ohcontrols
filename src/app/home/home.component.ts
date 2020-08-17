import { Component, ViewEncapsulation } from '@angular/core';
import { treeViewData } from '../shared/oh-tree-view/tree-view-data';
import { selectListData } from '../shared/oh-select/select-data';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HomeComponent {

  /* ------------------------------------------------------------------------
  ------------------------  Date Time Picker Start --------------------------
  ------------------------------------------------------------------------ */

  placeholder = 'Placeholder';
  dateTimeValue: any;
  defaultDate = { start: '2019-12-13T06:45:23.370', end: '2019-12-18T06:45:23.370' };
  startView = { start: 'month', end: null };
  startAt = { start: null, end: null };
  minDate = { start: null, end: null };
  maxDate = { start: null, end: null };
  filteredDays: string[] = [];
  disabled = false;
  dateDisabled = false;
  dateInputDisabled = false;
  datePickerIconDisabled = false;
  datePickerPopupDisabled = false;
  timeDisabled = false;
  hideHour = false;
  hideMinute = false;
  hideSeconds = false;
  hideMeridian = false;
  disableHour = false;
  disableMinute = false;
  disableSeconds = false;
  disableMeridian = false;
  required = true;
  isInline = false;
  isRange = false;
  hourFormat = 12;
  type = 'date-time';
  controlAlign = 'horizontal';
  widthDate = '200px';

  datePickerConfig = {
    name: 'DatePickerControl',
    placeholder: this.placeholder,
    type: this.type,
    isInline: this.isInline,
    isRange: this.isRange,
    controlAlign: this.controlAlign,
    width: this.widthDate,
    startAt: this.startAt,
    startView: this.startView,
    defaultDate: this.defaultDate,
    minDate: this.minDate,
    maxDate: this.maxDate,
    datePickerIconDisabled: this.datePickerIconDisabled,
    datePickerPopupDisabled: this.datePickerPopupDisabled,
    dateInputDisabled: this.dateInputDisabled,
    timeDisabled: this.timeDisabled,
    hideHour: this.hideHour,
    hideMinute: this.hideMinute,
    hideSeconds: this.hideSeconds,
    hideMeridian: this.hideMeridian,
    disabled: this.disabled,
    dateDisabled: this.dateDisabled,
    disableHour: this.disableHour,
    disableMinute: this.disableMinute,
    disableSeconds: this.disableSeconds,
    disableMeridian: this.disableMeridian,
    required: this.required,
    filteredDays: this.filteredDays,
    hourFormat: Number(this.hourFormat)
  };

  dateConfigChange(e: any, control: string) {

    if (e) {

      if (control === 'defaultDate.start') {
        this.defaultDate.start = e.targetElement.value;
      } else if (control === 'defaultDate.end') {
        this.defaultDate.end = e.targetElement.value;
      } else if (control === 'startAt.start') {
        this.startAt.start = e.targetElement.value;
      } else if (control === 'startAt.end') {
        this.startAt.end = e.targetElement.value;
      } else if (control === 'maxDate.start') {
        this.maxDate.start = e.targetElement.value;
      } else if (control === 'maxDate.end') {
        this.maxDate.end = e.targetElement.value;
      } else if (control === 'minDate.start') {
        this.minDate.start = e.targetElement.value;
      } else if (control === 'minDate.start') {
        this.minDate.start = e.targetElement.value;
      }
    }

    this.reSetDateConfig();
  }

  reSetDateConfig() {

    this.datePickerConfig = {
      name: 'DatePickerControl',
      placeholder: this.placeholder,
      type: this.type,
      isInline: this.isInline,
      isRange: this.isRange,
      controlAlign: this.controlAlign,
      width: this.widthDate,
      startAt: this.startAt,
      startView: this.startView,
      defaultDate: this.defaultDate,
      minDate: this.minDate,
      maxDate: this.maxDate,
      datePickerIconDisabled: this.datePickerIconDisabled,
      datePickerPopupDisabled: this.datePickerPopupDisabled,
      dateInputDisabled: this.dateInputDisabled,
      timeDisabled: this.timeDisabled,
      hideHour: this.hideHour,
      hideMinute: this.hideMinute,
      hideSeconds: this.hideSeconds,
      hideMeridian: this.hideMeridian,
      disabled: this.disabled,
      dateDisabled: this.dateDisabled,
      disableHour: this.disableHour,
      disableMinute: this.disableMinute,
      disableSeconds: this.disableSeconds,
      disableMeridian: this.disableMeridian,
      required: this.required,
      filteredDays: this.filteredDays,
      hourFormat: Number(this.hourFormat)
    };
    console.log('datePickerConfig =====> ', this.datePickerConfig);
  }

  valueChange(e: any): void {
    this.dateTimeValue = e;
  }

  dayDisableChange(e: any): void {

    if (e.checked && e.source.name) {
      this.filteredDays.push(e.source.name);
    } else {
      this.filteredDays.splice(this.filteredDays.indexOf(e.source.name), 1);
    }

    this.reSetDateConfig();
  }

  /* ------------------------------------------------------------------------
  ------------------------  Date Time Picker End ----------------------------
  ------------------------------------------------------------------------ */


  /* ------------------------------------------------------------------------
  ----------------------------  Select Start --------------------------------
  ------------------------------------------------------------------------ */

  selectData = selectListData;
  placeholderSel = 'Select element';
  requiredSel = true;
  multiSelect = true;
  groups: string[];
  disabledSel = false;
  disabledValues: any[];
  selectColumnList = ['id', 'name', 'symbol', 'weight'];
  displayedColumns = ['name', 'symbol'];
  valueField = 'id';
  nameField = 'name';
  widthSelect = '200px';
  panelWidthSelect = '300px';
  panelHeightSelect = 'auto';
  showValueField = false;
  returnValueOnClose = true;
  autoSelectFirstOption = true;
  autoActiveFirstOption = false;
  selectedList = [];

  selectConfig = {
    name: 'Select',
    placeholder: this.placeholderSel,
    required: this.requiredSel,
    valueField: this.valueField,
    nameField: this.nameField,
    showValueField: this.showValueField,
    returnValueOnClose: this.returnValueOnClose,
    autoSelectFirstOption: this.autoSelectFirstOption,
    multiSelect: this.multiSelect,
    groups: this.groups,
    disabled: this.disabledSel,
    disabledValues: this.disabledValues,
    displayedColumns: this.displayedColumns,
    width: this.widthSelect,
    panelHeight: this.panelHeightSelect,
    panelWidth: this.panelWidthSelect
  };

  selectReset() {

    this.selectConfig = {
      name: 'Select',
      placeholder: this.placeholderSel,
      required: this.requiredSel,
      valueField: this.valueField,
      nameField: this.nameField,
      showValueField: this.showValueField,
      returnValueOnClose: this.returnValueOnClose,
      autoSelectFirstOption: this.autoSelectFirstOption,
      multiSelect: this.multiSelect,
      groups: this.groups,
      disabled: this.disabledSel,
      disabledValues: this.disabledValues,
      displayedColumns: this.displayedColumns,
      width: this.widthSelect,
      panelHeight: this.panelHeightSelect,
      panelWidth: this.panelWidthSelect
    };
    console.log('selectConfig =====> ', this.selectConfig);
  }

  selectionChange(e: any): void {
    this.selectedList = e;
  }

  /* ------------------------------------------------------------------------
  ----------------------------  Select End ----------------------------------
  ------------------------------------------------------------------------ */


  /* ------------------------------------------------------------------------
  ----------------------------  Treeview Start ------------------------------
  ------------------------------------------------------------------------ */

  nodeIdList: number[] = [];
  expanded = true;
  searchable = true;
  treeViewConfig = {
    expanded: this.expanded,
    searchable: this.searchable,
    data: treeViewData
  };

  treeConfigChange(e: any) {

    this.treeViewConfig.expanded = this.expanded;
    this.treeViewConfig.searchable = this.searchable;
    this.treeViewConfig = { ...this.treeViewConfig };
    console.log('treeViewConfig =====> ', this.treeViewConfig);
  }

  treeViewChange(e: any): void {
    this.nodeIdList = e;
  }

  /* ------------------------------------------------------------------------
  ----------------------------  Treeview End --------------------------------
  ------------------------------------------------------------------------ */


  /* ------------------------------------------------------------------------
  ----------------------------  RatingPicker Start ------------------------------5
  ------------------------------------------------------------------------ */

  ratingValue: number;
  starsCount = 6;
  defaultValue = 4.5;
  starsColors = '#ff0000,#ff7777,#f4f400,#fbbc04,#00b92f,#6a6a35';
  vertical = false;
  allowHalf = true;
  returnDefaultValue = true;
  colorGenerated = '';

  fullRatingIcon = 'star';
  halfRatingIcon = 'star_half';
  emptyRatingIcon = 'star_bordered';

  ratingPickerConfigMatIcon = {
    starsCount: this.starsCount,
    defaultValue: this.defaultValue,
    returnDefaultValue: this.returnDefaultValue,
    starsColors: this.starsColors,
    allowHalf: this.allowHalf,
    orientation: this.vertical ? 'vertical' : 'horizontal',
    fullRatingIcon: this.fullRatingIcon,
    halfRatingIcon: this.halfRatingIcon,
    emptyRatingIcon: this.emptyRatingIcon,
    ratingType: 'mat-icon'
  };

  ratingPickerConfigCss = {
    starsCount: this.starsCount,
    defaultValue: this.defaultValue,
    returnDefaultValue: this.returnDefaultValue,
    starsColors: this.starsColors,
    orientation: this.vertical ? 'vertical' : 'horizontal',
    fullRatingIcon: this.fullRatingIcon,
    halfRatingIcon: this.halfRatingIcon,
    emptyRatingIcon: this.emptyRatingIcon,
    ratingType: 'css'
  };

  ratingPickerConfigChange(e: any, ctrl?: string): void {

    this.ratingPickerConfigMatIcon.starsColors = this.starsColors;
    this.ratingPickerConfigMatIcon.starsCount = this.starsCount;
    this.ratingPickerConfigMatIcon.defaultValue = this.defaultValue;
    this.ratingPickerConfigCss.defaultValue = this.defaultValue;
    this.ratingPickerConfigMatIcon.returnDefaultValue = this.returnDefaultValue;
    this.ratingPickerConfigMatIcon.allowHalf = this.allowHalf;
    this.ratingPickerConfigMatIcon.fullRatingIcon = this.fullRatingIcon;
    this.ratingPickerConfigMatIcon.halfRatingIcon = this.halfRatingIcon;
    this.ratingPickerConfigMatIcon.emptyRatingIcon = this.emptyRatingIcon;
    this.ratingPickerConfigMatIcon.orientation = this.vertical ? 'vertical' : 'horizontal';
    this.ratingPickerConfigMatIcon = { ...this.ratingPickerConfigMatIcon };
    this.ratingPickerConfigCss = { ...this.ratingPickerConfigCss };
    console.log('ratingPickerConfig =====> ', this.ratingPickerConfigMatIcon);
  }

  ratingPickerChange(e: any): void {
    this.ratingValue = e;
  }

  /* ------------------------------------------------------------------------
  ----------------------------  RatingPicker End --------------------------------
  ------------------------------------------------------------------------ */



}
