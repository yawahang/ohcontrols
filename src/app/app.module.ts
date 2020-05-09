import { OHSelectModule } from './shared/oh-select/oh-select.module';
import { OHDatePickerModule } from './shared/oh-date-picker/oh-date-picker.module';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import {
  MatCheckboxModule, MatDatepickerModule,
  MatInputModule, MatDividerModule, MatTabsModule, MatCardModule, MatSelectModule, MatTooltipModule, MatIconModule
} from '@angular/material';

import { OHTreeViewModule } from './shared/oh-tree-view/oh-tree-view.module';
import { OHRatingPickerModule } from './shared/oh-rating-picker/oh-rating-picker.module';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    FormsModule,
    HttpClientModule,
    RouterModule.forRoot([
      { path: '', component: HomeComponent }
    ]),

    // imports for home component
    MatCheckboxModule,
    MatSelectModule,
    MatDatepickerModule,
    MatInputModule,
    MatDividerModule,
    MatTabsModule,
    MatCardModule,
    MatTooltipModule,
    MatIconModule,
    // imports for home component

    // import controls
    OHDatePickerModule,
    OHSelectModule,
    OHTreeViewModule,
    OHRatingPickerModule

    // import controls
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {

}
