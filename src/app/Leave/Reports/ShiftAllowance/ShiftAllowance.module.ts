import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ShiftAllowanceComponent } from './ShiftAllowance.component';
import { FormsModule } from '@angular/forms';
import { ShiftAllowanceRoutingModule } from './ShiftAllowance-routing.module';
import { SharedmoduleModule } from '../../../shared/sharedmodule/sharedmodule.module';
;


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    ShiftAllowanceRoutingModule,
  ],
  declarations: [
    ShiftAllowanceComponent
],
providers:[
  DatePipe
]
})
export class ShiftAllowanceModule { }
