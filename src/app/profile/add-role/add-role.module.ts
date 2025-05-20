import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddRoleComponent } from './add-role.component';
import { FormsModule } from '@angular/forms';
import { AddRoleRoutingModule } from './add-role-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    AddRoleRoutingModule
  ],
  declarations: [
    AddRoleComponent
  ]
})
export class AddRoleModule { }
