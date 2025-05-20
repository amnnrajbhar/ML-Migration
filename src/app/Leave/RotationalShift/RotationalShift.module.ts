import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
 import { RotationalShiftComponent } from './RotationalShift.component';
import { RotationalShiftRoutingModule } from './RotationalShift-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    RotationalShiftRoutingModule
  ],
  declarations: [
     RotationalShiftComponent
  ],
  providers:[
    DatePipe
  ]
})
export class RotationalShiftModule { }
