import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import {
  MatInputModule, MatButtonToggleModule, MatDatepickerModule,
  MatNativeDateModule, MatTooltipModule, MatFormFieldModule, MatAutocompleteModule, MatIconModule
} from '@angular/material';
import { OHDatePickerComponent } from './oh-date-picker.component';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [
    OHDatePickerComponent
  ],
  imports: [
    CommonModule,
    MatInputModule,
    MatButtonToggleModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatIconModule,
    // ScrollEventModule
  ],
  exports: [OHDatePickerComponent],
  schemas: [NO_ERRORS_SCHEMA]
})

export class OHDatePickerModule {

}
