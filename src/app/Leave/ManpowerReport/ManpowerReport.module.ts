import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ManpowerReportComponent } from './ManpowerReport.component';
import { ManpowerReportRoutingModule } from './ManpowerReport-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    ManpowerReportRoutingModule
  ],
  declarations: [
    ManpowerReportComponent
  ],
  providers:[
    DatePipe
  ]
})
export class ManpowerReportModule { }
