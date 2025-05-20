import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AttendanceReportsComponent } from './Reports.component';
import { FormsModule } from '@angular/forms';
import { AttendanceReportsRoutingModule } from './Reports-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
;


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    AttendanceReportsRoutingModule,
  ],
  declarations: [
    AttendanceReportsComponent
],
providers:[
  DatePipe
]
})
export class AttendanceReportsModule { }
