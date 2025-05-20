import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PrintLogReportComponent } from './PrintLogReport.component';
import { PrintLogReportRoutingModule } from './PrintLogReport-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    PrintLogReportRoutingModule
  ],
  declarations: [
    PrintLogReportComponent
  ],
  providers:[
    DatePipe
  ]
})
export class PrintLogReportModule { }
