import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OvertimeReportComponent } from './OvertimeReport.component';
import { FormsModule } from '@angular/forms';
import { OvertimeReportRoutingModule } from './OvertimeReport-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
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
})
export class OvertimeReportModule { }
