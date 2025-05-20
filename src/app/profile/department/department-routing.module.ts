import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { DepartmentComponent } from './department.component';
import { AuthGuard } from '../../auth/auth-guard.service';

const appRoute: Routes = [
  { path: '', component: DepartmentComponent, canActivate: [AuthGuard] },
];
@NgModule({
  imports: [
    RouterModule.forChild(appRoute)
  ],
  exports: [RouterModule]
})
export class DepartmentRoutingModule { }
