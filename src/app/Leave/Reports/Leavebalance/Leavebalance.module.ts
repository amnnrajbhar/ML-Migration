import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { LeavebalanceComponent } from './Leavebalance.component';
import { FormsModule } from '@angular/forms';
import { LeavebalanceRoutingModule } from './Leavebalance-routing.module';
import { SharedmoduleModule } from '../../../shared/sharedmodule/sharedmodule.module';
;


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    LeavebalanceRoutingModule,
  ],
  declarations: [
    LeavebalanceComponent
],
providers:[
  DatePipe
]
})
export class LeavebalanceModule { }
