import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';
import { AssignApproverRoutingModule } from './AssignApprover-routing.module';
import { AssignApproverComponent } from './AssignApprover.component';

@NgModule({
  imports: [
    CommonModule,   
    
    FormsModule,
    SharedmoduleModule,
    AssignApproverRoutingModule
  ],
  declarations: [AssignApproverComponent],
  providers:[DatePipe]
})
export class AssignApproversModule { }
