import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DepartmentComponent } from './department.component';
import { FormsModule } from '@angular/forms';
import { DepartmentRoutingModule } from './department-routing.module';
import { SharedmoduleModule } from '../../shared/sharedmodule/sharedmodule.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedmoduleModule,
    DepartmentRoutingModule
  ],
  declarations: [
    DepartmentComponent
  ]
})
export class DepartmentModule { }
