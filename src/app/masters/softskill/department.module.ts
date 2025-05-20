import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SoftSkillComponent } from './department.component';
import { FormsModule } from '@angular/forms';
import { DepartmentRoutingModule } from './department-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    DepartmentRoutingModule
  ],
  declarations: [
    SoftSkillComponent
  ]
})
export class SoftSkillModule { }
