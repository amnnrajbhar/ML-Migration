import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatesuffixPipe } from '../datesuffix.pipe';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule, MatInputModule, MatAutocompleteModule, MatTooltipModule, MatAutocompleteTrigger, MatRadioModule, MatProgressSpinnerModule, MatSelectModule } from '@angular/material';
import { BrowserModule } from '@angular/platform-browser';
import { OwlDateTimeModule, OwlNativeDateTimeModule,OWL_DATE_TIME_FORMATS } from 'ng-pick-datetime';
import { OwlMomentDateTimeModule } from 'ng-pick-datetime-moment';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxBarcodeModule } from 'ngx-barcode';
//Ramesh P added
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { WebcamModule } from 'ngx-webcam';
import { PdfViewerModule } from 'ng2-pdf-viewer';

// Format custom
export const MY_MOMENT_FORMATS = {
  parseInput: 'DD/MM/YYYY LT',
  fullPickerInput: 'DD/MM/YYYY LT',
  datePickerInput: 'DD/MM/YYYY',
  timePickerInput: 'LT',
  monthYearLabel: 'MMM YYYY',
  dateA11yLabel: 'LL',
  monthYearA11yLabel: 'MMMM YYYY',
};
@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatAutocompleteModule,
    MatInputModule,
    MatFormFieldModule,
    MatTooltipModule,
    MatRadioModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    OwlMomentDateTimeModule,
    NgSelectModule,
    NgxBarcodeModule,

   //ramesh p added
    AngularMultiSelectModule,
    WebcamModule,
    MatProgressSpinnerModule,
    
    NgMultiSelectDropDownModule.forRoot()
  ],
  declarations: [
    DatesuffixPipe,
  ],
  exports: [
    DatesuffixPipe,
    ReactiveFormsModule,
    FormsModule,
    MatAutocompleteModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatTooltipModule,
    MatRadioModule,
    NgMultiSelectDropDownModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    NgSelectModule,
    NgxBarcodeModule,
    PdfViewerModule


  ],
  providers: [
    { provide: OWL_DATE_TIME_FORMATS, useValue: MY_MOMENT_FORMATS}
  ],
})
export class SharedmoduleModule { }
