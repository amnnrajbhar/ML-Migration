import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeeDataComponent } from './EmployeeData.component';
import { EmployeeDataRoutingModule } from './EmployeeData-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    EmployeeDataRoutingModule
  ],
  declarations: [
    EmployeeDataComponent
  ]
})
export class EmployeeDataModule { }
