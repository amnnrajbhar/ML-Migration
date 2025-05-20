import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompOffReportComponent } from './CompOffReport.component';
import { FormsModule } from '@angular/forms';
import { CompOffReportRoutingModule } from './CompOffReport-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
;


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    CompOffReportRoutingModule,
  ],
  declarations: [
    CompOffReportComponent
],
})
export class CompOffReportModule { }
