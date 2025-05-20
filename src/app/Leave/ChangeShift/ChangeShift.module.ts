import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeShiftComponent } from './ChangeShift.component';
import { ChangeShiftRoutingModule } from './ChangeShift-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    ChangeShiftRoutingModule
  ],
  declarations: [
    ChangeShiftComponent
  ],
  providers:[
    DatePipe
  ]
})
export class ChangeShiftModule { }
