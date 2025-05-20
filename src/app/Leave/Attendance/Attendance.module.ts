import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AttendanceComponent } from './Attendance.component';
import { FormsModule } from '@angular/forms';
import { AttendanceRoutingModule } from './Attendance-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    AttendanceRoutingModule,
  ],
  declarations: [
    AttendanceComponent
],
})
export class AttendanceModule { }
