import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OnDutyReportComponent } from './OnDutyReport.component';
import { FormsModule } from '@angular/forms';
import { OnDutyReportRoutingModule } from './OnDutyReport-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
;


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    OnDutyReportRoutingModule,
  ],
  declarations: [
    OnDutyReportComponent
],
})
export class OnDutyReportModule { }
