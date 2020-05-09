import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import {
  MatInputModule, MatTooltipModule, MatTableModule, MatCheckboxModule,
  MatFormFieldModule, MatMenuModule, MatChipsModule, MatAutocompleteModule, MatIconModule, MatSortModule
} from '@angular/material';
import { OHSelectComponent } from './oh-select.component';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  declarations: [
    OHSelectComponent
  ],
  imports: [
    CommonModule,
    MatMenuModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatTooltipModule,
    MatTableModule,
    MatInputModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    FlexLayoutModule,
    MatSortModule
  ],
  exports: [OHSelectComponent],
  schemas: [NO_ERRORS_SCHEMA]
})

export class OHSelectModule {

}
