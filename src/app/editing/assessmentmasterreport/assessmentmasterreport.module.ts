import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AssessmentmasterreportComponent } from './assessmentmasterreport.component';
import { AssessmentmasterreportRoutingModule } from './assessmentmasterreport-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    AssessmentmasterreportRoutingModule
  ],
  declarations: [
    AssessmentmasterreportComponent
  ]
})
export class AssessmentmasterreportModule { }
