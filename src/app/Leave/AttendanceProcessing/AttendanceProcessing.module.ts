import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AttendanceProcessingComponent } from './AttendanceProcessing.component';
import { FormsModule } from '@angular/forms';
import { AttendanceProcessingRoutingModule } from './AttendanceProcessing-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
;


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    AttendanceProcessingRoutingModule,
  ],
  declarations: [
    AttendanceProcessingComponent
],
})
export class AttendanceProcessingModule { }
