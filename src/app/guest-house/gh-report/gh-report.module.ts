import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GhReportRoutingModule } from './gh-report-routing.module';
import { GhReportComponent } from './gh-report.component';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    GhReportRoutingModule
  ],
  declarations: [
    GhReportComponent
  ]
})
export class GhReportModule { }
