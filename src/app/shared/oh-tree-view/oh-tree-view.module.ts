import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import {
  MatToolbarModule, MatIconModule,
  MatButtonToggleModule, MatCheckboxModule, MatTooltipModule
} from '@angular/material';
import { OHTreeViewComponent } from './oh-tree-view.component';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  declarations: [
    OHTreeViewComponent
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonToggleModule,
    MatCheckboxModule,
    MatTooltipModule
  ],
  exports: [OHTreeViewComponent],
  schemas: [NO_ERRORS_SCHEMA]
})

export class OHTreeViewModule {

}
