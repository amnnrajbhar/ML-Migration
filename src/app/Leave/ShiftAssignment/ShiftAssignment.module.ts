import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShiftAssignmentComponent } from './ShiftAssignment.component';
import { ShiftAssignmentRoutingModule } from './ShiftAssignment-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    ShiftAssignmentRoutingModule
  ],
  declarations: [
    ShiftAssignmentComponent
  ],
  providers:[
    DatePipe
  ]
})
export class ShiftAssignmentModule { }
