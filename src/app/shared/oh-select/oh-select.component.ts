import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource, MatAutocompleteTrigger, MatSort } from '@angular/material';

@Component({
  selector: 'oh-select',
  templateUrl: './oh-select.component.html',
  styleUrls: ['./oh-select.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class OHSelectComponent implements OnInit {

  @Output() valueChange = new EventEmitter<any>();

  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild('searchTb', { static: false }) searchTb: ElementRef;
  @ViewChild('ohSelAutoTrigger', { static: false }) ohSelAutoTrigger: MatAutocompleteTrigger;

  dataSource: any[]; // data for select list
  selectData: MatTableDataSource<any>; // main data for table
  selection: SelectionModel<any>; // table selection model
  placeholder: string; // placeholder, display text for select
  name: string; // placeholder, display text for select
  required = true; // required field
  multiSelect = false; // for multiple select
  groups: any[]; // for grouping select
  disabled = false; // select disabled
  autoActiveFirstOption = true; // mark first option as active
  autoSelectFirstOption = false; // mark first option selected
  disabledValues: any[]; // send values in array if to be disabled eg: [1,2,3] or ['a','b','c']
  displayedColumns: string[]; // for multiple column send eg: ['Name','Weight']
  displayedColumnsHeader: string[] = []; // column header for table
  multipleColumns = false; // num of cols in displayedColumns defines if is multu column or not
  valueField: string; // column name which should be provided as value eg: 'id', default this.displayedColumns[0]
  nameField: string; // column name which should be displayed as label eg: 'name', default this.displayedColumns[0]
  showValueField = false; // display valueField in select

  selectedValue: any[] = []; // all selected values
  currentSelection = ''; // all selected values to display in ui
  valueChanged = false;
  width: string; // select value input width
  panelWidth: string; // select value panel width
  panelHeight: string; // select value panel height
  returnValueOnClose = true; // return valueChange on control focus out event
  currentRowIndex: number; // row index of select on keyboard arrow key

  selectId: string;

  @Input('data') set data(data: any[]) {

    if (data) {
      this.dataSource = data;
    } else {
      this.dataSource = [];
    }

    this.selectData = new MatTableDataSource<any>(this.dataSource);
  }

  @Input('config') set config(prop: MvSelectConfig) {

    if (prop) {

      this.placeholder = prop.placeholder != null ? prop.placeholder : 'Select';
      this.name = prop.name != null ? prop.name : 'Select';
      this.required = prop.required != null ? prop.required : true;
      this.returnValueOnClose = prop.returnValueOnClose != null ? prop.returnValueOnClose : true;
      this.multiSelect = prop.multiSelect != null ? prop.multiSelect : false;
      this.groups = prop.groups != null ? prop.groups : [];
      this.disabled = prop.disabled != null ? prop.disabled : false;
      this.disabledValues = prop.disabledValues ? prop.disabledValues : [];
      this.displayedColumns = prop.displayedColumns ? prop.displayedColumns : [];

      this.selectId = this.name + Number((Math.random() * 500).toString()).toString();

      const w = prop.width ? prop.width : '100px';
      this.width = w;

      const pw = (prop.panelWidth ? prop.panelWidth : '');
      this.panelWidth = pw === 'auto' ? w : pw;
      this.panelHeight = prop.panelHeight ? prop.panelHeight : '350px';

      this.autoSelectFirstOption = prop.autoSelectFirstOption != null ? prop.autoSelectFirstOption : false;
      this.currentRowIndex = 0;
      this.autoActiveFirstOption = prop.autoActiveFirstOption != null ? prop.autoActiveFirstOption : true;

      // push columns if not provided for multipleColumns, first column except column valueField
      if (this.displayedColumns.length === 0 && this.dataSource.length > 0) {

        for (const key of Object.keys(this.dataSource[0])) {
          if (!this.showValueField && key !== this.valueField) {
            this.displayedColumns.push(key);
          }
        }
      }

      this.multipleColumns = this.displayedColumns.length > 1 ? true : false;

      this.showValueField = prop.showValueField != null ? prop.showValueField : false;
      this.valueField = prop.valueField != null ? prop.valueField : this.displayedColumns[0];
      this.nameField = prop.nameField != null ? prop.nameField : this.displayedColumns[0];

      if (this.showValueField && !this.displayedColumns.includes(this.valueField)) {
        this.displayedColumns = [...[this.valueField], ...this.displayedColumns];
      }

      this.displayedColumnsHeader = [];
      if (this.multiSelect) {
        this.displayedColumnsHeader.push('select');
      }

      this.displayedColumnsHeader = [...this.displayedColumnsHeader, ...this.displayedColumns]; // merge header with displayedColumns

      this.selection = new SelectionModel<any>(this.multiSelect, []);
      if (this.autoSelectFirstOption) {

        this.onSelect(this.selectData.data[this.currentRowIndex]);

        if (this.multiSelect && this.returnValueOnClose) {
          this.emitValueChange();
        }
      }
    }
  }

  constructor() {
  }

  ngOnInit(): void {

  }

  sortData(e: any) {
    this.selectData.sort = this.sort;
  }

  onClosed() { // autocomplete closed

    this.currentRowIndex = 0;
    if (this.multiSelect) {

      if (this.returnValueOnClose) { // return value on panel close
        this.emitValueChange();
      }
    }
  }

  onOpened() { // autocomplete opened
    this.currentRowIndex = 0;
  }

  onClear(): void {

    this.selection.clear();
    this.selectedValue = [];
    this.selectData.filter = '';
    this.searchTb.nativeElement.value = '';
    this.searchTb.nativeElement.focus();
    this.currentRowIndex = 0;
  }

  searchChange(e: any) {

    if (e && e.target.value) {
      this.selectData.filter = e.target.value.trim().toLowerCase();
      this.currentRowIndex = 0; // reset current row index
    }
  }

  keyFn(e: any): void {

    if (e) {

      e.preventDefault();
      const data = (this.selectData.filter === '' ? this.selectData.data : this.selectData.filteredData);
      if (e.code === 'ArrowDown') {

        if (this.currentRowIndex < data.length - 1) {
          this.currentRowIndex++;
        } else if (this.currentRowIndex === data.length - 1) {
          this.currentRowIndex = 0;
        }
      } else if (e.code === 'ArrowUp') {

        if (this.currentRowIndex > 0) {
          this.currentRowIndex--;
        } else if (this.currentRowIndex === 0) {
          this.currentRowIndex = data.length - 1;
        }
      } else if (e.code === 'Space' || e.code === 'Enter') {
        this.onSelect(data[this.currentRowIndex]);
      } else if (e.code === 'Tab') {
        this.ohSelAutoTrigger.closePanel();
      }
    }
  }

  openAutoCompletePanel(e: any) {

    if (e) {
      e.stopPropagation();
      this.ohSelAutoTrigger.openPanel();
    }
  }

  optionChange(e: Event, row: any) {

    if (e) {
      e.stopPropagation();
    }

    if (row) {
      this.onSelect(row);
    }
  }

  onSelect(row: any): void {

    if (row) {

      if (this.multiSelect) {

        this.selection.toggle(row);
        this.valueChanged = true;

        if (!this.returnValueOnClose) { // return value on select
          this.emitValueChange();
        }
      } else { // single select

        this.selection.select(row);
        this.selectData.filter = '';
        this.searchTb.nativeElement.value = '';
        this.valueChanged = true;
        this.emitValueChange();
      }
    }
  }

  emitValueChange(): void {

    if (this.valueChanged) {

      // get selectedValue
      this.selectedValue = [];
      this.currentSelection = '';
      const selectedDisplay: any[] = [];
      this.selection.selected.map(x => {
        selectedDisplay.push(x[this.nameField]);
        this.selectedValue.push(x[this.valueField]);
      });

      if (this.searchTb && this.selectData.filter === this.searchTb.nativeElement.value) { // clear search
        this.searchTb.nativeElement.value = '';
      }

      if (this.multiSelect) {
        if (this.selectedValue.length > 1) {

          if (this.isAllSelected()) {
            this.currentSelection = 'All';
          } else {
            this.currentSelection = selectedDisplay[0] + ' & ' + (selectedDisplay.length - 1) + ' more...';
          }
        } else {
          this.currentSelection = (selectedDisplay.length === 1) ? selectedDisplay[0] : '';
        }
      } else {
        this.currentSelection = (selectedDisplay.length === 1) ? selectedDisplay[0] : '';
      }

      this.valueChange.emit(this.selectedValue);
      this.valueChanged = false;
    }
  }

  isAllSelected() { // if all options are selected

    const selected = this.selection.selected.length;
    const total = this.selectData.data.length;
    return (selected === total);
  }

  selectUnselectAll(): void { // Selects all options if not selected, clears all selection if selected
    this.isAllSelected() ? this.selection.clear() : this.selectData.data.forEach((row: any) => this.selection.select(row));
    this.valueChanged = true;
    this.emitValueChange();
  }

  getLabel(row?: any): string { // get label for the checkbox on the passed row

    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    } else {
      return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
    }
  }
}

export interface MvSelectConfig {
  name: string;
  placeholder: string;
  valueField: string;
  nameField: string;
  showValueField: boolean;
  returnValueOnClose: boolean;
  autoSelectFirstOption: boolean;
  autoActiveFirstOption: boolean;
  width: string;
  panelWidth: string;
  panelHeight: string;
  required: boolean;
  multiSelect: boolean;
  groups: string[];
  disabled: boolean;
  disabledValues: any[]; // can be id or name (number/string)
  displayedColumns: string[];
}
