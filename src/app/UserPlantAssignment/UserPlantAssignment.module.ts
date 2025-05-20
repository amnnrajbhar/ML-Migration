import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserPlantAssignmentRoutingModule } from './UserPlantAssignment-routing.module';
import { UserPlantAssignmentComponent } from './UserPlantAssignment.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    UserPlantAssignmentRoutingModule
  ],
  declarations: [
    UserPlantAssignmentComponent
  ]
})
export class UserPlantAssignmentModule { }
