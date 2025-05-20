import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingReportComponent } from './booking-report.component';
import { bookingreportRoutingModule } from './booking-report-routing.module';
import { SharedmoduleModule } from '../shared/sharedmodule/sharedmodule.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    bookingreportRoutingModule
  ],
  declarations: [
    BookingReportComponent
  ]
})
export class bookingreportModule { }
