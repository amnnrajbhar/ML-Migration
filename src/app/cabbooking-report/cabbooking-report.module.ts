import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { cabbookingreportRoutingModule } from './cabbooking-report-routing.module';
import { CabbookingReportComponent } from './cabbooking-report.component';
import { SharedmoduleModule } from '../shared/sharedmodule/sharedmodule.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    cabbookingreportRoutingModule
  ],
  declarations: [
    CabbookingReportComponent
  ]
})
export class cabbookingreportModule { }
