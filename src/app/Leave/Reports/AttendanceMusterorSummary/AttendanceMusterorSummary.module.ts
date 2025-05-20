import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AttendanceMusterorSummaryComponent } from './AttendanceMusterorSummary.component';
import { FormsModule } from '@angular/forms';
import { AttendanceMusterorSummaryRoutingModule } from './AttendanceMusterorSummary-routing.module';
import { SharedmoduleModule } from '../../../shared/sharedmodule/sharedmodule.module';
;


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    AttendanceMusterorSummaryRoutingModule,
  ],
  declarations: [
    AttendanceMusterorSummaryComponent
],
providers:[
  DatePipe
]
})
export class AttendanceMusterorSummaryModule { }
