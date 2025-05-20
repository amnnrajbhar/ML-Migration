import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApprovalEmployeeComponent } from './employee.component';
import { FormsModule } from '@angular/forms';
import { EmployeeRoutingModule } from './employee-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    EmployeeRoutingModule
  ],
  declarations: [
    ApprovalEmployeeComponent
  ]
})
export class ApprovalEmployeeModule { }
