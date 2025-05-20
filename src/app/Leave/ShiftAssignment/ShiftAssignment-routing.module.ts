import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../../auth/auth-guard.service';
import { ShiftAssignmentComponent } from './ShiftAssignment.component';

const appRoute: Routes = [
  { path: '', component: ShiftAssignmentComponent, canActivate: [AuthGuard] },
];
@NgModule({
  imports: [
    RouterModule.forChild(appRoute)
  ],
  exports: [RouterModule]
})
export class ShiftAssignmentRoutingModule { }
 