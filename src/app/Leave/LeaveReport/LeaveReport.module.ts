import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeaveReportComponent } from './LeaveReport.component';
import { FormsModule } from '@angular/forms';
import { LeaveReportRoutingModule } from './LeaveReport-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
;


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    LeaveReportRoutingModule,
  ],
  declarations: [
    LeaveReportComponent
],
})
export class LeaveReportModule { }
