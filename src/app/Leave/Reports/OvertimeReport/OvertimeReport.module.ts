import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { OvertimeReportComponent } from './OvertimeReport.component';
import { FormsModule } from '@angular/forms';
import { OvertimeReportRoutingModule } from './OvertimeReport-routing.module';
import { SharedmoduleModule } from '../../../shared/sharedmodule/sharedmodule.module';
;


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    OvertimeReportRoutingModule,
  ],
  declarations: [
    OvertimeReportComponent
],
providers:[
  DatePipe
]
})
export class OvertimeReportModule { }
