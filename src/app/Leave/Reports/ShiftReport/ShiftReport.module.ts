import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ShiftReportComponent } from './ShiftReport.component';
import { FormsModule } from '@angular/forms';
import { ShiftReportRoutingModule } from './ShiftReport-routing.module';
import { SharedmoduleModule } from '../../../shared/sharedmodule/sharedmodule.module';
;


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    ShiftReportRoutingModule,
  ],
  declarations: [
    ShiftReportComponent
],
providers:[
  DatePipe
]
})
export class ShiftReportModule { }
