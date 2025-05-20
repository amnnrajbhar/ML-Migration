import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { LOPMonthlyReportComponent } from './LOPMonthlyReport.component';
import { FormsModule } from '@angular/forms';
import { LOPMonthlyReportRoutingModule } from './LOPMonthlyReport-routing.module';
import { SharedmoduleModule } from '../../../shared/sharedmodule/sharedmodule.module';
;


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    LOPMonthlyReportRoutingModule,
  ],
  declarations: [
    LOPMonthlyReportComponent
],
providers:[
  DatePipe
]
})
export class LOPMonthlyReportModule { }
