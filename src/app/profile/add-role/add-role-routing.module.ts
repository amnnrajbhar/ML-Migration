import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthGuard } from '../../auth/auth-guard.service';
import { AddRoleComponent } from './add-role.component';
import { Routes, RouterModule } from '@angular/router';

const appRoute: Routes = [
  { path: '', component: AddRoleComponent, canActivate: [AuthGuard] },
];
@NgModule({
  imports: [
    RouterModule.forChild(appRoute)
  ],
  exports: [RouterModule]
})
export class AddRoleRoutingModule { }
