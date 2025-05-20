import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { BiometricPunchReportComponent } from './BiometricPunchReport.component';
import { FormsModule } from '@angular/forms';
import { BiometricPunchReportRoutingModule } from './BiometricPunchReport-routing.module';
import { SharedmoduleModule } from '../../../shared/sharedmodule/sharedmodule.module';
;


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    BiometricPunchReportRoutingModule,
  ],
  declarations: [
    BiometricPunchReportComponent
],
providers:[
  DatePipe
]
})
export class BiometricPunchReportModule { }
