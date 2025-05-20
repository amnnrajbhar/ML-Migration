import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { DaywiseattendancestatusComponent } from './Daywiseattendancestatus.component';
import { FormsModule } from '@angular/forms';
import { DaywiseattendancestatusRoutingModule } from './Daywiseattendancestatus-routing.module';
import { SharedmoduleModule } from '../../../shared/sharedmodule/sharedmodule.module';
;


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    DaywiseattendancestatusRoutingModule,
  ],
  declarations: [
    DaywiseattendancestatusComponent
],
providers:[
  DatePipe
]
})
export class DaywiseattendancestatusModule { }
