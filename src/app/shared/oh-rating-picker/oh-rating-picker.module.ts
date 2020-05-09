import { OHRatingPickerComponent } from './oh-rating-picker.component';
import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import {
  MatTooltipModule, MatFormFieldModule, MatIconModule
} from '@angular/material';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [
    OHRatingPickerComponent
  ],
  imports: [
    CommonModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatIconModule
  ],
  exports: [OHRatingPickerComponent],
  schemas: [NO_ERRORS_SCHEMA]
})

export class OHRatingPickerModule {

}
