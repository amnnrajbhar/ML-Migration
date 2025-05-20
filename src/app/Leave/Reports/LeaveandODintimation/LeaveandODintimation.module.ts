import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { LeaveandODintimationComponent } from './LeaveandODintimation.component';
import { FormsModule } from '@angular/forms';
import { LeaveandODintimationRoutingModule } from './LeaveandODintimation-routing.module';
import { SharedmoduleModule } from '../../../shared/sharedmodule/sharedmodule.module';
;


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    LeaveandODintimationRoutingModule,
  ],
  declarations: [
    LeaveandODintimationComponent
],
providers:[
  DatePipe
]
})
export class LeaveandODintimationModule { }
